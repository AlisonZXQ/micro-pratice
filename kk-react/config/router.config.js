import { issues } from './routerConfigs/issues';
import { product_setting } from './routerConfigs/product_setting';
import { system_manage } from './routerConfigs/system_manage';
import { project } from './routerConfigs/project';
import { data_report } from './routerConfigs/data_report';
import { message } from './routerConfigs/message';
import { my_workbench } from './routerConfigs/my_workbench';
import { user_info } from './routerConfigs/user_info';
import { static_pages } from './routerConfigs/static_pages';
import { error } from './routerConfigs/error';
import { objective_manage } from './routerConfigs/objective_manage';

let routes = [
  {
    path: '/', component: '../layouts/index', // 全局布局
    routes: [
      project, // 项目管理
      data_report, // 数据报表
      message, //消息中心
      issues, // 单据包括版本看板
      objective_manage, // 目标管理
      product_setting, // 产品设置
      system_manage, // 系统管理
      my_workbench, // 个人工作台
      user_info, // 个人昵称下拉
      static_pages, //登录，产品接入，企业接入静态页面
      error,
      // { component: './static_pages/error' },
    ],
  }
];

export { routes };
