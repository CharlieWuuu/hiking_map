/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface RegisterDto {
  /** @example "hiker01" */
  username: string;
  /** @example "password123" */
  password: string;
}

export interface RegisterResponseDto {
  /** @example 1 */
  id: number;
  /** @example "hiker01" */
  username: string;
}

export interface LoginDto {
  /** @example "hiker01" */
  username: string;
  /** @example "password123" */
  password: string;
}

export interface LoginResponseDto {
  /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." */
  token: string;
}

export interface Profile {
  /** @example 1 */
  id: number;
  /** @example 1 */
  user_id: number;
  /** @example "https://example.com/avatar.png" */
  avatar: string;
  /** @example "中級" */
  level: string;
  /** @example "喜歡爬百岳的登山愛好者" */
  description: string;
}

export interface UpdateProfileDto {
  /** @example "https://example.com/avatar.png" */
  avatar?: string;
  /** @example "中級" */
  level?: string;
  /** @example "喜歡爬百岳的登山愛好者" */
  description?: string;
}

export interface CreateHikeDto {
  /** @example "合歡山主峰步道" */
  name: string;
  /** @example "2026-07-20" */
  date: string;
  /** @example 5.2 */
  distance_km: number;
  /** @example true */
  is_public?: boolean;
  /** @example "天氣很好，view 很棒" */
  note?: string;
  /** @example 1 */
  trail_id?: number;
  /** @example [1,2] */
  category_ids?: string[];
  /** @example {"type":"FeatureCollection","features":[]} */
  geojson: object;
}

export interface Hike {
  /** @example 1 */
  id: number;
  /** @example 1 */
  user_id: number;
  /** @example 1 */
  trail_id?: object | null;
  /** @example "合歡山主峰步道" */
  name: string;
  /** @example "2026-07-20" */
  date: string;
  /** @example 5.2 */
  distance_km: number;
  /** @example true */
  is_public: boolean;
  /** @example "天氣很好，view 很棒" */
  note?: object | null;
  /**
   * @format date-time
   * @example "2026-07-20T10:00:00.000Z"
   */
  created_at: string;
}

export interface Mountain {
  /** @example 1 */
  id: number;
  /** @example "玉山主峰" */
  name: string;
  /** @example 3952 */
  elevation_m: number;
  /** @example {"type":"Point","coordinates":[120.9576,23.4707]} */
  location: object;
  /** @example "中央山脈" */
  range?: object | null;
  /** @example "南投縣" */
  county?: object | null;
}

export interface Trail {
  /** @example 1 */
  id: number;
  /** @example "塔塔加登山口至排雲山莊" */
  name: string;
  /** @example "tataka-trailhead-to-paiyun-lodge" */
  slug: string;
  /** @example "玉山主線經典路線" */
  description?: object | null;
  /** @example 8.5 */
  distance_km?: object | null;
}

export interface TrailDetailDto {
  /** @example 1 */
  id: number;
  /** @example "塔塔加登山口至排雲山莊" */
  name: string;
  /** @example "tataka-trailhead-to-paiyun-lodge" */
  slug: string;
  /** @example "玉山主線經典路線" */
  description?: object | null;
  /** @example 8.5 */
  distance_km?: object | null;
  /**
   * 路線座標，GeoJSON LineString
   * @example {"type":"LineString","coordinates":[[120.9,23.47]]}
   */
  geojson?: object | null;
}

export interface CreateCollectionDto {
  /** @example "trail" */
  item_type: 'trail' | 'hike';
  /** @example 1 */
  item_id: number;
}

export interface Collection {
  /** @example 1 */
  id: number;
  /** @example 1 */
  user_id: number;
  /** @example "trail" */
  item_type: 'trail' | 'hike';
  /** @example 1 */
  item_id: number;
  /**
   * @format date-time
   * @example "2026-07-20T10:00:00.000Z"
   */
  created_at: string;
}

export interface Follow {
  /** @example 1 */
  follower_user_id: number;
  /** @example 2 */
  following_user_id: number;
  /**
   * @format date-time
   * @example "2026-07-20T10:00:00.000Z"
   */
  created_at: string;
}
