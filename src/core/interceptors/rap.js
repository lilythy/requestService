const isDebugger = () => window.location.search.indexOf('debug') > -1;
const url = pathname => {
  if (isDebugger()) {
    const query = window.location.search.split('&').reduce((currentObj, item) => {
      const itemArr = item.split('=');
      currentObj[itemArr[0]] = itemArr[1];
      return currentObj;
    }, {});
    if (query.port) {
      return `http://rap2api.alibaba-inc.com/app/mock/${query.port}${pathname}`;
    }
  }
  return pathname;
};

// 如果开启 debug 模式，则将接口替换成 rap 接口
export default [
  config => {
    config.url = url(config.url);
    return config;
  },
  // undefined,
];
