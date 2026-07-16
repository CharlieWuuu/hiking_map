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

export class Cookie<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Cookie
   * @name CookieControllerSetCookie
   * @request POST:/cookie/setCookie
   */
  cookieControllerSetCookie = (
    data: {
      /** @example "hello-cookie" */
      value?: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<void, any>({
      path: `/cookie/setCookie`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags Cookie
   * @name CookieControllerSeeCookie
   * @request GET:/cookie/seeCookie
   */
  cookieControllerSeeCookie = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/cookie/seeCookie`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Cookie
   * @name CookieControllerUseCookie
   * @request GET:/cookie/useCookie
   */
  cookieControllerUseCookie = (params: RequestParams = {}) =>
    this.request<object, any>({
      path: `/cookie/useCookie`,
      method: 'GET',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Cookie
   * @name CookieControllerDropCookie
   * @request POST:/cookie/dropCookie
   */
  cookieControllerDropCookie = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/cookie/dropCookie`,
      method: 'POST',
      ...params,
    });
}
