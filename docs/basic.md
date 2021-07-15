# 基本用法

- order: 0

发送请求

---

````jsx
import request from '@alife/hippo-request';

class App extends React.Component {
    state = {}
    async componentDidMount() {
        const res = await Promise.all([
            request.get('//127.0.0.1:3002/get', {
                label: 'Get',
                a: 1,
            }),
            request.post('//127.0.0.1:3002/post', {
                label: 'Post',
                a: 1,
                b: 2,
                c: [1, {
                    d: 'd',
                }],
            }),
            request.post('//127.0.0.1:3002/post', {
                label: 'Post(form-urlencoded)',
                a: 1,
                b: 2,
                c: [1, {
                    d: 'd',
                }],
            }, {
                headers: {
                   'content-type': 'application/x-www-form-urlencoded',
                },
            }),
            request.jsonp('//127.0.0.1:3002/jsonp', {
                label: 'Jsonp',
                a: 1,
            }, {
                callbackParamName: 'callback',
            }),
        ]);

        this.setState({ res });
    }
    render() {
        const res = this.state.res || [];

        return <ul>{res.map((data, i) => {
            const { label, ...others } = data;
            return (<li key={i}>
                {`${label}: ${JSON.stringify(others)}`}
            </li>);
        })}</ul>
    }
}

ReactDOM.render(<App/>, mountNode);
````
