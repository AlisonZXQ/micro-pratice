import request from '../utils/request';

// 新增产品需求看板
export async function addKanban(params) {
  return request('/rest/requirement/kanban', { data: { ...params }, method: 'POST' });
}

// 删除需求看板
export async function deleteKanban(id) {
  return request(`/rest/requirement/kanban/${id}`, { method: 'DELETE' });
}

// 设置默认看板
export async function setDefaultKanban(params) {
  return request(`/rest/requirement/kanban/setDefault`, { data: { ...params }, method: 'POST' });
}

// 查询需求看板需求列表
export async function getRequirementIssue(params) {
  return request(`/rest/requirement/kanban/issue`, { data: { ...params } });
}

// 添加需求到需求看板中
export async function addKanbanIssue(params) {
  return request(`/rest/requirement/kanban/issue`, { data: { ...params }, method: 'POST' });
}

// 删除需求
export async function deleteKanbanIssue(params) {
  return request(`/rest/requirement/kanban/issue`, { data: { ...params }, method: 'DELETE' });
}

// 查询产品下需求看板列表
export async function getKanbanList(productId) {
  return request(`/rest/requirement/kanban/${productId}`);
}


