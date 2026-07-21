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
import { HttpClient, RequestParams } from './http-client';

export class Search<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Search
   * @name SearchControllerSearch
   * @request GET:/search
   */
  searchControllerSearch = (
    query: {
      q: string;
      category: string;
      county: string;
    },
    params: RequestParams = {}
  ) =>
    this.request<SearchResultDto[], any>({
      path: `/search`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    });
}
