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
import { HttpClient, RequestParams } from './http-client';

export class Follows<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Social
   * @name SocialControllerFollow
   * @request POST:/follows/{userId}
   */
  socialControllerFollow = (userId: number, params: RequestParams = {}) =>
    this.request<Follow, any>({
      path: `/follows/${userId}`,
      method: 'POST',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Social
   * @name SocialControllerUnfollow
   * @request DELETE:/follows/{userId}
   */
  socialControllerUnfollow = (userId: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/follows/${userId}`,
      method: 'DELETE',
      ...params,
    });
  /**
   * No description
   *
   * @tags Social
   * @name SocialControllerFindFollowing
   * @request GET:/follows/following
   */
  socialControllerFindFollowing = (params: RequestParams = {}) =>
    this.request<Follow[], any>({
      path: `/follows/following`,
      method: 'GET',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Social
   * @name SocialControllerFindFollowers
   * @request GET:/follows/followers
   */
  socialControllerFindFollowers = (params: RequestParams = {}) =>
    this.request<Follow[], any>({
      path: `/follows/followers`,
      method: 'GET',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Social
   * @name SocialControllerGetFollowStatus
   * @request GET:/follows/status/{userId}
   */
  socialControllerGetFollowStatus = (userId: number, params: RequestParams = {}) =>
    this.request<
      {
        followerCount?: number;
        followingCount?: number;
        isFollowing?: boolean;
      },
      any
    >({
      path: `/follows/status/${userId}`,
      method: 'GET',
      format: 'json',
      ...params,
    });
}
