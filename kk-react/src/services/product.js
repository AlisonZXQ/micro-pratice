import request from '../utils/request';

/**
 * @desc 获取当前登录用户为子产品用户的可用子产品列表
 * @method GET
 */

/**
 * @desc 获取当前登录用户为管理员用户的可用子产品列表
 * @method GET
 */
export async function getAdminProduct() {
  return request('/rest/product/my4productadmin');
}

/**
 * @desc 获取当前登录在指定子产品中的角色标记
 * @method GET
 */
export async function getProductFlag(params) {
  return request('/rest/getProductFlag', { data: { ...params }, type: 'urlencoded' });
}

// 获取可用的产品列表(带子产品管理员标记/最后查看子产品标记）
export async function getUserProduct() {
  return request('/rest/getAvailableProductList', { type: 'urlencoded' });
}

// 设置最后选择的子产品
export async function setLastProduct(params) {
  return request('/rest/setLastProductid', { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 获取当前子产品下的所有用户
export async function getProductUser(params) {
  return request('/rest/product/user/search', { data: { ...params } });
}

// 获取全量子产品列表数据
export async function getAllSubProductList(id) {
  return request(`/rest/subProduct/listAll/${id}`);
}

// 获取全量子产品列表数据
export async function getSubProductList(params) {
  return request(`/rest/subProduct/list`, { data: { ...params }, type: 'urlencoded' });
}

// 根据产品id查询产品下的所有用户
export async function getAllUserByProductId(params) {
  return request(`/rest/product/user/listAll`, { data: { ...params } });
}

/**
 * @desc 查询子产品详情
 * @method GET
 */
export async function getSubProductDetail(id) {
  return request(`/rest/subProduct/${id}`);
}

// 取用户在该产品下的岗位列表
export async function getUserProductRole(productId) {
  return request(`/rest/product/role/listByProductId4User?productId=${productId}`);
}

// 添加用户产品岗位
export async function addUserProductRole(params) {
  return request(`/rest/product/role/addRole4User`, { data: { ...params }, method: 'POST' });
}

// 获取同企业全部的产品
export async function getSameCompanyProduct() {
  return request(`/rest/product/listByEntid?entid=1`);
}

// 新增工作日志
export async function addWorkLoad(params) {
  return request(`/rest/workload`, { data: { ...params }, method: 'POST' });
}

// 修改工作日志
export async function updateWorkLoad(params) {
  return request(`/rest/workload`, { data: { ...params }, method: 'PUT' });
}

// 修改工作日志
export async function deleteWorkLoad(params) {
  return request(`/rest/workload/${params.id}`, { method: 'DELETE' });
}

// 修改工作日志
export async function getWorkLoad(params) {
  return request(`/rest/workload/list`, { data: { ...params }, method: 'GET' });
}
