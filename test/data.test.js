import assert from 'power-assert';
import { formatter, normalizer, getMultipleKeyValue, setMultipleKeyValue } from '../src/service';

it('should get multiple key value', async () => {
  const data = {
    a: 1,
    b: {
      c: 2
    }
  };

  assert(getMultipleKeyValue(data, 'a') === 1);
  assert(getMultipleKeyValue(data, 'b') === data.b);
  assert(getMultipleKeyValue(data, 'b.c') === 2);
  assert(getMultipleKeyValue(data, 'b.c.d') === undefined);
});

it('should set multiple key value', async () => {
  const data = {};

  setMultipleKeyValue(data, 'a', 1);
  setMultipleKeyValue(data, 'b.c', 2);
  setMultipleKeyValue(data, 'b.d.e', 3);
  assert(data.a === 1);
  assert(data.b.c === 2);
  assert(data.b.d.e === 3);
});

it('should normalize payload', async () => {
  const normalize = normalizer({
    keyword: (v) => `%${v}%`,
    pageSize: 'recordSize',
    pageNo: 'currentRecord'
  });

  const data = {
    keyword: '1111',
    pageSize: 20,
    pageNo: 1
  };
  const newData = normalize(data);
  assert(newData.recordSize === data.pageSize);
  assert(newData.currentRecord === data.pageNo);
  assert(newData.keyword === `%${data.keyword}%`);

  const data1 = {
    keyword: ''
  };
  const newData1 = normalize(data1);
  assert(newData1.keyword === '');
});

// fix superx/x#51442
it('should format response data (pageList)', async () => {
  const format = formatter('pageList', {
    message: 'errorDesc',
    'data.list': 'result.data',
    'data.total': 'result.totalCount'
  });

  const data = {
    success: true,
    errorCode: null,
    errorDesc: null,
    result: {
      pageSize: 50,
      offset: 0,
      totalCount: 0,
      totalPage: 0,
      currentPage: 1,
      data: []
    },
    totalNum: 0,
    error: false
  };
  const newData = format(data);
  assert(newData.success === data.success);
  assert(newData.message === data.errorDesc);
  assert(newData.data.total === data.result.totalCount);
});

it('should format respose data with default rules', async () => {
  const format = formatter('list');
  const data = {
    success: true,
    data: [
      {
        label: '商品需要淘汰，停采',
        value: '商品需要淘汰，停采'
      },
      {
        label: '淘汰变更',
        value: '淘汰变更'
      },
      {
        label: '系统自动触发',
        value: '系统自动触发'
      }
    ]
  };

  const newData = format(data);
  assert.deepEqual(newData.data, data.data);
});

it('should format respose data with function rule', async () => {
  const format1 = formatter('list', {}, item => ({
    label: item.label,
    value: item.value,
    c: item.field3
  }));
  const format2 = formatter('list', {}, {
    c: 'field3'
  });
  const data = {
    success: true,
    data: [
      {
        label: '商品需要淘汰，停采',
        value: '商品需要淘汰，停采',
        field3: 1111
      },
      {
        label: '淘汰变更',
        value: '淘汰变更',
        field3: 222
      },
      {
        label: '系统自动触发',
        value: '系统自动触发',
        field3: 333
      }
    ]
  };

  // console.log(format1(data).data)
  // console.log(format2(data).data)
  assert.deepEqual(format1(data).data, format2(data).data);
});

it('should format response data (list)', async () => {
  const format = formatter('list', {
    message: 'errorMsg',
    data: 'records',
  });

  const data = {
    success: true,
    errorMsg: null,
    records: [
      {
        label: 'name1',
        value: 1
      },
      {
        label: 'name2',
        value: 2
      }
    ]
  };
  const newData = format(data);
  assert(newData.success === data.success);
  assert(newData.message === data.errorMsg);
  assert(newData.data.length === data.records.length);
  assert(newData.data[0].value === data.records[0].value);
  assert(newData.data[0].label === data.records[0].label);
});

it('should format response data (treeList)', async () => {
  const format = formatter('treeList', {
    data: 'records',
  }, {
    label: 'name',
    value: 'id',
    children: 'nodes'
  });

  const data = {
    success: true,
    message: 'OK',
    records: [
      {
        id: 1,
        name: '商品AAA',
        nodes: [
          {
            id: 2,
            name: '商品BBB',
          }
        ]
      },
      {
        id: 3,
        name: '商品CCC',
      }
    ]
  };
  const newData = format(data);
  assert(newData.success === data.success);
  assert(newData.message === data.message);
  assert(newData.data.length === data.records.length);
  assert(newData.data[0].value === data.records[0].id);
  assert(newData.data[0].label === data.records[0].name);
  assert(newData.data[0].children.length === data.records[0].nodes.length);
  assert(newData.data[0].children[0].value === data.records[0].nodes[0].id);
  assert(newData.data[0].children[0].label === data.records[0].nodes[0].name);
});

it('should format complex treeList response data', async () => {
  const format = formatter('treeList', {
    data: rawData => [rawData.records],
  }, {
    label: 'name',
    value: 'value.id'
  });

  const data = {
    success: true,
    message: 'OK',
    records: {
      value: {
        id: 0
      },
      name: '商品000',
      children: [
        {
          value: {
            id: 1
          },
          name: '商品AAA',
          children: [
            {
              value: {
                id: 2
              },
              name: '商品BBB',
            }
          ]
        },
        {
          value: {
            id: 3
          },
          name: '商品CCC',
        }
      ]
    }
  };
  const newData = format(data);
  assert(newData.success === data.success);
  assert(newData.message === data.message);
  assert(newData.data.length === 1);
  assert(newData.data[0].value === data.records.value.id);
  assert(newData.data[0].label === data.records.name);
  assert(newData.data[0].children.length === data.records.children.length);
  assert(newData.data[0].children[0].value === data.records.children[0].value.id);
  assert(newData.data[0].children[0].label === data.records.children[0].name);
});

it('should format pageList data', async () => {
  const format1 = formatter('pageList', {
    'data.list': 'data',
    'data.total': 'total'
  });
  const format2 = formatter('pageList', {
    'data.list': 'data',
    'data.total': 'total'
  }, item => ({
    id: item.deviceId,
    ...item
  }));

  const data = {
    success: true,
    message: 'message',
    errorCode: 0,
    data: [
      {
        warehouseName: '33571004',
        areaName: '后仓区域',
        imageUrl: 'https://img.alicdn.com/tfs/TB1BLoXs1GSBuNjSspbXXciipXa-694-521.jpg',
        displayName: '测试摄像头@deviceId',
        status: 1,
        deviceId: 4728,
        desc: '测试摄像头4728',
        gmtModified: 1551149395000
      },
      {
        warehouseName: '33571004',
        areaName: '后仓区域',
        imageUrl: 'https://img.alicdn.com/tfs/TB1BLoXs1GSBuNjSspbXXciipXa-694-521.jpg',
        displayName: '测试摄像头@deviceId',
        status: 1,
        deviceId: 5271,
        desc: '测试摄像头5271',
        gmtModified: 1551149395000
      },
    ],
    total: 12
  };

  // format1
  const newData1 = format1(data);
  assert(newData1.success === data.success);
  assert(newData1.data.list.length === data.data.length);
  assert(newData1.data.total === data.total);
  assert(newData1.data.list[0].areaName === data.data[0].areaName);

  // format2
  const newData2 = format2(data);
  assert(newData2.success === data.success);
  assert(newData2.data.list.length === data.data.length);
  assert(newData2.data.total === data.total);
  assert(newData2.data.list[0].id === data.data[0].deviceId);
  assert(newData2.data.list[0].areaName === data.data[0].areaName);
});
