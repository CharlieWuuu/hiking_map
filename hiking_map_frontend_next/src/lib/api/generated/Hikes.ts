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

import { CreateHikeDto, Hike, HikeStatsDto } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Hikes<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Hikes
   * @name HikesControllerCreate
   * @request POST:/hikes
   */
  hikesControllerCreate = (data: CreateHikeDto, params: RequestParams = {}) =>
    this.request<Hike, any>({
      path: `/hikes`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Hikes
   * @name HikesControllerFindAll
   * @request GET:/hikes
   */
  hikesControllerFindAll = (
    query: {
      userId: string;
      includeGeojson: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<Hike[], any>({
      path: `/hikes`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Hikes
   * @name HikesControllerFindInView
   * @request GET:/hikes/in-view
   */
  hikesControllerFindInView = (
    query: {
      bbox: string;
      userId: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/hikes/in-view`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags Hikes
   * @name HikesControllerGetStats
   * @request GET:/hikes/stats
   */
  hikesControllerGetStats = (
    query: {
      username: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<HikeStatsDto, any>({
      path: `/hikes/stats`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Hikes
   * @name HikesControllerFindOne
   * @request GET:/hikes/{id}
   */
  hikesControllerFindOne = (id: number, params: RequestParams = {}) =>
    this.request<Hike, any>({
      path: `/hikes/${id}`,
      method: 'GET',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Hikes
   * @name HikesControllerRemove
   * @request DELETE:/hikes/{id}
   */
  hikesControllerRemove = (id: number, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/hikes/${id}`,
      method: 'DELETE',
      ...params,
    });
}
