import request from '../utils/request';

// 获取组织目标列表
export async function getObjectiveList(params) {
  return request('/rest/orgObjective/listAll', { data: params, method: 'POST' });
}

// 获取组织目标地图
export async function getObjectiveMap(params) {
  return request('/rest/orgObjective/view', { data: params, method: 'POST' });
}

// 添加新目标
export async function addObjective(params) {
  return request('/rest/orgObjective/add', { data: params, method: 'POST' });
}

// 编辑目标
export async function editObjective(params) {
  return request('/rest/orgObjective/update', { data: params, method: 'POST' });
}

// 删除目标
export async function deleteObjective(params) {
  return request('/rest/orgObjective/delete', { data: params, method: 'POST' });
}

// 增加kr
export async function addObjectiveKR(params) {
  return request('/rest/orgObjective/kr/add', { data: params, method: 'POST' });
}

// 编辑kr
export async function editObjectiveKR(params) {
  return request('/rest/orgObjective/kr/update', { data: params, method: 'POST' });
}

// 删除kr
export async function deleteObjectiveKR(params) {
  return request('/rest/orgObjective/kr/delete', { data: params, method: 'POST' });
}

// 获取同企业下人员
export async function getEntResponseUser(params) {
  return request('/rest/orgObjective/listResponseUser', { data: params, method: 'POST' });
}

// 搜索对齐目标
export async function getParentObjective(params) {
  return request('/rest/orgObjective/search', { data: params, method: 'POST' });
}
