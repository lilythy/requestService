# 获取 response

- order: 3

需要获取原始 response 对象的情况，比如读取 response 的 headers 

---

````jsx
import request from '@alife/hippo-request';

class App extends React.Component {
    state = {}
    async componentDidMount() {
        const res = await request.get('//127.0.0.1:3002/get', {
            a: 1,
        }, {
            withResponse: true,
        });

        this.setState({
            res: 'response headers: ' + JSON.stringify(res.__response.headers, null, 2),
        });
    }
    render() {
        return <div>{this.state.res}</div>
    }
}

ReactDOM.render(<App/>, mountNode);

````
