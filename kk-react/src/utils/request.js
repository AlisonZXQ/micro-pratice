import fetch from 'dva/fetch';
import { obj2query, getCookie } from './helper';

const loginUrl = `http://${window.location.hostname}/openid`;
const nanjingLoginUrl = `http://${window.location.hostname}:${window.location.port}`;
const { hostname } = window.location;
const nanjingUrl = hostname.includes('test') ? 'id-test.njdiip.com' : 'id.njdiip.com';
const forbiddenUrl = '/project/403';
const CODE_MAP = {
  500: '500',
  502: '',
};

const cookieObj = getCookie();
let cookieParams = {
  pmot: '1635e6bcd5d64259a8b8f144030053b9',
  pmou: 'zhangxueqing01',
};

let currentPid = -1; // 暂时先用sessionStorage来存储当前项目的id做权限控制

/**
 * 延时处理
 */
const timeout = new Promise((resolve) => {
  setTimeout(resolve, 3000);
});

/**
 * 验证返回状态码
 * @param {object} response - ajax请求返回数据
 */
function checkStatus(response) {
  if (response.status === 203) {
    location.href = forbiddenUrl;
    return timeout;
  } else if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(CODE_MAP[response.status] || response.statusText);
    error.response = response;
    error.code = response.status;
    throw error;
  }
}

/**
 * 验证用户是否登录
 * @param {object} res - ajax返回数据
 * @param {string} url - ajax请求路径
 */
function checkLogin(res, url) {

  const { pathname } = window.location;
  const name = (pathname === '/v2' || pathname === '/v2/') ? `/v2/my_workbench/advise` : pathname;
  const redirectUrl = `${window.location.origin}${name}`;

  // 南京code 10001 10002 10003
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '10.242.200.77') {
    return res;
  } else if (res.code === 10001) {
    location.href = `http://${nanjingUrl}?referrer=${encodeURIComponent(`${nanjingLoginUrl}/nanjingCb?refer=${redirectUrl}`)}`;
    return timeout;
  } else if (res.code === 10002) {
    location.href = `${loginUrl}/needEmail.html`;
    return timeout;
  } else if (res.code === 10003) {
    location.href = `${loginUrl}/nanjingCb?refer=${window.location.href}`;
    return timeout;
  } else if (res.code === 401) {
    // uem的frame
    if (parent && parent.window && parent.window.uemCallBack) {
      parent.location.href = `${loginUrl}?refer=${encodeURIComponent(window.location.href)}`;
    } else {
      location.href = `${loginUrl}?refer=${encodeURIComponent(window.location.href)}`;
    }
    return timeout;
  } else if (res.code === 203) {
    location.href = forbiddenUrl;
    return timeout;
  } else {
    return res;
  }
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  let newoptions = { ...options } || {};
  let newurl = url;
  newoptions.method = newoptions.method || 'GET';
  newoptions.credentials = 'include';

  // 开发&测试&线上带上登陆的cookie信息
  if (cookieObj && cookieObj.pmot && cookieObj.pmou) {
    cookieParams = {
      pmot: cookieObj.pmot,
      pmou: cookieObj.pmou,
    };
  }

  if (sessionStorage.getItem('currentPid')) {
    currentPid = sessionStorage.getItem('currentPid');
  }

  newoptions.headers = newoptions.headers || {
    ...cookieParams,
    currentPid,
  };

  if (newoptions.data) {
    if (newoptions.type && (newoptions.type === 'weekreport' || newoptions.type === 'urlencoded')) {
      newoptions.headers = {
        ...newoptions.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      if (newoptions.method === 'GET') {
        newurl = `${url}?${obj2query(newoptions.data)}`; // 对weekreport or urlencoded的单独进行处理
      } else {
        newoptions.body = obj2query(newoptions.data);
      }
    } else if (newoptions.type === 'upload') { // 上传文件
      newoptions.headers = {
        ...newoptions.headers,
      };
      newoptions.body = newoptions.data;
    } else if (/GET|HEAD|DELETE/.test(newoptions.method)) {
      newurl = `${url}?${obj2query(newoptions.data)}`; // 组装成健值对
    } else { // post/put类型的处理
      newoptions.headers = {
        ...newoptions.headers,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      newoptions.body = JSON.stringify(newoptions.data);
    }
  }
  return fetch(newurl, newoptions)
    .then(checkStatus)
    .then((res) => {
      return !newoptions.raw ? res.json() : res;
    })
    .then((res3) => checkLogin(res3, newurl)) // 开发&测试&线上才校验
    .catch(err => {
      throw err;
    });
}
