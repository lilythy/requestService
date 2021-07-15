# Service

---

```js
import { createService } from '@alife/hippo-request';

const update = createService({
  url: '//rap2api.alibaba-inc.com/app/mock/2985/test-post',
  method: 'post'
})

let file

function selectFile (ev) {
  console.log(ev, ev.target)

  if (ev.target.files && ev.target.files.length) {
    file = ev.target.files[0]
  }
}

async function sendRequest () {
  try {
    const form = new FormData()
    form.append('name', 'hello')
    if (file) {
      form.append('file', file)
    }
    const data = await update(form)
  } catch (err) {
    console.error(err)
  }
}

ReactDOM.render((
  <div>
    <div>选择文件: <input type="file" onChange={selectFile} /></div>
    <div><button onClick={sendRequest}>发送请求</button></div>
  </div>
), mountNode)
```
