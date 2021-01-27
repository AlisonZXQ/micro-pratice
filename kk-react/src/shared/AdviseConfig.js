/**
 * @description - 建议常量配置
 */

// 建议状态映射
export const ADVISE_STATUS_MAP = {
  NEW: 1,
  REOPEN: 6,
  ASSESS: 14,
  REJECTED: 8,
  ACCEPTED: 7,
  SOLVING: 2,
  SOLVED: 3,
  CLOSE: 4,
  CANCLE: 5,
  CANCEL: 5,
};

export const EXCLUDE_CANCLE_CLOSE = [ADVISE_STATUS_MAP.NEW, ADVISE_STATUS_MAP.REOPEN, ADVISE_STATUS_MAP.ASSESS,
  ADVISE_STATUS_MAP.REJECTED, ADVISE_STATUS_MAP.ACCEPTED, ADVISE_STATUS_MAP.SOLVING, ADVISE_STATUS_MAP.SOLVED
];

// 建议优先级arr
export const levelMap = [
  { name: 'P0 必须有', id: 1 },
  { name: 'P1 应该有', id: 2 },
  { name: 'P2 有了会更好', id: 3 }
];

// 建议解决结果
export const resolveResultMap = {
  0: '未知',
  1: '驳回关闭',
  2: '解决关闭'
};

export const aQueryMoreList = [
  { key: 'start', value: '期望上线时间(开始)', status: 999 },
  { key: 'end', value: '期望上线时间(结束)', status: 999 },
  { key: 'addtimestart', value: '创建时间(开始)', status: 999 },
  { key: 'addtimeend', value: '创建时间(结束)', status: 999 },
  { key: 'submituid', value: '报告人', status: 2 },
  { key: 'tag', value: '标签', status: 2 },
  { key: 'resolveresult', value: '解决结果', status: 2 },
];

export const defaultadviseColumns = [
  {
    key: "id",
    label: "ID"
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

export const adviseColumns = [
  {
    key: "id",
    label: "ID",
    width: 130
  },
  {
    key: "subProductId",
    label: "子产品",
    width: 150
  },
  {
    key: "moduleid",
    label: "模块",
    width: 130
  },
  {
    key: "name",
    label: "标题",
    width: 400
  },
  {
    key: "rtotal",
    label: "关联需求",
    width: 130
  },
  {
    key: "expect_releasetime",
    label: "期望上线时间",
    width: 130
  },
  {
    key: "level",
    label: "优先级",
    width: 130
  },
  {
    key: "responseuid",
    label: "负责人",
    width: 130
  },
  {
    key: "submituid",
    label: "报告人",
    width: 130
  },
  {
    key: "state",
    label: "状态",
    width: 130
  },
  {
    key: "rejectdesc",
    label: "驳回原因",
    width: 200
  },
  {
    key: "resolveresult",
    label: "解决结果",
    width: 130
  },
  {
    key: "addtime",
    label: "创建时间",
    width: 200
  },
  {
    key: "updatetime",
    label: "最后更新时间",
    width: 200
  },
  {
    key: "tag",
    label: "标签",
    width: 130
  },
  {
    key: "dwManpower",
    label: "预估工作量汇总",
    width: 200
  },
  {
    key: "submitProductName",
    label: "报告来源",
    width: 200
  },
  {
    key: "submitRoleName",
    label: "报告岗位",
    width: 200
  },
];

export const timeMap = {
  1: "id",
  2: "subProductId",
  3: "moduleid",
  4: "name",
  5: "rtotal",
  6: "expect_releasetime",
  7: "level",
  8: "responseuid",
  9: "submituid",
  10: "state",
  11: "rejectdesc",
  12: "addtime",
  13: "updatetime",
};

export const orderMap = {
  1: 'asc',
  2: 'desc',
};

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
    name: "关联需求"
  },
  {
    name: "期望上线时间"
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
    name: "状态"
  },
  {
    name: "驳回原因"
  },
  {
    name: "创建时间"
  },
  {
    name: "最后更新时间"
  },
];

export const resolveResultConditionMap = [
  { name: '未知', id: 0},
  { name: '驳回关闭', id: 1 },
  { name: '解决关闭', id: 2 }
];

export const stateMap = {
  1: '需求合理性调研',
  2: '需求实现成本评估',
  3: '需求可行',
};

export const rejectReason = {
  1: "场景描述不明确",
  2: "已有功能",
  3: "不在规划内暂时搁置",
  4: "无法实现"
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

export const historyType = {
  create: 0,
  system_field: 1,
  custom_field: 2,
  attachment: 3,
  relative_requirement: 4,
  subscriber: 5,
  comment: 6,
};

export const titleMap = {
  0: '创建了建议',
  1: '更新了系统字段',
  2: '更新了自定义字段',
  3: '更新了附件',
  4: '更新了关联需求',
  5: '更新了关注人',
  6: '更新了备注',
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
  'state': '状态',
  'rejectdesc': '驳回原因',
  'reasontype': '原因分类',
  'acceptstatus': '受理子状态',
  'expect_releasetime': '预计上线时间',
  'resolveresult': '解决结果',
  'roleLimitType': '受限单据',
};
