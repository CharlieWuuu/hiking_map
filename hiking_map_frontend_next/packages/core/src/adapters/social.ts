import type { Collections as CollectionsClient } from '../api/Collections';
import type {
  Collection as RawCollection,
  CollectionItemDto as RawCollectionItemDto,
  CreateCollectionDto as RawCreateCollectionDto,
  Follow as RawFollow,
} from '../api/data-contracts';
import type { Follows as FollowsClient } from '../api/Follows';
import type { RequestParams } from '../api/http-client';
import { toCamelCase } from './case';

export type Collection = {
  id: number;
  userId: number;
  itemType: 'trail' | 'hike' | 'user';
  itemId: number;
  createdAt: string;
};

export type CollectionItem = Collection & {
  trailName?: string | null;
  trailSlug?: string | null;
  username?: string | null;
  avatar?: string | null;
  level?: string | null;
};

export type CreateCollectionDto = {
  itemType: 'trail' | 'hike' | 'user';
  itemId: number;
};

export type Follow = {
  followerUserId: number;
  followingUserId: number;
  createdAt: string;
};

export type FollowStatus = {
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
};

export function adaptCollection(raw: RawCollection): Collection {
  return toCamelCase<RawCollection>(raw) as Collection;
}

export function adaptCollectionItem(raw: RawCollectionItemDto): CollectionItem {
  return toCamelCase<RawCollectionItemDto>(raw) as CollectionItem;
}

export function toCreateCollectionDto(dto: CreateCollectionDto): RawCreateCollectionDto {
  return {
    item_type: dto.itemType,
    item_id: dto.itemId,
  };
}

export function adaptFollow(raw: RawFollow): Follow {
  return toCamelCase<RawFollow>(raw) as Follow;
}

export function createCollectionsService(client: CollectionsClient) {
  return {
    add: async (dto: CreateCollectionDto) => adaptCollection(await client.socialControllerAddCollection(toCreateCollectionDto(dto))),
    findAll: async () => (await client.socialControllerFindCollections()).map(adaptCollectionItem),
    findByUsername: async (username: string) => (await client.socialControllerFindCollectionsByUsername(username)).map(adaptCollectionItem),
    remove: (id: number) => client.socialControllerRemoveCollection(id),
  };
}

export function createFollowsService(client: FollowsClient) {
  return {
    follow: async (userId: number) => adaptFollow(await client.socialControllerFollow(userId)),
    unfollow: (userId: number) => client.socialControllerUnfollow(userId),
    findFollowing: async () => (await client.socialControllerFindFollowing()).map(adaptFollow),
    findFollowers: async () => (await client.socialControllerFindFollowers()).map(adaptFollow),
    getStatus: async (userId: number, params?: RequestParams): Promise<FollowStatus> => {
      const raw = await client.socialControllerGetFollowStatus(userId, params);
      return {
        followerCount: raw.followerCount ?? 0,
        followingCount: raw.followingCount ?? 0,
        isFollowing: raw.isFollowing ?? false,
      };
    },
  };
}
