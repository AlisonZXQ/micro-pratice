import request from '../utils/request';

// 读取需求数据文件
export async function readRequirementFile(formData) {
  return request('/rest/batch/requirement/readFile', { data: formData, method: 'POST', type: 'upload' });
}

// 上传需求数据文件
export async function importRequirementFile(formData) {
  return request('/rest/batch/requirement/import', { data: formData, method: 'POST' });
}

//【新建】获取实时预估工时
export async function getEstimateHour(params) {
  return request(`/rest/uem/getEstimateHour`, { data: { ...params } });
}

// 校验设计师是否已加入设计管理平台
export async function getUserExist(params) {
  return request(`/rest/uem/userExist`, { data: { ...params } });
}

// 获取需求登记信息详情(by requirementid)
export async function getByRequirementid(params) {
  return request(`/rest/uem/getByRequirementid`, { data: { ...params }, type: 'urlencoded' });
}

// 创建需求登记信息详情(by requirementid)
export async function addUemRequirement(params) {
  return request(`/rest/uem/add`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新需求登记信息详情(by requirementid)
export async function updateUemRequirement(params) {
  return request(`/rest/uem/update`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取指定单据下的附件列表
export async function getReqAttachment(params) {
  return request(`/rest/attachment/listByConntypeAndConnid`, { data: { ...params }, type: 'urlencoded' });
}

// 保存渠道+尺寸配置信息
export async function setUemSize(params) {
  return request(`/rest/uem/size/set`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取已有渠道下尺寸配置列表（子产品级）
export async function getUemSize(params) {
  return request(`/rest/uem/size/listByProductid`, { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 获取当前登录用户为管理员用户的可用子产品列表
 * @method POST
 */
export async function managerProduct() {
  return request('/rest/product/my4productmanage', { data: {}, method: 'POST' });
}

/**
 * @desc 获取当前登录用户信息
 * @method POST
 */
export async function userInfo(params) {
  return request('/rest/user/get', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 根据id获取用户
 * @method POST
 */
export async function getUserList(params) {
  return request('/rest/user/getByIdList', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取当前子产品需求自定义信息
 * @method GET
 */
export async function getRequirementCustomList(params) {
  return request('/rest/product/customfield/listByProductidOfRequirement', { data: { ...params }, method: 'GET' });
}

/**
 * @desc 获取当前子产品需求自定义下拉信息
 * @method POST
 */
export async function getCustomFieldList(params) {
  return request('/rest/product/customfield/value/listByCustomFieldid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取当前子产品下版本列表
 * @method GET
 */
export async function getVersionList(params) {
  return request('/rest/product/version/listByPage', { data: { ...params } });
}

/**
 * @desc 获取当前子产品下版本列表
 * @method GET
 */
export async function getVersionListTotal(params) {
  return request('/rest/product/version/totalCount', { data: { ...params } });
}

// export async function getProductDetail(productid) {
//   return request('/rest/product/get', { data: { ...params }, type: 'urlencoded' });
// }

export async function getJiraList(params) {
  return request('/rest/jira/search', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

export async function uploadFile(formData) {
  return request(`/rest/upload`, { data: formData, method: 'POST', type: 'upload' });
}

// 获取需求详情
export async function getReqirementDetail(params) {
  return request(`/rest/requirement/get`, { data: { ...params }, type: 'urlencoded' });
}

// 全链路数据(需求，建议，任务，子任务)
export async function getFullLink(params) {
  return request(`/rest/fulllink`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

//设置需求的状态
export async function setRequirementState(params) {
  return request(`/rest/requirement/batchUpdateState`, { data: params, method: 'POST' });
}

// 需求下关联的建议
export async function getRelateadvise(params) {
  return request(`/rest/arrelation/listByRequirementid`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 解除建议和需求的关联
export async function deleteRelateadvise(params) {
  return request(`/rest/arrelation/delete`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 一级任务拆分
export async function getRelateTask(params) {
  return request(`/rest/requirement/fstlevel/listByRequirementid`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 解除子任务和需求的关联
export async function deleteRelateTask(params) {
  return request(`/rest/requirement/fstlevel/delete`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 根据不同单据类型和id获取关注人
export async function getSubscribeByType(params) {
  return request(`/rest/subscribe/listByConntypeAndConnid`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 根据不同单据类型和id添加关注人
export async function addSubscribeByType(params) {
  return request(`/rest/subscribe/add`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 根据不同单据类型和id添加自己关注
export async function addSubscribeSelfByType(params){
  return request(`/rest/subscribe/add4myself`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 删除关注人
export async function deleteSubscribeByType(params) {
  return request(`/rest/subscribe/delete`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

//获取关注人总数
export async function getSubscribeNum(params) {
  return request(`/rest/subscribe/getNum`, { data: { ...params } });
}

// 搜索标签
export async function queryTag(params) {
  return request(`/rest/tag/search`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 添加标签
export async function addTag(params) {
  return request(`/rest/tag/add`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 删除标签
export async function deleteTag(params) {
  return request(`/rest/tag/relation/delete`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取标签
export async function getTag(params) {
  return request(`/rest/tag/relation/listByConntypeAndConnid`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 单据添加备注--jira
export async function addCommentJIRA(params) {
  return request(`/rest/jira/addComment`, { data: { ...params }, type: 'urlencoded' });
}

// 单据获取备注--jira
export async function getCommentJIRA(params) {
  return request(`/rest/jira/getComments`, { data: { ...params }, type: 'urlencoded' });
}

// 单据添加备注--ep
export async function addCommentEP(params) {
  return request(`/rest/comment/add`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 单据获取备注--ep
export async function getCommentEP(params) {
  return request(`/rest/comment/listByConntypeAndConnid`, { data: { ...params }, type: 'urlencoded' });
}

// 获取需求历史
export async function getReqHistory(params) {
  return request(`/rest/requirement/history/list`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 查看状态变迁历史
export async function getReqStateHistory(params) {
  return request(`/rest/statetimestamp/history/listByConntypeAndConnid`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 关联建议获取建议总数
export async function getRelateAdviseTotal(params) {
  return request(`/rest/advise/product/totalCount`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 关联建议分页获取建议列表
export async function getRelateAdviseByPage(params) {
  return request(`/rest/advise/product/listByPage`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 需求下批量关联建议 建议下关联需求
export async function batchAddAdvise(params) {
  return request(`/rest/arrelation/batchAdd`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 需求下关联目标
export async function updateEpic(params) {
  return request(`/rest/requirement/updateEpic`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取需求数据总个数
 * @method POST
 */
export async function getTotalCount(params) {
  return request('/rest/requirement/product/totalCount', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取需求数据
 * @method POST
 */
export async function getRequirementList(params) {
  return request('/rest/requirement/product/listByPage', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 删除需求数据
 * @method POST
 */
export async function deleteRequireItem(params) {
  return request('/rest/requirement/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新单据统一接口
export async function updateIssueByType(params) {
  return request('/ep/rest/issue/update', { data: { ...params }, method: 'PUT' });
}

// 创建完设计任务后通知uem那边
export async function uemDemandNotify(params) {
  return request('/rest/uem/demandNotify', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 更新需求数据
 * @method POST
 */
export async function updateRequirement(params) {
  return request('/rest/requirement/update', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新验证人
export async function updateRequireemail(params) {
  return request('/rest/requirement/updateRequireemail', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新模块
export async function updateModuleid(params) {
  return request('/rest/requirement/updateModuleid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新描述
export async function updateDescription(params) {
  return request('/rest/requirement/updateDescription', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新版本
export async function updateFixversionid(params) {
  return request('/rest/requirement/updateFixversionid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 更新附件
export async function updateAttachment(params) {
  return request('/rest/attachment/add', { data: params, method: 'POST' });
}

// 更新自定义字段
export async function updateRequirementCustom(params) {
  return request('/rest/rcfr/update', { data: { ...params }, method: 'POST' });
}

// 删除自定义字段
export async function deleteRequirementCustom(params) {
  return request('/rest/rcfr/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}


