/**
 * @description - 目标配置
 */

export const OBJECTIVE_ACHIEVE_TYPE = {
  OVER_PLAN: 1,
  ACHIEVE_PLAN: 2,
  BEHIND_PLAN: 3,
};

export const OBJECTIVE_ACHIEVE_MAP = {
  [OBJECTIVE_ACHIEVE_TYPE.OVER_PLAN]: '超出预期',
  [OBJECTIVE_ACHIEVE_TYPE.ACHIEVE_PLAN]: '达到预期',
  [OBJECTIVE_ACHIEVE_TYPE.BEHIND_PLAN]: '未达预期'
};

// 优先级内容筛选
export const levelMapArr = [
  {
    label: "P0 必须有",
    value: 1
  },
  {
    label: "P1 应该有",
    value: 2
  },
  {
    label: "P2 有了会更好",
    value: 3
  }
];

// 目标类型
export const epicType = [
  {
    name: "业务指标",
    id: 1
  },
  {
    name: "研发交付",
    id: 2
  },
  {
    name: "服务保障",
    id: 3
  },
  {
    name: "客户定制",
    id: 4
  },
  {
    name: "技术预研",
    id: 5
  }
];

export const OBJECTIVE_STATUS_MAP = {
  NEW: 1,
  DOING: 2,
  TODO: 3,
  CLOSE: 4,
  CANCLE: 5,
  REOPEN: 6
};

export const oQueryMoreList = [
  // { key: 'level', value: '优先级', status: 2 },
  // { key: 'type', value: '目标类型', status: 2 },
  { key: "start", value: "到期日(开始)", status: 999 },
  { key: "end", value: "到期日(结束)", status: 999 },
  { key: "addtimestart", value: "创建时间(开始)", status: 999 },
  { key: "addtimeend", value: "创建时间(结束)", status: 999 },
  { key: "submituid", value: "报告人", status: 2 },
  { key: "requireuid", value: "验证人", status: 2 },
  { key: "tag", value: "标签", status: 2 }
];

export const objectiveColumns = [
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
    key: "name",
    label: "标题",
    width: 480,
  },
  {
    key: "description",
    label: "验收标准",
    width: 200,
  },
  {
    key: "expect_releasetime",
    label: "到期日",
    width: 130,
  },
  {
    key: "level",
    label: "优先级",
    width: 130,
  },
  {
    key: "type",
    label: "目标类型",
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
    width: 150,
  },
  {
    key: "createuid",
    label: "创建人",
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

export const defaultobjectiveColumns = [
  {
    key: "id",
    label: "ID"
  },
  {
    key: "name",
    label: "标题"
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
  },
  {
    key: "projectid",
    label: "关联项目"
  }
];

export const levelMap = [
  { name: "P0 必须有", id: 1 },
  { name: "P1 应该有", id: 2 },
  { name: "P2 有了会更好", id: 3 }
];

export const orderFieldData = [
  {
    name: "ID"
  },
  {
    name: "子产品"
  },
  {
    name: "标题"
  },
  {
    name: "验收标准"
  },
  {
    name: "到期日"
  },
  {
    name: "优先级"
  },
  {
    name: "目标类型"
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
    name: "关联项目"
  },
  {
    name: "创建人"
  },
  {
    name: "状态"
  },
  {
    name: "创建时间"
  },
  {
    name: "最后更新时间"
  }
];

export const timeMap = {
  1: "id",
  2: "subProductId",
  3: "name",
  4: "description",
  5: "expect_releasetime",
  6: "level",
  7: "type",
  8: "responseuid",
  9: "submituid",
  10: "requireuid",
  11: "projectid",
  12: "createuid",
  13: "state",
  14: "addtime",
  15: "updatetime"
};

export const orderMap = {
  1: "asc",
  2: "desc"
};

export const historyType = {
  create: 0,
  system_field: 1,
  custom_field: 2,
  attachment: 3,
  subscriber: 4,
  comment: 5,
};

export const titleMap = {
  0: '创建了目标',
  1: '更新了系统字段',
  2: '更新了自定义字段',
  3: '更新了附件',
  4: '更新了关注人',
  5: '更新了备注',
};

export const keyMap = {
  'subProductId': '子产品',
  'productid': '产品',
  'name': '标题',
  'description': '验收标准',
  'level': '优先级',
  'type': '目标类型',
  'responseuid': '负责人',
  'submituid': '报告人',
  'requireuid': '验证人',
  'projectid': '关联项目',

  'expect_releasetime': '到期日',
  'cancel_msg': '取消原因',
  'jirakey': '关联目标',
  'state': '状态',
  'roleLimitType': '受限单据',
};

// OKR目标导入标记
export const OKR_OBJECTIVE_IMPORT_FLAG = {
  HAS_IMPORT: 1,
  NOT_IMPORT: 2
};

// okr个人目标or组织目标
export const OKR_OBJECTIVE_TYPE = {
  PERSON: 0,
  GROUP: 1,
};

// 组织个人目标or组织目标
export const ORG_OBJECTIVE_TYPE = {
  PERSON: 1,
  GROUP: 2,
};
