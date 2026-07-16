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

import { ContentType, HttpClient, RequestParams } from './http-client';

export class Session<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Session
   * @name SessionControllerSetSession
   * @request POST:/session/setSession
   */
  sessionControllerSetSession = (
    data: {
      /** @example "hello-session" */
      value?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/session/setSession`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Session
   * @name SessionControllerSeeSession
   * @request GET:/session/seeSession
   */
  sessionControllerSeeSession = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/session/seeSession`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Session
   * @name SessionControllerUseSession
   * @request GET:/session/useSession
   */
  sessionControllerUseSession = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/session/useSession`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Session
   * @name SessionControllerDropSession
   * @request POST:/session/dropSession
   */
  sessionControllerDropSession = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/session/dropSession`,
      method: 'POST',
      ...params,
    });
}
