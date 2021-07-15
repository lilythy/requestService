import axios from 'axios';
import * as utils from 'axios/lib/utils';
import addInterceptors from './interceptors';
import addMethods from './methods';

function createInstance(instanceConfig, origin = axios) {
  // 避免多个 hippo-request 产生冲突
  const request = axios.create(instanceConfig);

  // 补齐 origin 上挂载的属性
  Object.keys(origin).forEach(name => {
    if (!request[name]) {
      request[name] = origin[name];
    }
  });

  // add interceptors & methods
  addInterceptors(request);
  addMethods(request);

  // add create
  request.create = function create(instanceConfig) {
    return createInstance(utils.merge(request.defaults, instanceConfig), request);
  };

  return request;
}

export default createInstance();
