import qs from 'qs';
import { HTTP_METHODS, CSRF_SAFE_HTTP_METHOD } from '../const';
import { getContentType, getApiErrorMsg, getCsrf, isCsrfEnable } from '../utils';
import globalConfig from '../../config';

// 处理 ajax 请求：
// - 打通 retcode 打点
// - csrf token
export default function addAjaxMethod(axios) {
  HTTP_METHODS.forEach(method => {
    axios[method] = (pathname, params = {}, config = {}) => {
      const t = Date.now();

      // params 处理
      if (method === 'get') {
        config.params = params;
      } else {
        const contentType = getContentType(config.headers);
        if (contentType && contentType.indexOf('application/x-www-form-urlencoded') > -1) {
          config.data = qs.stringify(params);
        } else {
          config.data = params;
        }
      }

      // 不在 safe method 里才加 csrf
      if (CSRF_SAFE_HTTP_METHOD.indexOf(method) === -1) {
        // 支持 config.enableCsrf = false 关闭
        const { enableCsrf = isCsrfEnable() } = config;
        if (enableCsrf) {
          const csrf = getCsrf();
          if (csrf.header && csrf.token) {
            config.headers = config.headers || {};
            config.headers[csrf.header] = csrf.token;
          }
        }
      }

      return axios({
        url: pathname,
        method,
        withCredentials: true,
        ...config,
      }).then(data => {
        const time = Date.now() - t;
        const params = { url: pathname, isSuccess: true, time, code: 'ajax-success', msg: '接口调用成功!', begin: t };
        globalConfig.ajaxReport(params);
        return data;
      }).catch(error => {
        const time = Date.now() - t;
        const msg = JSON.stringify({ method, error: getApiErrorMsg(error), payload: method === 'get' ? config.params : config.data });
        const params = { url: pathname, isSuccess: false, time, code: 'ajax-error', msg, begin: t };
        globalConfig.ajaxReport(params);
        throw error;
      });
    };
  });
}
