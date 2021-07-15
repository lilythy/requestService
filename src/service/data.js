/**
 * 设置多节点键值
 *
 * ```text
 * setMultipleKeyValue(data, 'a.b.c', true)
 * data.a.b.c === true
 * ```
 *
 * @param {object} data
 * @param {string} name
 * @param {any} value
 */
export function setMultipleKeyValue (data, name, value) {
  const parts = name.split('.');
  const lastKey = parts.pop();
  let i = 0;
  let map = data;
  while (i < parts.length) {
    const key = parts[i];
    if (!map[key]) {
      map[key] = {};
    }
    map = map[key];
    i++;
  }
  map[lastKey] = value;
}

/**
 * 获取多节点键值
 *
 * ```text
 * getMultipleKeyValue(data, 'a.b.c') === true
 * ```
 * @param {object} data 原始数据
 * @param {string} name 支持多节点 key (a.b.c)
 */
export function getMultipleKeyValue (data, name) {
  const parts = name.split('.');
  let i = 0;
  let value = data;
  while (i < parts.length) {
    const key = parts[i];
    if (value && typeof value === 'object') {
      value = value[key];
      i++;
    } else {
      return undefined;
    }
  }
  return value;
}

function transformObject (data, mapRules) {
  data = data || {};
  mapRules = mapRules || {};

  // convert mapRules
  const newData = {};
  if (typeof mapRules === 'function') {
    // 特殊场景下, 需要自行写 mapRules 函数
    Object.assign(newData, mapRules(data));
  } else {
    for (const toKey in mapRules) {
      const fromKey = mapRules[toKey];
      let value;
      if (typeof fromKey === 'function') {
        value = fromKey(data);
      } else {
        value = getMultipleKeyValue(data, fromKey);
      }
      setMultipleKeyValue(newData, toKey, value);
    }
  }

  return newData;
}

function transformList (data, mapRules, recursive) {
  data = data || [];
  mapRules = mapRules || {};
  const newData = [];

  for (const item of data) {
    const newItem = transformObject(item, mapRules);

    if (recursive) {
      const nodesKey = mapRules.children ? mapRules.children : 'children';
      delete newItem.children;
      if (item[nodesKey] && item[nodesKey].length) {
        newItem.children = transformList(item[nodesKey], mapRules, recursive);
      }
    }

    newData.push(newItem);
  }

  return newData;
}

function mergeRules (defaultRules, passRules) {
  if (typeof passRules === 'function') {
    return passRules;
  }
  return Object.assign(defaultRules, passRules);
}

/**
* 请求数据格式化生成器
*
* ```text
* normalizer({
*   pageNo: 'currentRecord',
*   pageSize: 'recordSize
* })
*
* from: {
*   pageNo: 1,
*   pageSize: 20
* }
*
* to: {
*   currentRecord: 1,
*   recordSize: 20
* }
* ```
* @param {object} mapRules
*/
export function normalizer (mapRules) {
  return (payload) => {
    const newPayload = {};
    for (const name in payload) {
      if (!payload.hasOwnProperty(name)) {  // eslint-disable-line
        continue;
      }
      const rule = mapRules[name];
      const value = payload[name];
      if (typeof rule === 'string') {
        newPayload[rule] = value;
      } else if (typeof rule === 'function') {
        // 对于空数据, 就直接过滤掉, 不执行规则
        if (typeof value === 'undefined' || value === null || value === '') {
          newPayload[name] = value;
        } else {
          newPayload[name] = rule(value);
        }
      } else {
        newPayload[name] = value;
      }
    }
    return newPayload;
  };
}

/**
 * 响应数据格式化生成器
 *
 * ```text
 * formatter('treeList', {
 *   'data': 'records',
 *   'success': rawData => !!rawData.records
 * }, {
 *   label: 'name',
 *   value: 'id',
 *   children: 'nodes'
 * })
 *
 * from: {
 *   records: [
 *     {
 *       id: 1212,
 *       name: '商品AAA',
 *       nodes: [ ... ]
 *     }
 *   ]
 * }
 *
 * to: {
 *   success: true,
 *   data: [
 *     {
 *       value: 1212,
 *       label: '商品AAA',
 *       children: [ ... ]
 *     }
 *   ]
 * }
 * ```
 *
 * @param {string} type 响应格式类型 (empty|object|list|treeList|pageList)
 * @param {object|function} mapRules 数据映射规则
 * @param {object|function} itemRules 节点数据映射规则
 */
export function formatter (type, mapRules, itemRules) {
  mapRules = mapRules || {};

  const layoutKeys = [
    'code',
    'success',
    'message',
    'errors',
    'data',
  ];

  return (rawData) => {
    if (!rawData || typeof rawData !== 'object') {
      throw new Error('响应数据格式不合法');
    }
    if (typeof mapRules === 'function') {
      mapRules = mapRules(rawData);
    }
    if (!mapRules || typeof mapRules !== 'object') {
      throw new Error('mapRules 应该为 object 或能返回 object 的函数');
    }
    const data = {};

    // 外层数据映射
    for (const toKey in mapRules) {
      const fromKey = mapRules[toKey];
      let value;
      if (typeof fromKey === 'function') {
        value = fromKey(rawData);
      } else {
        value = getMultipleKeyValue(rawData, fromKey);
      }
      setMultipleKeyValue(data, toKey, value);
    }
    for (const key of layoutKeys) {
      // 对于 rawData 中存在, 但 data 不存在的 key, 进行复制
      if (!(key in data) && (key in rawData)) {
        data[key] = rawData[key];
      }
    }

    // 节点数据映射 (只有成功时才执行 data 映射)
    if (data.success) {
      switch (type) {
        case 'empty':
          // 保证有一个 data 属性, 避免属性缺失的警告
          if (!('data' in data)) {
            data.data = null;
          }
          break;
        case 'list':
          data.data = transformList(data.data, mergeRules({
            // default rules
            label: 'label',
            value: 'value'
          }, itemRules));
          break;
        case 'treeList':
          data.data = transformList(data.data, mergeRules({
            label: 'label',
            value: 'value',
            children: 'children'
          }, itemRules), true);
          break;
        case 'pageList':
          if (itemRules) {
            data.list = transformList(data.list, itemRules); // 此处代码用于兼容旧逻辑
            if (data.data && data.data.list) {
              data.data.list = transformList(data.data.list, itemRules);
            }
          }
          break;
      }
    }

    return data;
  };
}
