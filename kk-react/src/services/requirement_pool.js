import request from '../utils/request';

// 获取需求管理的需求池列表
export async function getRequirementPool(params) {
  return request('/rest/requirement/getRequirementPool', { data: { ...params }, type: 'urlencoded' });
}

// 拖拽排序需求项
export async function updateSortValue(params) {
  return request('/rest/requirement/updateSortValue', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 批量获取指定条件下的版本及内容数据
export async function getPlanVersion(params) {
  return request('/rest/product/version/filter2', { data: { ...params } });
}

// 获取版本的月度统计信息
export async function getVersionDwInfo(params) {
  return request('/rest/product/version/dw/info', { data: { ...params } });
}

// 切换版本内容到新版本中
export async function changeIssueVersion(params) {
  return request('/rest/product/version/plan/switchversion', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 从需求池添加单据到版本内容中
export async function addIssueToVersion(params) {
  return request('/rest/product/version/plan/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 同一版本下版本内容排序
export async function updateSameVerisonSort(params) {
  return request('/rest/product/version/plan/updateSortValue', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 已在版本下的内容移入需求池（仅限需求可操作）
export async function back2RequirementPool(params) {
  return request('/rest/product/version/plan/back2RequirementPool', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取需求排期的设定规则
export async function getRequirementLevelSetting(params) {
  return request('/rest/requirement/sort/config/get', { data: { ...params } });
}

// 保存需求排期的设定规则
export async function saveRequirementLevelSetting(params) {
  return request('/rest/requirement/sort/config/set', { data: { ...params }, method: 'POST' });
}
