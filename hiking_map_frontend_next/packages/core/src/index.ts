import { Auth } from './api/Auth';
import { Collections } from './api/Collections';
import { Follows } from './api/Follows';
import { Hikes } from './api/Hikes';
import type { ApiConfig } from './api/http-client';
import { Mountains } from './api/Mountains';
import { Profile } from './api/Profile';
import { Trails } from './api/Trails';

export * from './api/data-contracts';

export function createApiClient(config?: ApiConfig) {
  return {
    auth: new Auth(config),
    profile: new Profile(config),
    hikes: new Hikes(config),
    mountains: new Mountains(config),
    trails: new Trails(config),
    collections: new Collections(config),
    follows: new Follows(config),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
