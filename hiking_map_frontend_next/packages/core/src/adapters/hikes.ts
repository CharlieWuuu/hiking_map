import type { CreateHikeDto as RawCreateHikeDto, Hike as RawHike, HikeStatsDto as RawHikeStatsDto } from '../api/data-contracts';
import type { Hikes as HikesClient } from '../api/Hikes';
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
  // GET /hikes?includeGeojson=true 才會附帶
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

export function createHikesService(client: HikesClient) {
  return {
    create: async (dto: CreateHikeDto) => adaptHike(await client.hikesControllerCreate(toCreateHikeDto(dto))),
    findAll: async (userId: string, includeGeojson = false) =>
      (await client.hikesControllerFindAll({ userId, includeGeojson: includeGeojson ? 'true' : 'false' })).map(adaptHike),
    findOne: async (id: number) => adaptHike(await client.hikesControllerFindOne(id)),
    remove: (id: number) => client.hikesControllerRemove(id),
    getStats: async (username: string) => adaptHikeStats(await client.hikesControllerGetStats({ username })),
  };
}
