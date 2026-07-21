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

import { LoginDto, LoginResponseDto, RegisterDto, RegisterResponseDto } from './data-contracts';

export namespace Auth {
  /**
   * No description
   * @tags Auth
   * @name AuthControllerRegister
   * @request POST:/auth/register
   */
  export namespace AuthControllerRegister {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RegisterDto;
    export type RequestHeaders = {};
    export type ResponseBody = RegisterResponseDto;
  }

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
    export type ResponseBody = LoginResponseDto;
  }

  /**
   * No description
   * @tags Auth
   * @name AuthControllerLogout
   * @request POST:/auth/logout
   */
  export namespace AuthControllerLogout {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = void;
  }
}
