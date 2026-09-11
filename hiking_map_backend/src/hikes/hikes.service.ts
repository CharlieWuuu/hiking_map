import {
  BadRequestException,
  ConflictException,
  Injectable,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, In, SelectQueryBuilder } from 'typeorm';
import { Hike } from './hike.entity';
import { HikeTrack } from './hike-track.entity';
import { HikeMountainMap } from './hike-mountain-map.entity';
import { CreateHikeDto } from './dto/create-hike.dto';
import { UpdateHikeDto } from './dto/update-hike.dto';
import { HikeStatsDto } from './dto/hike-stats.dto';
import { MountainProgressDto } from './dto/mountain-progress.dto';
import { UploadsService } from '../uploads/uploads.service';
import { MergeHikesDto } from './dto/merge-hikes.dto';
import { TrimTrackDto } from './dto/trim-track.dto';
import { DropSegmentDto } from './dto/drop-segment.dto';
import { TrackGeometry, countPoints, dropSegment, mergeTracks, toSegments, trimTrack } from './track-edit.utils';

// 簡化軌跡的容差，單位是經緯度的「度」。0.00045 度在台灣的緯度約等於 45～50 公尺。
// 敢壓這麼兇是因為放大到看得出差別時，findInView 會依 zoom 直接改選 geom（完整軌跡）欄位。
const SIMPLIFY_TOLERANCE_DEG = 0.00045;

// zoom 分層門檻，需與前端 lib/mapStore.ts 的 CLUSTER_ZOOM / DETAIL_ZOOM 保持一致——
// findInView 依這兩個值決定回傳點位 / 簡化線 / 完整軌跡，前端只是照著畫，門檻本身以後端這份為準
const CLUSTER_ZOOM = 10;
const DETAIL_ZOOM = 14;

// GeoJSON 輸出的小數位數。6 位約等於 0.1 公尺，對登山軌跡遠遠夠用，
// 而 PostGIS 預設的 9 位會讓每個座標多出三分之一的長度。
const GEOJSON_PRECISION = 6;

// categories.name -> 前端使用的 achievements 欄位名稱
const CATEGORY_NAME_TO_ACHIEVEMENT_KEY: Record<string, 'hundred' | 'small_hundred' | 'hundred_trail'> = {
  百岳: 'hundred',
  小百岳: 'small_hundred',
  百大必訪步道: 'hundred_trail',
};

// 前端搜尋頁分類 key（camelCase）-> categories.name，跟 search.service.ts 的對照表意義相同
const CATEGORY_KEY_TO_NAME: Record<string, string> = {
  hundred: '百岳',
  smallHundred: '小百岳',
  hundredTrail: '百大必訪步道',
};

// 百岳/小百岳靠 hike_mountains 關聯的山是否屬於該分類；百大必訪步道靠 hike.trail_id 對應 trail_category_map。
// 一筆 hike 只要滿足其中一種就算數，用 EXISTS 子查詢，不會因為一筆 hike 對到多座山/多分類而重複列出
function applyCategoryFilter(qb: SelectQueryBuilder<Hike>, categoryName: string) {
  qb.andWhere(
    `(
      EXISTS (
        SELECT 1 FROM hike_mountains hm
        JOIN mountain_category_map mcm ON mcm.mountain_id = hm.mountain_id
        JOIN categories c ON c.id = mcm.category_id
        WHERE hm.hike_id = hike.id AND c.name = :categoryName
      )
      OR EXISTS (
        SELECT 1 FROM trail_category_map tcm
        JOIN categories c ON c.id = tcm.category_id
        WHERE tcm.trail_id = hike.trail_id AND c.name = :categoryName
      )
    )`,
    { categoryName },
  );
}

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

      if (dto.mountain_ids?.length) {
        await manager.getRepository(HikeMountainMap).insert(
          dto.mountain_ids.map((mountain_id) => ({
            hike_id: hike.id,
            mountain_id,
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

  // 只更新一般屬性（名稱、縣市、日期、公開狀態、分類、連結、說明），不碰軌跡本身
  async update(id: number, userId: number, dto: UpdateHikeDto) {
    await this.findOwnedHike(id, userId);

    await this.dataSource.transaction(async (manager) => {
      const fields: Record<string, unknown> = {};
      if (dto.name !== undefined) fields.name = dto.name;
      if (dto.county !== undefined) fields.county = dto.county;
      if (dto.town !== undefined) fields.town = dto.town;
      if (dto.date !== undefined) fields.date = dto.date;
      if (dto.is_public !== undefined) fields.is_public = dto.is_public;
      if (dto.urls !== undefined) fields.urls = dto.urls;
      if (dto.note !== undefined) fields.note = dto.note;

      if (Object.keys(fields).length > 0) {
        await manager.getRepository(Hike).update(id, fields);
      }

      // mountain_ids 是整批取代（不是像分類那樣逐個開關），前端每次都送完整清單比較好操作
      if (dto.mountain_ids !== undefined) {
        await manager.getRepository(HikeMountainMap).delete({ hike_id: id });
        if (dto.mountain_ids.length) {
          await manager.getRepository(HikeMountainMap).insert(
            dto.mountain_ids.map((mountain_id) => ({
              hike_id: id,
              mountain_id,
            })),
          );
        }
      }
    });

    return this.findOne(id);
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

    const mountainRows: { mountain_id: number }[] = await this.dataSource.query(
      `SELECT mountain_id FROM hike_mountains WHERE hike_id = $1`,
      [id],
    );

    return {
      ...hike,
      ...(track[0] ? toTrackMeta(track[0]) : { center: null, bbox: null, point_count: null, track_url: null }),
      geojson: track[0]?.geojson ? JSON.parse(track[0].geojson) : null,
      mountain_ids: mountainRows.map((row) => row.mountain_id),
    };
  }

  // cursor 沒給時維持原本行為（回傳完整陣列，不分頁）——首頁、chart 頁要拿全部紀錄去算統計/圖表，
  // 硬分頁反而要它們自己再迴圈把每頁串起來，划不來。只有 /data 清單頁需要真正分頁，帶 cursor 才會走分頁邏輯。
  // cursor 用 `date_id`（例如 '2026-07-20_42'）編碼，(date, id) 複合排序才不會因為同一天多筆而重複/漏筆
  async findAll(
    userId?: number,
    includeGeojson = false,
    pagination?: { cursor?: string; limit: number },
    category?: string,
  ) {
    const where = userId ? { user_id: userId } : {};
    const categoryName = category ? CATEGORY_KEY_TO_NAME[category] : undefined;
    if (category && !categoryName) throw new BadRequestException('不明的分類');

    let totalCount: number | undefined;
    let nextCursor: string | null = null;
    let hikes: Hike[];

    if (pagination) {
      const countQb = this.hikesRepo.createQueryBuilder('hike').where(userId ? 'hike.user_id = :userId' : '1=1', { userId });
      if (categoryName) applyCategoryFilter(countQb, categoryName);
      totalCount = await countQb.getCount();

      const qb = this.hikesRepo
        .createQueryBuilder('hike')
        .where(userId ? 'hike.user_id = :userId' : '1=1', { userId })
        .orderBy('hike.date', 'DESC')
        .addOrderBy('hike.id', 'DESC')
        .take(pagination.limit + 1); // 多拿一筆用來判斷還有沒有下一頁，不必另外查一次
      if (categoryName) applyCategoryFilter(qb, categoryName);

      if (pagination.cursor) {
        const [cursorDate, cursorIdRaw] = pagination.cursor.split('_');
        const cursorId = Number(cursorIdRaw);
        if (!cursorDate || Number.isNaN(cursorId)) throw new BadRequestException('cursor 格式錯誤');
        qb.andWhere('(hike.date < :cursorDate OR (hike.date = :cursorDate AND hike.id < :cursorId))', {
          cursorDate,
          cursorId,
        });
      }

      const rows = await qb.getMany();
      const hasMore = rows.length > pagination.limit;
      hikes = hasMore ? rows.slice(0, pagination.limit) : rows;
      const last = hikes[hikes.length - 1];
      nextCursor = hasMore && last ? `${last.date}_${last.id}` : null;
    } else if (categoryName) {
      const qb = this.hikesRepo
        .createQueryBuilder('hike')
        .where(userId ? 'hike.user_id = :userId' : '1=1', { userId })
        .orderBy('hike.date', 'DESC');
      applyCategoryFilter(qb, categoryName);
      hikes = await qb.getMany();
    } else {
      hikes = await this.hikesRepo.find({ where, order: { date: 'DESC' } });
    }

    if (hikes.length === 0) return pagination ? { items: [], total_count: totalCount ?? 0, next_cursor: null } : [];

    // center / bbox 很小，一律回傳；座標則只給簡化線，完整軌跡永遠不經過這個 API
    const trackRows: TrackRow[] = await this.dataSource.query(
      `${TRACK_META_SELECT}${includeGeojson ? `, ST_AsGeoJSON(geom_simplified, ${GEOJSON_PRECISION}) AS geojson` : ''}
       FROM hike_tracks WHERE hike_id = ANY($1)`,
      [hikes.map((hike) => hike.id)],
    );
    const trackByHikeId = new Map(trackRows.map((row) => [row.hike_id, row]));

    // 讓清單頁進編輯模式時不必再另外打一次 findOne 才能顯示已標記的山頭
    const mountainRows: { hike_id: number; mountain_id: number }[] = await this.dataSource.query(
      `SELECT hike_id, mountain_id FROM hike_mountains WHERE hike_id = ANY($1)`,
      [hikes.map((hike) => hike.id)],
    );
    const mountainIdsByHikeId = new Map<number, number[]>();
    for (const row of mountainRows) {
      if (!mountainIdsByHikeId.has(row.hike_id)) mountainIdsByHikeId.set(row.hike_id, []);
      mountainIdsByHikeId.get(row.hike_id)!.push(row.mountain_id);
    }

    // 清單卡片要顯示分類 tag：百岳/小百岳來自 hike_mountains 關聯的山，百大必訪步道來自 hike.trail_id
    const categoryRows: { hike_id: number; category_name: string }[] = await this.dataSource.query(
      `SELECT hm.hike_id, c.name AS category_name
       FROM hike_mountains hm
       JOIN mountain_category_map mcm ON mcm.mountain_id = hm.mountain_id
       JOIN categories c ON c.id = mcm.category_id
       WHERE hm.hike_id = ANY($1)
       UNION
       SELECT h.id AS hike_id, c.name AS category_name
       FROM hikes h
       JOIN trail_category_map tcm ON tcm.trail_id = h.trail_id
       JOIN categories c ON c.id = tcm.category_id
       WHERE h.id = ANY($1)`,
      [hikes.map((hike) => hike.id)],
    );
    const categoryNamesByHikeId = new Map<number, string[]>();
    for (const row of categoryRows) {
      if (!categoryNamesByHikeId.has(row.hike_id)) categoryNamesByHikeId.set(row.hike_id, []);
      categoryNamesByHikeId.get(row.hike_id)!.push(row.category_name);
    }

    const items = hikes.map((hike) => {
      const track = trackByHikeId.get(hike.id);
      return {
        ...hike,
        mountain_ids: mountainIdsByHikeId.get(hike.id) ?? [],
        category_names: categoryNamesByHikeId.get(hike.id) ?? [],
        ...(track ? toTrackMeta(track) : { center: null, bbox: null, point_count: null, track_url: null }),
        ...(includeGeojson ? { geojson: track?.geojson ? JSON.parse(track.geojson) : null } : {}),
      };
    });

    return pagination ? { items, total_count: totalCount ?? 0, next_cursor: nextCursor } : items;
  }

  // 給定一筆紀錄，算出它在 findAll 分頁排序（date DESC, id DESC）下位於第幾頁，
  // 讓地圖點擊某條路線時，清單能自動跳到對應那頁。cursor 沿用 findAll 的 `date_id` 編碼。
  async getPageInfo(hikeId: number, userId: number, limit: number) {
    const hike = await this.hikesRepo.findOne({ where: { id: hikeId, user_id: userId } });
    if (!hike) throw new NotFoundException('找不到這筆紀錄');

    const rankRows = await this.dataSource.query(
      `SELECT COUNT(*) AS rank FROM hikes
       WHERE user_id = $1 AND (date > $2 OR (date = $2 AND id > $3))`,
      [userId, hike.date, hike.id],
    );
    const rank = Number(rankRows[0].rank);
    const page = Math.floor(rank / limit) + 1;

    let cursor: string | null = null;
    if (rank > 0) {
      const cursorRows = await this.dataSource.query(
        `SELECT date, id FROM hikes WHERE user_id = $1
         ORDER BY date DESC, id DESC
         OFFSET $2 LIMIT 1`,
        [userId, rank - 1],
      );
      const cursorHike = cursorRows[0];
      cursor = cursorHike ? `${cursorHike.date instanceof Date ? cursorHike.date.toISOString().slice(0, 10) : cursorHike.date}_${cursorHike.id}` : null;
    }

    return { page, cursor };
  }

  // 只回傳 bbox 與目前視野相交的紀錄，同一個端點依 zoom 決定回傳的細緻度：
  // < CLUSTER_ZOOM 只給點位（遠景 cluster），CLUSTER_ZOOM ~ DETAIL_ZOOM 給簡化線，
  // >= DETAIL_ZOOM 直接給完整軌跡——選中單一路線平移過去時常常一步就跨進 DETAIL_ZOOM，
  // 這裡一次到位就不必再讓前端另外跑一趟去 R2 抓完整軌跡，也不會有「先粗後細」的過渡。
  // 走 hike_tracks 的 GiST 索引，資料量長大以後就不必再把整個人的軌跡一次送到前端。
  async findInView(bbox: [number, number, number, number], userId?: number, zoom = 0, category?: string) {
    const [minLng, minLat, maxLng, maxLat] = bbox;
    const categoryName = category ? CATEGORY_KEY_TO_NAME[category] : undefined;
    if (category && !categoryName) throw new BadRequestException('不明的分類');

    // 遠 zoom 只需要點位置，geojson 欄位整個不查、不傳，省頻寬
    const geojsonSelect =
      zoom >= DETAIL_ZOOM
        ? `, ST_AsGeoJSON(t.geom, ${GEOJSON_PRECISION}) AS geojson`
        : zoom >= CLUSTER_ZOOM
          ? `, ST_AsGeoJSON(t.geom_simplified, ${GEOJSON_PRECISION}) AS geojson`
          : '';

    // 跟 applyCategoryFilter 同一套判斷邏輯（百岳/小百岳看 hike_mountains，百大必訪步道看 h.trail_id），
    // 這裡是原生 SQL 不是 QueryBuilder，只能重寫一次子查詢
    const categoryCondition = categoryName
      ? `AND (
          EXISTS (
            SELECT 1 FROM hike_mountains hm
            JOIN mountain_category_map mcm ON mcm.mountain_id = hm.mountain_id
            JOIN categories c ON c.id = mcm.category_id
            WHERE hm.hike_id = h.id AND c.name = $6
          )
          OR EXISTS (
            SELECT 1 FROM trail_category_map tcm
            JOIN categories c ON c.id = tcm.category_id
            WHERE tcm.trail_id = h.trail_id AND c.name = $6
          )
        )`
      : '';

    const rows: (TrackRow & { id: number; name: string; geojson?: string | null })[] = await this.dataSource.query(
      `SELECT h.id, h.name,
              t.hike_id,
              ST_X(t.center) AS lng, ST_Y(t.center) AS lat,
              ST_XMin(t.bbox) AS min_lng, ST_YMin(t.bbox) AS min_lat,
              ST_XMax(t.bbox) AS max_lng, ST_YMax(t.bbox) AS max_lat,
              t.point_count, t.track_url
              ${geojsonSelect}
       FROM hike_tracks t
       JOIN hikes h ON h.id = t.hike_id
       WHERE t.bbox && ST_MakeEnvelope($1, $2, $3, $4, 4326)
         AND ($5::int IS NULL OR h.user_id = $5)
         ${categoryCondition}`,
      categoryName ? [minLng, minLat, maxLng, maxLat, userId ?? null, categoryName] : [minLng, minLat, maxLng, maxLat, userId ?? null],
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

    // 百岳／小百岳：透過 hike_mountains 算「不重複完成幾座山」，不依賴幾乎沒人填的 trail_id。
    // 同一座山爬了三次也只算一座，這是「完成度」的正確定義（跟 hike 筆數不同）
    const mountainAchievementRows = await this.dataSource.query(
      `SELECT c.name AS category_name, COUNT(DISTINCT hm.mountain_id) AS count
       FROM hike_mountains hm
       JOIN hikes h ON h.id = hm.hike_id
       JOIN mountain_category_map mcm ON mcm.mountain_id = hm.mountain_id
       JOIN categories c ON c.id = mcm.category_id
       WHERE h.user_id = $1
       GROUP BY c.name`,
      [userId],
    );

    // 百大必訪步道：本來就是路線層級的屬性，跟具體是哪座山無關，靠 hike.trail_id 對應到 trails 的分類
    const hundredTrailRows = await this.dataSource.query(
      `SELECT COUNT(DISTINCT h.id) AS count
       FROM hikes h
       JOIN trail_category_map tcm ON tcm.trail_id = h.trail_id
       JOIN categories c ON c.id = tcm.category_id
       WHERE h.user_id = $1 AND c.name = '百大必訪步道'`,
      [userId],
    );

    const achievements = { hundred: 0, small_hundred: 0, hundred_trail: 0 };
    for (const row of mountainAchievementRows) {
      const key = CATEGORY_NAME_TO_ACHIEVEMENT_KEY[row.category_name];
      if (key) achievements[key] = Number(row.count);
    }
    achievements.hundred_trail = Number(hundredTrailRows[0]?.count ?? 0);

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

  // 百岳／小百岳完成度：依分類列出「已完成」與「還缺」的山頭清單，
  // 跟 getStats 的 achievements 用同一份 hike_mountains 資料，只是這裡要逐座列出來而不是只給數字
  async getMountainProgress(userId: number): Promise<MountainProgressDto> {
    const rows: {
      category_name: string;
      id: number;
      name: string;
      elevation_m: number;
      completed: boolean;
    }[] = await this.dataSource.query(
      `SELECT c.name AS category_name, m.id, m.name, m.elevation_m,
              EXISTS(
                SELECT 1 FROM hike_mountains hm
                JOIN hikes h ON h.id = hm.hike_id
                WHERE hm.mountain_id = m.id AND h.user_id = $1
              ) AS completed
       FROM mountains m
       JOIN mountain_category_map mcm ON mcm.mountain_id = m.id
       JOIN categories c ON c.id = mcm.category_id
       WHERE c.name IN ('百岳', '小百岳')
       ORDER BY c.name, m.name`,
      [userId],
    );

    const grouped: MountainProgressDto = {
      hundred: { completed: [], missing: [] },
      small_hundred: { completed: [], missing: [] },
    };

    for (const row of rows) {
      const key = row.category_name === '百岳' ? 'hundred' : 'small_hundred';
      const bucket = row.completed ? grouped[key].completed : grouped[key].missing;
      bucket.push({ id: row.id, name: row.name, elevation_m: row.elevation_m });
    }

    return grouped;
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

  // 刪掉整段 segment，用於 GPS 飄移產生的雜訊段
  async dropTrackSegment(hikeId: number, userId: number, dto: DropSegmentDto) {
    await this.findOwnedHike(hikeId, userId);

    const result = await this.dataSource.transaction(async (manager) => {
      const geometry = await this.loadTrackGeometry(hikeId, manager, true);

      const segmentCount = toSegments(geometry).length;
      if (dto.expected_segment_count !== undefined && dto.expected_segment_count !== segmentCount) {
        throw new ConflictException(
          `軌跡有 ${segmentCount} 段，與你送出的 ${dto.expected_segment_count} 不符。請重新載入後再操作`,
        );
      }

      let dropped: TrackGeometry;
      try {
        dropped = dropSegment(geometry, dto.segment_index);
      } catch (error) {
        throw new BadRequestException((error as Error).message);
      }

      await this.writeTrack(manager, hikeId, dropped);
      await this.recalcDistance(manager, hikeId);
      return dropped;
    });

    await this.storeFullTrack(hikeId, result);
    return this.findOne(hikeId);
  }

  // 把多筆紀錄的軌跡合併成一筆新紀錄（例如多日縱走各天分開上傳）。
  // 來源預設保留，要刪得明確指定 delete_sources。
  async merge(userId: number, dto: MergeHikesDto) {
    // 型別、長度、重複與日期格式都由 MergeHikesDto 的驗證裝飾器擋掉了，
    // 這裡只處理需要查資料庫才知道的規則。
    const ids = dto.hike_ids;

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

      if (dto.delete_sources) {
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
      await manager.getRepository(HikeTrack).delete({ hike_id: id });
      await manager.getRepository(Hike).delete(id);
    });

    // 紀錄刪了，R2 上那份完整軌跡沒人會再讀，留著只是個仍可公開存取的孤兒
    await this.uploadsService.deleteByUrl(track[0]?.track_url);
  }
}
