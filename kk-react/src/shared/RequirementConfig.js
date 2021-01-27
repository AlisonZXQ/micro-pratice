/**
 * @description - 需求配置
 */

// 有优先级的单据统一
export const levelMap = {
  1: 'P0 必须有',
  2: 'P1 应该有',
  3: 'P2 有了会更好'
};

// 需求map
export const requirementNameMap = {
  1: '新建',
  2: '研发中',
  3: '待上线',
  4: '关闭',
  5: '取消',
  6: '重新打开',
  9: '已设计',
  10: '已评审',
  11: '已排期',
  15: '设计中',
  16: '待测试',
};

// 需求常量
export const REQUIREMENT_STATUS_MAP = {
  NEW: 1,
  DEVELOPMENT: 2,
  BE_ONLINE: 3,
  CLOSE: 4,
  CANCLE: 5,
  REOPEN: 6,
  DESIGN_DONE: 9,
  EVALUATION: 10,
  SCHEDULE: 11,
  DESIGN_TODO: 15,
  TEST: 16
};

export const OPEN_REQUIREMENT = [1, 6, 15, 9, 10, 11, 2, 16, 3];

// 需求规划月份->展示
export const MonthToTextMap = {
  January: '1月',
  February: '2月',
  March: '3月',
  April: '4月',
  May: '5月',
  June: '6月',
  July: '7月',
  August: '8月',
  September: '9月',
  October: '10月',
  November: '11月',
  December: '12月',
};

// 12个月
export const MonthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

// 和后端返回数据的映射关系
export const MonthToNumberMap = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

// 需求地图按用户 or 模块
export const REQUIREMENT_ROADMAP = {
  TARGET_USER: 1,
  MODULE: 2
};

// 优先级内容筛选
export const levelMapArr = [{
  label: 'P0 必须有',
  value: 1
}, {
  label: 'P1 应该有',
  value: 2
}, {
  label: 'P2 有了会更好',
  value: 3
}];

export const requirementState = {
  start: 1,
  plan: 9,
  review: 10,
  schedule: 11,
  doing: 2,
  resolved: 3,
  closed: 4,
  cancled: 5
};

export const statusMap = {
  1: '开始',
  2: '解决中',
  3: '已解决',
  4: '关闭',
  5: '取消',
  9: '已策划',
  10: '已评审',
  11: '已排期',
};

export const statusColor = {
  1: 'success',
  2: 'processing',
  3: 'processing',
  4: 'default',
  5: 'processing',
  9: 'processing',
  10: 'processing',
  11: 'processing',
};

export const rQueryMoreList = [
  // { key: 'moduleid', value: '模块', status: 2 },
  // { key: 'level', value: '优先级', status: 2 },
  { key: 'start', value: '计划上线时间(开始)', status: 999 },
  { key: 'end', value: '计划上线时间(结束)', status: 999 },
  { key: 'addtimestart', value: '创建时间(开始)', status: 999 },
  { key: 'addtimeend', value: '创建时间(结束)', status: 999 },
  { key: 'submituid', value: '报告人', status: 2 },
  { key: 'requireuid', value: '验证人', status: 2 },
  { key: 'fixversionid', value: '解决版本', status: 2 },
  { key: 'tag', value: '标签', status: 2 },
];

export const requirementColumns = [
  {
    key: "id",
    label: "ID",
    width: 130,
  },
  {
    key: "subProductId",
    label: "子产品",
    width: 150,
  },
  {
    key: "moduleid",
    label: "模块",
    width: 130,
  },
  {
    key: "name",
    label: "标题",
    width: 400,
  },
  {
    key: "rtotal",
    label: "关联建议",
    width: 130,
  },
  {
    key: "fsttotal",
    label: "一级拆分",
    width: 130,
  },
  {
    key: "expect_releasetime",
    label: "计划上线时间",
    width: 130,
  },
  {
    key: "level",
    label: "优先级",
    width: 130,
  },
  {
    key: "responseuid",
    label: "负责人",
    width: 130,
  },
  {
    key: "submituid",
    label: "报告人",
    width: 130,
  },
  {
    key: "requireuid",
    label: "验证人",
    width: 130,
  },
  {
    key: "projectid",
    label: "关联项目",
    width: 130,
  },
  {
    key: "fixversionid",
    label: "解决版本",
    width: 130,
  },
  {
    key: "state",
    label: "状态",
    width: 130,
  },
  {
    key: "rejectdesc",
    label: "评审不通过原因",
    width: 200,
  },
  {
    key: "addtime",
    label: "创建时间",
    width: 200,
  },
  {
    key: "updatetime",
    label: "最后更新时间",
    width: 200,
  },
  {
    key: "tag",
    label: "标签",
    width: 130,
  },
  {
    key: "dwManpower",
    label: "预估工作量汇总",
    width: 200,
  },
];

export const defaultrequireColumns = [
  {
    key: 'id',
    label: 'ID'
  },
  {
    key: "name",
    label: "标题"
  },
  {
    key: "rtotal",
    label: "关联需求"
  },
  {
    key: "fsttotal",
    label: "一级拆分"
  },
  {
    key: "level",
    label: "优先级"
  },
  {
    key: "responseuid",
    label: "负责人"
  },
  {
    key: "submituid",
    label: "报告人"
  },
  {
    key: "state",
    label: "状态"
  }
];

export const orderFieldData = [
  {
    name: "ID"
  },
  {
    name: "子产品"
  },
  {
    name: "模块"
  },
  {
    name: "标题"
  },
  {
    name: "关联建议"
  },
  {
    name: "一级拆分"
  },
  {
    name: "计划上线时间"
  },
  {
    name: "优先级"
  },
  {
    name: "负责人"
  },
  {
    name: "报告人"
  },
  {
    name: "验证人"
  },
  {
    name: "解决版本"
  },
  {
    name: "状态"
  },
  {
    name: "评审不通过原因"
  },
  {
    name: "创建时间"
  },
  {
    name: "最后更新时间"
  },
];

export const timeMap = {
  1: "id",
  2: "subProductId",
  3: "moduleid",
  4: "name",
  5: "rtotal",
  6: "fsttotal",
  7: "expect_releasetime",
  8: "level",
  9: "responseuid",
  10: "submituid",
  11: "requireuid",
  12: "fixversionid",
  13: "state",
  14: "rejectdesc",
  15: "addtime",
  16: "updatetime",
};

export const orderMap = {
  1: 'asc',
  2: 'desc',
};

// 需求下状态流转类型
export const requirementStatusNext = [{
  key: 1,
  name: '开始'
}, {
  key: 9,
  name: '已策划'
}, {
  key: 10,
  name: '已评审'
}, {
  key: 11,
  name: '已排期'
}, {
  key: 2,
  name: '解决中'
}, {
  key: 3,
  name: '已解决'
}, {
  key: 4,
  name: '关闭'
}, {
  key: 5,
  name: '取消'
}];

// 设计任务类型
export const DESIGN_TYPE = {
  PRODUCT_DESIGN: 1,
  SPREAD_DESIGN: 2,
  BRAND_DESIGN: 3,
  DETAIL_DESIGN: 4,
  LOOK_DESIGN: 5,
  PHOTO_DESIGN: 6
};

export const historyType = {
  create: 0,
  system_field: 1,
  custom_field: 2,
  attachment: 3,
  relative_advise: 4,
  sub_requirement: 5,
  fstlevel: 6,
  sndlevel: 7,
  subscriber: 8,
  comment: 9,
};

export const titleMap = {
  0: '创建了需求',
  1: '更新了系统字段',
  2: '更新了自定义字段',
  3: '更新了附件',
  4: '更新了关联建议',
  5: '更新了子需求',
  6: '更新了一级拆分',
  7: '更新了二级拆分',
  8: '更新了关注人',
  9: '更新了备注',
};

export const keyMap = {
  'subProductId': '子产品',
  'productid': '产品',
  'moduleid': '模块',
  'name': '标题',
  'description': '描述',
  'level': '优先级',
  'responseuid': '负责人',
  'submituid': '报告人',
  'requireuid': '验证人',
  'epic': '关联EPIC',
  'jiraKey': '关联需求',
  'fixversionid': '解决版本',
  'state': '状态',
  'reviewresult': '评审结果',
  'rejectdesc': '驳回原因',
  'expect_releasetime': '计划上线时间',
  'roleLimitType': '受限单据',
  'targetUser': '目标用户',
};

// 评审结果状态
export const REVIEW_RESULE_MAP = {
  PASS: 1,
  FAIL: 2,
  UNSET: 3,
};

/**
 * 需求看板
 */

export const boardColumns = ['todo', 'design_doing', 'schedule', 'development', 'done'];

export const boardColumnsNameMap = {
  'todo': '待处理',
  'design_doing': '设计中',
  'schedule': '已排期',
  'development': '研发中',
  'done': '已完成',
};

export const columnDatasMap = {
  'todo': [REQUIREMENT_STATUS_MAP.NEW, REQUIREMENT_STATUS_MAP.REOPEN],
  'design_doing': [REQUIREMENT_STATUS_MAP.DESIGN_TODO, REQUIREMENT_STATUS_MAP.DESIGN_DONE, REQUIREMENT_STATUS_MAP.EVALUATION],
  'schedule': [REQUIREMENT_STATUS_MAP.SCHEDULE],
  'development': [REQUIREMENT_STATUS_MAP.DEVELOPMENT, REQUIREMENT_STATUS_MAP.TEST, REQUIREMENT_STATUS_MAP.BE_ONLINE],
  'done': [REQUIREMENT_STATUS_MAP.CLOSE, REQUIREMENT_STATUS_MAP.CANCLE],
};

export const childColumnsMap = {
  'todo': [REQUIREMENT_STATUS_MAP.NEW, REQUIREMENT_STATUS_MAP.REOPEN],
  'design_doing': [REQUIREMENT_STATUS_MAP.DESIGN_TODO, REQUIREMENT_STATUS_MAP.DESIGN_DONE, REQUIREMENT_STATUS_MAP.EVALUATION],
  'schedule': [],
  'development': [REQUIREMENT_STATUS_MAP.DEVELOPMENT, REQUIREMENT_STATUS_MAP.TEST, REQUIREMENT_STATUS_MAP.BE_ONLINE],
  'done': [REQUIREMENT_STATUS_MAP.CLOSE, REQUIREMENT_STATUS_MAP.CANCLE],
};

export const canDropStatusMap = {
  'todo': [{
    key: REQUIREMENT_STATUS_MAP.REOPEN,
    name: '重新打开',
  }],
  'design_doing': [{
    key: REQUIREMENT_STATUS_MAP.DESIGN_TODO,
    name: '设计中',
  }, {
    key: REQUIREMENT_STATUS_MAP.DESIGN_DONE,
    name: '已设计',
  }, {
    key: REQUIREMENT_STATUS_MAP.EVALUATION,
    name: '已评审',
  }],
  'schedule': [{
    key: REQUIREMENT_STATUS_MAP.SCHEDULE,
    name: '已排期',
  }],
  'development': [{
    key: REQUIREMENT_STATUS_MAP.DEVELOPMENT,
    name: '研发中',
  }, {
    key: REQUIREMENT_STATUS_MAP.TEST,
    name: '待测试',
  }, {
    key: REQUIREMENT_STATUS_MAP.BE_ONLINE,
    name: '待上线',
  }],
  'done': [{
    key: REQUIREMENT_STATUS_MAP.CLOSE,
    name: '关闭',
  }, {
    key: REQUIREMENT_STATUS_MAP.CANCLE,
    name: '取消',
  }],
};

export const BOARD_FILTER_TYPE = {
  FILTER: 1,
  CUSTOM: 2,
  ALL: 3,
  ALL_OPEN: 4,
};

export const BOARD_DEFAULT = {
  DEFAULT: 1,
  NOT_DEFAULT: 2,
};

/**
 * 需求看板
 */
