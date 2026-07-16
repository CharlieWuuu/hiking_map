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

export namespace Trails {
  /**
   * No description
   * @tags Trails
   * @name TrailsControllerGetTrails
   * @request GET:/trails
   * @secure
   */
  export namespace TrailsControllerGetTrails {
    export type RequestParams = {};
    export type RequestQuery = {
      owner_uuid: string;
      type: string;
      uuid?: string;
      share?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags Trails
   * @name TrailsControllerPost
   * @request POST:/trails
   * @secure
   */
  export namespace TrailsControllerPost {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags Trails
   * @name TrailsControllerGetCountyOrder
   * @request GET:/trails/county_order
   * @secure
   */
  export namespace TrailsControllerGetCountyOrder {
    export type RequestParams = {};
    export type RequestQuery = {
      owner_uuid: string;
      type: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = object;
  }

  /**
   * No description
   * @tags Trails
   * @name TrailsControllerGetTrailsMonthData
   * @request GET:/trails/trails_month_data
   * @secure
   */
  export namespace TrailsControllerGetTrailsMonthData {
    export type RequestParams = {};
    export type RequestQuery = {
      owner_uuid: string;
      type: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = object;
  }

  /**
   * No description
   * @tags Trails
   * @name TrailsControllerGetExport
   * @request GET:/trails/export
   * @secure
   */
  export namespace TrailsControllerGetExport {
    export type RequestParams = {};
    export type RequestQuery = {
      type: string;
      owner_uuid: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags Trails
   * @name TrailsControllerPut
   * @request PUT:/trails/{uuid}
   * @secure
   */
  export namespace TrailsControllerPut {
    export type RequestParams = {
      uuid: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags Trails
   * @name TrailsControllerDelete
   * @request DELETE:/trails/{uuid}
   * @secure
   */
  export namespace TrailsControllerDelete {
    export type RequestParams = {
      uuid: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }

  /**
   * No description
   * @tags Trails
   * @name TrailsControllerPatch
   * @request PATCH:/trails/{uuid}/properties
   * @secure
   */
  export namespace TrailsControllerPatch {
    export type RequestParams = {
      uuid: string;
    };
    export type RequestQuery = {};
    export type RequestBody = TrailsInfoDto;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}
