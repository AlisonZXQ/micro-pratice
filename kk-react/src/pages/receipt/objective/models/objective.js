import { getObjectiveDetail, getProjectObjectiveDetail, getObjectiveHistory, getObjectiveAcceptList } from '@services/objective';
import { message } from 'antd';

export default {

  namespace: 'objective',

  state: {
    objectiveDetail: {},
    objectiveProject: {}, //项目目标下的信息
    objectiveHistory: [], // 目标下的历史
    objectiveIssueRole: 1,
    acceptList: [],
  },

  effects: {
    *getObjectiveDetail({ payload }, { put, call }) {
      try {
        const res = yield call(getObjectiveDetail, payload);
        if (res.code !== 200) {
          yield put({ type: 'receipt/saveDrawerIssueId', payload: '' });
          return message.error(res.msg);
        }
        yield put({ type: 'saveObjectiveDetail', payload: res.result });
      } catch (e) {
        yield put({ type: 'receipt/saveDrawerIssueId', payload: '' });
        return message.error(`获取目标详情异常，${e || e.message}`);
      }
    },

    *getProjectObjectiveDetail({ payload }, { put, call }) {
      try {
        const res = yield call(getProjectObjectiveDetail, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveProjectObjectiveDetail', payload: res.result });
      } catch (e) {
        return message.error(`获取目标验收信息异常，${e || e.message}`);
      }
    },

    *getObjectiveHistory({ payload }, { put, call }) {
      try {
        const res = yield call(getObjectiveHistory, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveObjectiveHistory', payload: res.result });
      } catch (e) {
        return message.error(`获取目标历史信息异常，${e || e.message}`);
      }
    },

    *getObjectiveAcceptList({ payload }, { put, call }) {
      try {
        const res = yield call(getObjectiveAcceptList, payload.id);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveObjectiveAcceptList', payload: res.result });
      } catch (e) {
        return message.error(`获取目标历史信息异常，${e || e.message}`);
      }
    },


  },

  reducers: {
    saveObjectiveDetail(state, action) {
      return {
        ...state,
        objectiveDetail: action.payload || {},
      };
    },

    saveProjectObjectiveDetail(state, action) {
      return {
        ...state,
        objectiveProject: action.payload || {},
      };
    },

    saveObjectiveHistory(state, action) {
      return {
        ...state,
        objectiveHistory: action.payload || {},
      };
    },

    saveObjectiveAcceptList(state, action) {
      return {
        ...state,
        acceptList: action.payload || [],
      };
    },

    saveObjectiveIssueRole(state, action) {
      return {
        ...state,
        objectiveIssueRole: action.payload || 1,
      };
    },

  }
};
