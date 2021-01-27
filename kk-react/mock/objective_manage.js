
const listData = [{
  id: 1,
  name: '我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一我是个目标一',
  department: [{
    id: 1,
    name: '杭州研究院'
  }, {
    id: 2,
    name: '技术工程事业部'
  }, {
    id: 3,
    name: '项目管理与效能中心'
  }, {
    id: 4,
    name: '工程效能组'
  }],
  level: 1,
  dueDate: '2020-10-20',
  responseUser: {
    id: 1,
    name: '张雪晴',
    email: 'zhangxueqing01@corp.netease.com'
  },
  keyResult: [{
    id: 1,
    name: '我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1我是目标1的KR1'
  }, {
    id: 2,
    name: '我是目标1的KR2'
  }],
  projectVO: {
    id: 1,
    name: '我是个项目',
  },
  parentObjectiveVO: {
    id: 2,
    name: '我是上一级目标',
  }
}, {
  id: 2,
  name: '我是个目标二',
  department: [{
    id: 1,
    name: '杭州研究院'
  }, {
    id: 2,
    name: '技术工程事业部'
  }, {
    id: 3,
    name: '项目管理与效能中心'
  }, {
    id: 4,
    name: '工程效能组'
  }],
  level: 1,
  dueDate: '2020-10-20',
  responseUser: {
    id: 1,
    name: '张雪晴',
    email: 'zhangxueqing01@corp.netease.com'
  },
  keyResult: [],
  productVO: {
    id: 1,
    name: '我是个产品',
  },
}, {
  id: 3,
  name: '我是个目标三',
  department: [{
    id: 1,
    name: '杭州研究院'
  }, {
    id: 2,
    name: '技术工程事业部'
  }, {
    id: 3,
    name: '项目管理与效能中心'
  }, {
    id: 4,
    name: '工程效能组'
  }],
  level: 1,
  dueDate: '2020-10-20',
  responseUser: {
    id: 1,
    name: '张雪晴',
    email: 'zhangxueqing01@corp.netease.com'
  },
  keyResult: [{
    id: 1,
    name: '我是目标3的KR1'
  }, {
    id: 2,
    name: '我是目标3的KR2'
  }],
  projectId: 1,
  productId: 1,
}, {
  id: 4,
  name: '我是个目标四',
  department: [{
    id: 1,
    name: '杭州研究院'
  }, {
    id: 2,
    name: '技术工程事业部'
  }, {
    id: 3,
    name: '项目管理与效能中心'
  }, {
    id: 4,
    name: '工程效能组'
  }],
  level: 1,
  dueDate: '2020-10-20',
  responseUser: {
    id: 1,
    name: '张雪晴',
    email: 'zhangxueqing01@corp.netease.com'
  },
  keyResult: [{
    id: 1,
    name: '我是目标4的KR1'
  }, {
    id: 2,
    name: '我是目标4的KR2'
  }],
  projectId: 1,
  productId: 1,
}, {
  id: 5,
  name: '我是个目标五',
  department: [{
    id: 1,
    name: '杭州研究院'
  }, {
    id: 2,
    name: '技术工程事业部'
  }, {
    id: 3,
    name: '项目管理与效能中心'
  }, {
    id: 4,
    name: '工程效能组'
  }],
  level: 1,
  dueDate: '2020-10-20',
  responseUser: {
    id: 1,
    name: '张雪晴',
    email: 'zhangxueqing01@corp.netease.com'
  },
  keyResult: [{
    id: 1,
    name: '我是目标5的KR1'
  }, {
    id: 2,
    name: '我是目标5的KR2'
  }],
  projectId: 1,
  productId: 1,
}];

const mapData = [{
  projectId: '100',
  id: 'Objective-586',
  issueKey: "Objective-586",
  parentIssueKey: 'Objective-hidden0',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "一级部门目标1",
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  column: 1,
  dueDate: '2020-10-10',
  keyResult: [{
    id: 1,
    name: '我是关键结果1'
  }, {
    id: 2,
    name: '我是关键结果2'
  }, {
    id: 3,
    name: '我是关键结果3'
  }],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-4',
  issueKey: "Objective-4",
  parentIssueKey: 'Objective-586',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "二级部门目标1",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 2,
  dueDate: '2020-10-10',
  keyResult: [],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-3',
  issueKey: "Objective-3",
  parentIssueKey: 'Objective-586',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "二级部门目标2",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 2,
  dueDate: '2020-10-10',
  keyResult: [],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-31',
  issueKey: "Objective-31",
  parentIssueKey: 'Objective-586',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "二级部门目标12",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 2,
  dueDate: '2020-10-10',
  keyResult: [],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-7',
  issueKey: "Objective-7",
  parentIssueKey: 'Objective-3',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "三级部门目标7",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 3,
  dueDate: '2020-10-10',
  keyResult: [],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-71',
  issueKey: "Objective-71",
  parentIssueKey: 'Objective-3',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "三级部门目标71",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 3,
  dueDate: '2020-10-10',
  keyResult: [],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-8',
  issueKey: "Objective-8",
  parentIssueKey: 'Objective-7',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "四级部门目标8",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 4,
  dueDate: '2020-10-10',
  keyResult: [{
    id: 1,
    name: '我是关键结果1'
  }, {
    id: 2,
    name: '我是关键结果2'
  }, {
    id: 3,
    name: '我是关键结果3'
  }],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-81',
  issueKey: "Objective-81",
  parentIssueKey: 'Objective-7',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "四级部门目标81",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 4,
  dueDate: '2020-10-10',
  keyResult: [],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  productId: '100',
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-2',
  issueKey: "Objective-2",
  parentIssueKey: 'Objective-hidden0',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "一级部门目标2",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 1,
  dueDate: '2020-10-10',
  keyResult: [],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-5',
  issueKey: "Objective-5",
  parentIssueKey: 'Objective-2',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "二级部门目标5",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 2,
  dueDate: '2020-10-10',
  keyResult: [],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-6',
  issueKey: "Objective-6",
  parentIssueKey: 'Objective-2',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "二级部门目标6",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 2,
  dueDate: '2020-10-10',
  keyResult: [],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-1111',
  issueKey: "Objective-1111",
  parentIssueKey: 'Objective-hidden0',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "一级零散目标一",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 1,
  dueDate: '2020-10-10',
  keyResult: [],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-111',
  issueKey: "Objective-111",
  parentIssueKey: 'Objective-hidden1',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "二级零散目标一",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 2,
  dueDate: '2020-10-10',
  keyResult: [],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-12',
  issueKey: "Objective-12",
  parentIssueKey: 'Objective-hidden2',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "三级零散目标一",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 3,
  dueDate: '2020-10-10',
  keyResult: [],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-110',
  issueKey: "Objective-110",
  parentIssueKey: 'Objective-hidden3',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "四级零散目标一",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 4,
  dueDate: '2020-10-10',
  keyResult: [],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}, {
  bugCount: 0,
  dwManpower: {},
  id: 'Objective-114',
  issueKey: "Objective-114",
  parentIssueKey: 'Objective-hidden3',
  issueRole: 1,
  issueType: 5,
  level: 3,
  name: "四级零散目标二",
  requirementCount: 5,
  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
  state: 1,
  taskCount: 1,
  column: 4,
  dueDate: '2020-10-10',
  keyResult: [],
  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
}];

export default {
  '/api/getObjectiveList': {
    code: 200,
    message: 'success',
    result: listData,
  },

  '/api/getObjectiveMap': {
    code: 200,
    message: 'success',
    result: mapData,
  }
};
