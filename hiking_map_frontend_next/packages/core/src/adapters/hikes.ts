import type { CreateHikeDto as RawCreateHikeDto, Hike as RawHike } from '../api/data-contracts';
import type { Hikes as HikesClient } from '../api/Hikes';
import { toCamelCase } from './case';

export type Hike = {
  id: number;
  userId: number;
  trailId: number | null;
  name: string;
  date: string;
  distanceKm: number;
  isPublic: boolean;
  note: string | null;
  createdAt: string;
};

export type CreateHikeDto = {
  name: string;
  date: string;
  distanceKm: number;
  isPublic?: boolean;
  note?: string;
  trailId?: number;
  categoryIds?: string[];
  geojson: object;
};

export function adaptHike(raw: RawHike): Hike {
  return toCamelCase<RawHike>(raw) as Hike;
}

export function toCreateHikeDto(dto: CreateHikeDto): RawCreateHikeDto {
  return {
    name: dto.name,
    date: dto.date,
    distance_km: dto.distanceKm,
    is_public: dto.isPublic,
    note: dto.note,
    trail_id: dto.trailId,
    category_ids: dto.categoryIds,
    geojson: dto.geojson,
  };
}

export function createHikesService(client: HikesClient) {
  return {
    create: async (dto: CreateHikeDto) => adaptHike(await client.hikesControllerCreate(toCreateHikeDto(dto))),
    findAll: async (userId: string) => (await client.hikesControllerFindAll({ userId })).map(adaptHike),
    findOne: async (id: number) => adaptHike(await client.hikesControllerFindOne(id)),
    remove: (id: number) => client.hikesControllerRemove(id),
  };
}
