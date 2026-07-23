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

import { Follow } from './data-contracts';

export namespace Follows {
  /**
   * No description
   * @tags Social
   * @name SocialControllerFollow
   * @request POST:/follows/{userId}
   */
  export namespace SocialControllerFollow {
    export type RequestParams = {
      userId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Follow;
  }

  /**
   * No description
   * @tags Social
   * @name SocialControllerUnfollow
   * @request DELETE:/follows/{userId}
   */
  export namespace SocialControllerUnfollow {
    export type RequestParams = {
      userId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags Social
   * @name SocialControllerFindFollowing
   * @request GET:/follows/following
   */
  export namespace SocialControllerFindFollowing {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Follow[];
  }

  /**
   * No description
   * @tags Social
   * @name SocialControllerFindFollowers
   * @request GET:/follows/followers
   */
  export namespace SocialControllerFindFollowers {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Follow[];
  }

  /**
   * No description
   * @tags Social
   * @name SocialControllerGetFollowStatus
   * @request GET:/follows/status/{userId}
   */
  export namespace SocialControllerGetFollowStatus {
    export type RequestParams = {
      userId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = {
      followerCount?: number;
      followingCount?: number;
      isFollowing?: boolean;
    };
  }
}
