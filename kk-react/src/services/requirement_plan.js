import request from '../utils/request';

// 查询产品需求规划列表
export async function getRequirementPlanList(params) {
  return request('/rest/requirement/plan', { data: { ...params } });
}

// 查询需求规划日历列表数据
export async function getRequirementPlanDate(params) {
  return request('/rest/requirement/plan/calendar', { data: { ...params } });
}

// 查询需求规划需求计划map列表数据
export async function getRequirementPlanMap(params) {
  return request('/rest/requirement/plan/map', { data: { ...params } });
}

// 未规划目标的需求
export async function getUnLinkedList(params) {
  return request('/rest/requirement/plan/unLinkedList', { data: { ...params } });
}

// 需求规划批量解绑需求
export async function batchDeleteRelation(params) {
  return request('/rest/issue/relation/batchDelete', { data: { ...params }, method: 'POST' });
}
