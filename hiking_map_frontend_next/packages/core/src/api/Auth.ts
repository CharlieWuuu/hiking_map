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
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Auth<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Auth
   * @name AuthControllerRegister
   * @request POST:/auth/register
   */
  authControllerRegister = (data: RegisterDto, params: RequestParams = {}) =>
    this.request<RegisterResponseDto, any>({
      path: `/auth/register`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Auth
   * @name AuthControllerLogin
   * @request POST:/auth/login
   */
  authControllerLogin = (data: LoginDto, params: RequestParams = {}) =>
    this.request<LoginResponseDto, any>({
      path: `/auth/login`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags Auth
   * @name AuthControllerLogout
   * @request POST:/auth/logout
   */
  authControllerLogout = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/auth/logout`,
      method: 'POST',
      ...params,
    });
  /**
   * No description
   *
   * @tags Auth
   * @name AuthControllerGoogleLogin
   * @request GET:/auth/google
   */
  authControllerGoogleLogin = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/auth/google`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags Auth
   * @name AuthControllerGoogleCallback
   * @request GET:/auth/google/callback
   */
  authControllerGoogleCallback = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/auth/google/callback`,
      method: 'GET',
      ...params,
    });
}
