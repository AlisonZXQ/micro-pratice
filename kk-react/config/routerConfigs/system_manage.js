export const system_manage = {
  path: '/system_manage', component: '../layouts/level/index', // 系统管理
  routes: [
    { path: '/system_manage/admin/', component: './system_manage/admin_manage' }, // 管理员管理
    { path: '/system_manage/enterprise/', component: './system_manage/enterprise_manage'}, //企业管理
    { path: '/system_manage/department/', component: './system_manage/department_manage' }, // 部门管理
    { path: '/system_manage/product/', component: './system_manage/product_manage' }, // 产品管理
    { path: '/system_manage/productuser/', component: './system_manage/productuser_manage' }, // 用户管理
    { path: '/system_manage/custom_manage/', component: './system_manage/custom_manage' }, // 产品协同管理
    { path: '/system_manage/tool_manage/', component: './system_manage/tool_manage' }, // 管理工具
  ]
};