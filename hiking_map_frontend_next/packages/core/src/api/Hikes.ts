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

import { CreateHikeDto, Hike } from './data-contracts';
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
