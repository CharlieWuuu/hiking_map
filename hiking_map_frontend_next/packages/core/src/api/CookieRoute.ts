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

export namespace Cookie {
  /**
   * No description
   * @tags Cookie
   * @name CookieControllerSetCookie
   * @request POST:/cookie/setCookie
   */
  export namespace CookieControllerSetCookie {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = {
      /** @example "hello-cookie" */
      value?: string;
    };
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags Cookie
   * @name CookieControllerSeeCookie
   * @request GET:/cookie/seeCookie
   */
  export namespace CookieControllerSeeCookie {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags Cookie
   * @name CookieControllerUseCookie
   * @request GET:/cookie/useCookie
   */
  export namespace CookieControllerUseCookie {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = object;
  }

  /**
   * No description
   * @tags Cookie
   * @name CookieControllerDropCookie
   * @request POST:/cookie/dropCookie
   */
  export namespace CookieControllerDropCookie {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}
