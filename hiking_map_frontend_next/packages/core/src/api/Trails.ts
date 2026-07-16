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

import { TrailsInfoDto } from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Trails<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Trails
   * @name TrailsControllerGetTrails
   * @request GET:/trails
   * @secure
   */
  trailsControllerGetTrails = (
    query: {
      owner_uuid: string;
      type: string;
      uuid: string;
      share: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/trails`,
      method: 'GET',
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Trails
   * @name TrailsControllerPost
   * @request POST:/trails
   * @secure
   */
  trailsControllerPost = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/trails`,
      method: 'POST',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Trails
   * @name TrailsControllerGetCountyOrder
   * @request GET:/trails/county_order
   * @secure
   */
  trailsControllerGetCountyOrder = (
    query: {
      owner_uuid: string;
      type: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/trails/county_order`,
      method: 'GET',
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Trails
   * @name TrailsControllerGetTrailsMonthData
   * @request GET:/trails/trails_month_data
   * @secure
   */
  trailsControllerGetTrailsMonthData = (
    query: {
      owner_uuid: string;
      type: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/trails/trails_month_data`,
      method: 'GET',
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Trails
   * @name TrailsControllerGetExport
   * @request GET:/trails/export
   * @secure
   */
  trailsControllerGetExport = (
    query: {
      type: string;
      owner_uuid: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/trails/export`,
      method: 'GET',
      query: query,
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Trails
   * @name TrailsControllerPut
   * @request PUT:/trails/{uuid}
   * @secure
   */
  trailsControllerPut = (uuid: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/trails/${uuid}`,
      method: 'PUT',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Trails
   * @name TrailsControllerDelete
   * @request DELETE:/trails/{uuid}
   * @secure
   */
  trailsControllerDelete = (uuid: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/trails/${uuid}`,
      method: 'DELETE',
      secure: true,
      ...params,
    });
  /**
   * No description
   *
   * @tags Trails
   * @name TrailsControllerPatch
   * @request PATCH:/trails/{uuid}/properties
   * @secure
   */
  trailsControllerPatch = (uuid: string, data: TrailsInfoDto, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/trails/${uuid}/properties`,
      method: 'PATCH',
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
}
