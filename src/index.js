// 默认出口
import request from './core/request';

export default request;

// 全局设置
export { default as globalConfig } from './config';

// Service 相关
export { createService, createServices, formatter } from './service';
