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

import { LoginDto } from './data-contracts';

export namespace Auth {
  /**
   * No description
   * @tags Auth
   * @name AuthControllerLogin
   * @request POST:/auth/login
   */
  export namespace AuthControllerLogin {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LoginDto;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}
