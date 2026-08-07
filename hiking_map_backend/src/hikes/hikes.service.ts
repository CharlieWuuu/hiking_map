import { Injectable, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Hike } from './hike.entity';
import { HikeTrack } from './hike-track.entity';
import { HikeCategoryMap } from './hike-category-map.entity';
import { CreateHikeDto } from './dto/create-hike.dto';
import { HikeStatsDto } from './dto/hike-stats.dto';
import { UploadsService } from '../uploads/uploads.service';

// 簡化軌跡的容差，單位是經緯度的「度」。0.00045 度在台灣的緯度約等於 45～50 公尺。
// 敢壓這麼兇是因為放大到看得出差別的時候，前端會另外去 R2 抓完整軌跡換掉。
const SIMPLIFY_TOLERANCE_DEG = 0.00045;

// GeoJSON 輸出的小數位數。6 位約等於 0.1 公尺，對登山軌跡遠遠夠用，
// 而 PostGIS 預設的 9 位會讓每個座標多出三分之一的長度。
const GEOJSON_PRECISION = 6;

// categories.name -> 前端使用的 achievements 欄位名稱
const CATEGORY_NAME_TO_ACHIEVEMENT_KEY: Record<string, 'hundred' | 'small_hundred' | 'hundred_trail'> = {
  百岳: 'hundred',
  小百岳: 'small_hundred',
  百大必訪步道: 'hundred_trail',
};

// 前端要判斷視野、panTo、畫線所需要的軌跡資訊，不含完整座標
type TrackMeta = {
  center: [number, number] | null;
  bbox: [number, number, number, number] | null;
  point_count: number | null;
  track_url: string | null;
};

type TrackRow = {
  hike_id: number;
  lng: number | null;
  lat: number | null;
  min_lng: number | null;
  min_lat: number | null;
  max_lng: number | null;
  max_lat: number | null;
  point_count: number | null;
  track_url: string | null;
  geojson: string | null;
};

// center 與 bbox 拆成數字回傳，前端不必再解一次 GeoJSON
const TRACK_META_SELECT = `
  SELECT hike_id,
         ST_X(center) AS lng,
         ST_Y(center) AS lat,
         ST_XMin(bbox) AS min_lng,
         ST_YMin(bbox) AS min_lat,
         ST_XMax(bbox) AS max_lng,
         ST_YMax(bbox) AS max_lat,
         point_count,
         track_url`;

function toTrackMeta(row: TrackRow): TrackMeta {
  return {
    center: row.lng === null || row.lat === null ? null : [row.lng, row.lat],
    bbox:
      row.min_lng === null || row.min_lat === null || row.max_lng === null || row.max_lat === null
        ? null
        : [row.min_lng, row.min_lat, row.max_lng, row.max_lat],
    point_count: row.point_count,
    track_url: row.track_url,
  };
}

@Injectable()
export class HikesService {
  private readonly logger = new Logger(HikesService.name);

  constructor(
    @InjectRepository(Hike)
    private hikesRepo: Repository<Hike>,

    @InjectRepository(HikeTrack)
    private hikeTracksRepo: Repository<HikeTrack>,

    @InjectRepository(HikeCategoryMap)
    private hikeCategoryMapRepo: Repository<HikeCategoryMap>,

    private dataSource: DataSource,

    private uploadsService: UploadsService,
  ) {}

  async create(userId: number, dto: CreateHikeDto) {
    const feature = dto.geojson.features[0];
    if (!feature) {
      throw new ForbiddenException('geojson 中沒有可用的軌跡');
    }

    const hike = await this.dataSource.transaction(async (manager) => {
      const hike = await manager.getRepository(Hike).save({
        user_id: userId,
        trail_id: dto.trail_id ?? null,
        name: dto.name,
        county: dto.county ?? null,
        town: dto.town ?? null,
        date: dto.date,
        distance_km: dto.distance_km,
        is_public: dto.is_public ?? true,
        note: dto.note ?? null,
        urls: dto.urls ?? [],
        cover_image_url: dto.cover_image_url ?? null,
      });

      // 簡化線跟原始軌跡在同一句寫入，兩者不可能不同步
      await manager.query(
        `INSERT INTO hike_tracks (hike_id, geom, geom_simplified, point_count)
         SELECT $1, g, ST_Multi(ST_SimplifyPreserveTopology(g, $3)), ST_NPoints(g)
         FROM (SELECT ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON($2), 4326)) AS g) AS source`,
        [hike.id, JSON.stringify(feature.geometry), SIMPLIFY_TOLERANCE_DEG],
      );

      if (dto.category_ids?.length) {
        await manager.getRepository(HikeCategoryMap).insert(
          dto.category_ids.map((category_id) => ({
            hike_id: hike.id,
            category_id,
          })),
        );
      }

      return hike;
    });

    // R2 是網路呼叫，放在交易外面才不會一路握著鎖。
    // 失敗也只是少了「高縮放才用得到」的那一層，紀錄本身仍然完整可用。
    await this.storeFullTrack(hike.id, feature.geometry);

    return hike;
  }

  // 把完整軌跡另存一份到 R2，供前端在放大或匯出時直接抓
  private async storeFullTrack(hikeId: number, geometry: unknown) {
    try {
      const url = await this.uploadsService.uploadImmutableJson(geometry, 'tracks');
      await this.dataSource.query(`UPDATE hike_tracks SET track_url = $2 WHERE hike_id = $1`, [hikeId, url]);
    } catch (error) {
      this.logger.warn(`hike ${hikeId} 的完整軌跡沒能存進 R2，前端會退回使用簡化線：${String(error)}`);
    }
  }

  async findOne(id: number) {
    const hike = await this.hikesRepo.findOne({ where: { id } });
    if (!hike) throw new NotFoundException('找不到這筆健行紀錄');

    // 單筆詳細頁只有一條軌跡，直接給完整座標即可，不需要走 R2 那層
    const track = await this.dataSource.query(
      `${TRACK_META_SELECT}, ST_AsGeoJSON(geom, ${GEOJSON_PRECISION}) AS geojson
       FROM hike_tracks WHERE hike_id = $1`,
      [id],
    );

    return {
      ...hike,
      ...(track[0] ? toTrackMeta(track[0]) : { center: null, bbox: null, point_count: null, track_url: null }),
      geojson: track[0]?.geojson ? JSON.parse(track[0].geojson) : null,
    };
  }

  async findAll(userId?: number, includeGeojson = false) {
    const where = userId ? { user_id: userId } : {};
    const hikes = await this.hikesRepo.find({
      where,
      order: { date: 'DESC' },
    });
    if (hikes.length === 0) return [];

    const categoryRows = await this.dataSource.query(
      `SELECT h.id AS hike_id, c.name AS category_name
       FROM hikes h
       JOIN trail_category_map tcm ON tcm.trail_id = h.trail_id
       JOIN categories c ON c.id = tcm.category_id
       WHERE h.id = ANY($1)`,
      [hikes.map((hike) => hike.id)],
    );

    const categoryKeysByHikeId = new Map<number, Set<string>>();
    for (const row of categoryRows) {
      const key = CATEGORY_NAME_TO_ACHIEVEMENT_KEY[row.category_name];
      if (!key) continue;
      if (!categoryKeysByHikeId.has(row.hike_id)) categoryKeysByHikeId.set(row.hike_id, new Set());
      categoryKeysByHikeId.get(row.hike_id)!.add(key);
    }

    // center / bbox 很小，一律回傳；座標則只給簡化線，完整軌跡永遠不經過這個 API
    const trackRows: TrackRow[] = await this.dataSource.query(
      `${TRACK_META_SELECT}${includeGeojson ? `, ST_AsGeoJSON(geom_simplified, ${GEOJSON_PRECISION}) AS geojson` : ''}
       FROM hike_tracks WHERE hike_id = ANY($1)`,
      [hikes.map((hike) => hike.id)],
    );
    const trackByHikeId = new Map(trackRows.map((row) => [row.hike_id, row]));

    return hikes.map((hike) => {
      const keys = categoryKeysByHikeId.get(hike.id) ?? new Set();
      const track = trackByHikeId.get(hike.id);
      return {
        ...hike,
        is_hundred: keys.has('hundred'),
        is_small_hundred: keys.has('small_hundred'),
        is_hundred_trail: keys.has('hundred_trail'),
        ...(track ? toTrackMeta(track) : { center: null, bbox: null, point_count: null, track_url: null }),
        ...(includeGeojson ? { geojson: track?.geojson ? JSON.parse(track.geojson) : null } : {}),
      };
    });
  }

  // 只回傳 bbox 與目前視野相交的紀錄。走 hike_tracks 的 GiST 索引，
  // 資料量長大以後就不必再把整個人的軌跡一次送到前端。
  async findInView(bbox: [number, number, number, number], userId?: number) {
    const [minLng, minLat, maxLng, maxLat] = bbox;

    const rows: (TrackRow & { id: number; name: string })[] = await this.dataSource.query(
      `SELECT h.id, h.name,
              t.hike_id,
              ST_X(t.center) AS lng, ST_Y(t.center) AS lat,
              ST_XMin(t.bbox) AS min_lng, ST_YMin(t.bbox) AS min_lat,
              ST_XMax(t.bbox) AS max_lng, ST_YMax(t.bbox) AS max_lat,
              t.point_count, t.track_url,
              ST_AsGeoJSON(t.geom_simplified, ${GEOJSON_PRECISION}) AS geojson
       FROM hike_tracks t
       JOIN hikes h ON h.id = t.hike_id
       WHERE t.bbox && ST_MakeEnvelope($1, $2, $3, $4, 4326)
         AND ($5::int IS NULL OR h.user_id = $5)`,
      [minLng, minLat, maxLng, maxLat, userId ?? null],
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      ...toTrackMeta(row),
      geojson: row.geojson ? JSON.parse(row.geojson) : null,
    }));
  }

  async getStats(userId: number): Promise<HikeStatsDto> {
    const totals = await this.dataSource.query(
      `SELECT COALESCE(SUM(distance_km), 0) AS total_distance_km, COUNT(*) AS hike_count
       FROM hikes WHERE user_id = $1`,
      [userId],
    );

    const monthlyDistance = await this.dataSource.query(
      `SELECT TO_CHAR(date, 'YYYY-MM') AS month, SUM(distance_km) AS distance_km
       FROM hikes WHERE user_id = $1
       GROUP BY month ORDER BY month`,
      [userId],
    );

    const countyStats = await this.dataSource.query(
      `SELECT county, COUNT(*) AS count
       FROM hikes WHERE user_id = $1 AND county IS NOT NULL
       GROUP BY county ORDER BY count DESC`,
      [userId],
    );

    const achievementRows = await this.dataSource.query(
      `SELECT c.name AS category_name, COUNT(DISTINCT h.trail_id) AS count
       FROM hikes h
       JOIN trail_category_map tcm ON tcm.trail_id = h.trail_id
       JOIN categories c ON c.id = tcm.category_id
       WHERE h.user_id = $1 AND h.trail_id IS NOT NULL
       GROUP BY c.name`,
      [userId],
    );

    const achievements = { hundred: 0, small_hundred: 0, hundred_trail: 0 };
    for (const row of achievementRows) {
      const key = CATEGORY_NAME_TO_ACHIEVEMENT_KEY[row.category_name];
      if (key) achievements[key] = Number(row.count);
    }

    return {
      total_distance_km: Number(totals[0].total_distance_km),
      hike_count: Number(totals[0].hike_count),
      achievements,
      monthly_distance: monthlyDistance.map((row: { month: string; distance_km: string }) => ({
        month: row.month,
        distance_km: Number(row.distance_km),
      })),
      county_stats: countyStats.map((row: { county: string; count: string }) => ({
        county: row.county,
        count: Number(row.count),
      })),
    };
  }

  async remove(id: number, userId: number) {
    const hike = await this.hikesRepo.findOne({ where: { id } });
    if (!hike) throw new NotFoundException('找不到這筆健行紀錄');
    if (hike.user_id !== userId) {
      throw new ForbiddenException('無法刪除他人的健行紀錄');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(HikeCategoryMap).delete({ hike_id: id });
      await manager.getRepository(HikeTrack).delete({ hike_id: id });
      await manager.getRepository(Hike).delete(id);
    });
  }
}
