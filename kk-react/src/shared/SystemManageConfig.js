/**
 * @description - 系统管理配置
 */

export const entStatusColor = {
  1: 'processing',
  2: 'default',
  3: 'default',
};

export const entStatusversionMap = {
  1: '正在使用',
  2: '已停用',
};

export const entStatusNameMap = {
  'run': 1,
  'stop': 2,
};

export const tabsDataNet = [{
  key: 'product',
  name: '产品接入',
}, {
  key: 'platform',
  name: '平台通知',
}, {
  key: 'cascader',
  name: '关联字段配置',
}];

export const tabsDataBusiness = [{
  key: 'product',
  name: '产品接入',
}, {
  key: 'enterprise',
  name: '企业接入',
}, {
  key: 'platform',
  name: '平台通知',
}];

export const issueMap = {
  1: '建议',
  2: '缺陷',
  3: '任务',
  4: '子任务',
  5: '目标',
  6: '需求',
  7: '工单'
};

// 级联字段是单据的还是项目的type
export const CASCADE_TYPE = {
  PROJECT: 1,
  RECEIPT: 2,
};

// 系统字段和自定义字段
export const FIELD_TYPE = {
  SYSTEM: 1,
  CUSTOM: 2,
};

// 产品协同管理是否修改
export const UPDATE_TYPE = {
  CHANGE: 2,
  NOCHANGE: 1,
};

// 管理工具是否必填
export const REQUIRE_TYPE = {
  REQUIRE: 1,
  NOTREQUIRE: 2,
};

export const ENTERPRISE_MAP = {
  NETEASE: 1,
};
