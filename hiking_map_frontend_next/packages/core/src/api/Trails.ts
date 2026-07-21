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

import { Trail } from './data-contracts';
import { HttpClient, RequestParams } from './http-client';

export class Trails<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Trails
   * @name TrailsControllerFindAll
   * @request GET:/trails
   */
  trailsControllerFindAll = (params: RequestParams = {}) =>
    this.request<Trail[], any>({
      path: `/trails`,
      method: 'GET',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Trails
   * @name TrailsControllerFindOne
   * @request GET:/trails/{id}
   */
  trailsControllerFindOne = (id: number, params: RequestParams = {}) =>
    this.request<Trail, any>({
      path: `/trails/${id}`,
      method: 'GET',
      format: 'json',
      ...params,
    });
}
