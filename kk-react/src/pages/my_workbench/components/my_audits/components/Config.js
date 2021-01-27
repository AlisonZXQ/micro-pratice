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

export const orderFieldData = [
  { name: '申请时间', key: 1 },
  { name: '操作时间', key: 2 },
];

export const orderByMap = {
  1: 'create_time',
  2: 'update_time'
};

export const orderData = [
  { name: '升序', key: 1 },
  { name: '降序', key: 2 },
];

export const orderTypeMap = {
  1: 'asc',
  2: 'desc'
};
