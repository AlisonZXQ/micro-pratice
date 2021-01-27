export let issues = {
  path: '/manage', component: '../layouts/level/index', // 单据
  routes: [
    { path: '/manage/productrequirement/', component: './receipt/requirement/requirement_list' }, // 需求列表页
    // { path: '/my_workbench/requirementdetail/:id', component: './receipt/requirement/requirement_detail' }, // 需求详情页

    { path: '/manage/productadvise/', component: './receipt/advise/advise_list' }, // 建议列表页
    // { path: '/my_workbench/advisedetail/:id', component: './receipt/advise/advise_detail' }, // 建议详情页

    { path: '/manage/productticket/', component: './receipt/ticket/ticket_list' }, // 工单列表页
    // { path: '/my_workbench/ticketdetail/:id', component: './receipt/ticket/ticket_detail' }, // 工单详情页

    { path: '/manage/producttask/', component: './receipt/task/task_list' }, // 任务/子任务列表页
    // { path: '/my_workbench/taskdetail/:id', component: './receipt/task/task_detail' }, // 任务/子任务详情页

    { path: '/manage/productbug/', component: './receipt/bug/bug_list' }, // 缺陷列表页
    // { path: '/my_workbench/bugdetail/:id', component: './receipt/bug/bug_detail' }, // 缺陷详情页

    { path: '/manage/productobjective/', component: './receipt/objective/objective_list' }, // 目标列表页
    // { path: '/my_workbench/objectivedetail/:id', component: './receipt/objective/objective_detail' }, // 目标详情页

    { path: '/manage/receipt/import/', component: '../components/tool/components/import.js' }, // 导出工具

    { path: '/manage/requirement_schedule/list/', component: './receipt/requirement_schedule' }, // 需求管理

    { path: '/manage/requirement_plan/list/', component: './receipt/requirement_plan' }, // 需求规划列表
    { path: '/manage/requirement_plan/date/', component: './receipt/requirement_plan' }, // 需求规划日历

    { path: '/manage/requirement_board/', component: './receipt/requirement_board' }, // 需求看板
    { path: '/manage/time_box/', component: './receipt/time_box' }, // 时间盒

    { path: '/manage/version/list', component: './receipt/version/index' }, // version 首页
    { path: '/manage/version/detail', component: './receipt/version/version_detail' }, // version 看板
  ]
};
