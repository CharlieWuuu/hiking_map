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

export namespace Hikes {
  /**
   * No description
   * @tags Hikes
   * @name HikesControllerCreate
   * @request POST:/hikes
   */
  export namespace HikesControllerCreate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateHikeDto;
    export type RequestHeaders = {};
    export type ResponseBody = Hike;
  }

  /**
   * No description
   * @tags Hikes
   * @name HikesControllerFindAll
   * @request GET:/hikes
   */
  export namespace HikesControllerFindAll {
    export type RequestParams = {};
    export type RequestQuery = {
      userId: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Hike[];
  }

  /**
   * No description
   * @tags Hikes
   * @name HikesControllerFindOne
   * @request GET:/hikes/{id}
   */
  export namespace HikesControllerFindOne {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Hike;
  }

  /**
   * No description
   * @tags Hikes
   * @name HikesControllerRemove
   * @request DELETE:/hikes/{id}
   */
  export namespace HikesControllerRemove {
    export type RequestParams = {
      id: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}
