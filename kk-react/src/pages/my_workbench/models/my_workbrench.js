import { getIssueListByPage, getIssueTotalCount, getMyCreateAuditList, getMyCreateAuditProjectList,
  getMyWaitAuditList, getMyWaitAuditProjectList, getMyWaitAuditCount } from '@services/my_workbench';
import { queryProjectList } from '@services/project';
import { message } from 'antd';
import { ADVISE_STATUS_MAP } from '@shared/AdviseConfig';
import { MY_FEEDBACK } from '@shared/WorkbenchConfig';

export default {

  namespace: 'myworkbench',

  state: {
    issueList: [],
    issueTotal: 0,

    projectObj: {},

    createAuditList: [],
    createProjectList: [],

    waitAuditList: [],
    waitProjectList: [],

    adviseCount: 0, // 我负责的/新建状态/建议的/红点数
    auditCount: 0, // 待我审批的个数
  },

  effects: {
    *getIssueListByPage({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getIssueListByPage, payload);
        if (res.code !== 200) return message.error(res.msg);
        const list = res.result; //浅拷贝
        list && list.map(it => {
          if(it.ticket) { //将ticket对象中的key值转为小写
            for(let label in it.ticket){
              if(label === 'expectReleaseTime') {
                it.ticket['expect_releasetime'] = it.ticket[label];
              }else {
                it.ticket[label.toLowerCase()] = it.ticket[label];
              }
            }
          }
        });
        yield put({ type: 'saveIssueListByPage', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getIssueTotalCount({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getIssueTotalCount, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveIssueTotalCount', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *queryProjectList({ payload }, { put, call, fork }) {
      try {
        const res = yield call(queryProjectList, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveProjectList', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getMyCreateAudit({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getMyCreateAuditList, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveMyCreateAudit', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getMyCreateAuditProject({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getMyCreateAuditProjectList, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveMyCreateProject', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getMyWaitAudit({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getMyWaitAuditList, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveMyWaitAudit', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getMyWaitAuditProject({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getMyWaitAuditProjectList, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveMyWaitAuditProject', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getAdviseCount({ payload }, { put, call, fork }) {
      try {
        const params = {
          filtertype: 1,
          state: [ADVISE_STATUS_MAP.NEW, ADVISE_STATUS_MAP.REOPEN],
          type: MY_FEEDBACK,
        };
        const res = yield call(getIssueTotalCount, params);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveAdviseCount', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getMyWaitAuditCount({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getMyWaitAuditCount);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveMyWaitAuditCount', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },
  },

  reducers: {
    saveIssueListByPage(state, action) {
      return {
        ...state,
        issueList: action.payload || [],
      };
    },

    saveIssueTotalCount(state, action) {
      return {
        ...state,
        issueTotal: action.payload || 0,
      };
    },

    saveProjectList(state, action) {
      return {
        ...state,
        projectObj: action.payload || {},
      };
    },

    saveMyCreateAudit(state, action) {
      return {
        ...state,
        createAuditList: action.payload || [],
      };
    },

    saveMyCreateProject(state, action) {
      return {
        ...state,
        createProjectList: action.payload || [],
      };
    },

    saveMyWaitAudit(state, action) {
      return {
        ...state,
        waitAuditList: action.payload || [],
      };
    },

    saveMyWaitAuditProject(state, action) {
      return {
        ...state,
        waitProjectList: action.payload || [],
      };
    },

    saveAdviseCount(state, action) {
      return {
        ...state,
        adviseCount: action.payload || 0,
      };
    },

    saveMyWaitAuditCount(state, action) {
      return {
        ...state,
        auditCount: action.payload || 0,
      };
    },
  },
};
