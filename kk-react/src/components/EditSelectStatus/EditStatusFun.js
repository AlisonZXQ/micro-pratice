import {
  bugTaskStatusChange, aimStatusChangeResponseAndReport, aimStatusChangeConfirm, aimStatusChangeAll,
  adviseStatusChangeResponse, adviseStatusChangeReport, adviseStatusChangeAll, adviseStatusChangeRequire, requirementStatusChange,
  requirementNameMap, requirementColorDotMap,
  bugTaskNameMap, bugTaskColorDotMap,
  aimNameMap, aimColorDotMap,
  adviseNameMap, adviseColorDotMap,
  ticketNameMap, ticketColorDotMap,
} from '@shared/CommonConfig';

const getObjectiveUserType = (currentUserType) => {
  let userType = "负责人";
  if (currentUserType.length === 1) {
    userType = currentUserType[0];
  } else if (currentUserType.length === 3) {
    userType = "三种角色";
  } else if (currentUserType.length === 2 && !currentUserType.includes('验证人')) {
    userType = "负责人";
  } else {
    userType = "三种角色";
  }
  return userType;
};

const getAdviseTicketUserType = (currentUserType) => {
  let userType = "负责人";
  if (currentUserType.length === 1) {
    userType = currentUserType[0];
  } else if (currentUserType.length === 2 && !currentUserType.includes('报告人')) {
    userType = "负责人";
  } else if (currentUserType.length === 2 && !currentUserType.includes('负责人')) {
    userType = "报告人";
  } else {
    userType = "三种角色";
  }
  return userType;
};


const nameMap = {
  'requirement': requirementNameMap,
  'objective': aimNameMap,
  'task': bugTaskNameMap,
  'bug': bugTaskNameMap,
  'advise': adviseNameMap,
  'ticket': ticketNameMap,
};

const colorMap = {
  'requirement': requirementColorDotMap,
  'objective': aimColorDotMap,
  'task': bugTaskColorDotMap,
  'bug': bugTaskColorDotMap,
  'advise': adviseColorDotMap,
  'ticket': ticketColorDotMap,
};

const objectiveDiffRolesChangeAction = {
  "报告人": aimStatusChangeResponseAndReport,
  "负责人": aimStatusChangeResponseAndReport,
  "验证人": aimStatusChangeConfirm,
  "三种角色": aimStatusChangeAll,
};

const adviseAndTicketDiffRolesChangeAction = {
  "报告人": adviseStatusChangeReport,
  "负责人": adviseStatusChangeResponse,
  "验证人": adviseStatusChangeRequire,
  "三种角色": adviseStatusChangeAll,
};

const changeMap = {
  'requirement': requirementStatusChange,
  'task': bugTaskStatusChange,
  'bug': bugTaskStatusChange,
};

const getChangeData = (type, currentUserType, value) => {
  let data = [];
  if (type === 'objective') {
    data = objectiveDiffRolesChangeAction[getObjectiveUserType(currentUserType)][value];
  } else if (type === 'advise' || type === 'ticket') {
    data = adviseAndTicketDiffRolesChangeAction[getAdviseTicketUserType(currentUserType)][value];
  } else {
    data = changeMap[type][value];
  }
  return data;
};

export {
  getObjectiveUserType,
  getAdviseTicketUserType,
  adviseAndTicketDiffRolesChangeAction,
  objectiveDiffRolesChangeAction,
  changeMap,
  nameMap,
  colorMap,
  getChangeData
};
