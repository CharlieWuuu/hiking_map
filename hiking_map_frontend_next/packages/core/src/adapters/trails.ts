import type { Trail as RawTrail, TrailDetailDto as RawTrailDetail } from '../api/data-contracts';
import type { Trails as TrailsClient } from '../api/Trails';
import { toCamelCase } from './case';

export type Trail = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  distanceKm: number | null;
};

export type TrailDetail = Trail & {
  geojson: object | null;
};

export function adaptTrail(raw: RawTrail): Trail {
  return toCamelCase<RawTrail>(raw) as Trail;
}

export function adaptTrailDetail(raw: RawTrailDetail): TrailDetail {
  return toCamelCase<RawTrailDetail>(raw) as TrailDetail;
}

export function createTrailsService(client: TrailsClient) {
  return {
    findAll: async () => (await client.trailsControllerFindAll()).map(adaptTrail),
    findOne: async (slug: string) => adaptTrailDetail(await client.trailsControllerFindOne(slug)),
  };
}
