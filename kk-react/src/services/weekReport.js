import request from '../utils/request';

/**
 * @desc 获取所有指定项目下的全部风险项(创建周报时展示用)
 * @method GET
 */
export async function getAllRisk() {
  return request('/ep/rest/project/weekreport/risk/listByProjectid', { type: 'weekreport' });
}

/**
 * @desc 获取周报字段值
 * @method GET
 */
export async function getReportDepend() {
  return request('/ep/rest/project/weekreport/getAutoFillFieldValue', { type: 'weekreport' });
}

/**
 * @desc 新建周报
 * @method POST
 * @param {Object} params
 */
export async function createWeekReport(params) {
  return request('/ep/rest/project/weekreport/add', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 分页获取周报列表
 * @method GET
 * @param {Object} params
 */
export async function getWeekReportByPage(params) {
  return request('/ep/rest/project/weekreport/listByPage', { data: { ...params }, type: 'weekreport' });
}

/**
 * @desc 获取周报列表全量
 * @method GET
 * @param {Object} params
 */
export async function getWeekReportAll() {
  return request('/ep/rest/project/weekreport/listAll');
}

/**
 * @desc 获取周报详情
 * @method GET
 * @param {Number} id
 */
export async function getWeekReportDetail(id) {
  return request(`/ep/rest/project/weekreport/get?id=${id}`, { type: 'weekreport' });
}

/**
 * @desc 获取周报创建人列表
 * @method GET
 */
export async function getWeekReportCreator() {
  return request(`/ep/rest/project/weekreport/getCreateUserList`, { type: 'weekreport' });
}

/**
 * @desc 更新周报
 * @method POST
 * @param {Object} params
 */
export async function updateWeekReport(params) {
  return request(`/ep/rest/project/weekreport/update`, { data: { ...params }, method: 'PUT' });
}

/**
 * @desc 复制周报
 * @method POST
 * @param {Number} id
 */
export async function copyWeekReport(id) {
  return request(`/ep/rest/project/weekreport/copy?id=${id}`, { method: 'POST', type: 'weekreport' });
}

/**
 * @desc 删除周报
 * @method POST
 * @param {Number} id
 */
export async function deleteWeekReport(id) {
  return request(`/ep/rest/project/weekreport/delete?id=${id}`, { method: 'POST', type: 'weekreport' });
}

/**
 * @desc 上传图片
 * @method POST
 * @param {*} formData
 */
export async function uploadImg(formData) {
  return request(`/rest/upload`, { data: formData, method: 'POST', type: 'upload' });
}

/**
 * @desc 周报归档
 * @method POST
 * @param {Object} params
 */
export async function endWeekReport(params) {
  return request(`/ep/rest/project/weekreport/updateState`, { data: { ...params}, method: 'POST', type: 'weekreport' });
}

// 发送周报邮件
export async function sendReportEmail(params) {
  return request(`/ep/rest/project/weekreport/sendEmail`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}
