import request from '../utils/request';

// 获取海量数据
export async function getCoreData(params) {
  return request('/rest/platform/coredata', { data: params, method: 'POST' });
}

// 申请接入产品
export async function productApply(params) {
  return request('/rest/apply', { data: params, method: 'POST', type: 'urlencoded' });
}

// 申请接入企业
export async function entApply(params) {
  return request('/rest/ent/apply', { data: params, method: 'POST', type: 'urlencoded' });
}

// 获取企业列表
export async function getEntList(params) {
  return request('/rest/entList', { data: params, method: 'POST' });
}

