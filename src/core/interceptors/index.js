import rap from './rap';
import res from './res';
import zmock from './zmock';
import pathVariable from './pathVariable';
import globalConfig from '../../config';

const defaultReject = error => Promise.reject(error);

function addInterceptor(axios, [req, res]) {
  if (req) {
    if (!Array.isArray(req)) {
      req = [req];
    }
    axios.interceptors.request.use(req[0], req[1] || defaultReject);
  }
  if (res) {
    if (!Array.isArray(res)) {
      res = [res];
    }
    axios.interceptors.response.use(res[0], res[1] || defaultReject);
  }
}

export default function addInterceptors(axios) {
  // 处理 response
  addInterceptor(axios, [null, [
    response => {
      if (globalConfig.handleResponse) {
        return globalConfig.handleResponse(null, response);
      }
      return response;
    },
    error => {
      if (globalConfig.handleResponse) {
        return globalConfig.handleResponse(error, error.response);
      }
      return Promise.reject(error);
    }
  ]]);

  // 顺序很重要
  addInterceptor(axios, pathVariable);
  addInterceptor(axios, rap);
  addInterceptor(axios, zmock);
  addInterceptor(axios, res);
}
