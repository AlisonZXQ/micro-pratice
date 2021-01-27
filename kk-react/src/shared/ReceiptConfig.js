/**
 * @description - 单据通用配置
 */
import { updateRequirementCustom, deleteRequirementCustom } from '@services/requirement';
import { updateObjectiveCustom, deleteObjectiveCustom } from '@services/objective';
import { updateBugCustom, deleteBugCustom } from '@services/bug';
import { updateTaskCustom, deleteTaskCustom } from '@services/task';
import { updateAdviseCustom, deleteAdviseCustom } from '@services/advise';
import { updateTicketCustom, deleteTicketCustom } from '@services/ticket';

//版本添加工作项的类型
export const versionIssueTypeArr = [{
  value: 2,
  label: '需求'
}, {
  value: 3,
  label: '任务'
}, {
  value: 4,
  label: '缺陷'
}];

//版本添加工作项的单据类型
export const versionIssueTypeMap = {
  1: 'requirement',
  3: 'task',
  4: 'bug',
};

/**
 *  需求规划
 */
export const requirementPlanTabs = [{
  key: 'list',
  name: '列表',
}, {
  key: 'date',
  name: '日历',
}];

export const REQUIREMENT_LEVEL_SETTING = {
  DRAG: 1,
  AUTO: 2,
};

export const DRAG_SETTING = {
  USE: 1,
  NOT_USE: 2,
};

export const ITEM_USE = {
  ENABLE: 1,
  UNABLE: 2,
};
/**
 *  需求规划
 */

// 映射关系
export const ISSUE_TYPE_MAP = {
  ADVISE: 1,
  BUG: 2,
  TASK: 3,
  SUB_TASK: 4,
  OBJECTIVE: 5,
  REQUIREMENT: 6,
};

// 与后端的数字结合的映射关系
export const ISSUE_TYPE_NAME_MAP = {
  [ISSUE_TYPE_MAP.ADVISE]: 'advise',
  [ISSUE_TYPE_MAP.TASK]: 'task',
  [ISSUE_TYPE_MAP.BUG]: 'bug',
  [ISSUE_TYPE_MAP.SUB_TASK]: 'subTask',
  [ISSUE_TYPE_MAP.OBJECTIVE]: 'objective',
  [ISSUE_TYPE_MAP.REQUIREMENT]: 'requirement',
};

// 除缺陷外的优先级
export const LEVER_MAP = {
  P0: 1,
  P1: 2,
  P2: 3,
};

export const LEVER_ICON = {
  [LEVER_MAP.P0]: "icon-P0",
  [LEVER_MAP.P1]: "icon-P1",
  [LEVER_MAP.P2]: "icon-P2",
};

export const LEVER_COLOR = {
  [LEVER_MAP.P0]: '#F04646', // @color-red-6
  [LEVER_MAP.P1]: "#FC952D", // @color-yellow-5
  [LEVER_MAP.P2]: "#46B937", // @color-green-6
};

// 除缺陷外的优先级名称映射
export const LEVER_NAME = {
  [LEVER_MAP.P0]: "P0",
  [LEVER_MAP.P1]: "P1",
  [LEVER_MAP.P2]: "P2",
};

// 不同单据的文字色值
export const issueTextColorMap = {
  'objective': '#4618B7',
  'requirement': '#3AB574',
  'task': '#2B72DA',
  'subTask': '#2B72DA',
  'advise': '#37B4D9',
  'bug': '#F0402F',
  'ticket': '#4618B7',
};

// 不同单据的父单据展示--单据卡片
export const issueParentMap = {
  'objective': [],
  'requirement': ['objective'],
  'task': ['objective', 'requirement', 'ticket'],
  'subTask': ['task'],
  'advise': [],
  'bug': [],
  'ticket': [],
};

// 不同单据的子单据和关联单据展示--单据卡片
export const issueRelationMap = {
  'objective': ['requirement', 'task'],
  'requirement': ['task', 'bug', 'advise'],
  'task': ['subTask', 'bug'],
  'subTask': [],
  'advise': ['requirement'],
  'bug': ['requirement', 'task', 'ticket'],
  'ticket': ['task', 'bug']
};

export const adviseDetailUrl = '/my_workbench/advisedetail';
export const requirementDetailUrl = '/my_workbench/requirementdetail';
export const taskDetailUrl = '/my_workbench/taskdetail';
export const subTaskDetailUrl = '/my_workbench/taskdetail';
export const bugDetailUrl = '/my_workbench/bugdetail';
export const objectiveDetailUrl = '/my_workbench/objectivedetail';

// 单据详情页跳转路由
export const detailUrlMap = {
  'objective': objectiveDetailUrl,
  'requirement': requirementDetailUrl,
  'task': taskDetailUrl,
  'subTask': subTaskDetailUrl,
  'advise': requirementDetailUrl,
  'bug': bugDetailUrl
};

export const NO_OPT_PERMISSION_TIP_MSG = '您暂无权限操作';

// 详情页面的切换
export const DETAIL_HISTORY_ATTACHMENT = {
  DETAIL: 1,
  HISTORY: 2,
  ATTACHMENT: 3
};

export const headerTabs = [{
  key: DETAIL_HISTORY_ATTACHMENT.DETAIL,
  name: '详情'
}, {
  key: DETAIL_HISTORY_ATTACHMENT.HISTORY,
  name: '历史'
}, {
  key: DETAIL_HISTORY_ATTACHMENT.ATTACHMENT,
  name: '附件'
}];

// 日志或者备注，单据详情切换的tab
export const REMARK_DINRARY = {
  REMARK: 1,
  DINARY: 2
};

export const detailHeaderTabs = [{
  key: REMARK_DINRARY.REMARK,
  name: '备注'
}, {
  key: REMARK_DINRARY.DINARY,
  name: '日志'
}];

// 单据统一组件(full_link/create4RelationIssue)
export const connTypeMap = {
  advise: 1,
  requirement: 2,
  task: 4,
  subTask: 5,
  objective: 6,
  bug: 7,
  ticket: 8,
};

export const connTypeIdMap = {
  advise: 'aid',
  requirement: 'rid',
  story: 'rid',
  task: 'tid',
  subTask: 'tid',
  bug: 'bid',
  objective: 'oid',
  ticket: 'tid',
};

// TODO  永洲的特殊要求（针对运维项目管理产品隐藏部分功能入口，详见原始需求： https://ep.netease.com/v2/manage/version/list?productid=9 ）
export const OPS_PM_PRODUCT_NAME = "运维项目管理";

// 五类单据EPiconfront标识
export const issueEpIconMap = {
  requirement: 'icon-xuqiu-danju1',
  task: 'icon-renwu-danju1',
  subTask: 'icon-zirenwu-danju1',
  bug: 'icon-quexian-danju1',
  objective: 'icon-mubiao-danju1',
  advise: 'icon-jianyi-danju1',
  ticket: 'icon-gongdan-danjulunkuohua',
};

// 五类单据JIRAiconfront标识
export const issueJiraIconMap = {
  requirement: 'icon-story',
  task: 'icon-task',
  subTask: 'icon-Subtask',
  bug: 'icon-bug',
  objective: 'icon-epicIcon',
  advise: 'icon-feature',
  ticket: 'icon-feature',
};

// issuetype jira对应值--常量/jira与ep状态映射关系枚举
export const ISSUE_TYPE_JIRA_MAP = {
  BUG: 1,
  ADVISE: 10209,
  REQUIREMENT: 10001,
  TASK: 3,
  SUBTASK: 5,
  OBJECTIVE: 10000,
  TICKET: 11301
};

// issuetype jira对应值--按名字
export const issue_type_name_map = {
  'bug': 1, //缺陷
  'advise': 10209, //建议
  'feature': 2, //需求
  'story': 10001, //需求
  'requirement': 10001, //需求
  'task': 3, //任务
  'subtask': 5, //子任务
  'epic': 10000, //目标
  'objective': 10000, //目标
  'ticket': 11301, // 工单
};

// 所有的自定义字段类型
export const CUSTOME_TYPE_MAP = {
  INPUT: 1,
  SELECT: 2,
  TEXTAREA: 3,
  MULTISELECT: 4,
  CASCADER: 5,
  USERSELECT: 6,
  DATEPICKER: 8,
  INTERGER: 9,
  DECIMAL: 10,
};

export const CUSTOME_TYPE_NAME_MAP = {
  [CUSTOME_TYPE_MAP.INPUT]: '单行文本输入',
  [CUSTOME_TYPE_MAP.SELECT]: '单选菜单',
  [CUSTOME_TYPE_MAP.TEXTAREA]: '多行文本输入',
  [CUSTOME_TYPE_MAP.MULTISELECT]: '多选菜单',
  [CUSTOME_TYPE_MAP.CASCADER]: '层级选择',
  [CUSTOME_TYPE_MAP.USERSELECT]: '单选成员选择',
  [CUSTOME_TYPE_MAP.DATEPICKER]: '日期选择',
  [CUSTOME_TYPE_MAP.INTERGER]: '整数',
  [CUSTOME_TYPE_MAP.DECIMAL]: '小数',
};

// 自定义字段是否禁用
export const ISSUE_CUSTOM_USE = {
  OPEN: 1,
  CLOSE: 2,
};

// 自定义字段的是否必须
export const CUSTOME_REQUIRED = {
  REQUIRED: 1,
  NOT_REQUIRED: 2,
};

// 自定义字段是否是系统字段还是自定义字段
export const CUSTOME_SYSTEM = {
  SYSTEM: 1,
  NOT_SYSTEM: 2,
};

// 单选和多选是平铺还是下拉, 对于级联的2可以选择到父级
export const CUSTOM_SELECTTYPE_MAP = {
  TILE: 1,
  SELECT: 2,
};

// 版本状态映射
export const VERISON_STATUS_MAP = {
  NEW: 1,
  OPEN: 2,
  PUBLISH: 3,
};

// 不包含已发布
export const EXCLUDE_PUBLISH = `${VERISON_STATUS_MAP.NEW},${VERISON_STATUS_MAP.OPEN}`;

// 包含已发布-全部
export const INCLUDE_PUBLISH = `${VERISON_STATUS_MAP.NEW},${VERISON_STATUS_MAP.OPEN},${VERISON_STATUS_MAP.PUBLISH}`;

export const versionColor = {
  [VERISON_STATUS_MAP.NEW]: 'green',
  [VERISON_STATUS_MAP.OPEN]: 'blue',
  [VERISON_STATUS_MAP.PUBLISH]: '',
};

export const versionMap = {
  [VERISON_STATUS_MAP.NEW]: '新建',
  [VERISON_STATUS_MAP.OPEN]: '已开启',
  [VERISON_STATUS_MAP.PUBLISH]: '已发布'
};

export const VERSION_PLAN_CONNTYPE_ENUM = {
  REQUIREMENT: 1,
  SUB_REQUIREMENT: 2,
  TASK: 3,
  BUG: 4,
};

// 受限单据与否
export const LIMITED_RECEIPT = {
  LIMITED: 1,
  NOT_LIMITED: 0,
};

// 日志和备注的connType
export const RECEIPT_LOG_TYPE = {
  ADVISE: 1,
  BUG: 4,
  OBJECTIVE: 5,
  REQUIREMENT: 2,
  TASK: 3,
  TICKET: 6,
};

// 单据详情或者抽屉自定义字段用到
export const nameMap = {
  'requirement': 'requirementCustomFieldRelation',
  'bug': 'bugCustomFieldRelation',
  'advise': 'adviseCustomFieldRelation',
  'task': 'taskCustomFieldRelation',
  'objective': 'objectiveCustomFieldRelation',
  'ticket': 'ticketCustomFieldRelation',
};

// 更新自定义字段函数
export const updateFun = {
  'requirement': updateRequirementCustom,
  'bug': updateBugCustom,
  'advise': updateAdviseCustom,
  'task': updateTaskCustom,
  'objective': updateObjectiveCustom,
  'ticket': updateTicketCustom,
};

// 删除自定义字段函数
export const deleteFun = {
  'requirement': deleteRequirementCustom,
  'bug': deleteBugCustom,
  'advise': deleteAdviseCustom,
  'task': deleteTaskCustom,
  'objective': deleteObjectiveCustom,
  'ticket': deleteTicketCustom
};

export const iconMap = {
  'advise': '建议',
  'requirement': '需求',
  'bug': '缺陷',
  'task': '任务',
  'subTask': '子任务',
  'objective': '目标',
  'ticket': '工单',
};

export const DRAWER_HEADER_TABS = {
  REMARK: 1,
  DINARY: 2,
  ATTACHMENT: 3,
  HISTORY: 4
};

export const drawerHeaderTabs = [{
  key: DRAWER_HEADER_TABS.REMARK,
  name: '备注'
}, {
  key: DRAWER_HEADER_TABS.DINARY,
  name: '日志'
}, {
  key: DRAWER_HEADER_TABS.ATTACHMENT,
  name: '附件'
}, {
  key: DRAWER_HEADER_TABS.HISTORY,
  name: '历史'
}];

export const issueTypeMap = {
  'Feedback': 'advise',
  'Feature': 'requirement',
  'Bug': 'bug',
  'Task': 'task',
  'Subtask': 'subTask',
  'Objective': 'objective',
  'Ticket': 'ticket',
};

export const detailPatchMap = {
  'advise': 'advise/getAdviseDetail',
  'requirement': 'requirement/getReqirementDetail',
  'bug': 'bug/getBugDetail',
  'objective': 'objective/getObjectiveDetail',
  'task': 'task/getTaskDetail',
  'subTask': 'task/getTaskDetail',
  'ticket': 'ticket/getTicketDetail',
};

export const detailPatchSaveMap = {
  'advise': 'advise/saveAdviseDetail',
  'requirement': 'requirement/saveRequirementDetail',
  'bug': 'bug/saveBugDetail',
  'objective': 'objective/saveObjectiveDetail',
  'task': 'task/saveTaskDetail',
  'subTask': 'task/saveTaskDetail',
  'ticket': 'ticket/saveTicketDetail',
};

export const urlJumpMap = {
  'advise': '/my_workbench/advisedetail/Feedback',
  'feedback': '/my_workbench/advisedetail/Feedback',
  'requirement': '/my_workbench/requirementdetail/Feature',
  'feature': '/my_workbench/requirementdetail/Feature',
  'bug': '/my_workbench/bugdetail/Bug',
  'objective': '/my_workbench/objectivedetail/Objective',
  'task': '/my_workbench/taskdetail/Task',
  'subTask': '/my_workbench/taskdetail/Subtask',
  'ticket': '/my_workbench/ticketdetail/Ticket',
};

export const issueUrlMap = {
  'advise': '/v2/my_workbench/advisedetail/Feedback',
  'feedback': '/v2/my_workbench/advisedetail/Feedback',
  'requirement': '/v2/my_workbench/requirementdetail/Feature',
  'feature': '/v2/my_workbench/requirementdetail/Feature',
  'bug': '/v2/my_workbench/bugdetail/Bug',
  'objective': '/v2/my_workbench/objectivedetail/Objective',
  'task': '/v2/my_workbench/taskdetail/Task',
  'subTask': '/v2/my_workbench/taskdetail/Subtask',
  'ticket': '/v2/my_workbench/ticketdetail/Ticket',
};

// 关注人是用户还是用户组
export const SUBSCRIBE_USER_TYPE = {
  USER: 1,
  USER_GROUP: 2,
};

// 版本看版状态筛选arr
export const issueMapArr = [{
  label: '新建',
  value: 1,
  colordot: 'success'
}, {
  label: '解决中',
  value: 2,
  colordot: 'processing'
}, {
  label: '已解决',
  value: 3,
  colordot: 'processing'
}, {
  label: '关闭',
  value: 4,
  colordot: 'default'
}, {
  label: '取消',
  value: 5,
  colordot: 'default'
}, {
  label: '重新打开',
  value: 6,
  colordot: 'default'
}, {
  label: '已受理',
  value: 7,
  colordot: 'processing'
}, {
  label: '已驳回',
  value: 8,
  colordot: 'default'
}, {
  label: '已设计',
  value: 9,
  colordot: 'processing'
}, {
  label: '已评审',
  value: 10,
  colordot: 'processing'
}, {
  label: '已排期',
  value: 11,
  colordot: 'processing'
}, {
  label: '评估中',
  value: 14,
  colordot: 'processing'
}, {
  label: '设计中',
  value: 15,
  colordot: 'processing'
}, {
  label: '待测试',
  value: 16,
  colordot: 'processing'
}];

// 版本看版的四个状态列
export const STATUS_CODE_MAP = {
  TODO: 1,
  DOING: 2,
  SOLVED: 3,
  DONE: 4,
};

// 版本看版的四个状态列
export const STATUS_CODE = {
  [STATUS_CODE_MAP.TODO]: '待处理',
  [STATUS_CODE_MAP.DOING]: '解决中',
  [STATUS_CODE_MAP.SOLVED]: '已解决',
  [STATUS_CODE_MAP.DONE]: '完成',
};

/**
 * timebox对应的配置
 */

export const timeBoxColorMap = {
  1: 'doing',
  2: 'done',
  3: 'todo',
};

export const TIME_TYPE_MAP = {
  ONE_WEEK: 1,
  TWO_WEEK: 2,
  THREE_WEEK: 3,
  FOUR_WEEK: 4,
  NORMAL_WEEK: 5,
  NORMAL_MONTH: 6,
  CUSTOM_TIME: 7
};

export const timeTypeArr = [{
  key: TIME_TYPE_MAP.ONE_WEEK,
  name: '一周'
}, {
  key: TIME_TYPE_MAP.TWO_WEEK,
  name: '两周'
}, {
  key: TIME_TYPE_MAP.THREE_WEEK,
  name: '三周'
}, {
  key: TIME_TYPE_MAP.FOUR_WEEK,
  name: '四周'
}, {
  key: TIME_TYPE_MAP.NORMAL_WEEK,
  name: '自然周'
}, {
  key: TIME_TYPE_MAP.NORMAL_MONTH,
  name: '自然月'
}, {
  key: TIME_TYPE_MAP.CUSTOM_TIME,
  name: '自定义时间'
}];

export const monthArr = ['', 'Jan', 'Fer', 'Mar', 'Apr',
  'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * timebox对应的配置
 */


export const drawerDispatch = 'receipt/saveDrawerIssueId';

/**
 * 批量操作功能
 */
export const bathNameMap = {
  level: '优先级',

  dueDate: '完成时间',
  expect: '期望上线时间',
  // estimate: '预计上线时间',

  bugLevel: '严重程度',

  responseEmail: '负责人',
  submitEmail: '报告人',
  requireEmail: '验证人',

  fixVersionId: '解决版本',
  findVersionId: '发现版本',
};

export const requiredArr = ['level', 'responseEmail', 'submitEmail', 'bugLevel'];

export const bathIssueMap = {
  feedback: ['level', 'expect', 'responseEmail', 'submitEmail'],
  ticket: ['level', 'expect', 'responseEmail', 'submitEmail'],
  feature: ['level', 'dueDate', 'fixVersionId', 'responseEmail', 'submitEmail', 'requireEmail'],
  task: ['level', 'dueDate', 'fixVersionId', 'responseEmail', 'submitEmail', 'requireEmail'],
  bug: ['bugLevel', 'dueDate', 'fixVersionId', 'findVersionId', 'responseEmail', 'submitEmail', 'requireEmail'],
  subtask: ['level', 'dueDate', 'responseEmail', 'submitEmail', 'requireEmail'],
};

/**
 * 批量操作功能
 */

