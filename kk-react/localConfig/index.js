let proxyConfig = {};

try {
  proxyConfig = require('./devProxy');
} catch (e) {
  // console.log('本地代理服务配置文件不存在！');
}

module.exports = proxyConfig;
