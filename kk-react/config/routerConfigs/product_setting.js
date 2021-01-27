export const product_setting = {
  path: '/product_setting', component: '../layouts/level/index', // 产品设置
  routes: [
    { path: '/product_setting/basic_info', component: './product_setting/basic_info' }, // 基本信息
    { path: '/product_setting/issue_setting', component: './product_setting/issue_setting' }, // 单据配置
    { path: '/product_setting/notice_setting', component: './product_setting/message_notice' }, // 通知配置
    { path: '/product_setting/cloudcc_setting', component: './product_setting/cloud_cc' }, // cloudcc配置
    { path: '/product_setting/template', component: './product_setting/project_template' }, // 项目模板
    { path: '/product_setting/user_manage', component: './product_setting/product_member' }, // 成员管理
    { path: '/product_setting/tag_manage', component: './product_setting/tag_manage' }, // 标签管理

    { path: '/product_setting/subProduct', component: './product_setting/sub_product_manage' }, // 子产品管理
    { path: '/product_setting/subProduct/module', component: './product_setting/sub_product_manage/components/product_module' }, // 团队模块管理
    { path: '/product_setting/subProduct/version', component: './product_setting/sub_product_manage/components/product_version' }, // 版本管理
    { path: '/product_setting/subProduct/mergestatus', component: './product_setting/sub_product_manage/components/jira_and_ep_status' }, // jira-ep映射关系管理

    { path: '/product_setting/product_role', component: './product_setting/product_role' }, // 岗位管理

    { path: '/product_setting/user_group', component: './product_setting/user_group' }, // 用户组管理
    { path: '/product_setting/user_group/detail', component: './product_setting/user_group/components/GroupDetail' }, // 用户组权限配置
    { path: '/product_setting/user_group/userlist', component: './product_setting/user_group/components/GroupListUser' }, // 用户组成员管理

    { path: '/product_setting/approval_flow', component: './product_setting/approval_flow/index' }, // 审批流 首页
    { path: '/product_setting/approval_flow/af_create', component: './product_setting/approval_flow/af_create' }, // 审批流 创建&删除

  ]
};
