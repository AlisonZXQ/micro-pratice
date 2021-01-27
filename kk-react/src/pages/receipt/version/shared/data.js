export const versionDetail = {
  id: 1,
  name: '版本1',
  startTime: '2010-01-01',
  endTime: '2010-10-01',
  left: 10,
  status: 1,
  versionIssues: [
    {
      id: 1,
      name: '需求1',
      jingban: 'zhangxueqing',
      status: 1,
      jiraUrl: 'http://www.baidu.com',
      todo: [{
        id: 1,
        name: '需求1待处理1',
        status: 1,
        jingban: 'zhangxueqing',
        time: '2020-01-01',
        hour: 0.5,
        parent: {
          id: 10,
          name: '父节点',
          status: 1
        }
      }, {
        id: 2,
        name: '需求1待处理2',
        status: 1,
        jingban: 'zhangxueqing',
        time: '2020-01-01',
        hour: 0.5

      }],
      doing: [{
        id: 3,
        name: '需求1解决中1',
        status: 2,
        jingban: 'zhangxueqing',
        time: '2020-01-01',
        hour: 1
      }, {
        id: 4,
        name: '需求1解决中2',
        status: 2,
        jingban: 'zhangxueqing',
        time: '2020-01-01',
        hour: 1
      }],
      done: [{
        id: 5,
        name: '需求1已完成1',
        status: 3,
        jingban: 'zhangxueqing',
        time: '2020-01-01',
        hour: 2,
        parent: {
          id: 11,
          name: '父节点2333',
          status: 2
        }
      }],
      close: [],
    },
    {
      id: 2,
      name: '需求2222222',
      jingban: 'zhangxueqing',
      status: 2,
      jiraUrl: 'http://www.baidu.com',
      todo: [{
        id: 6,
        name: '需求2待处理1',
        status: 1,
        jingban: 'zhangxueqing',
        time: '2020-01-01',
        hour: 2
      }, {
        id: 7,
        name: '需求2待处理2',
        status: 1,
        jingban: 'zhangxueqing',
        time: '2020-01-01',
        hour: 2
      }],
      doing: [{
        id: 8,
        name: '需求2解决中1',
        status: 2,
        jingban: 'zhangxueqing',
        time: '2020-01-01',
        hour: 3.5
      }],
      done: [],
      close: [{
        id: 9,
        name: '需求2已完成1',
        status: 3,
        jingban: 'zhangxueqing',
        time: '2020-01-01',
        hour: 4
      }],
    },
    {
      id: 3,
      name: '很长很长很长很航很长很长很长很航航很长很长很长很航',
      jingban: 'zhangxueqing',
      status: 3,
      jiraUrl: 'http://www.baidu.com',
      todo: [{
        id: 10,
        name: '需求3待处理1',
        status: 1,
        jingban: 'zhangxueqing',
        time: '2020-01-01',
        hour: 2
      }],
      doing: [{
        id: 11,
        name: '需求3解决中1',
        status: 2,
        jingban: 'zhangxueqing',
        time: '2020-01-01',
        hour: 2
      }],
      done: [],
      close: [{
        id: 12,
        name: '需求3已完成1',
        status: 3,
        jingban: 'zhangxueqing',
        time: '2020-01-01',
        hour: 4
      }],
    }
  ]
}

export const versionFilter = {
  type: [{
    id: 1,
    name: '开始'
  }, {
    id: 2,
    name: '解决中'
  }],
  assign: [{
    id: 1,
    name: '张三'
  }, {
    id: 2,
    name: '李四'
  }]
}

export const requirementFilter = {
  type: [{
    id: 1,
    name: '开始'
  }, {
    id: 2,
    name: '解决中'
  }],
  assign: [{
    id: 1,
    name: '张三'
  }, {
    id: 2,
    name: '李四'
  }]
}

export const requirementList = [{
  id: 1,
  name: '需求1',
  jingban: 'zhangxueqing1',
  date: '2019-09-09',
  status: 1,
}, {
  id: 2,
  name: 'renwu1',
  jingban: 'zhangxueqing1',
  date: '2019-09-09',
  status: 2,
}, {
  id: 3,
  name: 'quexian1',
  jingban: 'zhangxueqing1',
  date: '2019-09-09',
  status: 2,
}, {
  id: 4,
  name: 'hh1',
  jingban: 'zhangxueqing1',
  date: '2019-09-09',
  status: 3,
}, {
  id: 5,
  name: 'oo1',
  jingban: 'zhangxueqing1',
  date: '2019-09-09',
  status: 1,
}, {
  id: 6,
  name: '需求1',
  jingban: 'zhangxueqing1',
  date: '2019-09-09',
  status: 1,
}, {
  id: 7,
  name: 'oo1-7',
  jingban: 'zhangxueqing1',
  date: '2019-09-09',
  status: 1,
}, {
  id: 8,
  name: '需求-8',
  jingban: 'zhangxueqing1',
  date: '2019-09-09',
  status: 1,
}, {
  id: 9,
  name: 'oo-9',
  jingban: 'zhangxueqing1',
  date: '2019-09-09',
  status: 2,
}, {
  id: 10,
  name: '需求-10',
  jingban: 'zhangxueqing1',
  date: '2019-09-09',
  status: 3,
}, {
  id: 11,
  name: 'oo-11',
  jingban: 'zhangxueqing1',
  date: '2019-09-09',
  status: 2,
}, {
  id: 12,
  name: '需求-12',
  jingban: 'zhangxueqing1',
  date: '2019-09-09',
  status: 3,
}, {
  id: 13,
  name: 'oo-11',
  jingban: 'zhangxueqing1',
  date: '2019-09-09',
  status: 2,
}, {
  id: 14,
  name: '需求-12',
  jingban: 'zhangxueqing1',
  date: '2019-09-09',
  status: 3,
}]

export const versionList = [{
  id: 1,
  name: '版本1',
  date: '2019-09-09~2020-10-01',
  status: 2,
}, {
  id: 2,
  name: '版本2',
  date: '2019-09-09~2020-10-01',
  status: 1,
}, {
  id: 3,
  name: '版本3',
  date: '2019-09-09~2020-10-01',
  status: 3,
}, {
  id: 4,
  name: '版本4',
  date: '2019-09-09~2020-10-01',
  status: 1,
}, {
  id: 5,
  name: '版本5',
  date: '2019-09-09~2020-10-01',
  status: 2,
}, {
  id: 6,
  name: '版本6',
  date: '2019-09-09~2020-10-01',
  status: 1,
}, {
  id: 7,
  name: '版本7',
  date: '2019-09-09~2020-10-01',
  status: 3,
}, {
  id: 8,
  name: '版本8',
  date: '2019-09-09~2020-10-01',
  status: 1,
}, {
  id: 9,
  name: '版本9',
  date: '2019-09-09~2020-10-01',
  status: 2,
}]

export const versionSelect = {
  id: 1,
  name: '版本1',
  left: 10,
  startTime: '2020-01-01',
  endTime: '2020-10-01',
  status: 2,
  versionIssues: [{
    id: 1,
    versionId: 1,
    name: '需求1',
    jingban: 'zhangxueqing1',
    date: '2019-09-09',
    status: 1,
    hour: 0.5,
  }, {
    id: 2,
    versionId: 1,
    name: '需求2',
    jingban: 'zhangxueqing1',
    date: '2019-09-09',
    status: 1,
    hour: 1,
  }, {
    id: 3,
    versionId: 1,
    name: '需求3',
    jingban: 'zhangxueqing1',
    date: '2019-09-09',
    status: 1,
    hour: 2,
  }, {
    id: 4,
    versionId: 2,
    name: '需求4444',
    jingban: 'zhangxueqing1',
    date: '2019-09-09',
    status: 2,
    hour: 2,
  }, {
    id: 5,
    versionId: 2,
    name: '需求5555',
    jingban: 'zhangxueqing1',
    date: '2019-09-09',
    status: 2,
    hour: 2,
  }]
}

export const publishVersionCon = [{
  id: 1,
  name: '需求1'
}, {
  id: 2,
  name: '需求2'
}, {
  id: 3,
  name: '需求3'
}, {
  id: 4,
  name: '需求4'
}]
