import type { Trail as RawTrail } from '../api/data-contracts';
import type { Trails as TrailsClient } from '../api/Trails';
import { toCamelCase } from './case';

export type Trail = {
  id: number;
  name: string;
  description: string | null;
  distanceKm: number | null;
};

export function adaptTrail(raw: RawTrail): Trail {
  return toCamelCase<RawTrail>(raw) as Trail;
}

export function createTrailsService(client: TrailsClient) {
  return {
    findAll: async () => (await client.trailsControllerFindAll()).map(adaptTrail),
    findOne: async (id: number) => adaptTrail(await client.trailsControllerFindOne(id)),
  };
}
