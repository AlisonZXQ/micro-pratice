import request from '../utils/request';

/**
 * @desc 读取工单数据文件
 * @method POST
 */
export async function readTicketFile(formData) {
  return request('/rest/batch/ticket/readFile', { data: formData, method: 'POST', type: 'upload' });
}

// 上传工单数据文件
export async function importTicketFile(formData) {
  return request('/rest/batch/ticket/import', { data: formData, method: 'POST' });
}

/**
 * @desc 获取工单数据总个数
 * @method POST
 */
export async function getTotalCount(params) {
  return request('/rest/ticket/product/totalCount', { data: { ...params } });
}

/**
 * @desc 获取工单数据
 * @method POST
 */
export async function getTicketList(params) {
  return request('/rest/ticket/product/listByPage', { data: { ...params } });
}

// 获取工单详情信息
export async function getTicketDetail(params) {
  return request('/rest/ticket/get', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 获取工单历史
 * @method GET
 */
export async function getTicketHistory(params) {
  return request('/rest/ticket/history/list', { data: { ...params } });
}

/**
 * @desc 删除建议数据
 * @method POST
 */
export async function deleteTicketItem(params) {
  return request('/rest/ticket/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 更新工单一般数据
 * @method PUT
 */
export async function updateTicket(params) {
  return request('/rest/ticket/update', { data: { ...params }, method: 'PUT' });
}

/**
 * @desc 修改状态
 * @method POST
 */
export async function updateTicketState(params) {
  return request('/rest/ticket/updateState', { data: { ...params }, method: 'PUT' });
}

// 更新模块
export async function updateModuleid(params) {
  return request('/rest/ticket/updateModuleid', { data: { ...params }, method: 'PUT' });
}

// 更新验证人
export async function updateRequireemail(params) {
  return request('/rest/ticket/updateRequireemail', { data: { ...params }, method: 'PUT' });
}

// 更新自定义字段
export async function updateTicketCustom(params) {
  return request('/rest/ticfr/update', { data: { ...params }, method: 'PUT' });
}

// 删除自定义字段
export async function deleteTicketCustom(params) {
  return request('/rest/ticfr/delete', { data: { ...params }, method: 'DELETE' });
}

// // 获取自定义字段
// export async function getTicketCustom(params) {
//   return request('/rest/ticfr/listByTicketId', { data: { ...params }, method: 'GET' });
// }

/**
 * @desc 获取当前子产品建议自定义信息
 * @method GET
 */
export async function getTicketCustomList(params) {
  return request('/rest/product/customfield/listByProductidOfTicket', { data: { ...params }, method: 'GET' });
}

//设置工单的状态
export async function setTicketState(params) {
  return request(`/rest/ticket/batchUpdateState`, { data: params, method: 'PUT' });
}

// 工作台提醒用户
export async function noticeTicket(id) {
  return request(`/rest/ticket/remindState/${id}`, { method: 'POST' });
}

/**
 * @desc 删除工单数据(工作台差异处理)
 * @method POST
 */
export async function deleteTicketItem4Workbench(params) {
  return request('/rest/ticket/delete4Workbench', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 修改工单状态(工作台差异处理)
 * @method POST
 */
export async function updateTicketState4Workbench(params) {
  return request('/rest/ticket/updateState4Workbench', { data: { ...params }, method: 'PUT' });
}
