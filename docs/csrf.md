# CSRF

- order: 1

ajax 请求将默认带上 csrf 逻辑

---

````jsx
import request from '@alife/hippo-request';

class App extends React.Component {
    state = {}
    async componentDidMount() {
        const res = await request.post('//127.0.0.1:3002/csrf?csrfHeadname=XSRF-TOKEN');
        const res2 = await request.get('//127.0.0.1:3002/csrf?csrfHeadname=XSRF-TOKEN');
        const res3 = await request.post('//127.0.0.1:3002/csrf?csrfHeadname=XSRF-TOKEN', {}, {
            enableCsrf: false,
        });
        
        this.setState({
            res: [
                'csrf token(post): ' + JSON.stringify(res),
                'no csrf token(get): ' + JSON.stringify(res2),
                'no csrf token(post, disable by config): ' + JSON.stringify(res3),
            ].join('\n'),
        });
    }
    render() {
        return (<div>
            <meta name="_csrf" content="b202c4f2-b3d2-4300-b685-bb646174306a" />
            <meta name="_csrf_header" content="XSRF-TOKEN" />
            <meta name="_csrf_enable" content="true" />
            <textarea style={{
                height: '200px',
                width: '600px',
                fontSize: '20px',
                lineHeight: '30px',
            }} value={this.state.res}></textarea>
        </div>);
    }
}

ReactDOM.render(<App/>, mountNode);

````
