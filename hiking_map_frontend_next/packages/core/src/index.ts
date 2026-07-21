import { createAuthService } from './adapters/auth';
import { createHikesService } from './adapters/hikes';
import { createMountainsService } from './adapters/mountains';
import { createProfileService } from './adapters/profile';
import { createCollectionsService, createFollowsService } from './adapters/social';
import { createTrailsService } from './adapters/trails';
import { Auth } from './api/Auth';
import { Collections } from './api/Collections';
import { Follows } from './api/Follows';
import { Hikes } from './api/Hikes';
import type { ApiConfig } from './api/http-client';
import { Mountains } from './api/Mountains';
import { Profile } from './api/Profile';
import { Trails } from './api/Trails';

// 後端回傳/接收的欄位是 snake_case，前端要用的是 camelCase。
// 這裡組裝出來的 service 已經套用過轉換，app 端不該直接 import ./api/* 下的生成檔案。
export function createApiClient(config?: ApiConfig) {
  return {
    auth: createAuthService(new Auth(config)),
    profile: createProfileService(new Profile(config)),
    hikes: createHikesService(new Hikes(config)),
    mountains: createMountainsService(new Mountains(config)),
    trails: createTrailsService(new Trails(config)),
    collections: createCollectionsService(new Collections(config)),
    follows: createFollowsService(new Follows(config)),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

export type { CreateHikeDto, Hike } from './adapters/hikes';
export type { Mountain } from './adapters/mountains';
export type { Profile as ProfileModel, UpdateProfileDto } from './adapters/profile';
export type { Collection, CreateCollectionDto, Follow } from './adapters/social';
export type { Trail, TrailDetail } from './adapters/trails';
export type { LoginDto, LoginResponseDto, RegisterDto, RegisterResponseDto } from './api/data-contracts';
