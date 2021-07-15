import { AxiosInterceptorManager, AxiosRequestConfig, CancelStatic, CancelTokenStatic } from 'axios';
import { ComponentType } from 'react';

export interface HippoRequestConfig<K extends string | boolean = any> extends AxiosRequestConfig {
  formatter?(data: any): any;
  enableCsrf?: boolean;
  withResponse?: K;
}

export interface HippoAxiosResponse<T = any, K extends string | boolean = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: HippoRequestConfig<K>;
  request?: any;
}

// 根据 withResponse 字段来判断 response 挂在 data 的哪个字段下
type ResponseKey<K extends string | boolean> = K extends true ? '__response' : K extends false ? never : K;

type HippoPromise<T, K extends string | boolean> = Promise<T & { [key in ResponseKey<K>]: HippoAxiosResponse<T, K> }>;

export interface HippoAxiosInstance {
  <T = any, K extends string | boolean = any>(config: HippoRequestConfig<K>): HippoPromise<T, K>;
  <T = any, K extends string | boolean = any>(url: string, config?: HippoRequestConfig<K>): HippoPromise<T, K>;

  defaults: HippoRequestConfig<boolean | string>;

  interceptors: {
    request: AxiosInterceptorManager<HippoRequestConfig>;
    response: AxiosInterceptorManager<HippoAxiosResponse>;
  };

  request<T = any, K extends string | boolean = any>(config?: HippoRequestConfig<K>): HippoPromise<T, K>;
  get<T = any, K extends string | boolean = any>(url: string, params?: any, config?: HippoRequestConfig<K>): HippoPromise<T, K>;
  delete<T = any, K extends string | boolean = any>(url: string, params?: any, config?: HippoRequestConfig<K>): HippoPromise<T, K>;
  head<T = any, K extends string | boolean = any>(url: string, params?: any, config?: HippoRequestConfig<K>): HippoPromise<T, K>;
  options<T = any, K extends string | boolean = any>(url: string, params?: any, config?: HippoRequestConfig<K>): HippoPromise<T, K>;
  post<T = any, K extends string | boolean = any>(url: string, data?: any, config?: HippoRequestConfig<K>): HippoPromise<T, K>;
  put<T = any, K extends string | boolean = any>(url: string, data?: any, config?: HippoRequestConfig<K>): HippoPromise<T, K>;
  patch<T = any, K extends string | boolean = any>(url: string, data?: any, config?: HippoRequestConfig<K>): HippoPromise<T, K>;

  jsonp<T = any, K extends string | boolean = any>(
    url: string,
    params?: any,
    config?: HippoRequestConfig<K> & {
      callbackParamName?: string;
    }
  ): HippoPromise<T, K>;
}

export interface WithRequestExtraProps {
  url: string;
  method?: 'get' | 'delete' | 'head' | 'post' | 'patch' | 'jsonp';
  params?: object;
  formatter?(data: any): any;
  options?: HippoRequestConfig<any>;
  beforeRequest?(): void;
  afterRequest?(): void;
}

export interface HippoAxiosStatic extends HippoAxiosInstance {
  create<K extends string | boolean>(config?: HippoRequestConfig<K>): HippoAxiosInstance;

  Cancel: CancelStatic;
  CancelToken: CancelTokenStatic;
  isCancel(value: any): boolean;
  all<T>(values: (T | Promise<T>)[]): Promise<T[]>;
  spread<T, R>(callback: (...args: T[]) => R): (array: T[]) => R;
}

declare const request: HippoAxiosStatic;

export default request;
