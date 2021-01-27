import request from '../utils/request';

/**
 * @desc 获取风险负责人列表
 * @method GET
 */
export async function getResponseUserList() {
  return request('/ep/rest/project/weekreport/risk/getResponseUserList', { type: 'weekreport' });
}

/**
 * @desc 获取风险创建人列表
 * @method GET
 */
export async function getCreateUserList() {
  return request('/ep/rest/project/weekreport/risk/getCreateUserList', { type: 'weekreport' });
}

/**
 * @desc 获取风险列表分页
 * @method GET
 * @param {*} params
 */
export async function getRiskList(params) {
  return request('/ep/rest/project/weekreport/risk/listByPage', { data: { ...params }, type: 'weekreport' });
}

/**
 * @desc 获取风险列表
 * @method GET
 * @param {*} params
 */
export async function getRiskAll(params) {
  return request('/ep/rest/project/weekreport/risk/listAll', { data: { ...params }, type: 'weekreport' });
}

/**
 * @desc 保存风险
 * @method POST
 * @param {Object} params
 */
export async function saveRisk(params) {
  return request('/ep/rest/project/weekreport/risk/add', { data: { ...params }, method: 'POST', type: 'weekreport' });
}

/**
 * @desc 获取风险信息
 * @method GET
 * @param {Number} id
 */
export async function getRiskInfo(id) {
  return request(`/ep/rest/project/weekreport/risk/get?id=${id}`, { type: 'weekreport' });
}

/**
 * @desc 编辑风险
 * @method POST
 * @param {Object} params
 */
export async function updateRisk(params) {
  return request('/ep/rest/project/weekreport/risk/update', { data: { ...params }, method: 'POST', type: 'weekreport' });
}

/**
 * @desc 删除风险
 * @method DELETE
 * @param {Number} id
 */
export async function deleteRisk(id) {
  return request(`/ep/rest/project/weekreport/risk/delete/${id}`, { method: 'POST', type: 'weekreport' });
}

/**
 * @desc 风险下创建任务
 * @method POST
 */
export async function createTaskUnderRisk(params) {
  return request(`/ep/rest/issue/create4Risk`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 获取未关联到该项目风险的任务
 * @method POST
 */
export async function getRiskRelateTask(params) {
  return request(`/rest/task/risk/unBinding`, { data: { ...params } });
}

/**
 * @desc 风险下批量关联已有任务
 * @method POST
 */
export async function batchBindTask(params) {
  return request(`/ep/rest/project/weekreport/risk/bindTask`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 任务解绑风险
 * @method POST
 */
export async function unBindTask(params) {
  return request(`/ep/rest/project/weekreport/risk/unBindTask`, { data: { ...params }, method: 'POST' });
}
