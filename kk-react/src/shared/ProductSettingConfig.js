/**
 * @description - 产品设置配置
 */

import { requirementNameMap, bugTaskNameMap, aimNameMap, adviseNameMap } from '@shared/CommonConfig';

export const affectMap = {
  1: '全部类型',
  2: '仅建议',
  3: '仅需求',
  4: '仅任务',
  5: '仅缺陷',
  6: '仅目标',
};
export const affectArray = [
  { key: 1, value: '全部类型' },
  { key: 6, value: '仅目标' },
  { key: 2, value: '仅建议' },
  { key: 3, value: '仅需求' },
  { key: 4, value: '仅任务' },
  { key: 5, value: '仅缺陷' },
];

export const cusTypeMap = [
  { key: 1, value: '单行文本' },
  { key: 3, value: '多行文本' },
  { key: 2, value: '单选菜单' },
  { key: 4, value: '多选菜单' },
  { key: 5, value: '级联选择' },
];

export const flowType = {
  1: '立项',
  2: '结项',
  3: '变更',
  4: '验收',
};

export const flowMap = [
  {type: 1, name: '立项'},
  {type: 2, name: '结项'},
  {type: 3, name: '变更'},
  {type: 4, name: '验收'},
];

export const moveSuccessData = [
  { name: '目标单据字段值设置', value: 'objectiveValueCount' },
  { name: '建议单据字段值设置', value: 'adviseValueCount' },
  { name: '工单单据字段值设置', value: 'ticketValueCount' },
  { name: '需求单据字段值设置', value: 'requirementValueCount' },
  { name: '任务单据字段值设置', value: 'taskValueCount' },
  { name: '缺陷单据字段值设置', value: 'bugValueCount' },
];

export const noticeWayArr = [
  {key: 3, value: '站内信'},
  {key: 1, value: '邮件'},
  {key: 2, value: 'POPO'},
];

export const issueMap = {
  1: '建议',
  2: '缺陷',
  3: '任务',
  4: '子任务',
  5: '目标',
  6: '需求',
  7: '工单'
};

export const noticeMap = {
  0: [],
  1: [1],
  2: [2],
  3: [1, 2],
};

export const noticeName = [
  { key: 'system_upgrade', value: '系统通知' },
  { key: 'system_usergroupAdd', value: '用户组添加' },
  { key: 'system_usergroupDelete', value: '用户组删除' },

  { key: 'receipts_create', value: '单据创建' },
  { key: 'receipts_delete', value: '单据删除' },
  { key: 'receipts_update', value: '单据字段更新' },
  { key: 'receipts_state_change', value: '单据状态更新' },
  { key: 'receipts_fulllink_change', value: '单据链路更新' },
  { key: 'receipts_comment_change', value: '单据备注更新' },
  { key: 'receipts_workload_change', value: '单据日志更新' },
  { key: 'receipts_attachment_change', value: '单据附件更新' },

];

export const receiptNoticeUserArr = [
  { name: '负责人', key: 3 },
  { name: '报告人', key: 4 },
  { name: '验证人', key: 5 },
  { name: '关注人', key: 6 },
];

export const receiptNoticeTypeArr = [
  { name: '目标', key: 1 },
  { name: '建议', key: 2 },
  { name: '需求', key: 3 },
  { name: '任务', key: 4 },
  { name: '子任务', key: 5 },
  { name: '缺陷', key: 6 },
  { name: '工单', key: 7 },
];

export const receiptNoticeType = {
  system: 0,
  objective: 1,
  advise: 2,
  requirement: 3,
  task: 4,
  subTask: 5,
  bug: 6,
  ticket: 7
};

export const noticeTypeListMap = [
  { key: 1, value: '仅开始' },
  { key: 2, value: '仅结束' },
  { key: 3, value: '每个节点' },
];

export const approvalTypeMap = [
  { key: 1, value: '或签（一人通过或拒绝即可）' },
  { key: 2, value: '会签（需所有人操作）' },
];

// 是否是产品的owner
export const PRODUCT_USER_ROLE = {
  OWNER: 1,
  MEMBER: 2,
};

// 项目模版下的自定义字段是否禁用
export const PROJECT_CUSTOM_USE = {
  OPEN: 1,
  CLOSE: 2,
};

// 项目模版下的自定义字段是否必填
export const PROJECT_CUSTOM_REQUIRED = {
  REQUIRED: 1,
  NOT_REQUIRED: 2,
};

// 项目模版下的自定义字段是文本还是下拉
export const PROJECT_CUSTOM_TYPE = {
  TEXT: 1,
  SELECT: 2,
};

// 项目模版下的自定义字段文本的类型是input还是textarea
export const PROJECT_CUSTOM_TEXT_TYPE = {
  INPUT: 1,
  TEXTAREA: 2,
};

// 项目模版是否是系统模版
export const PROJECT_TEMPLATE_SYSTEM_TYPE = {
  SYSTEM: 1,
  NOT_SESYTEM: 0,
};

// 项目模版是否是默认模版
export const PROJECT_TEMPLATE_DEFAULT_TYPE = {
  DEFAULT: 0,
  NOT_DEFAULT: 1,
};

// 项目模版配置映射状态关系
export const issueTypeArr = [{
  key: 10209,
  name: '建议',
}, {
  key: 10001,
  name: '故事',
}, {
  key: 3,
  name: '任务',
}, {
  key: 5,
  name: '子任务',
}, {
  key: 1,
  name: '缺陷',
}, {
  key: 10000,
  name: '目标',
}];

export const headerTabs = [{
  key: 1,
  name: 'JIRA-EP',
}, {
  key: 2,
  name: 'EP-JIRA',
}
];

export const nameMap = {
  10209: adviseNameMap,
  10001: requirementNameMap,
  10000: aimNameMap,
  3: bugTaskNameMap,
  5: bugTaskNameMap,
  1: bugTaskNameMap,
};

// 子产品是否开启jira副本
export const JIRA_SYNC_USE = {
  OPEN: 1,
  CLOSE: 2,
};

// 版本，单据是否开启jira副本
export const SYNC_COPY = {
  OPEN: true,
  CLOSE: false,
};

//版本延期预警是否开启
export const WARNING_CONFIG_USE = {
  OPEN: 1,
  CLOSE: 2,
};

// 审批流流程通知是否打开
export const IS_NOTICE_USE = {
  OPEN: 1,
  CLOSE: 2,
};

// 版本arr
export const versionArr = [
  { name: '新建', id: 1 },
  { name: '已开启', id: 2 },
  { name: '已发布', id: 3 },
];

// 默认子产品
export const DEFAULT_SUB_PRODUCT = {
  DEFAULT: 1,
  NOT_DEFAULT: 2,
};

// 一级拆分类型
export const FST_TYPE_MAP = {
  TASK: 1,
  SUBTASK: 2,
};

//用户组类型
export const USERGROUP_TYPE_MAP = {
  SYSTEM: 1, //系统用户组
  USER: 2 //产品自定义用户组
};

export const USERGROUP_TYPE_NAME_MAP = {
  1: '系统用户组',
  2: '产品自定义用户组'
};

// 结项还是创建项目的自定义字段
export const PROJECT_CUSTOM_USECASE= {
  CREATE: 1,
  FINISH: 2,
};

// 子产品管理的单据类型
export const subproductIssueTypeArr= [
  { key: 'jiraObjectiveSync', value: '目标' },
  { key: 'jiraAdviseSync', value: '建议' },
  // { key: 'jiraTicketSync', value: '工单' },
  { key: 'jiraRequirementSync', value: '需求' },
  { key: 'jiraTaskSync', value: '任务' },
  { key: 'jiraBugSync', value: '缺陷' },
];

// 子产品管理的应用范围
export const subproductEffectArr= [
  { key: 'jiraModuleSync', value: '模块' },
  { key: 'jiraVersionSync', value: '版本' },
  { key: 'jiraReceiptSync', value: '单据' },
];

//基本信息状态联动
export const baseStateReactArr = [
  { key: 'adviseState', value: '建议-需求' },
  { key: 'ticketState', value: '工单-任务/缺陷' },
  { key: 'requirementState', value: '需求-任务' },
  { key: 'taskState', value: '任务-子任务' },
];

//预警配置类型
export const warningConfigType = {
  advise: 1,
  ticket: 2,
};

//预警配置参数的key值
export const warningConfigKey = {
  advise: 'advise_accept_alert',
  ticket: 'ticket_accept_alert',
};

// 子产品是否启用
export const SUB_PRODUCT_ENABLE = {
  ENABLE: 1,
  UNABLE: 2
};
