import { deepCopy } from '@utils/helper';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';

const setTreeData = (a) => {
  let arr = deepCopy(a, []);

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

  return treeData;
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
      workloadVO: it.workloadVO,
      ...it.issue,
    });
  });
  return list;
};

export {
  setTreeData,
  getList
};
