import assert from 'power-assert';
import mm from 'mm';
import request from '../src';
import mtop from '../src/service/mtop';
import { globalConfig, createService, formatter } from '../src';
import { getService } from '../src/service/service';
import { createApiFormatter } from '../src/service/api';

globalConfig.toast = {
  success: () => {},
  error: () => {}
};

describe('service test', () => {
  afterEach(() => {
    mm.restore();
  });

  it('should createService', async () => {
    mm(request, 'get', async () => {
      return {
        success: true,
        message: 'ok',
        data: [
          {
            label: 'xxx',
            value: 1
          },
          {
            label: 'yyy',
            value: 2
          }
        ]
      };
    });
    const apienv = {
      'test.hemaos.com/conversion': 2708,
      'test.hemaos.com': {
        local: 2708
      }
    };
    const getCommonBU = createService({
      url: '//test.hemaos.com/common/bu'
    }, apienv);
    const getConversionList = createService({
      url: '//test.hemaos.com/conversion/list',
      method: 'post'
    }, apienv);

    // normal
    let data = await getCommonBU();
    assert(Array.isArray(data));
    assert(data.length === 2);

    // mock local
    mm.restore();
    window._APIMAP_ENV = 'local';
    data = await getCommonBU();
    assert(Array.isArray(data));
    assert(data.length === 1);

    window._APIMAP_ENV = 'pre';
    data = await getConversionList();
    assert(Array.isArray(data));
    assert(data.length >= 1);
    assert(data[0].id);
  });

  it('should support getService with array', async () => {
    mm(request, 'get', async (url, params) => {
      return {
        success: true,
        data: params
      };
    });

    const getData = createService({
      url: '//test.hemaos.com/common/bu'
    });

    const data1 = await getData({
      foobar: true
    });
    assert(!Array.isArray(data1));

    const data2 = await getData([{
      hello: 'world'
    }]);
    assert(Array.isArray(data2));
  });

  it('should check response data format', async () => {
    // check invalid data
    const getInvalidData = createService({
      url: 'http://g.alicdn.com/sj/securesdk/0.0.3/securesdk_v2.js',
      formatter: formatter('object', {
        message: 'errorDesc'
      }),
      withCredentials: false
    });

    let error;
    try {
      await getInvalidData();
    } catch (err) {
      error = err;
    }
    assert(error);
    assert(error.message === '???????????????????????????');

    // get error response
    const getErrorResp = createService({
      url: 'http://rap2api.alibaba-inc.com/app/mock/2985/getErrorResp'
    });

    error = null;
    try {
      await getErrorResp();
    } catch (err) {
      error = err;
    }
    assert(error);
    assert(error.response);
    assert(error.code === 100);
    assert(Array.isArray(error.data));
    assert(Array.isArray(error.errors));

    // get error response (empty message)
    const getEmptyMessage = createService({
      url: 'http://rap2api.alibaba-inc.com/app/mock/2985/getEmptyMessage'
    });

    let logErrors = [];
    mm(console, 'error', (...args) => {
      logErrors.push(args);
    });

    error = null;
    try {
      await getEmptyMessage();
    } catch (err) {
      error = err;
    }
    assert(error);
    assert(error.message === '');
    assert(error.response);
    assert(logErrors.length === 1);
    assert(logErrors[0][0] === '[Service] service (%s) ????????????????????? %s ??????, ????????? service ??????????????????');
    assert(logErrors[0][2] === 'message');

    // get normal response
    const getNormal = createService({
      url: 'http://rap2api.alibaba-inc.com/app/mock/2985/getNormalResp',
    });

    logErrors = [];
    await getNormal();
    assert(logErrors.length === 1);
    assert(logErrors[0][0] === '[Service] service (%s) ????????????????????? %s ??????, ????????? service ??????????????????');
    assert(logErrors[0][2] === 'data');
  });

  it('should pass config to request', async () => {
    mm(request, 'get', async (url, params, config) => {
      return {
        success: true,
        message: 'ok',
        data: { config }
      };
    });

    const getCommonBU = createService({
      url: '//test.hemaos.com/common/bu',
      config1: 'c1',
      config2: 'c2',
    });
    let data;

    // ????????????
    data = await getCommonBU();
    assert(data.config.config1 === 'c1');
    assert(data.config.config2 === 'c2');

    // ??????????????????
    data = await getCommonBU(null, { config2: 'over' });
    assert(data.config.config1 === 'c1');
    assert(data.config.config2 === 'over');
  });

  it('should check bad url config', async () => {
    mm(request, 'get', async (url, params) => {
      return {
        success: true,
        message: 'ok',
        data: params
      };
    });

    let errors = [];
    mm(console, 'error', msg => {
      errors.push(msg);
    });
    const getOnlyPath = createService({
      url: '/common/bu',
    });

    const data = await getOnlyPath({
      foobar: 1
    });
    assert(data.foobar === 1);
    assert(errors.length === 1);
    assert(/???????????? service ???????????????????????? URL/.test(errors[0]));
  });

  it('should getService', async () => {
    const services = {
      namespace: {
        getABCService: async () => { },
        getDEFService: 1,
      }
    };

    const service = getService('namespace.getABCService', services);
    assert(service === services.namespace.getABCService);

    assert.throws(() => {
      getService('namespace.getNotExistsService', services);
    }, /service namespace.getNotExistsService is undefined/);

    assert.throws(() => {
      getService('namespace.getDEFService', services);
    }, /service namespace.getDEFService is not a function/);
  });

  it('should support api that link a datasource in createService', async () => {
    mm(request, 'get', async () => {
      return createApiFormatter(formatter('object', {
        'data.id': 'data.delivererId'
      }))({
        success: true,
        data: {
          queryDeliverer: {
            data: {
              delivererId: 2000260,
              wfId: null
            }
          }
        }
      });
    });

    const service = createService({
      api: 'deliverer.queryDeliverer',
      method: 'get'
    });
    const result = await service({
      delivererId: 2000260
    });

    assert.deepEqual(result, {
      id: 2000260
    });
  });

  it('should support api that link a datasource in createService when calling datasource failed', async () => {
    mm(request, 'get', async () => {
      return createApiFormatter()({
        success: false,
        data: {
          queryDeliverer: null
        },
        message: 'Errors exists in resolver',
        code: 'RESOLVER_ERROR',
        errors: [{
          path: ['queryDeliverer'],
          message: '??????????????????',
          extensions: {
            code: '40001',
            errors: [{
              message: 'delivererId ??????'
            }]
          },
          locations: [{ line: 2, column: 3 }],
        }]
      });
    });

    const service = createService({
      api: 'deliverer.queryDeliverer',
      method: 'get'
    });

    try {
      await service();
      assert(false);
    } catch (e) {
      assert(e.message === '??????????????????');
      assert.deepEqual(e.errors, [{
        message: 'delivererId ??????'
      }]);
    }
  });

  it('should support api that link mutiple datasources in createService', async () => {
    mm(request, 'get', async () => {
      return createApiFormatter({
        queryDeliverer: formatter('object', {
          'data.id': 'data.delivererId'
        })
      })({
        success: true,
        data: {
          queryDeliverer: {
            data: {
              delivererId: 2000260,
              wfId: null
            }
          },
          getDelivererBasicInfoById: {
            data: {
              id: 2000260,
              name: 'mock_name6000'
            }
          }
        }
      });
    });

    const service = createService({
      api: 'deliverer.test',
      method: 'get'
    });
    const result = await service({
      delivererId: 2000260,
      delivererId1: 2000260
    });

    assert.deepEqual(result, {
      queryDeliverer: {
        id: 2000260
      },
      getDelivererBasicInfoById: {
        id: 2000260,
        name: 'mock_name6000'
      }
    });
  });

  it('should support api that link multiple datasources in createService when calling datasource failed', async () => {
    mm(request, 'get', async () => {
      return createApiFormatter()({
        success: false,
        data: {
          queryDeliverer: null,
          getDelivererBasicInfoById: {
            data: {
              id: 2000260,
              name: 'mock_name6000'
            }
          }
        },
        message: 'Errors exists in resolver',
        code: 'RESOLVER_ERROR',
        errors: [{
          path: ['queryDeliverer'],
          message: '??????????????????',
          extensions: {
            code: '40001',
            errors: [{
              message: 'delivererId ??????'
            }]
          },
          locations: [{ line: 2, column: 3 }],
        }]
      });
    });

    const service = createService({
      api: 'deliverer.test',
      method: 'get'
    });

    try {
      await service({
        delivererId1: 2000260
      });
      assert(false);
    } catch (e) {
      assert(e.message === '[queryDeliverer]??????????????????');
      assert.deepEqual(e.errors, {
        queryDeliverer: {
          message: '??????????????????',
          code: '40001',
          errors: [{
            message: 'delivererId ??????'
          }]
        }
      });
    }
  });

  it('should throw error if api param of createService is not domainName.apiName format', async () => {
    const service = createService({
      api: 'queryDeliverer',
      method: 'get'
    });

    try {
      await service({
        delivererId: 2000260
      });
      assert(false);
    } catch (e) {
      assert(e.message === '[Service Ark] api ?????????????????????????????????????????????domianName.apiName????????? delivery.queryDeliverer');
    }
  });

  it('should throw error if api links multiple datasources but formatter is not an object', async () => {
    mm(request, 'get', async () => {
      return createApiFormatter(formatter('object', {
        'data.id': 'data.delivererId'
      }))({
        success: true,
        data: {
          queryDeliverer: {
            data: {
              delivererId: 2000260,
              wfId: null
            }
          },
          getDelivererBasicInfoById: {
            data: {
              id: 2000260,
              name: 'mock_name6000'
            }
          }
        }
      });
    });

    const service = createService({
      api: 'deliverer.test',
      method: 'get'
    });

    try {
      await service({
        delivererId: 2000260,
        delivererId1: 2000260
      });
      assert(false);
    } catch (e) {
      assert(e.message === '[Service Ark] ??????????????????????????????formatter ??????????????? object ?????????key ????????????????????? { hsfA: formatter(...), hsfB: formatter(...) }');
    }
  });

  it('should return validate error if validate params failed when use api', async () => {
    mm(request, 'get', async () => {
      return createApiFormatter()({
        success: false,
        message: 'Errors exists in resolver',
        code: 'RESOLVER_ERROR',
        errors: [{
          message: 'Variable "$delivererId" got invalid value "2000260"; Expected type Int'
        }]
      });
    });

    const service = createService({
      api: 'deliverer.test',
      method: 'get'
    });

    try {
      await service({
        delivererId1: '2000260'
      });
      assert(false);
    } catch (e) {
      assert(e.message === 'Variable "$delivererId" got invalid value "2000260"; Expected type Int');
    }
  });

  it('should support mtop request', async () => {
    const mapi = 'mtop.wdk.dms.iot.order.html.detail';
    const data = {
      taskCode: 123456
    };
    const expectResult = {
      id: 564321
    };

    mm(mtop, 'request', async params => {
      assert.equal(params.api, mapi);
      assert.equal(params.v, '1.0');
      assert.equal(params.dataType, 'json');
      assert.deepEqual(params.data, data);

      return {
        data: expectResult
      };
    });

    const service = createService({
      mapi
    });
    const result = await service(data);

    assert.deepEqual(result, expectResult);
  });

  it('should throw error if mtop request failed', async () => {
    const mapi = 'mtop.wdk.dms.iot.order.html.detail';
    const messae = 'My Error';
    const code = 999;

    mm(mtop, 'request', async () => {
      const error = new Error(messae);
      error.code = code;

      throw error;
    });

    const service = createService({
      mapi
    });
    try {
      await service();
      assert.equal(true, false);
    } catch (e) {
      assert.equal(e.message, messae);
      assert.equal(e.code, code);
    }
  });
});
