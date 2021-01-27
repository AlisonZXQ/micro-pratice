export const error = {
  path: '/error', component: '../layouts/level/index', // 出错页面
  routes: [
    { path: '/error/noPermission', component: '../components/403' }, // 403
    { path: '/error/notFound', component: '../components/404' }, // 404
    { path: '/error/serverError', component: '../components/500' }, // 500
  ]
};