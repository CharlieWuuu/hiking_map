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

import { HttpClient, RequestParams } from './http-client';

export class Owners<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Owner
   * @name OwnerControllerGetList
   * @request GET:/owners/list
   */
  ownerControllerGetList = (params: RequestParams = {}) =>
    this.request<object, any>({
      path: `/owners/list`,
      method: 'GET',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Owner
   * @name OwnerControllerGetDetail
   * @request GET:/owners/detail
   */
  ownerControllerGetDetail = (
    query: {
      name: string;
      type: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<object, any>({
      path: `/owners/detail`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    });
}
