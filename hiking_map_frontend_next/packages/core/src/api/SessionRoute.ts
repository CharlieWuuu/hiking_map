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

export namespace Session {
  /**
   * No description
   * @tags Session
   * @name SessionControllerSetSession
   * @request POST:/session/setSession
   */
  export namespace SessionControllerSetSession {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = {
      /** @example "hello-session" */
      value?: string;
    };
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags Session
   * @name SessionControllerSeeSession
   * @request GET:/session/seeSession
   */
  export namespace SessionControllerSeeSession {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags Session
   * @name SessionControllerUseSession
   * @request GET:/session/useSession
   */
  export namespace SessionControllerUseSession {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = object;
  }

  /**
   * No description
   * @tags Session
   * @name SessionControllerDropSession
   * @request POST:/session/dropSession
   */
  export namespace SessionControllerDropSession {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}
