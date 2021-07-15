const RESPONSE_DEFAULT_KEY = '__response';

// 将 response.data 提取
// - withResponse: 将 response 放到 data 里，默认不放置
// - formatter: 格式化 response.data
export default [
  null,
  response => {
    let data = response.data;
    const { withResponse, formatter } = response.config || {};
    if (formatter) {
      data = formatter(data);
    }

    if (withResponse) {
      delete response.data; // 打断循环依赖
      data[typeof withResponse === 'string' ? withResponse : RESPONSE_DEFAULT_KEY] = response;
    }

    return data;
  },
];
