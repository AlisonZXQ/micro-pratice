import request from '../utils/request';

// 读取目标数据文件
export async function readObjectiveFile(formData) {
  return request('/rest/batch/objective/readFile', { data: formData, method: 'POST', type: 'upload' });
}

// 上传目标数据文件
export async function importObjectiveFile(formData) {
  return request('/rest/batch/objective/import', { data: formData, method: 'POST' });
}

/**
 * @desc 获取当前子产品目标自定义信息
 * @method GET
 */
export async function getObjectiveCustomList(params) {
  return request('/rest/product/customfield/listByProductidOfObjective', { data: { ...params }, method: 'GET' });
}

/**
 * @desc 获取目标数据总个数
 * @method POST
 */
export async function getTotalCount(params) {
  return request('/rest/objective/product/totalCount', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取目标数据
 * @method POST
 */
export async function getobjectiveList(params) {
  return request('/rest/objective/product/listByPage', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取目标的详情信息
export async function getObjectiveDetail(params) {
  return request('/rest/objective/get', { data: { ...params }, type: 'urlencoded' });
}

// 获取项目下的目标详情信息
export async function getProjectObjectiveDetail(params) {
  return request('/rest/project/objective/initiate/detail', { data: { ...params }, type: 'urlencoded' });
}

// 更新目标的状态
export async function updateObjectiveState(params) {
  return request('/rest/objective/batchUpdateState', { data: params, method: 'POST' });
}

// 获取目标的历史
export async function getObjectiveHistory(params) {
  return request('/rest/objective/history/list', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 独立目标的删除
export async function deleteObjective(params) {
  return request('/rest/objective/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 更新目标数据
 * @method POST
 */
export async function updateObjective(params) {
  return request('/rest/objective/update', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新验证人
export async function updateRequireemail(params) {
  return request('/rest/objective/updateRequireemail', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新模块
export async function updateModuleid(params) {
  return request('/rest/objective/updateModuleid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新描述
export async function updateDescription(params) {
  return request('/rest/objective/updateDescription', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新备注
export async function updateRemark(params) {
  return request('/rest/objective/updateRemark', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新目标类型
export async function updateType(params) {
  return request('/rest/objective/updateType', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新目标自定义字段
export async function updateObjectiveCustom(params) {
  return request('/rest/ocfr/update', { data: { ...params }, method: 'POST' });
}

// 删除目标自定义字段
export async function deleteObjectiveCustom(params) {
  return request('/rest/ocfr/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取目标的验收历史
export async function getObjectiveAcceptList(id) {
  return request(`/rest/project/objective/initiate/list/${id}`);
}

//设置需求的状态
export async function setObjectiveState(params) {
  return request(`/rest/objective/batchUpdateState`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 查询okr目标列表
export async function getOKRList(params) {
  return request(`/rest/okr/objective/list`, { data: { ...params } });
}

// 查询组织目标列表
export async function getOrganizeList(params) {
  return request(`/rest/orgObjective/list4Add`, { data: { ...params }, method: 'POST' });
}

