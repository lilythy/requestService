import ajax from './ajax';
import jsonp from './jsonp';

export default function addMethods(axios) {
  ajax(axios);
  jsonp(axios);
  // 以后对接其它数据源就在这里实现了！
}
