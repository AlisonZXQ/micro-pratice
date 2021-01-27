import request from '../utils/request';

/**
 * @desc 获取当前产品下某一单据类型的状态同步关系JIRA->EP
 */
export async function getJiraToEp(params) {
  return request('/rest/product/mergestatus/listByProductidAndIssueType', { data: { ...params } });
}

/**
 * @desc 获取当前产品下某一单据类型的状态同步关系EP->JIRA
 */
export async function getEpToJira(params) {
  return request('/rest/product/mergestatus/reverse/listByProductidAndIssueType', { data: { ...params } });
}

/**
 * @desc 获取Jira所有类型单据的状态集合
 */
export async function getAllJiraStatus(params) {
  return request('/rest/jira/getAllStatuses', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 更新jiraToEp的状态映射
 * @method POST
 */
export async function updateStatusJiraToEp(params) {
  return request('/rest/product/mergestatus/add', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 更新EpToJira的状态映射
 * @method POST
 */
export async function updateStatusEpToJira(params) {
  return request('/rest/product/mergestatus/reverse/add', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 删除jiraToEp的状态映射
 * @method POST
 */
export async function deleteStatusJiraToEp(params) {
  return request('/rest/product/mergestatus/deleteByProductidAndIssueType', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 删除EpToJira的状态映射
 * @method POST
 */
export async function deleteStatusEpToJira(params) {
  return request('/rest/product/mergestatus/reverse/deleteByProductidAndIssueType', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 更新单个状态jiraToEp
 * @method POST
 */
export async function updateSingleStatusJiraToEp(params) {
  return request('/rest/product/mergestatus/update', { data: { ...params }, method: 'PUT' });
}

/**
 * @desc 更新单个状态EpToJira
 * @method POST
 */
export async function updateSingleStatusEpToJira(params) {
  return request('/rest/product/mergestatus/reverse/update', { data: { ...params }, method: 'PUT' });
}

/**
 * @desc 获取基本信息
 * @method GET
 */
export async function getBaseInfo(params) {
  return request(`/rest/product/${params.id}`, { method: 'GET' });
}

/**
 * @desc 更新基本信息
 * @method POST
 */
export async function updateBaseInfo(params) {
  return request('/rest/product/update', { data: { ...params }, method: 'PUT' });
}

// // 获取 子产品 下的模块 根据subProductId查询
// export async function getModuleListById(params) {
//   return request('/rest/product/module/listBySubProductid', { data: { ...params } });
// }

// 待子产品上线后端合并后改为上面的接口
export async function getModuleListById(params) {
  return request('/rest/product/module/listBySubProductid', { data: { ...params } });
}

// 根据模块id获取模块的信息
export async function getModuleDetailById(params) {
  return request('/rest/product/module/get', { data: { ...params } });
}

// 根据模块id删除模块
export async function deleteModuleById(id) {
  return request(`/rest/product/module/delete/${id}`, { method: 'POST' });
}

// 获取jira上的全部模块
export async function getModuleFromJira(params) {
  return request('/rest/jira/getComponents', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 创建jira模块
export async function addModuleJira(params) {
  return request('/rest/jira/createComponent', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 添加模块（需要先创建jira模块）
export async function addModuleEP(params) {
  return request('/rest/product/module/add', { data: { ...params }, method: 'POST' });
}

// 更新模块
export async function updateModuleEP(params) {
  return request('/rest/product/module/update', { data: { ...params }, method: 'PUT' });
}

// 获取jira上的全部版本
export async function getVersionFromJira(params) {
  return request('/rest/product/version/listJiraVersion', { data: { ...params } });
}

// 创建jira版本
export async function addVersionJira(params) {
  return request('/rest/product/version/batchAdd', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 获取自定义字段值
 * @method POST
 */
export async function getCustomData(params) {
  return request('/rest/product/customfield/listByProductid', { data: { ...params }, method: 'GET' });
}

/**
 * @desc 获取单条自定义字段
 * @method POST
 */
export async function getCustomItem(params) {
  return request('/rest/product/customfield/get', { data: { ...params }, method: 'GET' });
}

// 获取值设置的列表
export async function getCustomDefault(id) {
  return request(`/rest/product/customfield/value/${id}`);
}

// 设置字段默认值
export async function setCustomDefault(params) {
  return request(`/rest/product/customfield/value/default`, { data: { ...params }, method: 'POST' });
}

// 配置自定义字段属性
export async function setCustomValue(params) {
  return request('/rest/product/customfield/value', { data: { ...params }, method: 'POST' });
}

// 拖拽排序
export async function updateSortValue(params) {
  return request(`/rest/product/customfield/sortvalue`, { data: params, method: 'PUT' });
}

// 更新自定义字段是否使用
export async function updateCustomState(params) {
  return request(`/rest/product/customfield/state`, { data: { ...params }, method: 'PUT' });
}

// 更新自定义字段是否必填
export async function updateCustomRequired(params) {
  return request(`/rest/product/customfield/required`, { data: { ...params }, method: 'PUT' });
}

// 更新自定义字段
export async function updateCustomManage(params) {
  return request('/rest/product/customfield/update', { data: { ...params }, method: 'PUT' });
}

/**
 * @desc 添加自定义字段值
 * @method POST
 */
export async function addCustomField(params) {
  return request('/rest/product/customfield/add', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 更新自定义字段值
 * @method POST
 */
export async function updateCustomField(params) {
  return request('/rest/product/customfield/update', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 移除自定义字段值
 * @method POST
 */
export async function deleteCustomField(params) {
  return request('/rest/product/customfield/delete', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 迁移自定义字段值
 * @method POST
 */
export async function moveCustomField(params) {
  return request('/rest/product/customfield/move', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 获取自定义字段的值
 * @method POST
 */
export async function getValue(params) {
  return request('/rest/product/customfield/value/listByCustomFieldid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 设置自定义字段的值
 * @method POST
 */
export async function setValue(params) {
  return request('/rest/product/customfield/value/set', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取现有全部拆单方案
 * @method POST
 */
export async function getDismantleData(params) {
  return request('/rest/product/dismantle/listByProductid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取拆单方案列表
 * @method POST
 */
export async function getConfigList(params) {
  return request('/rest/product/dismantle/config/listByDismantleid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 更新方案名称
 * @method POST
 */
export async function updateDismantle(params) {
  return request('/rest/product/dismantle/update', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 创建方案
 * @method POST
 */
export async function addDismantle(params) {
  return request('/rest/product/dismantle/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 删除方案
 * @method POST
 */
export async function deleteDismantle(params) {
  return request('/rest/product/dismantle/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 添加方案配置
 * @method POST
 */
export async function addConfigDis(params) {
  return request('/rest/product/dismantle/config/add', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 删除方案配置
 * @method POST
 */
export async function deleteConfigDis(params) {
  return request(`/rest/product/dismantle/config/delete/${params.id}`, { method: 'POST' });
}

/**
 * @desc 更新方案配置
 * @method PUT
 */
export async function updateConfigDis(params) {
  return request(`/rest/product/dismantle/config/update`, { data: { ...params }, method: 'PUT' });
}

/**
 * @desc 清空方案配置
 * @method POST
 */
export async function emptyConfigDis(params) {
  return request('/rest/product/dismantle/config/deleteByDismantleid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}


//通知配置
/**
 * @desc 获取未受理建议通知人员
 * @method POST
 */
export async function notificationUserList(params) {
  return request('/rest/notification/userlist/listByProductidAndAffect', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 删除未受理建议通知人员
 * @method POST
 */
export async function deleteNotificationUser(params) {
  return request('/rest/notification/userlist/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 添加未受理建议通知人员
 * @method POST
 */
export async function addNotificationUser(params) {
  return request('/rest/notification/userlist/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取cloudcc数据
 * @method POST
 */
export async function getCloudccData(params) {
  return request('/rest/cloudcc/get', { data: { ...params }, method: 'GET', type: 'urlencoded' });
}

/**
 * @desc 更改cloudcc数据
 * @method POST
 */
export async function updateCloudcc(params) {
  return request('/rest/cloudcc/update', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}


/**
 * @desc 创建cloudcc配置数据
 * @method POST
 */
export async function addCloudcc(params) {
  return request('/rest/cloudcc/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取模板列表
 * @method GET
 */
export async function getTemplateList(params) {
  return request('/rest/project/template/listByProductid', { data: { ...params } });
}

/**
 * @desc 编辑模板名称
 * @method PUT
 */
export async function updateTemplate(params) {
  return request('/rest/project/template/update', { data: { ...params }, method: 'PUT' });
}

/**
 * @desc 新增模板
 * @method POST
 */
export async function addTemplate(params) {
  return request('/rest/project/template/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 删除模板
 * @method POST
 */
export async function deleteTemplate(params) {
  return request('/rest/project/template/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 设为默认
 * @method POST
 */
export async function setDefault(params) {
  return request('/rest/project/template/setDefault', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 获取自定义字段关联关系
 * @method GET
 */
export async function customRelation(params) {
  return request('/rest/project/template/tcrelation/listByTemplateidAndType', { data: { ...params }, method: 'GET' });
}

/**
 * @desc 获取模板自定义字段列表
 * @method POST
 */
export async function getConfigCustomList(params) {
  return request('/rest/project/template/customfield/listByProductid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 新增模板自定义字段
 * @method POST
 */
export async function addTemplateCustom(params) {
  return request('/rest/project/template/customfield/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 删除模板自定义字段
 * @method POST
 */
export async function deleteTemplateCustom(params) {
  return request('/rest/project/template/customfield/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 更新模板自定义字段
 * @method POST
 */
export async function updateTemplateCustom(params) {
  return request('/rest/project/template/customfield/update', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取单条模板自定义字段
 * @method POST
 */
export async function getTemplateCustomItem(params) {
  return request('/rest/project/template/customfield/get', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取单条模板自定义值
 * @method POST
 */
export async function getTemplateValue(params) {
  return request('/rest/project/template/customfield/value/listByCustomFieldid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 设置单条模板自定义值
 * @method POST
 */
export async function setTemplateValue(params) {
  return request('/rest/project/template/customfield/value/set', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 设置模板配置自定义字段和审批流
 * @method POST
 */
export async function setConfigTemplate(params) {
  return request('/rest/project/template/settings', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 模板配置审批流规则的值获取
 * @method GET
 */
export async function getFlowRule(params) {
  return request('/rest/project/template/workflowRefList', { data: { ...params } });
}

/**
 * @desc 获取通知预警配置的通知方式
 * @method POST
 */
export async function getNoticeType(params) {
  return request('/rest/event/type/listByProductid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取通知预警配置的通知对象
 * @method POST
 */
export async function getNoticeReceiver(params) {
  return request('/rest/event/receiver/listByProductid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 删除通知对象
 * @method POST
 */
export async function deleteNoticeUser(params) {
  return request('/rest/event/receiver/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 添加通知对象
 * @method POST
 */
export async function addNoticeUser(params) {
  return request('/rest/event/receiver/user/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 设置通知方式
 * @method POST
 */
export async function setNoticeType(params) {
  return request('/rest/event/type/reset', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 添加通知人员
 * @method POST
 */
export async function addNoticeType(params) {
  return request('/rest/event/receiver/user/flag/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 查询子产品列表
export async function getSubproductByPage(params) {
  return request('/rest/subProduct/listByPage', { data: { ...params } });
}

// 添加子产品
export async function addSubproduct(params) {
  return request('/rest/subProduct/add', { data: { ...params }, method: 'POST' });
}

// 更新子产品
export async function updateSubproduct(params) {
  return request('/rest/subProduct/update', { data: { ...params }, method: 'PUT' });
}

// 删除子产品
export async function deleteSubproduct(params) {
  return request('/rest/subProduct/delete', { data: { ...params }, method: 'POST' });
}

// 获取子产品信息
export async function getSubproductDetail(id) {
  return request(`/rest/subProduct/${id}`);
}

// /**
//  * @desc 获取预警配置数据
//  * @method POST
//  */
// export async function getWarningConfig(params) {
//   return request('/rest/config/listByProductid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
// }

/**
 * @desc 获取预警配置数据
 * @method  GET
 */
export async function getWarningConfig(params) {
  return request(`/rest/config/getAlertInfor/${params.productid}`, { method: 'GET' });
}

// /**
//  * @desc 保存预警配置数据
//  * @method POST
//  */
// export async function saveWarningConfig(params) {
//   return request('/rest/config/set', { data: { ...params }, method: 'POST', type: 'urlencoded' });
// }

/**
 * @desc 保存预警配置数据
 * @method PUT
 */
export async function saveWarningConfig(params) {
  return request('/rest/config/updateAlertInfor', { data: { ...params }, method: 'PUT' });
}

// 新增用户组
export async function addUserGroup(params) {
  return request('/rest/product/usergroup/add', { data: { ...params }, method: 'POST' });
}

// 编辑用户组
export async function editUserGroup(params) {
  return request('/rest/product/usergroup/update', { data: { ...params }, method: 'PUT' });
}

// 查询产品下的所有用户组
export async function getUserGroupByProductId(params) {
  return request('/rest/product/usergroup/listByProductId', { data: { ...params } });
}

// 根据id查询用户组详情
export async function getUserGroupDetail(id) {
  return request(`/rest/product/usergroup/${id}`);
}

// 编辑用户组名称
export async function updateUserGroup(params) {
  return request(`/rest/product/usergroup/update`, { data: { ...params }, method: 'PUT' });
}

// 删除用户组权限
export async function deleteGroupPermission(params) {
  return request(`/rest/product/usergroup/deletePermission`, { data: { ...params }, method: 'POST' });
}

// 新增用户组权限
export async function addGroupPermission(params) {
  return request(`/rest/product/usergroup/addPermission`, { data: { ...params }, method: 'POST' });
}

// 根据用户组id删除用户组
export async function deleteUserGroup(id) {
  return request(`/rest/product/usergroup/delete/${id}`, { method: 'POST' });
}

// 获取产品下的所有岗位
export async function getProductRole(params) {
  return request(`/rest/product/role/listByProductId`, { data: { ...params } });
}

// 新增产品岗位名称
export async function addProductRole(params) {
  return request(`/rest/product/role/add`, { data: { ...params }, method: 'POST' });
}

// 更改产品岗位名称
export async function updateProductRole(params) {
  return request(`/rest/product/role/update`, { data: { ...params }, method: 'PUT' });
}

// 删除产品下岗位
export async function deleteProductRole(params) {
  return request(`/rest/product/role/delete`, { data: { ...params }, method: 'DELETE' });
}

// 查询产品下所有用户列表
export async function getUserObjByPage(params) {
  return request(`/rest/product/user/list`, { data: { ...params } });
}

// 产品下添加用户
export async function addProductUser(params) {
  return request(`/rest/product/user/addWithRoleAndUserGroup`, { data: { ...params }, method: 'POST' });
}

// 产品下编辑用户
export async function updateProductUser(params) {
  return request(`/rest/product/user/updateWithRoleAndUserGroup`, { data: { ...params }, method: 'PUT' });
}

// 获取用户详情
export async function getUserDetail(id) {
  return request(`/rest/product/user/${id}`);
}

// 删除产品下用户
export async function deleteProductUser(id) {
  return request(`/rest/product/user/delete/${id}`, { method: 'POST' });
}

// 新增通知用户组
export async function addNoticeUserGroup(params) {
  return request('/rest/event/receiver/usergroup/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取标签列表
export async function getTagList(params) {
  return request('/rest/tag/listByPage', { data: { ...params } });
}

// 获取全量标签列表
export async function getAllTagList(params) {
  return request('/rest/tag/listByProductid', { data: { ...params } });
}

// 删除标签
export async function deleteTag(params) {
  return request(`/rest/tag/delete`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 新增标签
export async function addTag(params) {
  return request(`/rest/tag/add`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 修改标签
export async function updateTag(params) {
  return request(`/rest/tag/update`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取当前产品的版本列表
 * @method POST
 */
export async function getProductVersionList() {
  return request('/rest/product/version/myVersionList', { method: 'POST' });
}

// 停用or启用子产品
export async function handleEnableOrUnable(params) {
  return request('/rest/subProduct/enable', { data: { ...params }, method: 'PUT' });
}
