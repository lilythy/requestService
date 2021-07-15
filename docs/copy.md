# 副本定制

- order: 5

副本化，做业务定制与隔离

---

````jsx
import oriRequest from '@alife/hippo-request';

const request = oriRequest.create();
request.interceptors.request.use(
    function(config) {
        config.params.interceptor = 'add by interceptors!';
        return config;
    },
    function(error) {
        return Promise.reject(error);
    }
);
const request2 = request.create();

// console.log(typeof request.withRequest, typeof request2.withRequest);

class App extends React.Component {
    state = {}
    async componentDidMount() {
        const res = await Promise.all([
            request.get('//127.0.0.1:3002/get', {
                label: 'Get by forked',
                a: 1,
            }),
            oriRequest.get('//127.0.0.1:3002/get', {
                label: 'Get origin',
                a: 2,
            }),
            request2.get('//127.0.0.1:3002/get', {
                label: 'Get by forked * 2',
                a: 3,
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
