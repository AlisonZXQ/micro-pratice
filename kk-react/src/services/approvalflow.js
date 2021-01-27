import request from '../utils/request';

/**
 * @desc 审批流列表
 * @author liucheng01
 * @method GET
 * @param {Object} params
 */
export async function workFlowList(params) {
  return request(`/ep/rest/workflow/${params.productId}`);
}

/**
 * @desc 使生效
 * @method PUT
 * @param {Object} params
 */
export async function isEnable(params) {
  return request(`/ep/rest/workflow/enable/${params.id}`, { method: 'PUT' });
}

/**
 * @desc 使失效
 * @method PUT
 * @param {Object} params
 */
export async function isDisable(params) {
  return request(`/ep/rest/workflow/disable/${params.id}`, { method: 'PUT' });
}

/**
 * @desc 删除工作流
 * @method DELETE
 * @param {Object} params
 */
export async function dltWorkFlow(params) {
  return request(`/ep/rest/workflow/${params.id}`, { method: 'DELETE' });
}

/**
 * @desc 复制工作流
 * @method POST
 * @param {Object} params
 */
export async function copyWorkFlow(params) {
  return request(`/ep/rest/workflow/copy/${params.id}`, { method: 'POST' });
}

/**
 * @desc 新增工作流
 * @method POST
 * @param {Object} params
 */
export async function addWorkFlow(params) {
  return request(`/ep/rest/workflow`, {data: { ...params }, method: 'POST' });
}

/**
 * @desc 工作流详情
 * @method GET
 * @param {Object} params
 */
export async function getFlowDetail(params) {
  return request(`/ep/rest/workflow/detail/${params.id}`);
}

/**
 * @desc 工作流编辑
 * @method PUT
 * @param {Object} params
 */
export async function editFlowData(params) {
  return request(`/ep/rest/workflow`, { data: { ...params }, method: 'PUT' });
}

/**
 * @desc 当前子产品下所有用户组
 * @method GET
 * @param {Object} params
 */
export async function getUserGroup(params) {
  return request(`/rest/rbac/usergroup/listByProductid?productid=${params.productId}`, { method: 'GET' });
}

/**
 * @desc 当前用户组下的用户
 * @method GET
 * @param {Object} params
 */
export async function getUser(params) {
  return request(`/rest/rbac/usergroup/data/listAll?productid=${params.productId}&usergroupid=${params.usergroupId}&keyword=${params.keyword?params.keyword:''}`, { method: 'GET' });
}

/**
 * 添加用户到用户组中
 *
 * @method POST
 * @param {Object} params
 */
export async function addUserIntoGroup(params){
  return request(`/rest/rbac/usergroup/data/add`, {data: { ...params }}, { method: 'POST' });
}

/**
 * 从用户组中移除用户
 *
 * @method POST
 * @param {Object} params
 */
export async function deleteUserFromGroup(params){
  return request(`/rest/rbac/usergroup/data/delete`, {data: { ...params }}, { method: 'POST' });
}
