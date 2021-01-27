import request from '../utils/request';

/**
 * @desc 获取需求池列表
 * @method GET
 */
export async function getRequirementList(params) {
  return request('/rest/product/version/pool/listAll', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 获取产品下版本列表-全量
 * @method GET
 */
export async function getVersionList(params) {
  return request('/rest/product/version/filter', { data: { ...params } });
}

/**
 * @desc 获取选中版本列表的详细信息
 * @method GET
 */
export async function getVersionSelect(params) {
  return request('/rest/product/version/get', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 指定版本下的内容列表（全量）
 * @method GET
 */
export async function getVersionSelectList(params) {
  return request('/rest/product/version/plan/list', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 指定版本下的内容列表（全量）
 * @method POST
 */
export async function getVersionSelectData(params) {
  return request('/rest/product/version/plan/getAvailableData', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 批量添加版本下的内容
 * @method POST
 */
export async function batchAddVersion(params) {
  return request('/rest/product/version/plan/batchAdd', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 获取指定版本下的看板数据列表
 * @method GET
 */
export async function getVersionKanban(params) {
  return request('/rest/product/version/kanban/list', { data: { ...params }, type: 'urlencode' });
}

/**
 * @desc 新建版本
 * @method POST
 */
export async function addVersion(params) {
  return request('/rest/product/version/addnew', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 查询是否有重复版本
 * @method POST
 */
export async function queryVersionTitle(params) {
  return request('/rest/product/version/checkname', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 删除版本
 * @method GET
 */
export async function deleteVersion(params) {
  return request('/rest/product/version/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 更新版本（包括版本名称和日期）
 * @method POST
 */
export async function updateVersion(params) {
  return request('/rest/product/version/update', { data: { ...params }, method: 'PUT' });
}

// /**
//  * @desc 获取当前登录用户为子产品用户的可用子产品列表
//  * @method GET
//  */
// export async function getUserProduct() {
//   return request('/rest/product/my4productuser');
// }

/**
 * @desc 从需求池添加单据到版本内容中
 * @method POST
 */
export async function versionPlanAdd(params) {
  return request('/rest/product/version/plan/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 从版本内容中移除单据
 * @method POST
 */
export async function versionPlanDelete(params) {
  return request('/rest/product/version/plan/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 切换版本内容到新版本中
 * @method POST
 */
export async function switchVersion(params) {
  return request('/rest/product/version/plan/switchversion', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取需求池负责人列表
 * @method GET
 */
export async function getPoolUserList(params) {
  return request('/rest/product/version/pool/getResponseUserList', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 获取版本内容负责人列表
 * @method GET
 */
export async function getVersionUserList(params) {
  return request('/rest/product/version/plan/getResponseUserList', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 获取看板负责人列表
 * @method GET
 */
export async function getKanbanResponseUserList(params) {
  return request('/rest/product/version/kanban/getResponseUserList', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 获取看板验证人列表
 * @method GET
 */
export async function getKanbanRequireUserList(params) {
  return request('/rest/product/version/kanban/getRequireUserList', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 看板下的单据状态变更
 * @method POST
 */
export async function kanbanChangeState(params) {
  return request('/rest/product/version/kanban/changestate', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取发布版本前的单据状态情况
 * @method GET
 */
export async function getPublishPre(params) {
  return request('/rest/product/version/prerelease', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 获取当前登录在指定子产品中的角色标记
 * @method GET
 */
export async function getProductFlag(params) {
  return request('/rest/getProductFlag', { data: { ...params }, type: 'urlencoded' });
}

// 批量移除
export async function removeFromVersion(params) {
  return request('/rest/product/version/plan/batchDelete', { data: { ...params }, method: 'POST' });
}

// 批量关闭
export async function closeFromVersion(params) {
  return request('/rest/product/version/plan/batchClose', { data: { ...params }, method: 'POST' });
}
