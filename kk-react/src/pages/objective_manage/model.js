
import { getObjectiveList, getObjectiveMap } from '@services/objective_manage';
import { message } from 'antd';
import { deepCopy, setTreeData } from '@utils/helper';

export default {

  namespace: 'objectiveManage',

  state: {
    objectiveList: [],
    objectiveMap: {},
  },

  effects: {
    *getObjectiveList({ payload }, { put, call }) {
      try {
        const res = yield call(getObjectiveList, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveObjectiveList', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getObjectiveMap({ payload }, { put, call }) {
      try {
        const res = yield call(getObjectiveMap, payload);
        if (res.code !== 200) return message.error(res.msg);

        const getData = () => {
          const newData = res.result || [];
          newData.forEach(item => {
            item.id = `Orgobjective-${item.id}`;
            item.department = item.department || [];
            item.column = item.department.length;

            if (!item.parentIssueKey ||
              (item.parentIssueKey && !newData.some(it => it.issueKey === item.parentIssueKey))) {
              item.parentIssueKey = `Objective-hidden${item.column - 1}`;
            }

          });
          return newData;
        };

        const hiddenLevelData = [{
          bugCount: 0,
          dwManpower: {},
          id: 'Objective-hidden0',
          issueKey: "Objective-hidden0",
          issueRole: 1,
          issueType: 5,
          level: 3,
          name: "大boss",
          requirementCount: 5,
          responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
          state: 1,
          taskCount: 1,
          column: 0,
          dueDate: '2020-10-10',
          keyResult: [],
          department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
          children: data,
        }, {
          projectId: '100',
          id: 'Objective-hidden1',
          issueKey: "Objective-hidden1",
          parentIssueKey: 'Objective-hidden0',
          issueRole: 1,
          issueType: 5,
          level: 3,
          name: "hidden1",
          responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
          state: 1,
          column: 1,
          dueDate: '2020-10-10',
          keyResult: [],
          department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
        }, {
          bugCount: 0,
          dwManpower: {},
          id: 'Objective-hidden2',
          issueKey: "Objective-hidden2",
          parentIssueKey: 'Objective-hidden1',
          issueRole: 1,
          issueType: 5,
          level: 3,
          name: "hidden2",
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
          id: 'Objective-hidden3',
          issueKey: "Objective-hidden3",
          parentIssueKey: 'Objective-hidden2',
          issueRole: 1,
          issueType: 5,
          level: 3,
          name: "hidden3",
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
          id: 'Objective-hidden4',
          issueKey: "Objective-hidden4",
          parentIssueKey: 'Objective-hidden3',
          issueRole: 1,
          issueType: 5,
          level: 3,
          name: "hidden41",
          requirementCount: 5,
          responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
          state: 1,
          taskCount: 1,
          column: 4,
          dueDate: '2020-10-10',
          keyResult: [],
          department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
        }];

        const hejiData = [...getData(), ...hiddenLevelData];

        const newHeji = [...hejiData];
        newHeji.forEach(item => {
          if (item.parentIssueKey) {
            const parent = newHeji.find(it => it.issueKey === item.parentIssueKey);
            // 非连续上下级
            if (parent && item.column - 1 !== parent.column) {
              // 假如4级连接1级
              for (let i = item.column - 1; i > parent.column; i--) {
                newHeji.push({
                  id: `Objective-virtual${item.issueKey}-${i}`,
                  issueKey: `Objective-virtual${item.issueKey}-${i}`,
                  parentIssueKey: i === parent.column + 1 ? parent.issueKey : `Objective-virtual${item.issueKey}-${i - 1}`,
                  level: 3,
                  name: `为了${item.issueKey}存在的虚拟节点---${i}`,
                  responseUser: { id: 122, name: "牛盼盼", email: "wb.niupanpan@mesg.corp.netease.com", department: "" },
                  state: 1,
                  column: i,
                  dueDate: '2020-10-10',
                  keyResult: [],
                  department: ['杭州研究院', '技术工程事业部', '项目管理与效能中心', '工程效能组'],
                  children: data,
                });
              }
              item.parentIssueKey = `Objective-virtual${item.issueKey}-${item.column - 1}`;
            }
          }
        });

        const data = setTreeData(newHeji, 'issueKey', 'parentIssueKey').find(it => it.issueKey === 'Objective-hidden0');

        yield put({ type: 'saveObjectiveMap', payload: data || {} });
      } catch (e) {
        return message.error(e || e.message);
      }
    },
  },

  reducers: {
    saveObjectiveList(state, action) {
      return {
        ...state,
        objectiveList: action.payload || [],
      };
    },

    saveObjectiveMap(state, action) {
      return {
        ...state,
        objectiveMap: action.payload || {},
      };
    }
  }
};
