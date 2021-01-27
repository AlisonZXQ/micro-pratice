/**
 * @description - layout 配置
 */
export const issueManageMenuIds = ['0', '1', '9', '2', '3', '4'];

// 6之前的数据报表
export const menuList = [{
  key: '8',
  name: '需求规划',
  iconType: 'icon-xuqiuguihua',

}, {
  key: '7',
  name: '需求排期',
  iconType: 'icon-xuqiupaiqi',

}, {
  key: '10',
  name: '需求看板',
  iconType: 'icon-xuqiukanban',

}, {
  key: '11',
  name: '时间盒',
  iconType: 'icon-shijianhe',
}, {
  key: '5',
  name: '版本',
  iconType: 'icon-banben2',
}, {
  key: '12',
  name: '工作项',
  iconType: 'icon-gongzuoxiang1',
  children: [{
    key: '0',
    name: '目标',
  }, {
    key: '1',
    name: '建议',
  }, {
    key: '9',
    name: '工单',
  }, {
    key: '2',
    name: '需求',
  }, {
    key: '3',
    name: '任务',
  }, {
    key: '4',
    name: '缺陷',
  }]
}];

export const menuSettingList = [
  {
    key: '1',
    name: '产品配置',
    children: [{
      key: '1-1',
      name: '基本信息',
    }, {
      key: '1-2',
      name: '成员管理',
    }, {
      key: '1-3',
      name: '用户组与权限',
    }, {
      key: '1-4',
      name: '岗位管理',
    }, {
      key: '1-5',
      name: '子产品配置',
    }, {
      key: '1-6',
      name: '单据配置',
    }, {
      key: '1-7',
      name: '标签管理',
    }, {
      key: '1-8',
      name: '通知配置',
    }, {
      key: '1-9',
      name: 'cloudcc配置',
    }, {
      key: '1-10',
      name: '项目模板',
    }]
  }];

export const menuManageList = [
  {
    key: '1',
    name: '平台管理',
    children: [{
      key: '1-1',
      name: '管理员管理',
    }, {
      key: '1-2',
      name: '企业管理',
    }, {
      key: '1-3',
      name: '部门管理',
    }, {
      key: '1-4',
      name: '产品管理',
    }, {
      key: '1-5',
      name: '用户管理',
    }, {
      key: '1-7',
      name: '产品协同管理',
    }, {
      key: '1-6',
      name: '管理工具',
    }]
  }];

export const urlMap = {
  '0': `/manage/productobjective/`,
  '1': `/manage/productadvise/`,
  '2': `/manage/productrequirement/`,
  '3': `/manage/producttask/`,
  '4': `/manage/productbug/`,
  '5': '/manage/version/list',
  '7': '/manage/requirement_schedule/list',
  '8': '/manage/requirement_plan/list',
  '9': '/manage/productticket/',
  '10': '/manage/requirement_board/',
  '11': '/manage/time_box/',
};

export const urlSettingMap = {
  '0-1': `/manage.html#/mydashboard/`,
  '0-2': `/manage.html#/mydashboardhistory/`,

  '1-1': `/product_setting/basic_info`,
  '1-2': `/product_setting/user_manage`,
  '1-3': `/product_setting/user_group`,
  '1-4': `/product_setting/product_role`,
  '1-5': `/product_setting/subProduct`,
  '1-6': `/product_setting/issue_setting`,
  '1-7': `/product_setting/tag_manage`,
  '1-8': `/product_setting/notice_setting`,
  '1-9': `/product_setting/cloudcc_setting`,
  '1-10': `/product_setting/template`,
};

export const urlManageMap = {
  '1-1': `/system_manage/admin/`,
  '1-2': `/system_manage/enterprise/`,
  '1-3': `/system_manage/department/`,
  '1-4': `/system_manage/product/`,
  '1-5': `/system_manage/productuser/`,
  '1-7': `/system_manage/custom_manage/`,
  '1-6': `/system_manage/tool_manage/`,
};

export const issuesUrl = ['productobjective', 'productadvise', 'productrequirement', 'producttask', 'productbug',
  'objectivedetail', 'advisedetail', 'requirementdetail', 'taskdetail', 'bugdetail'
];

export const productSettingUrl = [];

export const systemManageUrl = ['tool'];

export const urlPrefix = {
  issuesUrl: '/manage',
  productSettingUrl: '/product_setting',
  systemManageUrl: '/system_manage',
};

export const staticPagesUrl = ['/', '/v2/', '/v2', '/v2/apply', '/v2/apply/', '/v2/entapply', '/v2/entapply/', '/v2/logout', '/v2/logout/', '/v2/error', '/v2/error/', '/v2/needEmail', '/v2/needEmail/'];

export const oldReceiptDetailArr = ['/manage/requirementdetail', '/manage/advisedetail', '/manage/ticketdetail', '/manage/taskdetail', '/manage/bugdetail', '/manage/objectivedetail', '/manage/ticketdetail'];

export const receiptDetailArr = ['/my_workbench/requirementdetail', '/my_workbench/advisedetail', '/my_workbench/ticketdetail', '/my_workbench/taskdetail', '/my_workbench/bugdetail', '/my_workbench/objectivedetail'];

export const receiptListArr = ['/manage/productrequirement', '/manage/productadvise', '/manage/producttask', '/manage/productbug', '/manage/productobjective', '/manage/productticket'];

export const verionUrlArr = ['/manage/version/list', '/manage/version/detail'];

export const requirement_manage = ['/manage/requirement_schedule/list',
  '/manage/requirement_board', '/manage/time_box', '/manage/requirement_plan/list'];

export const manageUrl = [...receiptListArr, ...receiptDetailArr, ...verionUrlArr, ...requirement_manage];

export const loginPathname = ['/v2', '/v2/', '/'];

export const PRODUCT_MANAGE_MAP = {
  OBJECTIVE: '0',
  ADVISE: '1',
  REQUIREMENT: '2',
  TASK: '3',
  BUG: '4',
  VERSION: '5',
  DATA_REPORT: '6',
  REQUIREMENT_SCHEDULE: '7',
  REQUIREMENT_PLAN: '8',
  TICKET: '9',
  REQUIREMENT_BOARD: '10',
  TIME_BOX: '11',
  RECEIPT_LIST: '12'
};

export const issueDetailValueMap = {
  '/my_workbench/objectivedetail': PRODUCT_MANAGE_MAP.OBJECTIVE,
  '/my_workbench/advisedetail': PRODUCT_MANAGE_MAP.ADVISE,
  '/my_workbench/ticketdetail': PRODUCT_MANAGE_MAP.TICKET,
  '/my_workbench/requirementdetail': PRODUCT_MANAGE_MAP.REQUIREMENT,
  '/my_workbench/taskdetail': PRODUCT_MANAGE_MAP.TASK,
  '/my_workbench/bugdetail': PRODUCT_MANAGE_MAP.BUG,
  '/manage/productobjective': PRODUCT_MANAGE_MAP.OBJECTIVE,
  '/manage/productadvise': PRODUCT_MANAGE_MAP.ADVISE,
  '/manage/productticket': PRODUCT_MANAGE_MAP.TICKET,
  '/manage/productrequirement': PRODUCT_MANAGE_MAP.REQUIREMENT,
  '/manage/producttask': PRODUCT_MANAGE_MAP.TASK,
  '/manage/productbug': PRODUCT_MANAGE_MAP.BUG,
  '/manage/requirement_schedule': PRODUCT_MANAGE_MAP.REQUIREMENT_SCHEDULE,
  '/manage/requirement_plan': PRODUCT_MANAGE_MAP.REQUIREMENT_PLAN,
  '/manage/version': PRODUCT_MANAGE_MAP.VERSION,
  '/manage/requirement_board': PRODUCT_MANAGE_MAP.REQUIREMENT_BOARD,
  '/manage/time_box': PRODUCT_MANAGE_MAP.TIME_BOX,
};

export const receiptList = {
  '0': 'objective',
  '1': 'advise',
  '2': 'requirement',
  '3': 'task',
  '4': 'bug',
};

//白名单灰度功能键
export const ABTEST_FUNCKEY_MAP = {
  'REQUIREMENT_POOL_MANAGE': 'requirement_manage',
  'REQUIREMENT_PLAN_MANAGE': 'requirement_plan',
};

//白名单灰度功能键 对应 名称
export const ABTEST_FUNCKEY_NAME_MAP = {
  'requirement_manage': '需求管理'
};

// 顶部选中类型
export const LAYOUT_HEADER_TYPE_MAP = {
  PROJECT: 1, //项目管理
  PRODUCT: 2, //产品管理
  OTHER: 3, // 其他
  OBJECTIVE: 4, // 目标
};

// 产品管理左侧导航
export const LAYOUT_SIDEBAR_TYPE_MAP = {
  PRODUCT: 1, //产品管理，5类单据菜单
  PRODUCT_SETTING: 2, //产品配置菜单
  SYSTEM_SETTING: 3 //系统管理菜单
};

// 当产品改变时重新push到这些页面改变productid
export const productChangeRelace = ['/manage/requirement_plan/list', '/manage/requirement_schedule/list', '/manage/requirement_board', '/manage/time_box'];
