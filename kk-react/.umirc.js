const path = require('path');
const { routes } = require('./config/router.config');
const SentryPlugin = require('@sentry/webpack-plugin');
const moment = require('moment');

export default {
  nodeModulesTransform: {
    type: 'none',
  },
  hash: true,
  chainWebpack(config, { webpack }) {
    if (process.env.UMI_ENV == 'production') {//当为prod时候才进行sourcemap的上传，如果不判断，在项目运行的打包也会上传
      config.plugin("sentry").use(SentryPlugin, [{
        ignore: ['node_modules'],
        include: './dist/v2', //上传dist文件的js
        configFile: './sentryclirc', //配置文件地址
        release: moment().format('YYYY-MM-DD HH:mm'), //版本号，唯一
        deleteAfterCompile: true,
        urlPrefix: '~/v2'
      }])
    }
  },
  // devtool: 'source-map',
  devtool: process.env.UMI_ENV == 'production' ? 'source-map' : 'eval',
  dva: {},
  antd: {},
  routes: routes,
  qiankun: {
    slave: {},
  },
  // cssLoader: {
  //   modules: {
  //     localIdentName: '[folder]_[local]_[hash:base64:5]',
  //   }
  // },
  // cssLoader: {
  //   modules: {
  //     getLocalIdent: (
  //       context,
  //       _,
  //       localName,
  //     ) => {
  //       if (
  //        // 这里排除下 node_modules
  //         context.resourcePath.includes('node_modules') ||
  //         context.resourcePath.includes('global.less')
  //       ) {
  //         return localName;
  //       } else {
  //         return '[folder]_[local]_[hash:base64:5]'
  //       }
  //     },
  //   },
  // },
  theme: {
    '@color-blue-1': '#E6F5FF',
    '@color-blue-2': '#A5DCFF',
    '@color-blue-3': '#78C8FF',
    '@color-blue-4': '#50B9FF',
    '@color-blue-5': '#29A6FF',
    '@color-blue-6': '#008CFF',
    '@color-blue-7': '#0070D9',
    '@color-blue-8': '#0056B3',
    '@color-blue-9': '#003F8C',
    '@color-blue-10': '#002B66',
    '@color-black-1': '#F5F7F9',
    '@color-black-2': '#F1F3F5',
    '@color-black-3': '#E8EAEC',
    '@color-black-4': '#D5DAE2',
    '@color-black-5': '#B9BEC8',
    '@color-black-6': '#8791A0',
    '@color-black-7': '#7C8895',
    '@color-black-8': '#475669',
    '@color-black-9': '#19222E',
    '@color-black-10': '#0E141B',
    '@color-red-1': '#FFF2F0',
    '@color-red-2': '#FFF0ED',
    '@color-red-3': '#FFCAC4',
    '@color-red-4': '#FFA29C',
    '@color-red-5': '#FC7672',
    '@color-red-6': '#F04646',
    '@color-red-7': '#C93035',
    '@color-red-8': '#A31F28',
    '@color-red-9': '#7D111C',
    '@color-red-10': '#570B15',
    '@color-gold-1': '#FFF6E6',
    '@color-gold-2': '#FFEEA3',
    '@color-gold-3': '#FFE27A',
    '@color-gold-4': '#FFD452',
    '@color-gold-5': '#FFC229',
    '@color-gold-6': '#FAAA00',
    '@color-gold-7': '#D48A00',
    '@color-gold-8': '#AD6B00',
    '@color-gold-9': '#874F00',
    '@color-gold-10': '#613500',
    '@color-green-1': '#EFFAEB',
    '@color-green-2': '#E2EDDF',
    '@color-green-3': '#BAE0AF',
    '@color-green-4': '#92D483',
    '@color-green-5': '#6CC75B',
    '@color-green-6': '#46B937',
    '@color-green-7': '#2E9425',
    '@color-green-8': '#1A6E16',
    '@color-green-9': '#0C470B',
    '@color-green-10': '#052105',
    '@color-cyan-1': '#EBFAF7',
    '@color-cyan-2': '#DFEDEB',
    '@color-cyan-3': '#AFE0DA',
    '@color-cyan-4': '#83D4CC',
    '@color-cyan-5': '#5BC7C0',
    '@color-cyan-6': '#37B9B4',
    '@color-cyan-7': '#259494',
    '@color-cyan-8': '#166B6E',
    '@color-cyan-9': '#0B4347',
    '@color-cyan-10': '#051E21',
    '@color-purple-1': '#F3EBFA',
    '@color-purple-2': '#D2B9ED',
    '@color-purple-3': '#B28BE0',
    '@color-purple-4': '#9161D4',
    '@color-purple-5': '#713CC7',
    '@color-purple-6': '#5019B9',
    '@color-purple-7': '#380D94',
    '@color-purple-8': '#22046E',
    '@color-purple-9': '#120047',
    '@color-purple-10': '#070021',
    '@color-white-1': '#FFFFFF'
  },
  alias: {
    '@src': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@pages': path.resolve(__dirname, 'src/pages'),
    '@services': path.resolve(__dirname, 'src/services'),
    '@models': path.resolve(__dirname, 'src/models'),
    '@assets': path.resolve(__dirname, 'src/assets'),
    '@shared': path.resolve(__dirname, 'src/shared'),
    '@tests': path.resolve(__dirname, 'src/tests'),
  },
  outputPath: './dist/v2',
  // 用于追加至HTML的静态资源文件的地址引用中
  publicPath: '/v2/',
  proxy: {
    context: ['/rest', '/ep', '/logout'],
    target: 'https://kk-dev.hz.netease.com/',
    // target: 'https://ep.njdiip.com:518',
    // target: 'https://kk-test.hz.netease.com/',
    // target: 'https://ep.netease.com/',
    // target: 'https://kk-performance.hz.netease.com/',
    // target: 'http://10.219.185.79:9000',
    // target: 'https://kk.hz.netease.com/',
    // target: 'http://10.219.184.134:9000',
    secure: false,
    changeOrigin: true,
    headers: {
    },
  },

  // ...devProxyConfig,
};
