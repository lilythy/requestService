# requestService

- category: Components
- chinese: 前端请求库
- type: 工具

---

## Usage

具备以下能力:

1. [x] 内置了 csrf 集成, 请求自动上报等能力
2. [x] 支持全局设置, 可自定义 toast, 上报函数等模块
3. [x] 提供快速创建 http/ark Service 的能力
4. [ ] 在钉钉环境下支持钉钉免登 (开发中)


### 基础使用

```js
// 默认的 request 函数
import request from '@alife/hippo-request';

const url = 'http://example.com/api.json'
const params = {
  foobar: 'hello world'
}
const data = {
  username: 'xxx',
  password: 'yyy'
}
const config = {
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
}

request({ method: 'get', url, ...config })
request.get(url, params, config)
request.post(url, data, config)
request.put(url, data, config)
request.delete(url, config)
```

### 全局设置

hippo-request 开放了部分全局设置, 你可以根据环境需要修改全局设定.

```js
import { Balloon } from '@alife/hippo'
import { globalConfig } from '@alife/hippo-request'

// 自定义 ajax 上报函数
globalConfig.ajaxReport = function customReport (params) {
  // TODO: 添加上报逻辑
}

// 自定义 toast 函数，当出现错误时会默认调用此 toast 显示错误消息
globalConfig.toast = Balloon.toast;

// 添加统一处理函数。注意，此勾子本质上是直接调用 axios.interceptors.response.use(handleResponse)
// 具体逻辑请参考 axios 的官方文档
globalConfig.handleResponse = (error, response) => {
  if (error) {
    // TODO: 错误处理逻辑
    return Promise.reject(error);
  }

  // TODO: 正常处理逻辑
  return response;
}
```

### 创建 Service

```js
import { createServices, formatter } from '@alife/hippo-request'

export default createServices({
  getExampleData: {
    url: '//item.hemaos.com/api.json',
    formatter: formatter('pageList', {
      message: 'errorDesc'
    })
  }
})
```

可通过 pathVariables 开启路径参数支持：

```js
import { createServices } from '@alife/hippo-request'

// 通过传入 pathVariables = true, 会将 GET 参数替换为 path 参数
const services = createServices({
  changeExampleData: {
    method: 'post',
    url: '//api.hemaos.com/page/:id',
  }
})

services.changeExampleData(postData, {
  pathVariables: {
    id: 111
  }
})
```



### Ark 请求
为 createService 和 batchCreateService 新增 api 参数，用来请求 ark 的接口，格式为 `${业务域名}.${接口名}`：

```js
import { createService } from '@alife/legion';

const areaInfoDelivererCountStat = createService({
  api: 'delivery.areaInfoDelivererCountStat',
  method: 'get',
});

areaInfoDelivererCountStat({ deliveryDockCode });
```
别忘了同样指定接口的请求方式，如果和配置的接口请求方式不一致后端服务则会报错。

#### 返回值处理
1. 单一数据源
如果你的接口只对应一个数据源，那么对于返回值的处理和过去传入 url 时是一样的，你可以照常传入 formatter 参数对返回结果进行修改：

```js
const getDelivererArea = createService({
  api: 'delivery.getDelivererArea',
  method: 'get',
  formatter: formatter('pageList', {
    'data.list': 'data',
    'data.total': 'total',
  })
});

const { list, total } = await getDelivererArea({ deliveryDockCode });
```

2. 多个数据源
如果你的接口对应多个数据源，那么 formatter 需要传入一个 key 为数据源名，value 为 formatter 的对象，返回值也是一个同样的 key 为数据源名的对象。

```js
const test = createService({
  api: 'delivery.test',
  method: 'get',
  formatter: {
    datasourceA: formatter(/*...*/),
    datasourceB: formatter(/*...*/)
  }
});

const { datasourceA, datasourceB } = await test();
```

### Mtop 请求
为 createService 和 batchCreateService 新增 mapi 参数，用来请求 mtop 的接口，normalizer 和 formatter 等其他功能同样支持：
```js
const getDetail = createService({
  mapi: 'mtop.wdk.dms.iot.order.html.detail',
  // v: '1.0' 可省略，默认值为'1.0'
  // dataType: 'json' 可省略，默认值为 'json',
});

getDetail({
  taskCode: '153303'
});
```


### 错误提示

默认会在出错时显示错误信息，可通过以下方式关闭：

- 在 service 中通过传入 errorsTips = false 来关闭
- 在 throw error 时，设置 error.noErrorTips = true 来关闭

### 钉钉免登

WIP: 开发中