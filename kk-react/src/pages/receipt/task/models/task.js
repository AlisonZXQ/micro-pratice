import { getTaskDetail, getRelateReq, getTaskHistory, getTaskDetailWithoutRole } from '@services/task';
import { message } from 'antd';

export default {

  namespace: 'task',

  state: {
    taskDetail: {},
    relateReq: [],
    taskHistory: [],
    taskDetailWithoutRole: {},
  },

  effects: {
    *getTaskDetail({ payload }, { put, call }) {
      try {
        const res = yield call(getTaskDetail, payload);
        if (res.code !== 200) {
          yield put({ type: 'receipt/saveDrawerIssueId', payload: '' });
          return message.error(res.msg);
        }
        yield put({ type: 'saveTaskDetail', payload: res.result });
      } catch (e) {
        yield put({ type: 'receipt/saveDrawerIssueId', payload: '' });
        return message.error(`获取任务详情异常，${e || e.message}`);
      }
    },

    *getTaskDetailWithoutRole({ payload }, { put, call }) {
      try {
        const res = yield call(getTaskDetailWithoutRole, payload);
        if (res.code !== 200) {
          return message.error(res.msg);
        }
        yield put({ type: 'saveTaskDetailWithoutRole', payload: res.result });
      } catch (e) {
        return message.error(`获取任务详情异常，${e || e.message}`);
      }
    },

    *getRelateReq({ payload }, { put, call }) {
      try {
        const res = yield call(getRelateReq, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveRelateReq', payload: res.result });
      } catch (e) {
        return message.error(`获取关联的需求异常，${e || e.message}`);
      }
    },

    *getTaskHistory({ payload }, { put, call }) {
      try {
        const res = yield call(getTaskHistory, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveTaskHistory', payload: res.result });
      } catch (e) {
        return message.error(`获取关联的任务异常，${e || e.message}`);
      }
    },
  },

  reducers: {
    saveTaskDetail(state, action) {
      return {
        ...state,
        taskDetail: action.payload || {},
      };
    },

    saveTaskDetailWithoutRole(state, action) {
      return {
        ...state,
        taskDetailWithoutRole: action.payload || {},
      };
    },

    saveRelateReq(state, action) {
      return {
        ...state,
        relateReq: action.payload || [],
      };
    },

    saveTaskHistory(state, action) {
      return {
        ...state,
        taskHistory: action.payload || [],
      };
    },
  }
};
