import {
  BadRequestException,
  ConflictException,
  Injectable,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, In } from 'typeorm';
import { Hike } from './hike.entity';
import { HikeTrack } from './hike-track.entity';
import { HikeCategoryMap } from './hike-category-map.entity';
import { CreateHikeDto } from './dto/create-hike.dto';
import { HikeStatsDto } from './dto/hike-stats.dto';
import { UploadsService } from '../uploads/uploads.service';
import { MergeHikesDto } from './dto/merge-hikes.dto';
import { TrimTrackDto } from './dto/trim-track.dto';
import { TrackGeometry, countPoints, mergeTracks, trimTrack } from './track-edit.utils';

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
      // 這是輸入格式問題，不是權限問題
      throw new BadRequestException('geojson 中沒有可用的軌跡');
    }

    const hike = await this.dataSource.transaction(async (manager) => {
      const hike = await manager.getRepository(Hike).save({
        user_id: userId,
        trail_id: dto.trail_id ?? null,
        name: dto.name,
        county: dto.county ?? null,
        town: dto.town ?? null,
        date: dto.date,
        distance_km: 0, // 隨即由 recalcDistance 從軌跡算出
        is_public: dto.is_public ?? true,
        note: dto.note ?? null,
        urls: dto.urls ?? [],
        cover_image_url: dto.cover_image_url ?? null,
      });

      await this.writeTrack(manager, hike.id, feature.geometry as TrackGeometry);

      // 距離一律由 PostGIS 從軌跡算，不採用前端送來的 distance_km。
      // 否則新建與編輯會是兩套定義，getStats 等於在加總兩種不同的數字。
      await this.recalcDistance(manager, hike.id);

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

  // 寫入（或覆蓋）一筆軌跡。簡化線與 point_count 都在同一句 SQL 由 geom 推導，
  // 所以不管是新建還是編輯，三者永遠一致。
  private async writeTrack(manager: EntityManager, hikeId: number, geometry: TrackGeometry) {
    await manager.query(
      `INSERT INTO hike_tracks (hike_id, geom, geom_simplified, point_count)
       SELECT $1, g, ST_Multi(ST_SimplifyPreserveTopology(g, $3)), ST_NPoints(g)
       FROM (SELECT ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON($2), 4326)) AS g) AS source
       ON CONFLICT (hike_id) DO UPDATE
         SET geom = EXCLUDED.geom,
             geom_simplified = EXCLUDED.geom_simplified,
             point_count = EXCLUDED.point_count,
             track_url = NULL`,
      [hikeId, JSON.stringify(geometry), SIMPLIFY_TOLERANCE_DEG],
    );
  }

  // 編輯過軌跡以後距離一定變了，交給 PostGIS 用 geography 重算，
  // 比在 JS 裡自己寫 haversine 準，也少一份要維護的公式。
  private async recalcDistance(manager: EntityManager, hikeId: number) {
    await manager.query(
      `UPDATE hikes SET distance_km = COALESCE(
         (SELECT ST_Length(geom::geography) / 1000 FROM hike_tracks WHERE hike_id = $1), 0)
       WHERE id = $1`,
      [hikeId],
    );
  }

  // 取出完整軌跡（真實來源），編輯一律以它為基準，不能拿簡化線去編
  // lock=true 會在交易內鎖住這列，避免兩個並行的編輯各自讀到編輯前的軌跡、
  // 後寫的那個把先寫的成果整個蓋掉。
  private async loadTrackGeometry(
    hikeId: number,
    runner: EntityManager | DataSource = this.dataSource,
    lock = false,
  ): Promise<TrackGeometry> {
    const rows = await runner.query(
      `SELECT ST_AsGeoJSON(geom) AS geojson FROM hike_tracks WHERE hike_id = $1${lock ? ' FOR UPDATE' : ''}`,
      [hikeId],
    );
    if (!rows[0]?.geojson) {
      throw new NotFoundException('這筆紀錄沒有軌跡可以編輯');
    }
    return JSON.parse(rows[0].geojson) as TrackGeometry;
  }

  private async findOwnedHike(hikeId: number, userId: number, action = '編輯'): Promise<Hike> {
    const hike = await this.hikesRepo.findOne({ where: { id: hikeId } });
    if (!hike) throw new NotFoundException('找不到這筆健行紀錄');
    if (hike.user_id !== userId) {
      throw new ForbiddenException(`無法${action}他人的健行紀錄`);
    }
    return hike;
  }

  // 把完整軌跡另存一份到 R2，供前端在放大或匯出時直接抓
  private async storeFullTrack(hikeId: number, geometry: unknown) {
    try {
      // 編輯過的紀錄會有一份舊的，換上新網址之後那份就沒人讀得到了
      const previous: { track_url: string | null }[] = await this.dataSource.query(
        `SELECT track_url FROM hike_tracks WHERE hike_id = $1`,
        [hikeId],
      );

      const url = await this.uploadsService.uploadImmutableJson(geometry, 'tracks');
      await this.dataSource.query(`UPDATE hike_tracks SET track_url = $2 WHERE hike_id = $1`, [hikeId, url]);

      // 新網址寫進資料庫之後才刪舊的，中途失敗也不會留下指向已刪檔案的紀錄
      await this.uploadsService.deleteByUrl(previous[0]?.track_url);
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

  // 裁切軌跡頭尾。索引是攤平後的點序號，由前端從 point_count 或完整軌跡推得。
  async trimTrack(hikeId: number, userId: number, dto: TrimTrackDto) {
    await this.findOwnedHike(hikeId, userId);

    // 讀取與寫入必須在同一個交易裡，中間隔著一次 HTTP 往返的話就擋不住並行編輯
    const trimmed = await this.dataSource.transaction(async (manager) => {
      const geometry = await this.loadTrackGeometry(hikeId, manager, true);

      // 索引必須以完整軌跡為基準。前端若拿列表 API 的簡化線去算，
      // 索引仍會落在合法範圍內，卻會裁到完全不同的位置。
      const total = countPoints(geometry);
      if (dto.expected_point_count !== undefined && dto.expected_point_count !== total) {
        throw new ConflictException(
          `軌跡有 ${total} 個點，與你送出的 ${dto.expected_point_count} 不符。請重新載入完整軌跡後再裁切`,
        );
      }

      let result: TrackGeometry;
      try {
        result = trimTrack(geometry, dto.start_index, dto.end_index);
      } catch (error) {
        // 純函式用 Error 表達「輸入不合理」，到了 HTTP 這層要翻成 400
        throw new BadRequestException((error as Error).message);
      }

      await this.writeTrack(manager, hikeId, result);
      await this.recalcDistance(manager, hikeId);
      return result;
    });

    await this.storeFullTrack(hikeId, trimmed);
    return this.findOne(hikeId);
  }

  // 把多筆紀錄的軌跡合併成一筆新紀錄（例如多日縱走各天分開上傳）。
  // 來源預設保留，要刪得明確指定 delete_sources。
  async merge(userId: number, dto: MergeHikesDto) {
    // 專案目前沒有全域 ValidationPipe，DTO 只是型別宣告，執行期擋不住任何東西，
    // 所以這裡自己驗。移除前請先確認 main.ts 已掛上 ValidationPipe。
    const ids = dto.hike_ids ?? [];
    if (!Array.isArray(ids) || ids.some((id) => !Number.isInteger(id))) {
      throw new BadRequestException('hike_ids 必須是整數陣列');
    }
    if (typeof dto.name !== 'string' || dto.name.trim() === '') {
      throw new BadRequestException('name 不可為空');
    }
    if (dto.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(dto.date)) {
      throw new BadRequestException('date 格式應為 YYYY-MM-DD');
    }
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('hike_ids 不可重複');
    }
    if (ids.length < 2) {
      throw new BadRequestException('合併至少需要兩筆紀錄');
    }

    const hikes = await this.hikesRepo.find({ where: { id: In(ids) } });
    if (hikes.length !== ids.length) {
      throw new NotFoundException('有些紀錄不存在');
    }
    if (hikes.some((hike) => hike.user_id !== userId)) {
      throw new ForbiddenException('無法合併他人的健行紀錄');
    }

    // 依照 dto 給的順序取軌跡，而不是資料庫回傳的順序
    const byId = new Map(hikes.map((hike) => [hike.id, hike]));
    const geometries = await Promise.all(ids.map((id) => this.loadTrackGeometry(id)));

    let merged: TrackGeometry;
    try {
      merged = mergeTracks(geometries);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    const sources = ids.map((id) => byId.get(id)!);

    // 合併後的新紀錄只留得住一個 trail_id，而 getStats 是用
    // COUNT(DISTINCT h.trail_id) 算成就的。來源分屬不同官方步道時若把它們刪掉，
    // 成就數就會憑空減少且無法復原——寧可擋下來，讓使用者自己決定。
    const distinctTrailIds = new Set(sources.map((s) => s.trail_id).filter((id) => id !== null));
    if (dto.delete_sources && distinctTrailIds.size > 1) {
      throw new BadRequestException(
        `這幾筆紀錄分屬 ${distinctTrailIds.size} 條官方步道，刪除來源會讓成就統計少算。請改為保留來源（delete_sources = false）`,
      );
    }
    const earliest = sources.map((hike) => hike.date).sort()[0];
    const first = sources[0];

    const created = await this.dataSource.transaction(async (manager) => {
      const hike = await manager.getRepository(Hike).save({
        user_id: userId,
        trail_id: first.trail_id,
        name: dto.name,
        county: first.county,
        town: first.town,
        date: dto.date ?? earliest,
        distance_km: 0, // 隨即由 recalcDistance 從合併後的軌跡算出
        is_public: sources.every((source) => source.is_public),
        note: null,
        urls: [],
        cover_image_url: first.cover_image_url,
      });

      await this.writeTrack(manager, hike.id, merged);
      await this.recalcDistance(manager, hike.id);

      // 成就是用 trail_id 算的（getStats 的 COUNT(DISTINCT h.trail_id)），
      // 而合併後的新紀錄只留得住第一筆的 trail_id。三天縱走三座百岳若把來源刪掉，
      // 百岳數會從 3 掉到 1，所以來源的分類對應要一併搬到新紀錄上。
      const sourceCategories: { category_id: number }[] = await manager.query(
        `SELECT DISTINCT category_id FROM hike_category_map WHERE hike_id = ANY($1)`,
        [ids],
      );
      if (sourceCategories.length) {
        await manager.getRepository(HikeCategoryMap).insert(
          sourceCategories.map((row) => ({
            hike_id: hike.id,
            category_id: row.category_id,
          })),
        );
      }

      if (dto.delete_sources) {
        await manager.getRepository(HikeCategoryMap).delete({ hike_id: In(ids) });
        await manager.getRepository(HikeTrack).delete({ hike_id: In(ids) });
        await manager.getRepository(Hike).delete(ids);
      }

      return hike;
    });

    await this.storeFullTrack(created.id, merged);
    return this.findOne(created.id);
  }

  async remove(id: number, userId: number) {
    await this.findOwnedHike(id, userId, '刪除');

    // 交易外先取，因為交易一結束這筆就查不到了
    const track: { track_url: string | null }[] = await this.dataSource.query(
      `SELECT track_url FROM hike_tracks WHERE hike_id = $1`,
      [id],
    );

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(HikeCategoryMap).delete({ hike_id: id });
      await manager.getRepository(HikeTrack).delete({ hike_id: id });
      await manager.getRepository(Hike).delete(id);
    });

    // 紀錄刪了，R2 上那份完整軌跡沒人會再讀，留著只是個仍可公開存取的孤兒
    await this.uploadsService.deleteByUrl(track[0]?.track_url);
  }
}
