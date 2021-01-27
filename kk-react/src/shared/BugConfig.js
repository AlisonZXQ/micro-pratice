/**
 * @description - 缺陷常量配置
 */

// 缺陷优先级
export const BUG_LEVER_MAP = {
  MAJOR: 1,
  NORMAL: 2,
  CRITICAL: 3,
  BLOCKER: 4,
  MINOR: 5,
  TRIVIAL: 6,
};

export const BUG_LEVER_NAME = {
  [BUG_LEVER_MAP.MAJOR]: 'major',
  [BUG_LEVER_MAP.NORMAL]: 'normal',
  [BUG_LEVER_MAP.CRITICAL]: 'critical',
  [BUG_LEVER_MAP.BLOCKER]: 'blocker',
  [BUG_LEVER_MAP.MINOR]: 'minor',
  [BUG_LEVER_MAP.TRIVIAL]: 'trivial',
};

// 优先级内容筛选
export const levelMapArr = [
  {
    label: '阻塞(blocker)',
    value: 4
  }, {
    label: '严重(critical)',
    value: 3
  }, {
    label: '重要(major)',
    value: 1
  }, {
    label: '正常(normal)',
    value: 2
  }, {
    label: '微小(minor)',
    value: 5
  }, {
    label: '不重要(trivial)',
    value: 6
  }];

export const levelMap = [
  {
    name: '阻塞(blocker)',
    id: 4
  }, {
    name: '严重(critical)',
    id: 3
  }, {
    name: '重要(major)',
    id: 1
  }, {
    name: '正常(normal)',
    id: 2
  }, {
    name: '微小(minor)',
    id: 5
  }, {
    name: '不重要(trivial)',
    id: 6
  }];

// bug分类内容筛选
export const classifyBug = [{
  name: '无',
  id: 0
}, {
  name: '功能实现缺陷',
  id: 1
}, {
  name: '需求缺陷',
  id: 2
}, {
  name: '交互&UI缺陷',
  id: 3
}, {
  name: '兼容性缺陷',
  id: 4
}, {
  name: '性能缺陷',
  id: 5
}, {
  name: '安全缺陷',
  id: 6
}, {
  name: '配置缺陷',
  id: 7
}, {
  name: '开发架构缺陷',
  id: 8
}, {
  name: '第三方缺陷',
  id: 9
}, {
  name: '硬件问题',
  id: 10
}, {
  name: '元数据问题',
  id: 11
}, {
  name: '部署脚本缺陷',
  id: 12
}, {
  name: '其他',
  id: 13
}];

// 缺陷状态映射
export const BUG_STATUS_MAP = {
  NEW: 1,
  DOING: 2,
  TODO: 3,
  CLOSE: 4,
  CANCLE: 5,
  REOPEN: 6
};

export const bugState = {
  start: 1,
  doing: 2,
  resolved: 3,
  closed: 4,
  cancled: 5,
  reopen: 6,
};

export const statusMap = {
  [BUG_STATUS_MAP.NEW]: '开始',
  [BUG_STATUS_MAP.DOING]: '解决中',
  [BUG_STATUS_MAP.TODO]: '待验收',
  [BUG_STATUS_MAP.CLOSE]: '关闭',
  [BUG_STATUS_MAP.CANCLE]: '取消',
  [BUG_STATUS_MAP.REOPEN]: '重新打开'
};

export const statusColor = {
  [BUG_STATUS_MAP.NEW]: 'success',
  [BUG_STATUS_MAP.DOING]: 'processing',
  [BUG_STATUS_MAP.TODO]: 'processing',
  [BUG_STATUS_MAP.CLOSE]: 'default',
  [BUG_STATUS_MAP.CANCLE]: 'processing',
  [BUG_STATUS_MAP.REOPEN]: 'processing',
};

export const bQueryMoreList = [
  { key: 'bugtype', value: 'BUG分类', status: 2 },
  { key: 'addtimestart', value: '创建时间(开始)', status: 999 },
  { key: 'addtimeend', value: '创建时间(结束)', status: 999 },
  { key: 'submituid', value: '报告人', status: 2 },
  { key: 'requireuid', value: '验证人', status: 2 },
  { key: 'findversionid', value: '发现版本', status: 2 },
  { key: 'fixversionid', value: '解决版本', status: 2 },
  { key: 'expectReleaseTimeStart', value: '到期日(开始)', status: 999 },
  { key: 'expectReleaseTimeEnd', value: '到期日(结束)', status: 999 },
  { key: 'tag', value: '标签', status: 2 },
];

export const bugColumns = [
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
    key: "level",
    label: "严重程度",
    width: 130,
  },
  {
    key: "onlinebug",
    label: "线上BUG",
    width: 130,
  },
  {
    key: "bugtype",
    label: "BUG分类",
    width: 130,
  },
  {
    key: "estimate_cost",
    label: "预估工作量",
    width: 200,
  },
  {
    key: "expect_releasetime",
    label: "到期日",
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
    key: "fixversionid",
    label: "解决版本",
    width: 130,
  },
  {
    key: "findversionid",
    label: "发现版本",
    width: 130,
  },
  {
    key: "state",
    label: "状态",
    width: 130,
  },
  {
    key: "addtime",
    label: "创建时间",
    width: 130,
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

export const defaultbugColumns = [
  {
    key: 'id',
    label: 'ID'
  },
  {
    key: "name",
    label: "标题"
  },
  {
    key: "level",
    label: "严重程度"
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

// 线上bug-map
export const ONLINE_BUG_MAP = {
  NONE: 0,
  YES: 1,
  NO: 2
};

export const onlinebugMap = [
  // { name: '无', id: 0 },
  { name: '是', id: ONLINE_BUG_MAP.YES },
  { name: '否', id: ONLINE_BUG_MAP.NO }
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
    name: "严重程度"
  },
  {
    name: "线上BUG"
  },
  {
    name: "BUG分类"
  },
  {
    name: "预估工作量"
  },
  {
    name: "到期日"
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
    name: '发现版本'
  },
  {
    name: "状态"
  },
  {
    name: "创建时间"
  },
  {
    name: "最后更新时间"
  },
  {
    name: "重新打开次数"
  },
];

export const timeMap = {
  1: "id",
  2: "subProductId",
  3: "moduleid",
  4: "name",
  5: "level",
  6: "onlinebug",
  7: "bugtype",
  8: "estimate_cost",
  9: 'expect_releasetime',
  10: "responseuid",
  11: "submituid",
  12: "requireuid",
  13: "fixversionid",
  14: "finedversionid",
  15: "state",
  16: "addtime",
  17: "updatetime",
  18: "reopentimes"
};

export const orderMap = {
  1: 'asc',
  2: 'desc',
};

// 活动历史
export const historyType = {
  create: 0,
  system_field: 1,
  custom_field: 2,
  attachment: 3,
  subscriber: 4,
  comment: 5,
};

export const titleMap = {
  0: '创建了缺陷',
  1: '更新了系统字段',
  2: '更新了自定义字段',
  3: '更新了附件',
  4: '更新了关注人',
  5: '更新了备注',
};

export const keyMap = {
  'subProductId': '子产品',
  'productid': '产品',
  'moduleid': '模块',
  'name': '标题',
  'description': '描述',
  'level': '重要性',
  'onlinebug': '线上BUG',
  'bugtype': 'bug分类',
  'estimate_cost': '预估工作量',
  'responseuid': '负责人',
  'submituid': '报告人',
  'requireuid': '验证人',
  'jirakey': '关联缺陷',
  'expect_releasetime': '到期日',
  'fixversionid': '解决版本',
  'state': '状态',
  'roleLimitType': '受限单据',
};
