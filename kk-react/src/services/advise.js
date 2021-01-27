import request from '../utils/request';

/**
 * @desc 读取建议数据文件
 * @method POST
 */
export async function readAdviseFile(formData) {
  return request('/rest/batch/advise/readFile', { data: formData, method: 'POST', type: 'upload' });
}

// 上传建议数据文件
export async function importAdviseFile(formData) {
  return request('/rest/batch/advise/import', { data: formData, method: 'POST' });
}

/**
 * @desc 获取建议数据总个数
 * @method POST
 */
export async function getTotalCount(params) {
  return request('/rest/advise/product/totalCount', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取建议数据
 * @method POST
 */
export async function getadviseList(params) {
  return request('/rest/advise/product/listByPage', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 删除建议数据
 * @method POST
 */
export async function deleteAdviseItem(params) {
  return request('/rest/advise/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}


/**
 * @desc 删除建议数据(工作台差异处理)
 * @method POST
 */
export async function deleteAdviseItem4Workbench(params) {
  return request('/rest/advise/delete4Workbench', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 修改建议状态
 * @method POST
 */
export async function updateAdviseState(params) {
  return request('/rest/advise/updateState', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 修改建议状态(工作台差异处理)
 * @method POST
 */
export async function updateAdviseState4Workbench(params) {
  return request('/rest/advise/updateState4Workbench', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}


//获取建议自定义数据
export async function getCustomadvise(params) {
  return request('/rest/product/customfield/value/listByCustomFieldid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取建议详情信息
export async function getAdviseDetail(params) {
  return request('/rest/advise/get', { data: { ...params }, type: 'urlencoded' });
}

// 查询关联需求总数来源ep
export async function getRequirementTotal(params) {
  return request('/rest/requirement/product/totalCount', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 分页查询关联需求来源ep
export async function getRequirementByPage(params) {
  return request('/rest/requirement/product/listByPage', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取当前子产品建议自定义信息
 * @method GET
 */
export async function getAdviseCustomList(params) {
  return request('/rest/product/customfield/listByProductidOfAdvise', { data: { ...params }, method: 'GET' });
}

/**
 * @desc 获取建议的过滤器列表
 * @method POST
 */
export async function getFilterList(params) {
  return request('/rest/filter/listByProductidAndType', { data: { ...params }, method: 'GET' });
}

/**
 * @desc 更新建议的状态
 * @method POST
 */
export async function updateStateAdvise(params) {
  return request('/rest/advise/updateState', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 更新建议的受理状态
 * @method POST
 */
export async function updateAcceptStateAdvise(params) {
  return request('/rest/advise/updateAcceptStatus', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 建议下的关联需求列表
 * @method POST
 */
export async function getRelateRequirement(params) {
  return request('/rest/arrelation/listByAdviseid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/*
 * @desc 获取当前过滤器状况
 * @method GET
 */

export async function filterConditionList(params) {
  return request('/rest/filter/get', { data: { ...params }, method: 'GET' });
}

/**
 * @desc 删除过滤器
 * @method GET
 */
export async function filterDelete(params) {
  return request('/rest/filter/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 添加过滤器
 * @method GET
 */
export async function filterAdd(params) {
  return request('/rest/filter/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取建议历史
 * @method GET
 */
export async function getAdviseHistory(params) {
  return request('/rest/advise/history/list', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/*
 * @desc 更新过滤器
 * @method GET
 */
export async function filterUpdate(params) {
  return request('/rest/filter/update', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 更新建议一般数据
 * @method POST
 */
export async function updateAdvise(params) {
  return request('/rest/advise/update', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新模块
export async function updateModuleid(params) {
  return request('/rest/advise/updateModuleid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新验证人
export async function updateRequireemail(params) {
  return request('/rest/advise/updateRequireemail', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新描述
export async function updateDescription(params) {
  return request('/rest/advise/updateDescription', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新自定义字段
export async function updateAdviseCustom(params) {
  return request('/rest/acfr/update', { data: { ...params }, method: 'POST' });
}

// 删除自定义字段
export async function deleteAdviseCustom(params) {
  return request('/rest/acfr/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

//设置建议的状态
export async function setAdviseState(params) {
  return request(`/rest/advise/batchUpdateState`, { data: params, method: 'POST' });
}

// 工作台提醒用户
export async function noticeAdvise(id) {
  return request(`/rest/advise/remindState/${id}`, { method: 'POST' });
}
