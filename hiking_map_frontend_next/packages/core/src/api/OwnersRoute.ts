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

export namespace Owners {
  /**
   * No description
   * @tags Owner
   * @name OwnerControllerGetList
   * @request GET:/owners/list
   */
  export namespace OwnerControllerGetList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = object;
  }

  /**
   * No description
   * @tags Owner
   * @name OwnerControllerGetDetail
   * @request GET:/owners/detail
   */
  export namespace OwnerControllerGetDetail {
    export type RequestParams = {};
    export type RequestQuery = {
      name: string;
      type: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = object;
  }
}
