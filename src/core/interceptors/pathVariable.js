//             pathVariables
// '/api/:id' + { id: 233 } = 'api/233'
export default [
  config => {
    // 这样向下兼容更保险，没启用的用户都不会进入逻辑
    if (!config.pathVariables) {
      return config;
    }

    const pathVariables = config.pathVariables;
    // 防止 xxxx.com:443/xxx/:id 的情况
    config.url = config.url.replace(/\/:(\w+)/ig, (_, key) => `/${pathVariables[key]}`);
    return config;
  },
  // undefined,
];
