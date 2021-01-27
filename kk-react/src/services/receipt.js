import request from '../utils/request';

// 获取链路单据
export async function getRelationLink(params) {
  return request(`/rest/issue/relation/link`, { data: { ...params } });
}

// 删除备注
export async function deleteComment(params) {
  return request(`/rest/comment/delete`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 解绑单据关系
export async function deleteIssueRelationId(id) {
  return request(`/rest/issue/relation/delete/${id}`, { method: 'POST' });
}

// 获取单据的需求全链路关系图数据
export async function getFullLink(params) {
  return request(`/rest/issue/relation/fullLink`, { data: { ...params } });
}

// 单据下关联关系创建
export async function create4RelationIssue(params) {
  return request(`/ep/rest/issue/create4Relation`, { data: { ...params }, method: 'POST' });
}

// 独立单据获取
export async function getAloneIssue(params) {
  return request(`/ep/rest/issue/listWithoutBinding`, { data: { ...params } });
}

// 单据关联
export async function issueRelationAdd(params) {
  return request(`/rest/issue/relation/add`, { data: { ...params }, method: 'POST' });
}

// 获取标签下指定类型的资源分页列表
export async function getIssueTagList(params) {
  return request(`/rest/tag/relation/listByConntypeAndConnid`, { data: { ...params }, type: 'urlencoded' });
}

// 添加标签
export async function createIssueTag(params) {
  return request(`/rest/tag/relation/add`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 删除标签
export async function removeIssueTag(params) {
  return request(`/rest/tag/relation/delete`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取产品级被引用人员历史列表（全量）
export async function getUserHistory(params) {
  return request(`/rest/product/userhistory/listByProductid`, { data: { ...params }, type: 'urlencoded' });
}

// 删除附件
export async function deleteAttachment(params) {
  return request(`/rest/attachment/delete`, { data: { ...params }, type: 'urlencoded' });
}

// 获取附件数量
export async function getAttachmentCount(params) {
  return request(`/rest/attachment/count`, { data: { ...params }, type: 'urlencoded' });
}

// 删除jira备注
export async function deleteJiraComment(params) {
  return request(`/rest/jira/deleteComment`, { data: { ...params }, type: 'urlencoded' });
}

// 编辑ep备注
export async function updateEpComment(params) {
  return request(`/rest/comment/update`, { data: { ...params }, type: 'urlencoded' });
}

// 编辑jira备注
export async function updateJiraComment(params) {
  return request(`/rest/jira/updateComment`, { data: { ...params }, type: 'urlencoded' });
}

// 模糊查询cloudcc数据
export async function queryCloudCC(params) {
  return request(`/rest/cloudcc/query`, { data: { ...params }, method: 'GET', type: 'urlencoded' });
}

// 添加clodcc字段
export async function addCloudCC(params) {
  return request(`/rest/product/customfield/value/add`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 批量添加clodcc字段
export async function batchAddCloudCC(params) {
  return request(`/rest/product/customfield/value/batchAdd`, { data: { ...params }, method: 'POST'});
}

// 下载附件
export async function downloadAttachment(url) {
  return request(`rest/download/attachment?url=${encodeURI(url)}`, { raw: true, responseType: 'blob' });
}

// 获取单据模块数据
export async function getModuleList(params) {
  return request('/rest/product/module/list', { data: { ...params }, method: 'GET' });
}

/**
 * @desc 所有的单据创建
 * @method POST
 */
export async function createBill(params) {
  return request('/ep/rest/issue/create', { data: { ...params }, method: 'POST', });
}

// 批量更新
export async function batchUpdateIssue(params) {
  return request('/ep/rest/issue/batchUpdate', { data: { ...params }, method: 'POST', });
}

//最近上传d-box文件
export async function recentUpload() {
  return request('/rest/dbox/recentUpload', { method: 'GET' });
}

//获取个人所属项目
export async function ownProject() {
  return request('/rest/dbox/ownProject', { method: 'GET' });
}

//获取个人项目的模块
export async function ownProjectModule(pid) {
  return request(`/rest/dbox/module/${pid}`, { method: 'GET' });
}

//获取项目列表
export async function fileByProject(params) {
  return request(`/rest/dbox/fileByProject`, { data: { ...params }, method: 'GET' });
}

//获取个人所属团队
export async function ownTeam() {
  return request('/rest/dbox/ownTeam', { method: 'GET' });
}

//获取团队列表
export async function fileByTeam(params) {
  return request(`/rest/dbox/fileByTeam`, { data: { ...params }, method: 'GET' });
}

//设置备注状态为已读
export async function setCommentState(params) {
  return request(`/rest/receipt/setCommentNotification2Read`, { data: { ...params }, method: 'POST' });
}
