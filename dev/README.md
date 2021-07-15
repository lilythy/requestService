# HippoRequest 开发指导

## 环境

因为是请求库开发，为了方案测试，所以开发了一个简单的 mock 服务器（代码 `scripts/server.js`），如果需要增加新的请求类型或者 case，可以修改以上文件完成

> TODO: 需要把这个服务独立部署到内网环境，否则文档站不可读

开发命令（已经集成了 mock 启动）：

```shell
$ just dev
```

## 开发必读

- 核心请求库使用的是 [axios](https://github.com/axios/axios#axios) ，所以有新需求最好利用好 axios 的能力
- 由于 interceptors 会影响所有类型的请求，慎用！
- 对于一些新增数据源的语法糖，可以利用 methods 来完成

### interceptors

**适用于全请求生效的情况，一般情况下慎用**

开发步骤：

1. 往 `src/core/interceptors` 目录下新增 interceptor 文件，实现 interceptor 逻辑
2. 在 `src/core/interceptors/index.js` 里注册 interceptor（注意和其它 interceptors 的顺序）

一个 interceptor 文件的导出格式如下（可以参考已实现的 interceptor）：

```
// 默认的 reject 方法都是 `err => Promise.reject(err)`
export default [
  // request interceptor，可以为空
  reqResolve,     // 或者 [ reqResolve, reqReject ]
  // response interceptor，可以为空
  resResolve,     // 或者 [ resResolve, resReject ]
];
```

### methods

**针对增加挂载的方法，一般用于特殊数据源的适配**

目前实现的是通用的 ajax 及 jsonp 能力，未来可以根据实际情况增加

一些和特定场景相关的能力也可以在这里实现，比如 **ajax 的 csrfToken**

开发步骤：

1. 往 `src/core/methods` 目录下新增相关文件，实现挂载方法逻辑
2. 在 `src/core/methods/index.js` 里调用刚实现的方法

我们期望所有添加的新方法都遵守一样的出入参，这样对接 withRequest 及可视化配置等会更简单：

```ts
declare interface Request {
  // url: url 地址
  // params: 请求参数
  // options: 配置项
  [key: string]: (url: string, params: object, options: object) => Promise<object>;
}
```