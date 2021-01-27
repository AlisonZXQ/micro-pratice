import { PROJECT_DATASOURCE, epUrl } from '@shared/ProjectConfig';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { deepCopy } from '@utils/helper';

const setTreeData = (a, projectBasic) => {
  const data = projectBasic || {};
  const projectDetail = data.projectDetail || {};
  const datasource = projectDetail.datasource;
  let arr = deepCopy(a, []);

  const issuesExcludeBug = arr.filter(it => it.issuetype !== '缺陷');
  const issuesBug = arr.filter(it => it.issuetype === '缺陷');
  if (datasource === PROJECT_DATASOURCE.EP) {
    arr = issuesExcludeBug;
  }

  arr.forEach(item => {
    item.children = null;
  });

  let map = {}; // 构建map
  arr.forEach(i => {
    map[i.issueKey] = i; // 构建以key为键 当前数据为值
  });

  let treeData = [];

  arr.forEach(child => {
    const mapItem = map[child.parentKey];
    if (mapItem) {
      mapItem.children = mapItem.children || [];
      mapItem.children.push(child);
    } else {
      treeData.push(child);
    }
  });

  if (datasource === PROJECT_DATASOURCE.EP && issuesBug.length && !treeData.some(it => it.issueKey === 'bugGroup')) {
    treeData.push({
      summary: '缺陷组',
      issueKey: 'bugGroup',
      issuetype: '缺陷',
      children: issuesBug,
    });
  }
  return treeData;
};

const getTitle = (type) => {
  switch (type) {
    case 'story': return '创建需求';
    case 'task': return '创建任务';
    case 'subtask': return '创建子任务';
    case 'version': return '排入版本';
    default: return '';
  }
};

const getList = (plannings) => {
  const list = [];
  plannings && plannings.forEach(it => {
    list.push({
      id: it.id,
      projectId: it.projectId,
      versionVO: it.versionVO,
      isIndependentIssue: it.isIndependentIssue,
      isRelateMilestone: it.isRelateMilestone,
      milestoneName: it.milestoneName || [],
      subProductId: it.subProductId,
      issueRole: it.issueRole || ISSUE_ROLE_VALUE_MAP.READ,
      dwManpower: it.dwManpower,
      ...it.issue,
    });
  });
  return list;
};

const getAllKeys = (plannings) => {
  let arr = getList(plannings);
  let allExpandKeys = [];
  arr.forEach(it => {
    if (it.parentKey && arr.some(i => i.issueKey === it.parentKey) && !allExpandKeys.some(i => i === it.parentKey)) {
      allExpandKeys.push(it.parentKey);
    }
  });
  if (plannings && plannings.some(it => it.issuetype === '缺陷') && !allExpandKeys.includes('bugGroup')) {
    allExpandKeys.push('bugGroup');
  }
  return allExpandKeys;
};

const getEPUrl = (record) => {
  const issueKey = record.issueKey;
  const id = issueKey.split('-')[1];
  const url = epUrl[record.issuetype];
  if (record.issuetype === '子任务') {
    return `${url}-${id}/?subTaskId=1`;
  } else {
    return `${url}-${id}`;
  }
};

const showRemoveFromProject = (record, dataSource) => {
  if (['需求', '故事', '任务'].includes(record.issuetype)) {
    return true;
  } else if (['缺陷'].includes(record.issuetype) && dataSource === PROJECT_DATASOURCE.JIRA) {
    return true;
  } else if (['缺陷'].includes(record.issuetype) && dataSource === PROJECT_DATASOURCE.EP && record.isIndependentIssue) {
    return true;
  } else {
    return false;
  }
};

const processData = (data, stoneName, filterObj) => {
  const { status, summary, issuetype, milestoneName, assignee } = filterObj;
  const name = summary || stoneName;

  const getMileStone = (item) => {
    let flag = false;
    if (milestoneName.includes(1) && milestoneName.includes(2)) {
      flag = true;
    } else if (milestoneName.includes(1) && !milestoneName.includes(2)) {
      if (item.milestoneName && item.milestoneName.length) {
        flag = true;
      }
    } else if (!milestoneName.includes(1) && milestoneName.includes(2) && (!item.milestoneName || (item.milestoneName && !item.milestoneName.length))) {
      flag = true;
    }
    return flag;
  };

  return data && data.filter(item => !status || !status.length || status.includes(item.status))
    .filter(item => !issuetype || !issuetype.length || issuetype.includes(item.issuetype))
    .filter(item => !name || !name.length || item.summary.includes(name))
    .filter(item => !milestoneName || !milestoneName.length ||
      getMileStone(item))
    .filter(item => !assignee || !assignee.length || assignee.includes(item.assignee));
};

export {
  setTreeData,
  getTitle,
  getList,
  getAllKeys,
  getEPUrl,
  showRemoveFromProject,
  processData
};
