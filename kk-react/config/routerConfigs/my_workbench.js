export const my_workbench = {
  path: '/my_workbench', component: '../layouts/level/index', // 项目周报对应的操作
  routes: [
    { path: '/my_workbench/issue', component: './my_workbench' }, // 工作台单据
    { path: '/my_workbench/userPro', component: './my_workbench' }, // 工作台项目
    { path: '/my_workbench/audit', component: './my_workbench' }, // 工作台单据审批页
    { path: '/my_workbench/advise', component: './my_workbench' }, // 工作台建议
    { path: '/my_workbench/advisedetail/:id', component: './receipt/advise/advise_detail' }, // 工作台建议
    { path: '/my_workbench/ticketdetail/:id', component: './receipt/ticket/ticket_detail' }, // 工作台工单
    { path: '/my_workbench/bugdetail/:id', component: './receipt/bug/bug_detail' }, // 工作台缺陷
    { path: '/my_workbench/taskdetail/:id', component: './receipt/task/task_detail' }, // 工作台任务
    { path: '/my_workbench/objectivedetail/:id', component: './receipt/objective/objective_detail' }, // 工作台目标
    { path: '/my_workbench/requirementdetail/:id', component: './receipt/requirement/requirement_detail' }, // 工作台需求
  ]
};
