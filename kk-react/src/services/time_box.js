import request from '../utils/request';

/**
 * @desc 新增时间盒配置
 * @method POST
 */
export async function saveTimeBoxSetting(params) {
  return request('/rest/product/timeBox/setting', { data: params, method: 'POST' });
}

/**
 * @desc 根据产品id查询时间盒内容
 * @method POST
 */
export async function getTimeBoxByTime(params) {
  return request('/rest/product/timeBox/getByTime', { data: params });
}

/**
 * @desc 根据产品id查询时间盒内容
 * @method POST
 */
export async function getTimeBoxIssueByTime(params) {
  return request('/rest/product/timeBox/getIssueByTime', { data: params });
}

/**
 * @desc 根据产品id查询时间盒配置
 * @method POST
 */
export async function getTimeBoxSetting(productId) {
  return request(`/rest/product/timeBox/setting/${productId}`);
}
