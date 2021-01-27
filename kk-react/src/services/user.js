import request from '../utils/request';

// 通过邮箱获取用户的详细信息
export async function getUserByEmail(params) {
  return request(`/rest/user/getByEmail`, { data: { ...params } });
}