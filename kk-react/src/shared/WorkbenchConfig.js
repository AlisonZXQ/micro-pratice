/**
 * @description - 个人工作台配置
 */

import {
  requirementNameMap, requirementColorDotMap, bugTaskNameMap, bugTaskColorDotMap,
  aimNameMap, aimColorDotMap, adviseNameMap, adviseColorDotMap, ticketNameMap, ticketColorDotMap
} from '@shared/CommonConfig';

export const tabsData = [{
  key: 4,
  name: '我的反馈',
  badge: 0,
}, {
  key: 2,
  name: '我的项目',
  badge: 0,
}, {
  key: 3,
  name: '我的审批',
  badge: 0,
}, {
  key: 1,
  name: '我的工作项',
  badge: 0,
}];

export const TAB_INDEX_MAP = {
  ADVISE: 0,
  AUDIT: 2,
};

export const tabsRoute = {
  1: 'issue',
  2: 'userPro',
  3: 'audit',
  4: 'advise',
};

export const keyMap = {
  'issue': 1,
  'userPro': 2,
  'audit': 3,
  'advise': 4,
};

export const orderFieldAdviseData = [
  { name: '创建时间', key: 1 },
  { name: '更新时间', key: 2 },
  { name: '到期日', key: 3 },
  { name: '优先级', key: 4 }
];

export const orderFieldAdviseNameMap = {
  1: 'addtime',
  2: 'updatetime',
  3: 'expect_releasetime',
  4: 'level',
};

export const orderData = [
  { name: '升序', key: 1 },
  { name: '降序', key: 2 },
];

export const orderNameMap = {
  1: 'asc',
  2: 'desc'
};

export const orderFieldIssueData = [
  { name: '创建时间', key: 1 },
  { name: '更新时间', key: 2 },
  { name: '到期日', key: 3 },
];

export const orderFieldIssueNameMap = {
  1: 'addtime',
  2: 'updatetime',
  3: 'expect_releasetime',
};

export const orderFieldAuditData = [
  { name: '申请时间', key: 1 },
  { name: '操作时间', key: 2 },
];

export const orderFieldAuditByMap = {
  1: 'create_time',
  2: 'update_time'
};

export const AUDIT_STATE_MAP = {
  NEW: 'success',
  TODO: 'processing',
  PASS: 'success',
  FAIL: 'error',
  CANCLE: 'default',
};

export const AUDIT_STATE_COLOR = {
  0: AUDIT_STATE_MAP.NEW,
  1: AUDIT_STATE_MAP.TODO,
  2: AUDIT_STATE_MAP.PASS,
  3: AUDIT_STATE_MAP.FAIL,
  4: AUDIT_STATE_MAP.CANCLE,
};

export const AUDIT_TYPE_NAME_MAP = {
  BEGIN: '立项',
  FINISH: '结项',
  CHANGE: '变更',
  AIM: '验收',
};

export const AUDIT_TYPE_MAP = {
  1: AUDIT_TYPE_NAME_MAP.BEGIN,
  2: AUDIT_TYPE_NAME_MAP.FINISH,
  3: AUDIT_TYPE_NAME_MAP.CHANGE,
  4: AUDIT_TYPE_NAME_MAP.AIM,
};

export const AUDIT_TYPE_NUM_MAP = {
  BEGIN: 1,
  FINISH: 2,
  CHANGE: 3,
  AIM: 4,
};

// 项目的时间条件
export const orderFieldProjectData = [
  { name: '创建时间', key: 1 },
  { name: '更新时间', key: 2 },
];

export const orderFieldProjectByMap = {
  1: 'create_time',
  2: 'update_time'
};

export const orderProjectNameMap = {
  1: 'desc',
  2: 'asc'
};

// 我的工作项筛选
export const typeMap = {
  // 1: '建议',
  2: '需求',
  3: '任务',
  4: '缺陷',
  // 5: '目标'
};

// 需求任务缺陷
export const MY_ISSUE = [2, 3, 4];

//负责人和验证人
export const RESPONSE_REQUIRE = [1, 3];

// 建议和工单
export const MY_FEEDBACK = [1, 6];

// 建议和工单的枚举
export const MY_FEEDBACK_MAP = [
  { key: 1, value: '建议' },
  { key: 6, value: '工单' },
];

// 工作台所有单据状态集合
export const statusMap = {
  /**
* 任务/缺陷
*/
  1: '新建',
  2: '解决中',
  3: '已解决',
  4: '关闭',
  5: '取消',
  6: '重新打开',
  /**
   * 建议
   */
  // 7: '已受理',
  // 8: '已驳回',
  /**
 * 需求
 */
  9: '已设计',
  10: '已评审',
  11: '已排期',
  14: '评估中',
  15: '设计中',
  16: '待测试',
};

// 除了关闭和取消的单据状态集合
export const EXCLUDE_CLOSE_CANCEL = [1, 2, 3, 6, 9, 10, 11, 14, 15, 16];

export const typeNameMap = {
  // 1: '建议',
  2: 'Feature',
  3: 'Task',
  4: 'Bug',
  5: 'Objective'
};

export const KeyToType = {
  // 1: '建议',
  'Feature': 'requirement',
  'Task': 'task',
  'Bug': 'bug',
  'Objective': 'objective',
  'Subtask': 'subTask'
};

export const urlMap = {
  1: '/my_workbench/advisedetail/Feedback',
  2: '/my_workbench/requirementdetail/Feature',
  3: '/my_workbench/taskdetail/Task',
  4: '/my_workbench/bugdetail/Bug',
  5: '/my_workbench/objectivedetail/Objective',
  6: '/my_workbench/taskdetail/Subtask'
};

export const nameMap = {
  1: adviseNameMap,
  2: requirementNameMap,
  3: bugTaskNameMap,
  4: bugTaskNameMap,
  5: aimNameMap,
  6: ticketNameMap,
};

export const colorMap = {
  1: adviseColorDotMap,
  2: requirementColorDotMap,
  3: bugTaskColorDotMap,
  4: bugTaskColorDotMap,
  5: aimColorDotMap,
  6: ticketColorDotMap,
};

export const riskcolorMap = {
  HIGH: '#FF4343',
  MIDDLE: '#FCAE00', // @color-gold-6
  LOW: '#4DC600'
};

//我的反馈关联单据弹框名称
export const relationNameMap = {
  requirement: '需求',
  task: '任务',
  bug: '缺陷'
};

//我的反馈关联单据弹框地址
export const relationUrlMap = {
  requirement: '/my_workbench/requirementdetail/Feature',
  task: '/my_workbench/taskdetail/Task',
  bug: '/my_workbench/bugdetail/Bug'
};

// 个人工作台我的建议tab
export const ADVISE_TICKET_TABS = {
  REPORT: 2,
  RESPONSE: 1,
  SUBSCRIBE: 4,
};

//个人工作台我的反馈的备注状态
export const COMMENT_STATE = {
  UNREAD: 0,
  READED: 1,
};

