const reportUrl = './project/week_report/diff_report';

export const project = {
  path: '/project', component: '../layouts/level/index',
  routes: [
    { path: '/project/list', component: './project/project_list' }, // projectList 首页
    { path: '/project/create_project', component: './project/create_project' }, // 创建project
    { path: '/project/detail', component: './project/project_detail' }, // project详情首页

    { path: '/project/detail/:code', component: './project/project_detail' }, // project详情首页
    { path: '/project/audit_result/:type/:projectId/:workflowId', component: './project/audit_result_page' }, // 审批结果统一页

    { path: '/project/timeline_detail', component: './project/timeline_detail' }, // 项目动态详情
    { path: '/project/edit_project', component: './project/edit_project' }, // 编辑project
    { path: '/project/manage_members', component: './project/manage_members' }, // 管理人员
    { path: '/project/project_attachment', component: './project/project_attachment' }, // 项目附件
    { path: '/project/project_begin_approval', component: './project/project_approval' }, // 项目初审批页面
    { path: '/project/project_finish_approval', component: './project/project_finish' }, // 项目结审批页面
    { path: '/project/project_risk_list', component: './project/project_risk' }, // 项目风险列表页
    {
      path: '/project/project_week_report', component: '../layouts/level/index', // 项目周报对应的操作
      routes: [
        { path: '/project/project_week_report/list', component: './project/week_report/week_report_list' }, // 列表
        { path: '/project/project_week_report/create', component: reportUrl }, // 创建
        { path: '/project/project_week_report/edit', component: reportUrl }, // 编辑
        { path: '/project/project_week_report/view', component: reportUrl } // 查看
      ]
    },

    { path: '/project/change_project', component: './project/edit_project' }, // 变更编辑project
    { path: '/project/change', component: './project/change_form_v2' }, // 项目变更编辑页

    // { path: '/project/change', component: './project/change_form' }, // 项目变更编辑页
    { path: '/project/change_list', component: './project/change_list' }, // 项目变更历史列表页
    { path: '/project/project_change_approval', component: './project/change_detail_v2' }, // 项目结审批页面
    { path: '/project/project_change_version', component: './project/change_version_history_v2' }, // 项目变更版本信息
    { path: '/project/aim_accept', component: './project/aim_approval' }, // 目标验收
    { path: '/project/access_manage', component: './project/access_manage' }, // 项目权限,
  ]
};
