import request from '../utils/request';

// 读取任务数据文件
export async function readTaskFile(formData) {
  return request('/rest/batch/task/readFile', { data: formData, method: 'POST', type: 'upload' });
}

// 上传任务数据文件
export async function importTaskFile(formData) {
  return request('/rest/batch/task/import', { data: formData, method: 'POST' });
}

/**
 * @desc 获取当前子产品任务自定义信息
 * @method GET
 */
export async function getTaskCustomList(params) {
  return request('/rest/product/customfield/listByProductidOfTask', { data: { ...params }, method: 'GET' });
}

/**
 * @desc 获取当前子产品子任务自定义信息
 * @method GET
 */
export async function getSubTaskCustomList(params) {
  return request('/rest/product/customfield/listByProductidOfSubTask', { data: { ...params }, method: 'GET' });
}

// 获取任务详情信息
export async function getTaskDetail(params) {
  return request('/rest/task/get', { data: { ...params }, type: 'urlencoded' });
}

// 获取任务详情信息(无权限校验)
export async function getTaskDetailWithoutRole(params) {
  return request('/rest/task/getWithoutRole', { data: { ...params }, type: 'urlencoded' });
}

// 更新任务子任务的状态
export async function updateTaskState(params) {
  return request('/rest/task/batchUpdateState', { data: params, method: 'POST' });
}

// 任务更新目标
export async function updateEpicTask(params) {
  return request('/rest/task/updateEpic', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 任务下关联的需求列表
export async function getRelateReq(params) {
  return request('/rest/requirement/fstlevel/listByTypeAndJiraid4fst', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 任务下重新关联需求
export async function batchRelateRequirement(params) {
  return request('/rest/requirement/fstlevel/batchAddByTaskid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取任务下的子任务列表
export async function getSubtaskList(params) {
  return request('/rest/task/listByParentid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取任务历史
export async function getTaskHistory(params) {
  return request('/rest/task/history/list', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取任务数据总个数
 * @method POST
 */
export async function getTotalCount(params) {
  return request('/rest/task/product/totalCount', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取任务数据
 * @method POST
 */
export async function getTaskList(params) {
  return request('/rest/task/product/listByPage', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取子任务数据
 * @method POST
 */
export async function childTaskList(params) {
  return request('/rest/task/listByParentid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 删除任务数据
 * @method POST
 */
export async function deleteTaskItem(params) {
  return request('/rest/task/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 更新任务数据
 * @method POST
 */
export async function updateTask(params) {
  return request('/rest/task/update', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新模块
export async function updateModuleid(params) {
  return request('/rest/task/updateModuleid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新验证人
export async function updateRequireemail(params) {
  return request('/rest/task/updateRequireemail', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新描述
export async function updateDescription(params) {
  return request('/rest/task/updateDescription', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新预估工作量
export async function updateEstimateCost(params) {
  return request('/rest/task/updateEstimateCost', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新版本
export async function updateFixversionid(params) {
  return request('/rest/task/updateFixversionid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新自定义字段
export async function updateTaskCustom(params) {
  return request('/rest/tcfr/update', { data: { ...params }, method: 'POST' });
}

// 删除自定义字段
export async function deleteTaskCustom(params) {
  return request('/rest/tcfr/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}
