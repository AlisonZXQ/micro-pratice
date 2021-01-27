import request from '../utils/request';

/**
 * @desc 获取实时数据
 * @author zhangxueqing01
 * @method GET
 * @param {Object} params 
 */
export async function getLastDataObj(params) {
  return request('/rest/report/dashboard', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 获取指定子产品的过滤条件配置
 * @author zhangxueqing01
 * @method GET
 * @param {Object} params 
 */
export async function getDatafilter(params) {
  return request('/rest/report/datafilter/get', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 设置指定子产品的过滤条件配置
 * @author zhangxueqing01
 * @method POST
 * @param {Object} params 
 */
export async function saveDatafilter(params) {
  return request('/rest/report/datafilter/set', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取项目负责人列表
export async function getProjectOwnerList(params) {
  return request('/rest/report/datafilter/project/getOwnerList', { data: { ...params }, type: 'urlencoded' });
}

// 预览项目数据
export async function getProjectPreview(params) {
  return request('/rest/report/datafilter/project/preview', { data: { ...params }, type: 'urlencoded' });
}

// 预览版本数据
export async function getVersionPreview(params) {
  return request('/rest/report/datafilter/version/preview', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 生成报告快照
 * @author zhangxueqing01
 * @method POST
 * @param {Object} params 
 */
export async function saveReportSnapshot(params) {
  return request('/rest/report/snapshot/generate', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 分页获取报告快照列表
 * @author zhangxueqing01
 * @method GET
 * @param {Object} params 
 */
export async function getSnapshotByPage(params) {
  return request('/rest/report/snapshot/listByPage', { data: { ...params }, type: 'urlencoded' });
}

// 获取单个报告快照详情
export async function getSnapshotDetail(params) {
  return request('/rest/report/snapshot/get', { data: { ...params }, type: 'urlencoded' });
}

// 删除报告快照
export async function deleteSnapshot(params) {
  return request('/rest/report/snapshot/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取自动报告配置信息
export async function getSnapshotConfig(params) {
  return request('/rest/report/snapshot/generate/config/get', { data: { ...params }, type: 'urlencoded' });
}

// 设置自动报告配置信息
export async function setSnapshotConfig(params) {
  return request('/rest/report/snapshot/generate/config/set', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 报告下用户权限列表（搜索为前端匹配）
export async function getPermissionUserList(params) {
  return request('/rest/report/permission/user/list', { data: { ...params }, type: 'urlencoded' });
}

// 报告下用户组权限列表（搜索为前端匹配）
export async function getPermissionUserGroupList(params) {
  return request('/rest/report/permission/usergroup/list', { data: { ...params }, type: 'urlencoded' });
}

// 查找指定子产品下的用户组
export async function getUserGroupSearch(params) {
  return request('/rest/rbac/usergroup/searchOne', { data: { ...params }, type: 'urlencoded' });
}

// 搜索用户组（指定子产品的同企业下）
export async function getUserGroupSearchEnt(params) {
  return request('/rest/rbac/usergroup/searchEnt', { data: { ...params }, type: 'urlencoded' });
}

// 添加报告下的新用户权限
export async function addUser(params) {
  return request('/rest/report/permission/user/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 添加报告下的新用户组权限
export async function addUserGroup(params) {
  return request('/rest/report/permission/usergroup/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更改授权
export async function changeAuth(params) {
  return request('/rest/report/permission/changeauth', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 删除权限
export async function deleteAuth(params) {
  return request('/rest/report/permission/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取当前登录用户在指定子产品下的数据报表权限
export async function getUserReportPer(params) {
  return request('/rest/report/permission/check', { data: { ...params }, type: 'urlencoded' });
}

// 只调一次，为后台刷数据报表的权限用
export async function permissionTransfer(params) {
  return request('/rest/manage/report/permission/transfer');
}
