export const data_report = {
  path: '/report', component: '../layouts/level/index', // 项目周报对应的操作
  routes: [
    { path: '/report/dashboard', component: './report/last_data' }, // report 实时数据
    { path: '/report/dashboard/edit', component: './report/last_data/components/EditDashBoard' }, // report 实时数据
    { path: '/report/list', component: './report/report_list' }, // report 报告列表
    { path: '/report/detail', component: './report/report_list/components/ReportDetail' }, // report 权限管理
    { path: '/report/access', component: './report/access_manage' }, // report 权限管理
  ]
};