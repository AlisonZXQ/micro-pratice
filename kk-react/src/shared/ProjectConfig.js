/**
 * @description - 项目配置
 */

// 项目状态
export const PROJECT_STATUS_MAP = {
  NEW: 1,
  BEGIN_APPROVAL: 2,
  DOING: 3,
  FINISH_APPROVAL: 4,
  FINISH: 5,
  DOING_CHANGE: 7,
  AIM_COMPLETE: 8,
};

// 除了结项之外的项目状态
export const PROJECT_STATUS_EXCLUDE_FINISH = [PROJECT_STATUS_MAP.NEW, PROJECT_STATUS_MAP.BEGIN_APPROVAL,
  PROJECT_STATUS_MAP.DOING, PROJECT_STATUS_MAP.FINISH_APPROVAL, PROJECT_STATUS_MAP.DOING_CHANGE, PROJECT_STATUS_MAP.AIM_COMPLETE];

// 项目权限
export const PROEJCT_PERMISSION = {
  MANAGE: 1,
  EDIT: 2,
  READ: 3
};

// 数据源
export const PROJECT_DATASOURCE = {
  EP: 1,
  JIRA: 2,
};

export const orderMap = {
  1: "asc",
  2: "desc"
};

export const statusMap = {
  1: "新建",
  2: "立项审批中",
  3: "进行中",
  4: "结项审批中",
  5: "结项",
  // 6: "取消",
  7: "进行中-变更中",
  8: "已验收"
};

export const statusColor = {
  1: "success",
  2: "processing",
  3: "processing",
  4: "processing",
  5: "default",
  // 6: "default",
  7: "processing",
  8: "processing",
  1001: "green",
  1002: "blue",
  1003: "blue",
  1004: "blue",
  1005: "",
  1006: "",
  1007: "blue",
  1008: "blue"
};

export const jiraStatusMap = {
  '开始': 'success',
  '重新打开': 'success',
  '关闭': 'default',
  '其他': 'processing',
};

export const role = {
  1: "负责人",
  2: "项目经理",
  3: "项目成员"
};

export const projectStatusArr = [
  {
    key: 1,
    value: "新建"
  },
  {
    key: 2,
    value: "立项审批中"
  },
  {
    key: 3,
    value: "进行中"
  },
  {
    key: 7,
    value: "进行中-变更中"
  },
  {
    key: 8,
    value: "已验收"
  },
  {
    key: 4,
    value: "结项审批中"
  },
  {
    key: 5,
    value: "结项"
  }
];

export const LEVER_TYPE = {
  P0: 1,
  P1: 3,
  P2: 4
};

export const priorityMap = {
  [LEVER_TYPE.P0]: "P0",
  [LEVER_TYPE.P1]: "P1",
  [LEVER_TYPE.P2]: "P2"
};

export const aimMap = {
  1: "P0",
  2: "P1",
  3: "P2"
};

export const mileStatus = {
  1: "新建",
  2: "进行中",
  3: "已验收"
};

export const mileStatusTag = {
  1: "",
  2: "blue",
  3: "green"
};

// 当前端筛选时映射关系(目前由后端统一映射关系了)
export const jiraTypeMap = {
  Epic: "Epic",
  故事: "Story",
  任务: "Task",
  子任务: "子任务",
  缺陷: "Bug"
};

export const approvalStatusMap = {
  0: "icon-tuoyuanxingbeifen15", // 未到达（初始状态）
  1: "icon-xiangmudongtaiyuanquan", // 待审批（待审批）
  2: "icon-xiangmudongtaiduigou", // 已审批（通过）
  3: "icon-shibaitishicion", // 已拒绝（不通过）
  4: "icon-shibaitishicion" // 已取消（撤回）
};

export const approvalColorMap = {
  0: "#D5DAE2", // 未到达（初始状态）
  1: "#008CFF", // 待审批（待审批）
  2: "#008CFF", // 已审批（通过）
  3: "#f04134", // 已拒绝（不通过）
  4: "#f04134" // 已取消（撤回）
};

// 项目目标状态映射
export const aimNameMap = {
  1: "新建",
  2: "进行中",
  13: "待验收",
  12: "已验收",
  5: "取消",
  6: "重新打开"
};

// 项目目标状态映射
export const aimColorMap = {
  1: "success",
  2: "processing",
  12: "processing",
  13: "processing",
  5: "default",
  6: "success",
  1001: "green",
  1002: "blue",
  1012: "blue",
  1013: "blue",
  1005: "",
  1006: "green"
};

export const aimType = {
  1: "业务指标",
  2: "研发交付",
  3: "服务保障",
  4: "客户定制",
  5: "技术预研"
};

// 合规性检查项
export const reportType = {
  1: "已上传立项报告",
  2: "已上传验收报告",
  3: "已上传结项报告"
};

export const epUrl = {
  故事: "/v2/my_workbench/requirementdetail/Feature",
  任务: "/v2/my_workbench/taskdetail/Task",
  子任务: "/v2/my_workbench/taskdetail/Subtask",
  缺陷: "/v2/my_workbench/bugdetail/Bug",
  目标: "/v2/my_workbench/objectivedetail/Objective",
  建议: "/v2/my_workbench/advisedetail/Advise",
  // 需求和epic是ep单据对应关系
  需求: "/v2/my_workbench/requirementdetail/Feature",
  Epic: "/v2/my_workbench/objectivedetail/Objective"
};

export const timelineType = [
  {
    id: 1,
    name: "立项"
  },
  {
    id: 3,
    name: "变更"
  },
  {
    id: 4,
    name: "验收"
  },
  {
    id: 2,
    name: "结项"
  },
  {
    id: 0,
    name: "其他"
  },
];

// 项目下用户角色
export const PROJECT_ROLE_TYPE = {
  PRODUCTUSER: 1,
  NONE: 0,
};

// 所有审批的类型
export const PROJECT_AUDIT_TYPE = {
  NEW: 0,
  TODO: 1,
  PASS: 2,
  FAIL: 3,
  CANCLE: 4
};

export const PROJECT_AUDIT_NODETYPE = {
  SINGLE: 1,
  ALL: 2,
};

// 审批说明
export const PROJECT_AUDIT_TYPE_NAME = {
  [PROJECT_AUDIT_TYPE.NEW]: '新建',
  [PROJECT_AUDIT_TYPE.TODO]: '进行中',
  [PROJECT_AUDIT_TYPE.PASS]: '完成',
  [PROJECT_AUDIT_TYPE.FAIL]: '失败',
  [PROJECT_AUDIT_TYPE.CANCLE]: '取消'
};

// 审批结果页根据行为区分
export const PROJECT_AUFIT_SUTIATION = {
  'begin': '立项',
  'change': '变更',
  'finish': '结项',
  'aim_approval': '目标',
};

// 变更原因映射
export const CHANGE_REASON_TYPE = {
  REQUIREMENT_CHANGE: 1,
  PRODUCT_PLAN_CHANGE: 2,
  PRODUCT_MEMBER_CHANGE: 3,
  OTHER: 4,
};

// 审批类型type
export const WORKFLOW_TYPE = {
  'begin': 1,
  'change': 3,
  'finish': 2,
  'aim_approval': 4,
};

// 变更原因说明
export const changeTypeMap = {
  [CHANGE_REASON_TYPE.REQUIREMENT_CHANGE]: '客户需求变更',
  [CHANGE_REASON_TYPE.PRODUCT_PLAN_CHANGE]: '产品规划调整',
  [CHANGE_REASON_TYPE.PRODUCT_MEMBER_CHANGE]: '团队人员变化',
  [CHANGE_REASON_TYPE.OTHER]: '其他',
};

// 变更字段类型，目标or项目
export const CHANGE_ITEM_TYPE = {
  PROJECT: 1,
  OBJECTIVE: 2,
};

// 变更审批人是否可更改
export const APPROVAL_FLOW_SETTING_TYPE = {
  EDIT: 1,
  UN_EDIT: 2,
};

// 里程碑的状态
export const MILESTONE_MAP = {
  NEW: 1,
  TODO: 2,
  COMPLETE: 3,
};

// 项目风险状态
export const RISK_STATUS_MAP = {
  OPEN: 1,
  CLOSE: 2
};

// 项目风险状态arr
export const riskStateMap = [{
  label: '打开',
  value: RISK_STATUS_MAP.OPEN
}, {
  label: '关闭',
  value: RISK_STATUS_MAP.CLOSE
}];

export const riskTypeStatusMap = {
  [RISK_STATUS_MAP.OPEN]: "打开",
  [RISK_STATUS_MAP.CLOSE]: "关闭"
};

export const riskTypeStatusColorMap = {
  [RISK_STATUS_MAP.OPEN]: "processing",
  [RISK_STATUS_MAP.CLOSE]: "default"
};

export const riskTypeStatusColorMapTag = {
  [RISK_STATUS_MAP.OPEN]: "blue",
  [RISK_STATUS_MAP.CLOSE]: ""
};

// 项目风险登记
export const RISK_LEVEL_MAP = {
  LOW: 1,
  MIDDLE: 2,
  HIGH: 3
};

// 项目风险登记arr
export const riskLevelMap = [{
  label: '低风险',
  value: RISK_LEVEL_MAP.LOW
}, {
  label: '中风险',
  value: RISK_LEVEL_MAP.MIDDLE
}, {
  label: '高风险',
  value: RISK_LEVEL_MAP.HIGH
}];

export const riskTypeColorMap = {
  [RISK_LEVEL_MAP.LOW]: "green",
  [RISK_LEVEL_MAP.MIDDLE]: "orange",
  [RISK_LEVEL_MAP.HIGH]: "red" // color-red-6
};

export const riskTypeNameMap = {
  [RISK_LEVEL_MAP.LOW]: "低",
  [RISK_LEVEL_MAP.MIDDLE]: "中",
  [RISK_LEVEL_MAP.HIGH]: "高"
};

// 周报的状态
export const WEEKREPORT_TYPE = {
  TODO: 1,
  DONE: 2,
};

// 成员管理的用户和用户组
export const MANAGE_MEMBER = {
  USER: 0,
  USERGROUP: 1,
};

// 周报模版
export const WEEKREPORT_TEMPLATE_TYPE = {
  EMPTY: 1,
  COMMON: 2,
};

// 周报模版映射
export const WEEKREPORT_TEMPLATE_NAME_TYPE = {
  [WEEKREPORT_TEMPLATE_TYPE.EMPTY]: '空白模版',
  [WEEKREPORT_TEMPLATE_TYPE.COMMON]: '通用模版',
};

export const timeMap = {
  1: 'updatetime',
  2: 'starttime',
  3: 'endtime',
};

export const weekReportStateArr = [{
  label: '未归档',
  value: 1,
}, {
  label: '已归档',
  value: 2,
}];

export const weekReportStateMap = {
  1: '未归档',
  2: '已归档',
};

export const weekReportStateColorMap = {
  1: 'default',
  2: 'success',
};
