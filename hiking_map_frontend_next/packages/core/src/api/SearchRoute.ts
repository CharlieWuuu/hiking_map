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

import { SearchResultDto } from './data-contracts';

export namespace Search {
  /**
   * No description
   * @tags Search
   * @name SearchControllerSearch
   * @request GET:/search
   */
  export namespace SearchControllerSearch {
    export type RequestParams = {};
    export type RequestQuery = {
      q: string;
      category: string;
      county: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SearchResultDto[];
  }
}
