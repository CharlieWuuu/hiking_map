import type {
  CreateHikeDto as RawCreateHikeDto,
  Hike as RawHike,
  HikeStatsDto as RawHikeStatsDto,
  InViewHikeDto as RawInViewHikeDto,
  UpdateHikeDto as RawUpdateHikeDto,
} from '../generated/data-contracts';
import type { Hikes as HikesClient } from '../generated/Hikes';
import { toCamelCase } from './case';

export type Hike = {
  id: number;
  userId: number;
  trailId: number | null;
  name: string;
  county: string | null;
  town: string | null;
  date: string;
  distanceKm: number;
  isPublic: boolean;
  note: string | null;
  urls: string[];
  coverImageUrl: string | null;
  createdAt: string;
  // GET /hikes 才會附帶，取決於這次紀錄對應的 trail 是否屬於對應分類
  isHundred?: boolean;
  isSmallHundred?: boolean;
  isHundredTrail?: boolean;
  // 軌跡的 meta，很小所以一律附帶
  center: [number, number] | null;
  bbox: [number, number, number, number] | null;
  pointCount: number | null;
  // 完整軌跡在 R2 的網址，放大或匯出時由瀏覽器直接抓
  trackUrl: string | null;
  // GET /hikes?includeGeojson=true 才會附帶，且只有簡化過的線
  geojson?: object | null;
};

export type CreateHikeDto = {
  name: string;
  county?: string;
  town?: string;
  date: string;
  distanceKm: number;
  isPublic?: boolean;
  note?: string;
  urls?: string[];
  coverImageUrl?: string;
  trailId?: number;
  categoryIds?: string[];
  geojson: object;
};

export type UpdateHikeDto = {
  name?: string;
  county?: string;
  town?: string;
  date?: string;
  isPublic?: boolean;
  isHundred?: boolean;
  isSmallHundred?: boolean;
  isHundredTrail?: boolean;
  urls?: string[];
  note?: string;
};

export type InViewHike = {
  id: number;
  name: string;
  center: [number, number] | null;
  bbox: [number, number, number, number] | null;
  pointCount: number | null;
  trackUrl: string | null;
  // 只有 includeGeojson=true 時才有值，這裡固定回 undefined 以外一律是簡化線
  geojson?: object | null;
};

export type HikeStats = {
  totalDistanceKm: number;
  hikeCount: number;
  achievements: {
    hundred: number;
    smallHundred: number;
    hundredTrail: number;
  };
  monthlyDistance: { month: string; distanceKm: number }[];
  countyStats: { county: string; count: number }[];
};

export function adaptHike(raw: RawHike): Hike {
  return toCamelCase<RawHike>(raw) as Hike;
}

export function adaptHikeStats(raw: RawHikeStatsDto): HikeStats {
  return toCamelCase<RawHikeStatsDto>(raw) as HikeStats;
}

export function adaptInViewHike(raw: RawInViewHikeDto): InViewHike {
  return toCamelCase<RawInViewHikeDto>(raw) as InViewHike;
}

export function toCreateHikeDto(dto: CreateHikeDto): RawCreateHikeDto {
  return {
    name: dto.name,
    county: dto.county,
    town: dto.town,
    date: dto.date,
    distance_km: dto.distanceKm,
    is_public: dto.isPublic,
    note: dto.note,
    urls: dto.urls,
    cover_image_url: dto.coverImageUrl,
    trail_id: dto.trailId,
    category_ids: dto.categoryIds,
    geojson: dto.geojson,
  };
}

export function toUpdateHikeDto(dto: UpdateHikeDto): RawUpdateHikeDto {
  return {
    name: dto.name,
    county: dto.county,
    town: dto.town,
    date: dto.date,
    is_public: dto.isPublic,
    is_hundred: dto.isHundred,
    is_small_hundred: dto.isSmallHundred,
    is_hundred_trail: dto.isHundredTrail,
    urls: dto.urls,
    note: dto.note,
  };
}

export function createHikesService(client: HikesClient) {
  return {
    create: async (dto: CreateHikeDto) => adaptHike(await client.hikesControllerCreate(toCreateHikeDto(dto))),
    findAll: async (userId: string, includeGeojson = false) =>
      (await client.hikesControllerFindAll({ userId, includeGeojson: includeGeojson ? 'true' : 'false' })).map(adaptHike),
    findOne: async (id: number) => adaptHike(await client.hikesControllerFindOne(id)),
    findInView: async (bbox: [number, number, number, number], userId?: string, includeGeojson = false) =>
      (
        await client.hikesControllerFindInView({
          bbox: bbox.join(','),
          userId,
          includeGeojson: includeGeojson ? 'true' : 'false',
        })
      ).map(adaptInViewHike),
    update: async (id: number, dto: UpdateHikeDto) => adaptHike(await client.hikesControllerUpdate(id, toUpdateHikeDto(dto))),
    remove: (id: number) => client.hikesControllerRemove(id),
    getStats: async (username: string) => adaptHikeStats(await client.hikesControllerGetStats({ username })),
  };
}
