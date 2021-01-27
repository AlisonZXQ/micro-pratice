import store from 'store';

const localStorage = store.enabled ? store : () => {
  console.log('你的浏览器不支持本地存储，将导致一些本地存储功能失效，请使用更高版本的浏览器');
  return null;
};

export default localStorage;
