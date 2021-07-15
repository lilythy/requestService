# pathVariables

- order: 6

针对 path vars 的处理

---

````jsx
import request from '@alife/hippo-request';

class App extends React.Component {
    state = {}
    async componentDidMount() {
        const res = await Promise.all([
            request.get('//127.0.0.1:3002/:method', {
                label: 'Get',
                a: 1,
            }, {
                pathVariables: {
                    method: 'get',
                },
            }),
            request.post('//127.0.0.1:3002/:method', {
                label: 'Post',
                a: 1,
                b: 2,
                c: [1, {
                    d: 'd',
                }],
            }, {
                pathVariables: {
                    method: 'post',
                },
            }),
            request.jsonp('//127.0.0.1:3002/:method', {
                label: 'Jsonp',
                a: 1,
            }, {
                callbackParamName: 'callback',
                pathVariables: {
                    method: 'jsonp',
                },
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
