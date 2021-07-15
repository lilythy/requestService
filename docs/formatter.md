# formatter

- order: 2

格式化 response.data 的场景

---

````jsx
import request from '@alife/hippo-request';

class App extends React.Component {
    state = {}
    async componentDidMount() {
        const res = await request.post('//127.0.0.1:3002/post', {
            a: {
                id: 111,
                value: 'haha',
            },
            pageSize: 20,
            current: 2,
        }, {
            formatter: data => {
                console.log('before formatter:', data);
                return {
                    list: [data.a],
                    total: 200,
                    pageSize: 20,
                    current: 2,
                };
            },
        });

        this.setState({
            res: 'after formatter: ' + JSON.stringify(res, null, 2),
        });
    }
    render() {
        return <div>{this.state.res}</div>
    }
}

ReactDOM.render(<App/>, mountNode);

````
