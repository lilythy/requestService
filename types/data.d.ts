/**
 * 设置多节点键值
 *
 * ```text
 * setMultipleKeyValue(data, 'a.b.c', true)
 * data.a.b.c === true
 * ```
 */
export function setMultipleKeyValue(data: any, name: string, value: any): void;

/**
 * 获取多节点键值
 *
 * ```text
 * getMultipleKeyValue(data, 'a.b.c') === true
 * ```
 * @param data 原始数据
 * @param name 支持多节点 key (a.b.c)
 */
export function getMultipleKeyValue(data: any, name: string): any;

export interface HippoRequestNormalizer {
  (payload: any): any;
}

export interface MapRules {
  [name: string]: string | ((value: any) => any);
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
 */
export function normalizer(mapRules: MapRules): HippoRequestNormalizer;

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
 * @param type 响应格式类型
 * @param mapRules 数据映射规则
 * @param itemRules 节点数据映射规则
 */
export function formatter(
  type: 'empty' | 'object' | 'list' | 'treeList' | 'pageList',
  mapRules?: MapRules,
  itemRules?: ((value: any) => any) | MapRules,
);
