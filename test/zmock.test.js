import assert from 'power-assert';
import MockAdapter from 'axios-mock-adapter';

import request from '../src';
import { getUrl } from '../src/service/service';

const mock = new MockAdapter(request);

const replyCallback = config => [200, config.url];

mock.onGet("//test.hemaos.com/users").reply(replyCallback);
mock.onGet("//ark.hemaos.com/delivery/queryDeliverer").reply(replyCallback);
mock.onGet("//local.zmock.hemaos.com/data/ehr-rider-entry/users").reply(replyCallback);
mock.onGet("//local.zmock.hemaos.com/data/ehr-rider-entry/delivery.queryDeliverer").reply(replyCallback);

it('should get real url', async () => {
  // http
  assert(await request.get('//test.hemaos.com/users') === '//test.hemaos.com/users')
  // ark
  assert(await request.get('//ark.hemaos.com/delivery/queryDeliverer', null, {
    mockToken: 'ehr-rider-entry',
  }) === '//ark.hemaos.com/delivery/queryDeliverer')
  // mtop
  assert(getUrl({
    mapi: 'mtop.wdk.dms.iot.order.html.detail',
    v: '1.1'
  }) === undefined);

  window._ZMOCK_CONFIG = {
    domainPath: '//local.zmock.hemaos.com'
  };
  assert(await request.get('//test.hemaos.com/users') === '//test.hemaos.com/users')
});

it('should get zmock url', async () => {
  window._ZMOCK_CONFIG = {
    domainPath: '//local.zmock.hemaos.com'
  };

  assert(await request.get('//test.hemaos.com/users', null, {
    mockToken: 'ehr-rider-entry'
  }) === '//local.zmock.hemaos.com/data/ehr-rider-entry/users')

  assert(await request.get('//ark.hemaos.com/delivery/queryDeliverer', null, {
    mockToken: 'ehr-rider-entry',
    api: 'delivery.queryDeliverer',
    protocol: 'ARK',
  }) === '//local.zmock.hemaos.com/data/ehr-rider-entry/delivery.queryDeliverer')
});