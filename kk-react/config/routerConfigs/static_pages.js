export const static_pages = {
  path: '/', component: '../layouts/level/index', // 系统管理
  routes: [
    { path: '/', component: './static_pages/login' }, // 登陆
    { path: '/apply', component: './static_pages/apply' }, //产品申请
    { path: '/entapply', component: './static_pages/ent_apply' }, //企业申请
    { path: '/logout', component: './static_pages/logout' }, //退出
    { path: '/error', component: './static_pages/error' }, //500
    { path: '/noPermission', component: './static_pages/no_permission' }, //403
    { path: '/needEmail', component: './static_pages/need_email' }, //需要邮箱
  ]
};
