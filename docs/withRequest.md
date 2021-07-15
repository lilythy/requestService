# HOC 用法

- order: 4

包裹普通的组件使其具备异步访问的能力, 组件必须具备接收 dataSource 作为 props

---

```jsx
import request, { withRequest } from '@alife/hippo-request';

class Ul extends React.Component {
  render() {
    const { dataSource = [] } = this.props;

    return (
      <ul>
        {dataSource.map((data, i) => {
          return <li key={i}>{`${data.label}: ${data.value}`}</li>;
        })}
      </ul>
    );
  }
}

class List extends React.Component {
  handleChange = e => {
    this.props.onInputUpdate(e.target.value);
  };

  render() {
    const { dataSource } = this.props;
    return (
      <div>
        <input onChange={this.handleChange} />
        <Ul dataSource={dataSource} />
      </div>
    );
  }
}

const AsyncList = withRequest(List);

const list = () => {
  return [
    { label: 'aa', value: new Date() },
    { label: 'bb', value: new Date() },
    { label: 'cc', value: new Date() }
  ];
};

const load = (inputValue, callback) => {
  setTimeout(() => {
    callback(list());
  }, 500);
};

const mapResult = data => {
  return data.result.map(item => {
    return {
      // 可以通过 title 属性透传给 Menu.Item 节点
      title: item[0],
      label: item[0],
      value: item[1]
    };
  });
};

const asyncLoad = inputValue => {
  return request
    .jsonp(`https://suggest.taobao.com/sug?code=utf-8&q=${inputValue}`)
    .then(mapResult);
};

let searchTimeout;

const search = (inputValue, callback) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    request
      .jsonp(`https://suggest.taobao.com/sug?code=utf-8&q=${inputValue}`)
      .then(data =>
        data.result.map(item => ({
          title: item[0],
          label: item[0],
          value: item[1]
        }))
      )
      .then(callback);
  }, 500);
};

const onInputUpdate = (...args) => {
  console.log(args);
};

ReactDOM.render(
  <div>
    <AsyncList loadDataSource={load} />
    <br />
    <br />
    <AsyncList loadDataSource={asyncLoad} />
    <br />
    <br />
    <AsyncList loadDataSource={search} />
  </div>,
  mountNode
);
```
