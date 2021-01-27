import request from '../utils/request';

/**
 * @desc 获取消息列表
 * @author liucheng01
 * @method GET
 * @param {Object} params 
 */
export async function queryMessageList(params) {
  return request('/rest/inbox/listByPage', { data: { ...params }, type: 'urlencoded' });
//   return request('https://nei.netease.com/api/apimock-v2/78deed5379236c0b458e7c29ddf670a5/rest/inbox/list?state=&productid=&type=&page=1&size=10')
}

/**
 * @desc 获取用户消息总数
 * @method GET
 */
export async function getCurrentMessageCount() {
  return request('/rest/inbox/getUnreadCount', {type: 'urlencoded'});
}

/**
 * @desc 获取用户消息详情
 * @method GET
 */
export async function queryMessageDetail(params) {
  return request('/rest/inbox/get', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 修改消息状态
 * @method POST
 */
export async function updateState(params) {
  return request('/rest/inbox/setReaded', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 用户消息全部设为已读
 * @method GET
 */
export async function updateAllState(params) {
  return request('/rest/inbox/setAllReaded', { data: { ...params }, type: 'urlencoded'});
}

/**
 * @desc 删除当前消息
 * @method POST
 */
export async function deleteMessage(params) {
  return request('/rest/inbox/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 删除全部消息
 * @method GET
 */
export async function deleteAllMessage(params) {
  return request('/rest/inbox/deleteAll', { data: { ...params }, type: 'urlencoded'});
}

/**
 * @desc 获取所有子产品列表
 * @method GET
 */
export async function getProductUser(params) {
  return request('/rest/product/my4productuser', {type: 'urlencoded'});
}

