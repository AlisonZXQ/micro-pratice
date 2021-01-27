/**
 * @description - task配置
 */
export const TASK_STATUS_MAP = {
  NEW: 1,
  DOING: 2,
  TODO: 3,
  CLOSE: 4,
  CANCLE: 5,
  REOPEN: 6
};

export const statusMap = {
  1: '开始',
  2: '解决中',
  3: '已解决',
  4: '关闭',
  5: '取消',
  6: '重新打开'
};

export const taskLevelNameMap = {
  1: 'P0 必须有',
  2: 'P1 应该有',
  3: 'P2 有了会更好'
};

export const statusColor = {
  1: 'success',
  2: 'processing',
  3: 'processing',
  4: 'default',
  5: 'processing',
  6: 'processing',
};

export const tQueryMoreList = [
  { key: 'level', value: '优先级', status: 2 },
  { key: 'start', value: '到期日(开始)', status: 999 },
  { key: 'end', value: '到期日(结束)', status: 999 },
  { key: 'addtimestart', value: '创建时间(开始)', status: 999 },
  { key: 'addtimeend', value: '创建时间(结束)', status: 999 },
  { key: 'submituid', value: '报告人', status: 2 },
  { key: 'requireuid', value: '验证人', status: 2 },
  { key: 'fixversionid', value: '解决版本', status: 2 },
  { key: 'tag', value: '标签', status: 2 },
];

export const taskColumns = [
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
    label: "优先级",
    width: 130,
  },
  {
    key: "rtotal",
    label: "关联需求",
    width: 130,
  },
  {
    key: "estimate_cost",
    label: "预估工作量",
    width: 130,
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

export const defaulttaskColumns = [
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
    label: "优先级"
  },
  {
    key: "rtotal",
    label: "关联需求"
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
    name: "优先级"
  },
  {
    name: "关联需求"
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
    name: "状态"
  },
  {
    name: "创建时间"
  },
  {
    name: "最后更新时间"
  },
  {
    name: "子任务数量"
  },
];

export const timeMap = {
  1: "id",
  2: "subProductId",
  3: "moduleid",
  4: "name",
  5: "level",
  6: "rtotal",
  7: "estimate_cost",
  8: "expect_releasetime",
  9: "responseuid",
  10: "submituid",
  11: "requireuid",
  12: "fixversionid",
  13: "state",
  14: "addtime",
  15: "updatetime",
  16: "total"
};

export const orderMap = {
  1: 'asc',
  2: 'desc',
};

export const levelMap = [
  { name: 'P0 必须有', id: 1 },
  { name: 'P1 应该有', id: 2 },
  { name: 'P2 有了会更好', id: 3 }
];

export const taskLevelKeyMap = {
  P0: 1,
  P1: 2,
  P2: 3
};

export const historyType = {
  create: 0,
  system_field: 1,
  custom_field: 2,
  attachment: 3,
  relative_requirement: 4,
  sub_task: 5,
  subscriber: 6,
  comment: 7,
};

export const titleMap = {
  0: '创建了任务',
  1: '更新了系统字段',
  2: '更新了自定义字段',
  3: '更新了附件',
  4: '更新了关联需求',
  5: '更新了子任务',
  6: '更新了关注人',
  7: '更新了备注',
};

export const keyMap = {
  'subProductId': '子产品',
  'productid': '产品',
  'moduleid': '模块',
  'name': '标题',
  'estimate_cost': '预估工作量',
  'epic': '关联EPIC',
  'description': '描述',
  'jirakey': '关联任务',
  'fixversionid': '解决版本',
  'level': '优先级',
  'responseuid': '负责人',
  'submituid': '报告人',
  'requireuid': '验证人',
  'state': '状态',
  'rejectdesc': '驳回原因',
  'reasontype': '原因分类',
  'acceptstatus': '受理子状态',
  'expect_releasetime': '到期日',
  'uem_estimate_cost': 'UEM预估工作量',
  'system_estimate_cost': 'UEM系统预估工作量',
  'uem_doing_msg': '设计退回原因',
  'uem_cancel_msg': '设计取消原因',
  'uem_close_msg': '设计关闭原因',
  'roleLimitType': '受限单据',
};

