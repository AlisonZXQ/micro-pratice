/**
 * @description - 包含五类单据的通用常量配置--后续需要继续迁移
 */
import { OBJECTIVE_STATUS_MAP } from './ObjectiveConfig';
import { ADVISE_STATUS_MAP } from './AdviseConfig';

// 需求
export const requirementNameMap = {
  1: '新建',
  6: '重新打开',
  15: '设计中',
  9: '已设计',
  10: '已评审',
  11: '已排期',
  2: '研发中',
  16: '待测试',
  3: '待上线',
  4: '关闭',
  5: '取消'
};

export const requirementNameArr = [{
  key: 1,
  name: '新建'
}, {
  key: 6,
  name: '重新打开'
}, {
  key: 15,
  name: '设计中'
}, {
  key: 9,
  name: '已设计'
}, {
  key: 10,
  name: '已评审'
}, {
  key: 11,
  name: '已排期'
}, {
  key: 2,
  name: '研发中'
}, {
  key: 16,
  name: '待测试'
}, {
  key: 3,
  name: '待上线'
}, {
  key: 4,
  name: '关闭'
}, {
  key: 5,
  name: '取消'
}];

export const requirementColorDotMap = {
  1: 'success',
  6: 'processing',
  15: 'processing',
  9: 'processing',
  10: 'processing',
  11: 'processing',
  2: 'processing',
  16: 'processing',
  3: 'processing',
  4: 'default',
  5: 'default',
};

export const requirementColorMap = {
  1: 'green',
  6: 'green',
  15: 'blue',
  9: 'blue',
  10: 'blue',
  11: 'blue',
  2: 'blue',
  16: 'blue',
  3: 'blue',
  4: '',
  5: '',
};

export const requirementStatusChange = {
  1: [{
    action: '开始设计',
    status: '设计中',
    value: 15,
  }, {
    action: '取消',
    status: '取消',
    value: 5,
  }],
  6: [{
    action: '开始设计',
    status: '设计中',
    value: 15,
  }, {
    action: '取消',
    status: '取消',
    value: 5,
  }],
  15: [{
    action: '设计完成',
    status: '已设计',
    value: 9,
  }, {
    action: '取消',
    status: '取消',
    value: 5,
  }],
  9: [{
    action: '评审通过',
    status: '已评审',
    value: 10,
  }, {
    action: '取消',
    status: '取消',
    value: 5,
  }],
  10: [{
    action: '排期完成',
    status: '已排期',
    value: 11,
  }, {
    action: '开始研发',
    status: '研发中',
    value: 2,
  }, {
    action: '提交测试',
    status: '待测试',
    value: 16,
  }, {
    action: '测试完成',
    status: '待上线',
    value: 3,
  }, {
    action: '取消',
    status: '取消',
    value: 5,
  }],
  11: [{
    action: '开始研发',
    status: '研发中',
    value: 2,
  }, {
    action: '提交测试',
    status: '待测试',
    value: 16,
  }, {
    action: '测试完成',
    status: '待上线',
    value: 3,
  }, {
    action: '取消',
    status: '取消',
    value: 5,
  }],
  2: [{
    action: '提交测试',
    status: '待测试',
    value: 16,
  }, {
    action: '测试完成',
    status: '待上线',
    value: 3,
  }, {
    action: '取消',
    status: '取消',
    value: 5,
  }],
  16: [{
    action: '开始研发',
    status: '研发中',
    value: 2,
  }, {
    action: '测试完成',
    status: '待上线',
    value: 3,
  }, {
    action: '取消',
    status: '取消',
    value: 5,
  }],
  3: [{
    action: '开始研发',
    status: '研发中',
    value: 2,
  }, {
    action: '提交测试',
    status: '待测试',
    value: 16,
  }, {
    action: '上线完成',
    status: '关闭',
    value: 4,
  }, {
    action: '重新开始',
    status: '重新打开',
    value: 6,
  }],
  4: [{
    action: '重新开始',
    status: '重新打开',
    value: 6,
  }],
  5: [{
    action: '重新开始',
    status: '重新打开',
    value: 6,
  }]
};

export const bugTaskNameMap = {
  1: '新建',
  2: '进行中',
  3: '待验收',
  4: '关闭',
  5: '取消',
  6: '重新打开',
};

export const bugTaskNameArr = [{
  key: 1,
  name: '新建'
}, {
  key: 2,
  name: '进行中'
}, {
  key: 3,
  name: '待验收'
}, {
  key: 4,
  name: '关闭'
}, {
  key: 5,
  name: '取消'
}, {
  key: 6,
  name: '重新打开'
}];

export const versionColorDotMap = {
  1: 'success',
  2: 'processing',
  3: 'default',
};

// 版本, 任务，子任务，缺陷
export const versionNameMap = {
  1: '新建',
  2: '已开启',
  3: '已发布',
};

export const bugTaskColorMap = {
  1: 'green',
  2: 'blue',
  3: 'blue',
  4: '',
  5: '',
  6: 'green',
};

export const bugTaskColorDotMap = {
  1: 'success',
  2: 'processing',
  3: 'processing',
  4: 'default',
  5: 'default',
  6: 'processing',
};

const bugTaskData = [{
  action: '新建',
  status: '新建',
  value: 1,
}, {
  action: '开始进行',
  status: '进行中',
  value: 2,
}, {
  action: '提交验收',
  status: '待验收',
  value: 3,
}, {
  action: '通过验收',
  status: '关闭',
  value: 4,
}, {
  action: '取消',
  status: '取消',
  value: 5,
}, {
  action: '重新打开',
  status: '重新打开',
  value: 6,
}];

export const bugTaskStatusChange = {
  1: bugTaskData,
  2: bugTaskData,
  3: bugTaskData,
  4: bugTaskData,
  5: bugTaskData,
  6: bugTaskData,
};

export const statusAction = {
  'new': 1,
  'todo': 2,
  'done': 3,
  'close': 4,
  'cancel': 5,
  'reopen': 6
};

// 目标
export const aimNameMap = {
  1: '新建',
  2: '进行中',
  3: '待验收',
  4: '关闭',
  5: '取消',
  6: '重新打开',
};

export const aimColorDotMap = {
  1: 'success',
  2: 'processing',
  3: 'processing',
  4: 'default',
  5: 'default',
  6: 'processing',
};

export const aimColorMap = {
  1: 'green',
  2: 'blue',
  3: 'blue',
  4: '',
  5: '',
  6: 'green',
};

export const aimNameArr = [{
  key: 1,
  name: '新建',
}, {
  key: 2,
  name: '进行中',
}, {
  key: 3,
  name: '待验收',
}, {
  key: 4,
  name: '关闭',
}, {
  key: 5,
  name: '取消',
}, {
  key: 6,
  name: '重新打开',
}];

const aimCommonChange = {
  [OBJECTIVE_STATUS_MAP.NEW]: [{
    action: '开始进行',
    status: '进行中',
    value: OBJECTIVE_STATUS_MAP.DOING,
  }, {
    action: '取消',
    status: '取消',
    value: OBJECTIVE_STATUS_MAP.CANCLE,
  }],
  [OBJECTIVE_STATUS_MAP.CLOSE]: [{
    action: '重新打开',
    status: '重新打开',
    value: OBJECTIVE_STATUS_MAP.REOPEN,
  }],
  [OBJECTIVE_STATUS_MAP.CANCLE]: [{
    action: '重新打开',
    status: '重新打开',
    value: OBJECTIVE_STATUS_MAP.REOPEN,
  }],
  [OBJECTIVE_STATUS_MAP.REOPEN]: [{
    action: '开始进行',
    status: '进行中',
    value: OBJECTIVE_STATUS_MAP.DOING,
  }, {
    action: '取消',
    status: '取消',
    value: OBJECTIVE_STATUS_MAP.CANCLE,
  }],
};

export const aimStatusChangeResponseAndReport = {
  ...aimCommonChange,
  [OBJECTIVE_STATUS_MAP.DOING]: [{
    action: '验收提交',
    status: '待验收',
    value: OBJECTIVE_STATUS_MAP.TODO,
  }, {
    action: '取消',
    status: '取消',
    value: OBJECTIVE_STATUS_MAP.CANCLE,
  }],
  [OBJECTIVE_STATUS_MAP.TODO]: [{
    action: '验收撤回',
    status: '进行中',
    value: OBJECTIVE_STATUS_MAP.DOING,
  }],
};

export const aimStatusChangeConfirm = {
  ...aimCommonChange,
  [OBJECTIVE_STATUS_MAP.DOING]: [{
    action: '取消',
    status: '取消',
    value: OBJECTIVE_STATUS_MAP.CANCLE,
  }],
  [OBJECTIVE_STATUS_MAP.TODO]: [{
    action: '验收通过',
    status: '关闭',
    value: OBJECTIVE_STATUS_MAP.CLOSE,
  }, {
    action: '验收拒绝',
    status: '进行中',
    value: OBJECTIVE_STATUS_MAP.DOING,
  }]
};

export const aimStatusChangeAll = {
  ...aimCommonChange,
  [OBJECTIVE_STATUS_MAP.DOING]: [{
    action: '验收提交',
    status: '待验收',
    value: OBJECTIVE_STATUS_MAP.TODO,
  }, {
    action: '取消',
    status: '取消',
    value: OBJECTIVE_STATUS_MAP.CANCLE,
  }],
  [OBJECTIVE_STATUS_MAP.TODO]: [{
    action: '验收撤回',
    status: '进行中',
    value: OBJECTIVE_STATUS_MAP.DOING,
  }, {
    action: '验收通过',
    status: '关闭',
    value: OBJECTIVE_STATUS_MAP.CLOSE,
  }, {
    action: '验收拒绝',
    status: '进行中',
    value: OBJECTIVE_STATUS_MAP.DOING,
  }],
};

export const AIM_TASK_BUG_STATUS_MAP = {
  NEW: 1,
  DOING: 2,
  TODO: 3,
  CLOSE: 4,
  CANCLE: 5,
  REOPEN: 6,
};

// 建议
export const adviseNameMap = {
  1: '新建',
  6: '重新打开',
  14: '评估中',
  8: '已驳回',
  7: '已受理',
  2: '解决中',
  3: '已解决',
  4: '关闭',
  5: '取消'
};

export const adviseNameArr = [{
  key: 1,
  name: '新建',
}, {
  key: 6,
  name: '重新打开',
}, {
  key: 14,
  name: '评估中',
}, {
  key: 8,
  name: '已驳回',
}, {
  key: 7,
  name: '已受理',
}, {
  key: 2,
  name: '解决中',
}, {
  key: 3,
  name: '已解决',
}, {
  key: 4,
  name: '关闭',
}, {
  key: 5,
  name: '取消',
}];

export const adviseColorMap = {
  1: 'green',
  6: 'green',
  14: 'blue',
  8: 'blue',
  7: 'blue',
  2: 'blue',
  3: 'blue',
  4: '',
  5: ''
};

export const adviseColorDotMap = {
  1: 'success',
  6: 'processing',
  14: 'processing',
  8: 'processing',
  7: 'processing',
  2: 'processing',
  3: 'processing',
  4: 'default',
  5: 'default'
};

// 建议负责人
export const adviseStatusChangeResponse = {
  [ADVISE_STATUS_MAP.NEW]: [{
    action: '评估',
    status: '评估中',
    value: ADVISE_STATUS_MAP.ASSESS,
  }, {
    action: '取消',
    status: '取消',
    value: ADVISE_STATUS_MAP.CANCEL,
  }],
  [ADVISE_STATUS_MAP.REOPEN]: [{
    action: '评估',
    status: '评估中',
    value: ADVISE_STATUS_MAP.ASSESS,
  }, {
    action: '取消',
    status: '取消',
    value: ADVISE_STATUS_MAP.CANCEL,
  }],
  [ADVISE_STATUS_MAP.ASSESS]: [{
    action: '受理',
    status: '已受理',
    value: ADVISE_STATUS_MAP.ACCEPTED,
  }, {
    action: '驳回',
    status: '已驳回',
    value: ADVISE_STATUS_MAP.REJECTED,
  }, {
    action: '取消',
    status: '取消',
    value: ADVISE_STATUS_MAP.CANCEL,
  }],
  [ADVISE_STATUS_MAP.REJECTED]: [],
  [ADVISE_STATUS_MAP.ACCEPTED]: [{
    action: '驳回',
    status: '已驳回',
    value: ADVISE_STATUS_MAP.REJECTED,
  }, {
    action: '取消',
    status: '取消',
    value: ADVISE_STATUS_MAP.CANCEL,
  }],
  [ADVISE_STATUS_MAP.SOLVING]: [{
    action: '驳回',
    status: '已驳回',
    value: ADVISE_STATUS_MAP.REJECTED,
  }, {
    action: '取消',
    status: '取消',
    value: ADVISE_STATUS_MAP.CANCEL,
  }],
  [ADVISE_STATUS_MAP.SOLVED]: [],
  [ADVISE_STATUS_MAP.CLOSE]: [{
    action: '重新开始',
    status: '重新打开',
    value: ADVISE_STATUS_MAP.REOPEN,
  }],
  [ADVISE_STATUS_MAP.CANCEL]: [{
    action: '重新开始',
    status: '重新打开',
    value: ADVISE_STATUS_MAP.REOPEN,
  }]
};

// 建议报告人
const commonAdviseAction = [{
  action: '取消',
  status: '取消',
  value: ADVISE_STATUS_MAP.CANCEL,
}];
export const adviseStatusChangeReport = {
  ...adviseStatusChangeResponse,
  [ADVISE_STATUS_MAP.NEW]: commonAdviseAction,
  [ADVISE_STATUS_MAP.REOPEN]: commonAdviseAction,
  [ADVISE_STATUS_MAP.ASSESS]: commonAdviseAction,
  [ADVISE_STATUS_MAP.ACCEPTED]: commonAdviseAction,
  [ADVISE_STATUS_MAP.SOLVING]: commonAdviseAction,
  [ADVISE_STATUS_MAP.SOLVED]: [{
    action: '通过验收',
    status: '关闭',
    value: ADVISE_STATUS_MAP.CLOSE,
  }, {
    action: '拒绝验收',
    status: '重新打开',
    value: ADVISE_STATUS_MAP.REOPEN,
  }],
  [ADVISE_STATUS_MAP.REJECTED]: [{
    action: '同意驳回',
    status: '关闭',
    value: ADVISE_STATUS_MAP.CLOSE,
  }, {
    action: '重新开始',
    status: '重新打开',
    value: ADVISE_STATUS_MAP.REOPEN,
  }, {
    action: '取消',
    status: '取消',
    value: ADVISE_STATUS_MAP.CANCEL,
  }],
  [ADVISE_STATUS_MAP.CLOSE]: [{
    action: '重新开始',
    status: '重新打开',
    value: ADVISE_STATUS_MAP.REOPEN,
  }],
  [ADVISE_STATUS_MAP.CANCEL]: [{
    action: '重新开始',
    status: '重新打开',
    value: ADVISE_STATUS_MAP.REOPEN,
  }]
};

// 建议验证人
export const adviseStatusChangeRequire = {
  [ADVISE_STATUS_MAP.NEW]: [],
  [ADVISE_STATUS_MAP.REOPEN]: [],
  [ADVISE_STATUS_MAP.ASSESS]: [],
  [ADVISE_STATUS_MAP.ACCEPTED]: [],
  [ADVISE_STATUS_MAP.SOLVING]: [],
  [ADVISE_STATUS_MAP.SOLVED]: [],
  [ADVISE_STATUS_MAP.REJECTED]: [],
  [ADVISE_STATUS_MAP.CLOSE]: [],
  [ADVISE_STATUS_MAP.CANCEL]: []
};

// 建议负责人和报告人都有时
export const adviseStatusChangeAll = {
  ...adviseStatusChangeResponse,
  [ADVISE_STATUS_MAP.SOLVED]: [{
    action: '通过验收',
    status: '关闭',
    value: ADVISE_STATUS_MAP.CLOSE,
  }, {
    action: '拒绝验收',
    status: '重新打开',
    value: ADVISE_STATUS_MAP.REOPEN,
  }],
  [ADVISE_STATUS_MAP.REJECTED]: [{
    action: '同意驳回',
    status: '关闭',
    value: ADVISE_STATUS_MAP.CLOSE,
  }, {
    action: '重新开始',
    status: '重新打开',
    value: ADVISE_STATUS_MAP.REOPEN,
  }, {
    action: '取消',
    status: '取消',
    value: ADVISE_STATUS_MAP.CANCEL,
  }],
};

// 工单
export const ticketNameMap = {
  1: '新建',
  6: '重新打开',
  14: '评估中',
  8: '已驳回',
  7: '已受理',
  2: '解决中',
  3: '已解决',
  4: '关闭',
  5: '取消'
};

export const ticketNameArr = [{
  key: 1,
  name: '新建',
}, {
  key: 6,
  name: '重新打开',
}, {
  key: 14,
  name: '评估中',
}, {
  key: 8,
  name: '已驳回',
}, {
  key: 7,
  name: '已受理',
}, {
  key: 2,
  name: '解决中',
}, {
  key: 3,
  name: '已解决',
}, {
  key: 4,
  name: '关闭',
}, {
  key: 5,
  name: '取消',
}];

export const ticketColorMap = {
  1: 'green',
  6: 'green',
  14: 'blue',
  8: 'blue',
  7: 'blue',
  2: 'blue',
  3: 'blue',
  4: '',
  5: ''
};

export const ticketColorDotMap = {
  1: 'success',
  6: 'processing',
  14: 'processing',
  8: 'processing',
  7: 'processing',
  2: 'processing',
  3: 'processing',
  4: 'default',
  5: 'default'
};

export const ticketStatusChange = {
  1: [{
    action: '评估',
    status: '评估中',
    value: 14,
  }, {
    action: '取消',
    status: '取消',
    value: 5,
  }],
  6: [{
    action: '评估',
    status: '评估中',
    value: 14,
  }, {
    action: '取消',
    status: '取消',
    value: 5,
  }],
  14: [{
    action: '受理',
    status: '已受理',
    value: 7,
  }, {
    action: '驳回',
    status: '已驳回',
    value: 8,
  }, {
    action: '取消',
    status: '取消',
    value: 5,
  }],
  8: [{
    action: '重新开始',
    status: '重新打开',
    value: 6,
  }, {
    action: '同意驳回',
    status: '关闭',
    value: 4,
  }],
  7: [{
    action: '开始解决',
    status: '解决中',
    value: 2,
  }, {
    action: '驳回',
    status: '已驳回',
    value: 8,
  }, {
    action: '取消',
    status: '取消',
    value: 5,
  }],
  2: [{
    action: '解决完成',
    status: '已解决',
    value: 3,
  }, {
    action: '驳回',
    status: '已驳回',
    value: 8,
  }, {
    action: '取消',
    status: '取消',
    value: 5,
  }],
  3: [{
    action: '通过验收',
    status: '关闭',
    value: 4,
  }, {
    action: '拒绝验收',
    status: '重新打开',
    value: 6,
  }],
  4: [{
    action: '重新打开',
    status: '重新打开',
    value: 6,
  }],
  5: [{
    action: '重新打开',
    status: '重新打开',
    value: 6,
  }]
};

// 单据/项目统一组件(关注)
export const connTypeMapIncludeProject = {
  advise: 1,
  requirement: 2,
  task: 3,
  bug: 4,
  objective: 5,
  subTask: 3,
  project: 6,
  ticket: 7,
};

export const connTypeIdMap = {
  advise: 'aid',
  requirement: 'rid',
  story: 'rid',
  task: 'tid',
  bug: 'bid',
  objective: 'oid',
  subTask: 'tid',
};

export const manPower = {
  Objective: 1,
  Feedback: 2,
  Feature: 3,
  Task: 4,
  Subtask: 5,
  Bug: 6,
  project: 7,
  weekReport: 7,
};

// tag类型
export const colorMap = {
  'advise': adviseColorMap,
  'objective': aimColorMap,
  'bug': bugTaskColorMap,
  'task': bugTaskColorMap,
  'subTask': bugTaskColorMap,
  'requirement': requirementColorMap,
  'ticket': ticketColorMap
};

// dot类型
export const colorDotMap = {
  'advise': adviseColorDotMap,
  'objective': aimColorDotMap,
  'bug': bugTaskColorDotMap,
  'task': bugTaskColorDotMap,
  'subTask': bugTaskColorDotMap,
  'requirement': requirementColorDotMap,
  'ticket': ticketColorDotMap
};

// name
export const nameMap = {
  'advise': adviseNameMap,
  'objective': aimNameMap,
  'bug': bugTaskNameMap,
  'task': bugTaskNameMap,
  'subTask': bugTaskNameMap,
  'requirement': requirementNameMap,
  'ticket': ticketNameMap
};

//单据权限
export const ISSUE_ROLE_VALUE_MAP = {
  MANAGE: 1,
  EDIT: 2,
  READ: 3
};

export const ISSUE_ROLE_KEY_MAP = {
  MANAGE: 'MANAGE',
  EDIT: 'EDIT',
  READ: 'READ'
};

//单据权限
export const ISSUE_ROLE_NAME_MAP = {
  1: '管理',
  2: '编辑',
  3: '查看'
};

//单据类型映射表
export const ISSUE_ROLE_TYPE_MAP = {
  OBJECTIVE: 'OBJECTIVE_ROLE',
  ADVISE: 'ADVISE_ROLE',
  REQUIREMENT: 'REQUIREMENT_ROLE',
  TASK: 'TASK_ROLE',
  BUG: 'BUG_ROLE',
  TICKET: 'TICKET_ROLE'
};

export const ISSUE_ROLE_TYPE_NAME_MAP = {
  OBJECTIVE_ROLE: '目标管理',
  ADVISE_ROLE: '建议管理',
  REQUIREMENT_ROLE: '需求管理',
  TASK_ROLE: '任务管理',
  BUG_ROLE: '缺陷管理',
  TICKET_ROLE: '工单管理'
};

//用户组权限键
export const USERGROUP_PERMISSION_KEY_MAP = {

  OBJECTIVE_ROLE_MANAGE: ISSUE_ROLE_TYPE_MAP.OBJECTIVE + '_' + ISSUE_ROLE_KEY_MAP.MANAGE,
  OBJECTIVE_ROLE_EDIT: ISSUE_ROLE_TYPE_MAP.OBJECTIVE + '_' + ISSUE_ROLE_KEY_MAP.EDIT,
  OBJECTIVE_ROLE_READ: ISSUE_ROLE_TYPE_MAP.OBJECTIVE + '_' + ISSUE_ROLE_KEY_MAP.READ,

  ADVISE_ROLE_MANAGE: ISSUE_ROLE_TYPE_MAP.ADVISE + '_' + ISSUE_ROLE_KEY_MAP.MANAGE,
  ADVISE_ROLE_EDIT: ISSUE_ROLE_TYPE_MAP.ADVISE + '_' + ISSUE_ROLE_KEY_MAP.EDIT,
  ADVISE_ROLE_READ: ISSUE_ROLE_TYPE_MAP.ADVISE + '_' + ISSUE_ROLE_KEY_MAP.READ,

  REQUIREMENT_ROLE_MANAGE: ISSUE_ROLE_TYPE_MAP.REQUIREMENT + '_' + ISSUE_ROLE_KEY_MAP.MANAGE,
  REQUIREMENT_ROLE_EDIT: ISSUE_ROLE_TYPE_MAP.REQUIREMENT + '_' + ISSUE_ROLE_KEY_MAP.EDIT,
  REQUIREMENT_ROLE_READ: ISSUE_ROLE_TYPE_MAP.REQUIREMENT + '_' + ISSUE_ROLE_KEY_MAP.READ,

  TASK_ROLE_MANAGE: ISSUE_ROLE_TYPE_MAP.TASK + '_' + ISSUE_ROLE_KEY_MAP.MANAGE,
  TASK_ROLE_EDIT: ISSUE_ROLE_TYPE_MAP.TASK + '_' + ISSUE_ROLE_KEY_MAP.EDIT,
  TASK_ROLE_READ: ISSUE_ROLE_TYPE_MAP.TASK + '_' + ISSUE_ROLE_KEY_MAP.READ,

  BUG_ROLE_MANAGE: ISSUE_ROLE_TYPE_MAP.BUG + '_' + ISSUE_ROLE_KEY_MAP.MANAGE,
  BUG_ROLE_EDIT: ISSUE_ROLE_TYPE_MAP.BUG + '_' + ISSUE_ROLE_KEY_MAP.EDIT,
  BUG_ROLE_READ: ISSUE_ROLE_TYPE_MAP.BUG + '_' + ISSUE_ROLE_KEY_MAP.READ,

  TICKET_ROLE_MANAGE: ISSUE_ROLE_TYPE_MAP.TICKET + '_' + ISSUE_ROLE_KEY_MAP.MANAGE,
  TICKET_ROLE_EDIT: ISSUE_ROLE_TYPE_MAP.TICKET + '_' + ISSUE_ROLE_KEY_MAP.EDIT,
  TICKET_ROLE_READ: ISSUE_ROLE_TYPE_MAP.TICKET + '_' + ISSUE_ROLE_KEY_MAP.READ,
};

export const PROJECT_DATA_SOURCE_NAME_MAP = {
  1: 'EP',
  2: 'JIRA'
};

//附件子类型
export const ATTACHMENT_TYPE_MAP = {
  'BLOB': 1,
  'LINK': 2
};

//附件子类型名称
export const ATTCHEMENT_TYPE_NAME_MAP = {
  1: '二进制文件附件',
  2: '链接附件'
};

//附件子类型MAP
export const ATTCHEMENT_TYPE_MAP = {
  BINARY: 1,
  LINK: 2
};

export const dboxTypeArr = [
  { label: '最新上传', value: 'near' },
  { label: '项目空间', value: 'project' },
  { label: '团队空间', value: 'team' },
];

export const dboxProjectType = [
  { name: '策划稿', id: 'PLAN' },
  { name: '交互稿', id: 'INTERACTION' },
  { name: '视觉稿', id: 'VISION' },
];

//图片类的类型
export const pictureTypeArr = [
  'gif', 'jpg', 'jpeg', 'png', 'GIF', 'JPG', 'JEPG', 'PNG'
];

//链接正则
export const REG_FOR_LINK = /(https?|http):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;

export const CYCLE_RIGHT_ARR = [
  { value: 'allyear', label: '年度' },
  { value: 'upyear', label: '上半年度' },
  { value: 'downyear', label: '下半年度' },
  { value: 'first', label: 'Q1' },
  { value: 'second', label: 'Q2' },
  { value: 'third', label: 'Q3' },
  { value: 'fourth', label: 'Q4' },
];

export const CYCLE_TYPE_TIME = {
  allyear: ['01-01', '12-31'],
  upyear: ['01-01', '06-30'],
  downyear: ['07-01', '12-31'],
  first: ['01-01', '03-31'],
  second: ['04-01', '06-30'],
  third: ['07-01', '09-30'],
  fourth: ['10-01', '12-31'],
};
