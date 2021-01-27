import request from '../utils/request';

// 读取缺陷数据文件
export async function readBugFile(formData) {
  return request('/rest/batch/bug/readFile', { data: formData, method: 'POST', type: 'upload' });
}

// 上传缺陷数据文件
export async function importBugFile(formData) {
  return request('/rest/batch/bug/import', { data: formData, method: 'POST' });
}

/**
 * @desc 获取当前子产品需求自定义信息
 * @method GET
 */
export async function getBugCustomList(params) {
  return request('/rest/product/customfield/listByProductidOfBug', { data: { ...params }, method: 'GET' });
}

// 获取bug详情信息
export async function getBugDetail(params) {
  return request('/rest/bug/get', { data: { ...params }, type: 'urlencoded' });
}

// 更新缺陷的状态
export async function updateBugState(params) {
  return request('/rest/bug/batchUpdateState', { data: params, method: 'POST' });
}

// 获取缺陷的历史
export async function getBugHistory(params) {
  return request('/rest/bug/history/list', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取缺陷数据总个数
 * @method POST
 */
export async function getTotalCount(params) {
  return request('/rest/bug/product/totalCount', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取缺陷数据
 * @method POST
 */
export async function getBugList(params) {
  return request('/rest/bug/product/listByPage', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 删除缺陷数据
 * @method POST
 */
export async function deleteBugItem(params) {
  return request('/rest/bug/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 更新缺陷数据
 * @method POST
 */
export async function updateBug(params) {
  return request('/rest/bug/update', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新验证人
export async function updateRequireemail(params) {
  return request('/rest/bug/updateRequireemail', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新模块
export async function updateModuleid(params) {
  return request('/rest/bug/updateModuleid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新描述
export async function updateDescription(params) {
  return request('/rest/bug/updateDescription', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新版本
export async function updateFixversionid(params) {
  return request('/rest/bug/updateFixversionid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新发现版本
export async function updateFindversionid(params) {
  return request('/rest/bug/updateFindversionid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新bug类型
export async function updateBugtype(params) {
  return request('/rest/bug/updateBugtype', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新预估工作量
export async function updateEstimateCost(params) {
  return request('/rest/bug/updateEstimateCost', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新自定义字段
export async function updateBugCustom(params) {
  return request('/rest/bcfr/update', { data: { ...params }, method: 'POST' });
}

// 删除自定义字段
export async function deleteBugCustom(params) {
  return request('/rest/bcfr/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}
