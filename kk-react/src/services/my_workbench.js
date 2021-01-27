import request from '../utils/request';

/**
 * @desc 我的工作台-我的单据分页列表
 * @method POST
 */
export async function getIssueListByPage(params) {
  return request('/rest/receipt/myworkbench/listByPage', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 我的工作台-我的单据总量
 * @method POST
 */
export async function getIssueTotalCount(params) {
  return request('/rest/receipt/myworkbench/totalCount', { data: { ...params }, type: 'urlencoded' });
}

// 我参与的审批单
export async function getMyParticipate(params) {
  return request('/ep/rest/workflow/apply/myWorkflowAuditList', { data: { ...params }, type: 'urlencoded' });
}

// 我参与的审批单下面的筛选条件-项目
export async function getMyParticipateProject(params) {
  return request('/ep/rest/workflow/apply/myWorkflowAuditProjectList', { data: { ...params }, type: 'urlencoded' });
}

// 我的审批单
export async function getMyAudit(params) {
  return request('/ep/rest/workflow/apply/myWorkflowAuditedList', { data: { ...params }, type: 'urlencoded' });
}

// 我的审批单下的项目筛选项
export async function getMyAuditProject(params) {
  return request('/ep/rest/workflow/apply/myWorkflowAuditedProjectList', { data: { ...params }, type: 'urlencoded' });
}

// 工作台创建建议
export async function createFeedback4Workbench(params) {
  return request('/ep/rest/issue/createFeedback4Workbench', { data: { ...params }, method: 'POST' });
}

// 获取我的建议产品列表
export async function productList4MyFeedback() {
  return request('/rest/receipt/myworkbench/productList4MyFeedback');
}

// 查询我负责的项目
export async function getMyOwnerPro(params) {
  return request('/ep/rest/project/workbench/myOwner', { data: { ...params } });
}

// 查询我参与的项目
export async function getMyParticipatePro(params) {
  return request('/ep/rest/project/workbench/myParticipatory', { data: { ...params } });
}

// 查询我收藏的项目
export async function getMyCollectPro(params) {
  return request('/ep/rest/project/collect/myCollectProject', { data: { ...params } });
}

// 查询我的项目下的详情信息
export async function getProjectWorkbenchDetail(params) {
  return request('/ep/rest/project/workbench/getProjectWorkbenchDetail', { data: { ...params } });
}

// 查询我负责的项目的产品列表
export async function getMyOwnerProduct() {
  return request('/ep/rest/project/workbench/myOwnerProduct');
}

// 查询我参与的项目的产品列表
export async function getMyParticipateProduct() {
  return request('/ep/rest/project/workbench/myParticipatoryProduct');
}

// 查询我负责的项目的产品列表
export async function getMyCollectProduct() {
  return request('/ep/rest/project/collect/myCollectProject4Product');
}

// 工作台我发起的审批列表
export async function getMyCreateAuditList(params) {
  return request('/ep/rest/workflow/apply/myCreateAuditList', { data: { ...params } });
}

// 工作台我发起的审批项目列表
export async function getMyCreateAuditProjectList() {
  return request('/ep/rest/workflow/apply/myCreateAuditProjectList');
}

// 工作台提醒审批
export async function remindAudit(params) {
  return request('/ep/rest/workflow/apply/remindAudit', { data: { ...params }, method: 'POST' });
}

// 工作台待我审批的单据列表
export async function getMyWaitAuditList(params) {
  return request('/ep/rest/workflow/apply/myUnAuditList', { data: { ...params } });
}

// 工作台待我审批的单据项目下拉框列表
export async function getMyWaitAuditProjectList() {
  return request('/ep/rest/workflow/apply/myUnAuditProjectList');
}

// 工作台待我审批的单据个数
export async function getMyWaitAuditCount(params) {
  return request('/ep/rest/workflow/apply/myUnAuditCount');
}
