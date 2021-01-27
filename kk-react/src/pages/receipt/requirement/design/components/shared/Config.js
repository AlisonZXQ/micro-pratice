export const typeDes = {
  1: '涉及前后端交互操作的产品功能、活动页面等，及有复杂信息层级的页面设计；',
  2: '用于推广宣传的线上或线下视觉资源，一般只涉及前端展示，不涉及后端交互；',
  3: '品牌相关的logo/VI/线上线下规范设计/物料设计等；',
  4: '商品详情页设计；',
  5: '包括商品包装、印刷品等；',
  6: '包含商品的拍摄、修图、视频、剪辑等；',
};

export const typeTitle = {
  1: '产品设计定义：',
  2: '推广设计定义：',
  3: '品牌设计定义：',
  4: '详情页设计定义：',
  5: '包装设计定义：',
  6: '摄影定义：',
};

export const plainOptions = {
  1: '产品设计',
  2: '推广设计',
  3: '品牌设计',
  4: '详情页设计',
  5: '包装设计',
  6: '摄影'
};

export const fuzadu = [{
  id: 1,
  type: 'historyLogic',
  name: '历史耦合逻辑',
  tip: '该需求对现有的其他功能或模块的影响程度',
  des: {
    1: '完全不耦合',
    2: '少量耦合',
    3: '50%耦合',
    4: '大量耦合',
    5: '完全耦合',
  }
}, {
  id: 2,
  type: 'platformNum',
  name: '平台数',
  tip: '该需求涉及到的平台数量，比如小程序、h5、pc端，甚至其他设备等',
  des: {
    1: '1个',
    2: '2个',
    3: '3个',
    4: '4个',
    5: '5个及以上',
  }
}, {
  id: 3,
  type: 'processDepth',
  name: '流程长度',
  tip: '该需求的流程节点数量，当有多个流程时取平均数',
  des: {
    1: '极短-3个以内节点完成',
    2: '短-3-7个节点完成',
    3: '正常-7-10个节点完成',
    4: '长-10-15个节点完成',
    5: '非常长-15个以上节点完成',
  }
}, {
  id: 4,
  type: 'cases',
  name: '场景用例',
  tip: '该需求可能要处理的场景情况数量，比如各种异常场景',
  des: {
    1: '极少-10个以下',
    2: '少-11-30个',
    3: '正常-31-50个',
    4: '多-51-70个',
    5: '极多-70个以上',
  }
}];

export const importantRate = {
  1: ['1、战略新产品或功能设计需求', '2、决定产品生死的，系统、框架、优化型的设计需求', '3、影响千万级以上的UV(每日)', '4、影响千万级以上的营收', '5、市场投入预算在100万以上', '6、一级部门负责人以上的需求', '7、特大型会议、发布会、里程碑等设计需求'],
  2: ['1、非决定业务生死的，但严重影响业务发展的，高级、复杂、优化型的设计需求', '2、影响百万级以上、千万级以下的UV(每日)', '3、影响百万级以上、千万级以下的营收', '4、市场投入预算在20万-100万之间', '5、中型会议、发布会等设计需求'],
  3: ['1、对业务发展影响有限的，基础、补全、优化型的设计需求', '2、影响百万级以上、千万级以下的UV(每日)', '3、影响百万级以上、千万级以下的营收', '4、市场投入预算在1万-20万之间', '5、小型会议、发布会等设计需求'],
  4: ['1、几乎不影响业务发展的，零星调整或完善的设计需求', '2、影响用户和营收有限，都在百万之下', '3、几乎无市场投入预算'],
  5: ['建议使用自助制图等工具完成，不建议申请设计资源'],
};

export const importantTitle = {
  1: 'S级需求定义：',
  2: 'A级需求定义：',
  3: 'B级需求定义：',
  4: 'C级需求定义：',
  5: 'D级需求定义：',
};

export const spreadRate = {
  1: 'banner/资源位',
  2: 'H5',
  3: '活动页/主视觉/功能模块',
  4: '物料设计',
  5: '直邮/贺卡/信函',
  6: 'PPT优化',
};

export const dengji = {
  1: 'S',
  2: 'A',
  3: 'B',
  4: 'C',
  5: 'D',
};

export const platFormObj = {
  1: '移动端',
  2: 'WEB端',
  3: '小程序',
  4: 'H5',
  5: '桌面端',
  6: '线下',
  7: '其他'
};

export const data = {
  content: "需求内容",
  describe: "<p>需求描述</p>",
  extraFile: [{
    name: "Test.java",
    suffix: "java",
    url: "http://overmind-test.nos-jd.163yun.com/8cb1c869df4342c2b024b09e0cb27cb2.java",
    id: "c274a234-3728-417b-a01b-a018fae1a45b",
  }],
  platform: [1],
  priority: 1,
  dueDate: "2020-03-24",
  responseId: 2,
  responseUser: { id: 2, nick: "zhangxueqing01", realname: "张雪晴", email: "zhangxueqing01@corp.netease.com" },
  designType: 1,
  pageNum: 10,
  historyLogic: 3,
  platformNum: 1,
  processDepth: 3,
  cases: 3,
  INTERACTION: "cheked",
  interId: 2,
  interUser: { id: 2, nick: "zhangxueqing01", realname: "张雪晴", email: "zhangxueqing01@corp.netease.com" },
  VISION: "cheked",
  visionId: 2,
  visionUser: { id: 2, nick: "zhangxueqing01", realname: "张雪晴", email: "zhangxueqing01@corp.netease.com" },
  remark: "10",
};

export const commonType = ['name', 'description', 'extraFile', 'platform', 'extraText', 'priority', 'dueDate', 'responseId', 'responseUser'];
export const diffType = {
  designType1: ['designType', 'pageNum1', 'historyLogic', 'platformNum', 'processDepth', 'cases', 'INTERACTION', 'interId', 'interUser', 'VISION', 'visionId1', 'visionUser1', 'remark1', 'assignType', ...commonType],
  designType2: ['designType', 'pageNum2', 'expandType', 'size', 'designDemand2', 'grade2', 'visionId2', 'visionUser2', 'remark2', 'addSize', 'selectSize', ...commonType],
  designType3: ['designType', 'pageNum3', 'designDemand3', 'grade3', 'visionId3', 'visionUser3', 'remark3', ...commonType],
  designType4: ['designType', 'pageNum4', 'designDemand4', 'grade4', 'visionId4', 'visionUser4', 'remark4', ...commonType],
  designType5: ['designType', 'pageNum5', 'designDemand5', 'grade5', 'visionId5', 'visionUser5', 'remark5', ...commonType],
  designType6: ['designType', 'pageNum6', 'designDemand6', 'grade6', 'visionId6', 'visionUser6', 'remark6', ...commonType],
};
