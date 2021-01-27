import { ISSUE_TYPE_MAP } from '@shared/ReceiptConfig';
import { REQUIREMENT_STATUS_MAP } from '@shared/RequirementConfig';
import { setTreeData } from '@utils/helper';

function getDataByIssueType(issueList) {
  const data = setTreeData(issueList, 'issueKey', 'parentIssueKey');

  let requirementObj = {
    issueKey: 'group-feature',
    name: '需求',
    children: null,
  };
  let taskObj = {
    issueKey: 'group-task',
    name: '任务',
    children: null,
  };
  let bugObj = {
    issueKey: 'group-bug',
    name: '缺陷',
    children: null,
  };

  let emptyRequirement = {
    issueKey: 'group-feature-empty',
    name: '暂无数据',
  };

  let emptyTask = {
    issueKey: 'group-task-empty',
    name: '暂无数据',
  };

  let emptyBug = {
    issueKey: 'group-bug-empty',
    name: '暂无数据',
  };

  const requirementChild = data.filter(it => it.issueType === ISSUE_TYPE_MAP.REQUIREMENT) || [];
  const taskChild = data.filter(it => it.issueType === ISSUE_TYPE_MAP.TASK || it.issueType === ISSUE_TYPE_MAP.SUB_TASK) || [];
  const bugChild = data.filter(it => it.issueType === ISSUE_TYPE_MAP.BUG) || [];

  data.forEach(it => {
    let obj = {};
    if (it.issueType === ISSUE_TYPE_MAP.REQUIREMENT) {
      obj = requirementObj;
    }
    if (it.issueType === ISSUE_TYPE_MAP.TASK || it.issueType === ISSUE_TYPE_MAP.SUB_TASK) {
      obj = taskObj;
    }
    if (it.issueType === ISSUE_TYPE_MAP.BUG) {
      obj = bugObj;
    }
    obj.children = obj.children || [];
    obj.children.push(it);
    const estimate = it.dwManpower && it.dwManpower.estimate ? it.dwManpower.estimate : 0;
    obj.estimate += estimate;
    if (it.state === REQUIREMENT_STATUS_MAP.CLOSE) {
      obj.close += 1;
    } else {
      obj.other += 1;
    }
  });

  requirementObj = getChildData(requirementObj, requirementChild);
  taskObj = getChildData(taskObj, taskChild);
  bugObj = getChildData(bugObj, bugChild);
  if (!requirementChild.length) {
    requirementObj.children = [emptyRequirement];
  }
  if (!taskChild.length) {
    taskObj.children = [emptyTask];
  }
  if (!bugChild.length) {
    bugObj.children = [emptyBug];
  }
  return [requirementObj, taskObj, bugObj];
}

function getChildData(newObj, childrenData) {
  newObj.estimate = 0;
  newObj.close = 0;
  newObj.other = 0;

  const getChild = (children) => {
    children.forEach(it => {
      const dwManpower = it.dwManpower || {};
      newObj.estimate += dwManpower.estimate || 0;
      if (it.state === REQUIREMENT_STATUS_MAP.CLOSE) {
        newObj.close += dwManpower.estimate || 0;
      }
      if (it.children) {
        getChild(it.children || []);
      }
    });
  };

  getChild(childrenData || []);
  return newObj;
}

function getDataByUser(issueList) {
  let userData = [];
  issueList.forEach(item => {
    if (item.responseUser && !userData.some(it => it.id === item.responseUser.id)) {
      userData.push({
        ...item.responseUser,
        issueKey: `group-${item.responseUser.id}`,
        children: null,
        estimate: 0,
        close: 0,
        other: 0,
      });
    }
  });

  issueList.forEach(item => {
    const sameUserObj = userData.find(it => it.id === item.responseUser.id) || {};
    sameUserObj.children = sameUserObj.children || [];
    sameUserObj.children.push(item);
    const estimate = item.dwManpower && item.dwManpower.estimate ? item.dwManpower.estimate : 0;
    sameUserObj.estimate += estimate;
    if (item.state === REQUIREMENT_STATUS_MAP.CLOSE) {
      sameUserObj.close += estimate;
    }
  });

  userData.forEach(it => {
    it.children = setTreeData(it.children, 'issueKey', 'parentIssueKey');
  });
  return userData;
}

function getIsGroupRow(record) {
  return record && record.issueKey && record.issueKey.includes('group');
}

function getCurrentBox(timeBoxList, time) {
  return timeBoxList.find(it => it && it.dateList && it.dateList.includes(time)) || {};
}

function getTotalDwm(data) {
  const dataSource = data || [];
  let dwm = {
    estimate: 0,
    close: 0,
    other: 0,
  };
  dataSource.forEach(it => {
    const dwManpower = (it && it.dwManpower) || {};
    dwm.estimate += dwManpower.estimate || 0;
    if (it.state === REQUIREMENT_STATUS_MAP.CLOSE) {
      dwm.close += dwManpower.estimate || 0;
    }
  });
  return dwm;
}

const getBoxStyle = (item) => {
  let style = {};
  const firstDay = item.dateList ? item.dateList[0] : '';
  const lastDay = item.dateList ? item.dateList[item.dateList.length - 1] : '';
  const timeBegin = item.timeBegin;
  const timeEnd = item.timeEnd;

  if (firstDay !== timeBegin) {
    style = {
      ...style,
      borderRadius: '0px 8px 8px 0px',
      borderLeft: 'unset',
    };
  }
  if (lastDay !== timeEnd) {
    style = {
      ...style,
      borderRadius: '8px 0px 0px 8px',
      borderRight: 'unset',
    };
  }
  if (firstDay !== timeBegin && lastDay !== timeEnd) {
    style = {
      ...style,
      borderRadius: '0px',
      borderLeft: 'unset',
      borderRight: 'unset',
    };
  }
  return style;
};

export {
  getDataByIssueType,
  getDataByUser,
  getIsGroupRow,
  getTotalDwm,
  getCurrentBox,
  getBoxStyle
};
