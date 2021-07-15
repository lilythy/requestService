import merge from 'lodash/merge';

import request from '../core/request';
import { createApiFormatter } from './api';
import globalConfig from '../config';
import mtop from './mtop';

const zmockConfig = window._ZMOCK_CONFIG || {};

export function getService (name, services) {
  if (typeof name === 'function') {
    return name;
  }

  const parts = name.split('.');
  let i = 0;
  let value = services;
  while (i < parts.length) {
    const key = parts[i];
    if (!value || !value[key]) {
      throw new Error(`service ${name} is undefined`);
    }
    value = value[key];
    i++;
  }
  if (typeof value !== 'function') {
    throw new Error(`service ${name} is not a function`);
  }

  return value;
}

function checkResponseFormat (url, rawData) {
  if (!rawData) {
    console.error('[Service] service (%s) 的响应必须是一个 object, 但返回的却是 %s 类型', url, typeof rawData);
    return;
  }

  const required = ['success'];
  if (!rawData.success) {
    required.push('message');
  } else {
    required.push('data');
  }
  const missingKeys = required.filter(key => !(key in rawData));
  if (missingKeys.length) {
    let message = '[Service] service (%s) 返回的数据缺少 %s 字段, 请检查 service 定义是否正确';
    if (process.env.NODE_ENV === 'production') {
      console.warn(message, url, missingKeys.join());
    } else {
      console.error(message, url, missingKeys.join(), '\n(了解 service 响应格式化: https://hippod.alibaba-inc.com/develop/im9m7c#ogn8se)');
    }
  }
}

function normalize(data, normalizer) {
  let normalized;

  // 对数据进行预格式化
  if (normalizer) {
    data = normalizer(data);
  }

  if (Array.isArray(data)) {
    normalized = data;
  } else {
    // 做请求数据的简单格式化
    normalized = {};
    for (const name in data) {
      if (!data.hasOwnProperty(name)) { // eslint-disable-line
        continue;
      }
      if (data[name] instanceof Date) {
        normalized[name] = data[name].getTime();
      } else {
        normalized[name] = data[name];
      }
    }
  }

  return normalized;
}

function handleError(err, onError, errorTips) {
  let noThrow = false;
  let noErrorTips = err && err.noErrorTips;
  if (onError) {
    noThrow = onError(err);
  } else if (errorTips && !noErrorTips) {
    // 如果传入 true, 就表示使用默认的消息
    if (errorTips === true) {
      if (err && err.message) {
        globalConfig.toast.error(`请求失败: ${err.message}`);
      } else {
        globalConfig.toast.error('请求数据失败, 请稍后再试');
      }
    } else {
      // 否则, 使用用户传入的 tips
      globalConfig.toast.error(errorTips);
    }
  }
  if (!noThrow) {
    throw err;
  }
}

function getApiMapUrl(url, apienv) {
  // 支持 APIMAP_ENV
  if (window._APIMAP_ENV && apienv) {
    const envType = window._APIMAP_ENV;
    for (const key in apienv) {
      const rule = apienv[key];

      // 如果 rule 是 string 或 mock id, 表示匹配所有环境; 否则表示指定环境匹配
      let envDomain = rule;
      if (rule && typeof rule === 'object') {
        envDomain = rule[envType];
      }

      // 如果是 domain 是数字, 就表示 mock ID, 将进行转换
      if (/^\d+$/.test(envDomain)) {
        envDomain = `rap2api.alibaba-inc.com/app/mock/${envDomain}`;
      }

      if (envDomain && url.indexOf(`${key}`) >= 0) {
        const pos = key.indexOf('/');
        const domain = pos > 0 ? key.substring(0, pos) : key;
        url = url.replace(domain, envDomain);
        break;
      }
    }
  }
  return url;
}

export function getUrl(config, apienv) {
  let { mockToken, url, api, mapi } = config;
  let useMock = zmockConfig.domainPath && mockToken;

  if (api) {
    const [domainName, apiName] = api.split('.', 2);
    if (!domainName || !apiName) {
      throw new Error('[Service Ark] api 参数必须包含业务域名和接口名（domianName.apiName），如 delivery.queryDeliverer');
    }
    url = `//ark.hemaos.com/graphql/${domainName}/${apiName}`;
    apienv = {
      'ark.hemaos.com': {
        local: 'daily-ark.hemaos.com',
        development: 'daily-ark.hemaos.com',
        pre: 'pre-ark.hemaos.com'
      },
      ...apienv
    };
  }

  if (useMock && mapi) {
    url = `${zmockConfig.domainPath}/data/${mockToken}/${mapi}`;
  }

  url = getApiMapUrl(url, apienv);

  return url;
}

export function createService (config, apienv) {
  return async function req(data, requestConfig = {}) {
    let { url, api, mapi, v, dataType, mock, method, normalizer, onError, errorTips = true, ...otherConfig } = config;
    let useMock = zmockConfig.domainPath && otherConfig.mockToken;
    let normalized = normalize(data, normalizer);
    method = (method || 'get').toLowerCase();

    if (mapi) {
      if (useMock) {
        otherConfig.mapi = mapi;
        otherConfig.protocol = 'MTOP';
      } else {
        try {
          const resp = await mtop.request({
            api: mapi,
            v: v || '1.0',
            dataType: dataType || 'json',
            data: normalized
          });

          return otherConfig.formatter ? otherConfig.formatter(resp.data) : resp.data;
        } catch (err) {
          return handleError(err, onError, errorTips);
        }
      }
    } else {
      if (data instanceof FormData) {
        // 如果是 FormData, 就直接传入数据
        normalized = data;
      } else if (otherConfig.params && method === 'get') {
        // 修正 hippo-request 无法在 GET 请求下支持传入 params 的问题
        data = Object.assign({}, otherConfig.params, data);
        delete otherConfig.params;
      }

      if (api) {
        normalized = {
          variables: normalized
        };
        if (mock) {
          const [domainName, apiName] = api.split('.', 2);
          normalized.domain = domainName;
          normalized.api = apiName;
        }
        if (useMock) {
          otherConfig.api = api;
          otherConfig.protocol = 'ARK';
        }
        otherConfig.formatter = createApiFormatter(otherConfig.formatter);
      }
    }

    url = getUrl(config, apienv);

    // 检测 URL: service 的 URL 必须包含 domain
    if (!/^(https?:)?\/\//.test(url)) {
      let message = '[Service] service url %s 必须包含域名, 请在定义 service 时使用完整的线上 URL (建议不要带 http 协议头)';
      if (process.env.NODE_ENV === 'production') {
        console.warn(message, url);
      } else {
        console.error(message, url);
      }
    }

    try {
      // 真正的处理请求
      const resp = await request[method](url, normalized, merge({}, otherConfig, requestConfig));

      // 检查数据响应格式, 如果格式不对要进行提醒 (error or warning)
      checkResponseFormat(url, resp);

      if (resp.success) {
        return resp.data;
      }
      const err = new Error(resp.message || '');

      // 为 err 绑定数据
      err.response = resp;
      resp.code && (err.code = resp.code);
      resp.errors && (err.errors = resp.errors);
      resp.data && (err.data = resp.data);
      throw err;
    } catch (err) {
      handleError(err, onError, errorTips);
    }
  };
}

export function createServices (configs, apienv, defaultConfig) {
  defaultConfig = defaultConfig || {};

  const services = {};
  for (const name in configs) {
    const config = configs[name];
    services[name] = createService(Object.assign({}, defaultConfig, config), apienv);
  }
  return services;
}
