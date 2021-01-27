import request from '../utils/request';

/**
 * @desc 创建产品
 * @method POST
 */
export async function addProduct(params) {
  return request('/rest/product/add', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 更新产品
 * @method POST
 */
export async function updateProduct(params) {
  return request('/rest/product/update', { data: { ...params }, method: 'PUT' });
}

/**
 * @desc 查询产品详情
 * @method GET
 */
export async function getProductDetail(id) {
  return request(`/rest/product/${id}`);
}

/**
 * @desc 删除产品
 * @method GET
 */
export async function deleteProduct(id) {
  return request(`/rest/product/delete/${id}`, { method: 'DELETE' });
}

/**
 * @desc 根据条件查询产品列表
 * @method GET
 */
export async function getProductListObj(params) {
  return request('/rest/product/listByPage', { data: { ...params } });
}

/**
 * @desc 添加管理员
 * @method POST
 */
export async function addAdmin(params) {
  return request('/rest/admin/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 删除管理员
 * @method POST
 */
export async function dltAdmin(params) {
  return request('/rest/admin/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取管理员列表
 * @method POST
 */
export async function getAdminList(params) {
  return request('/rest/admin/listAll', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取部门列表
 * @method POST
 */
export async function getDepartmentList(params) {
  return request('/rest/department/listByPage', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取企业列表
 * @method POST
 */
export async function getEntlist() {
  return request('/rest/enterprise/listAll', { method: 'POST' });
}

/**
 * @desc 添加部门
 * @method POST
 */
export async function addDepartment(params) {
  return request('/rest/department/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 修改部门
 * @method POST
 */
export async function editDepartment(params) {
  return request('/rest/department/update', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 删除部门
 * @method POST
 */
export async function dltDepartment(params) {
  return request('/rest/department/delete', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取企业总数
 * @method POST
 */
export async function getEntCount() {
  return request('/rest/enterprise/totalCount', { method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取企业列表
 * @method POST
 */
export async function getEnterpriseList(params) {
  return request('/rest/enterprise/listByPage', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 添加企业
 * @method POST
 */
export async function addEnterprise(params) {
  return request('/rest/enterprise/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 修改企业
 * @method POST
 */
export async function editEnterprise(params) {
  return request('/rest/enterprise/update', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取企业下产品
 * @method POST
 */
export async function getEntProduct(params) {
  return request('/rest/product/listByEntid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取用户列表
 * @method GET
 */
export async function getUserList(params) {
  return request('/rest/user/list4Admin', { data: { ...params } });
}

/**
 * @desc 删除用户
 * @method POST
 */
export async function deleteUser(params) {
  return request(`/rest/user/delete/${params.id}`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 添加用户
 * @method POST
 */
export async function addUser(params) {
  return request(`/rest/user/add4Admin`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 更新用户
 * @method POST
 */
export async function updateUser(params) {
  return request(`/rest/user/update4Admin`, { data: { ...params }, method: 'PUT' });
}

/**
 * @desc 获取用户产品总数
 * @method POST
 */
export async function getUserProductCount(params) {
  return request('/rest/product/user/totalCount', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取用户关联产品列表
 * @method GET
 */
export async function getUserRelaProduct(params) {
  return request('/rest/user/productList', { data: { ...params } });
}

/**
 * @desc 获取用户下所有产品
 * @method GET
 */
export async function getUserProductList(params) {
  return request('/rest/user/productSelectList', { data: { ...params } });
}

/**
 * @desc 获取用户下所有岗位
 * @method GET
 */
export async function getRoleProductList(params) {
  return request('/rest/product/role/listByUid', { data: { ...params } });
}

/**
 * @desc 删除用户产品
 * @method POST
 */
export async function dltUserProduct(params) {
  return request(`/rest/product/user/delete/${params.id}`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 添加用户产品
 * @method POST
 */
export async function addUserProduct(params) {
  return request('/rest/product/user/add', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取用户产品角色
 * @method POST
 */
export async function getUserProductRole(params) {
  return request('/rest/role/listAllOfProductAndSystem', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

/**
 * @desc 获取产品用户更多信息
 * @method POST
 */
export async function getUserProductMore(params) {
  return request('/rest/user/getMore', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取产品配置字段列表
export async function getCustomManageList(params) {
  return request('/rest/product/customfield/listByPlatform', { data: { ...params }, method: 'GET' });
}

// 创建自定义字段
export async function addCustomManage(params) {
  return request('/rest/customfield', { data: { ...params }, method: 'POST' });
}

// 查询自定义字段详情
export async function getCustomManageInfo(id) {
  return request(`/rest/customfield/${id}`);
}

// 更新自定义字段
export async function updateCustomManage(params) {
  return request('/rest/customfield', { data: { ...params }, method: 'PUT' });
}

// 配置自定义字段属性
export async function setCustomValue(params) {
  return request('/rest/customfield/value', { data: { ...params }, method: 'POST' });
}

// 删除自定义字段
export async function deleteCustom(params) {
  return request(`/rest/customfield/delete`, { method: 'POST', data: { ...params } });
}

// 拖拽排序
export async function updateSortValue(params) {
  return request(`/rest/customfield/sortvalue`, { data: params, method: 'PUT' });
}

// 获取值设置的列表
export async function getCustomFieldSet(id) {
  return request(`/rest/customfield/value/${id}`);
}

// 更新是否必填
export async function updateCustomRequired(params) {
  return request(`/rest/customfield/required`, { data: { ...params }, method: 'PUT' });
}

// 更新是否使用
export async function updateCustomState(params) {
  return request(`/rest/customfield/state`, { data: { ...params }, method: 'PUT' });
}

// 设置字段默认值
export async function setCustomDefault(params) {
  return request(`/rest/customfield/value/default`, { data: { ...params }, method: 'POST' });
}

// 系统应用配置
export async function refreshCustomField() {
  return request(`/rest/customfield/refresh`, { method: 'POST' });
}

// 通过邮箱获取用户的详细信息
export async function getUserByEmail(params) {
  return request(`/rest/user/getByEmail`, { data: { ...params } });
}

// 获取单据/项目的工作量汇总数据
export async function getManPower(params) {
  return request(`/rest/dw/metric/manpower/get`, { data: { ...params }, type: 'urlencoded' });
}

// 刷新工作量汇总
export async function refreshManPower(params) {
  return request(`/rest/dw/metric/manpower/refresh`, { data: { ...params }, type: 'urlencoded', method: 'POST' });
}

// 添加级联字段
export async function addCascaderField(params) {
  return request(`/rest/cascade/field/add`, { data: { ...params }, type: 'urlencoded', method: 'POST' });
}

// 获取级联字段信息
export async function getCascaderField(params) {
  return request(`/rest/cascade/field/get`, { data: { ...params }, type: 'urlencoded', method: 'POST' });
}

// 更新级联字段信息
export async function updateCascaderField(params) {
  return request(`/rest/cascade/field/update`, { data: { ...params }, type: 'urlencoded', method: 'POST' });
}

// 添加根级联值
export async function addCategoryValue(params) {
  return request(`/rest/cascade/category/add`, { data: { ...params }, type: 'urlencoded', method: 'POST' });
}

// 删除级联值
export async function deleteCategoryValue(params) {
  return request(`/rest/cascade/category/delete`, { data: { ...params }, type: 'urlencoded', method: 'POST' });
}

// 更新级联值
export async function updateCategoryValue(params) {
  return request(`/rest/cascade/category/update`, { data: { ...params }, type: 'urlencoded', method: 'POST' });
}

// 企业发送通知
export async function sendUpgradeMsg(params) {
  return request(`/rest/manage/inbox/sendUpgradeMsg`, { data: { ...params }, type: 'urlencoded', method: 'POST' });
}

// 删除级联字段
export async function deleteField(params) {
  return request(`/rest/cascade/field/delete`, { data: { ...params }, type: 'urlencoded', method: 'POST' });
}

// 接入产品
export async function productAccept(params) {
  return request(`/rest/manage/oneclick`, { data: { ...params }, type: 'urlencoded', method: 'POST' });
}

// 接入企业
export async function entAccept(params) {
  return request(`/rest/manage/ent/oneclick`, { data: { ...params }, type: 'urlencoded', method: 'POST' });
}

// 驳回企业
export async function entReject(params) {
  return request(`/rest/manage/ent/reject`, { data: { ...params }, type: 'urlencoded', method: 'POST' });
}

//迁移系统字段
export async function moveSystemField(params) {
  return request(`/rest/customfield/move`, { data: { ...params }, method: 'POST' });
}

