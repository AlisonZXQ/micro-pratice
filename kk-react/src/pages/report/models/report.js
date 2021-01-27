import {
  getLastDataObj, getSnapshotByPage, getProjectOwnerList, getDatafilter,
  getUserReportPer
} from '@services/report';
import { message } from 'antd';

export default {

  namespace: 'report',

  state: {
    lastDataObj: {},
    snapShotObj: {},
    projectOwnerList: [],
    dataFilter: {},
    currentUserReportPer: {},
    reportPermission: true, // 报告默认有权限
  },

  effects: {
    *getLastDataObj({ payload }, { put, call }) {
      try {
        const res = yield call(getLastDataObj, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveLastDataObj', payload: res.result });
      } catch (e) {
        return message.error(`获取实时数据异常, ${e || e.message}`);
      }
    },

    *getSnapshotByPage({ payload }, { put, call }) {
      try {
        const res = yield call(getSnapshotByPage, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveSnapshotByPage', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getProjectOwnerList({ payload }, { put, call }) {
      try {
        const res = yield call(getProjectOwnerList, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveProjectOwnerList', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getDatafilter({ payload }, { put, call }) {
      try {
        const res = yield call(getDatafilter, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveDatafilter', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getUserReportPer({ payload }, { put, call }) {
      try {
        const res = yield call(getUserReportPer, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveUserReportPer', payload: res.result });
        if (!res.result.hasPermission) {
          yield put({ type: 'saveReportPermission', payload: false });
        }
      } catch (e) {
        return message.error(e || e.message);
      }
    },

  },

  reducers: {
    saveLastDataObj(state, action) {
      return {
        ...state,
        lastDataObj: action.payload || {},
      };
    },

    saveSnapshotByPage(state, action) {
      return {
        ...state,
        snapShotObj: action.payload || {},
      };
    },

    saveProjectOwnerList(state, action) {
      return {
        ...state,
        projectOwnerList: action.payload || [],
      };
    },

    saveDatafilter(state, action) {
      return {
        ...state,
        dataFilter: action.payload || {},
      };
    },

    saveUserReportPer(state, action) {
      return {
        ...state,
        currentUserReportPer: action.payload || {},
      };
    },

    saveReportPermission(state, action) {
      return {
        ...state,
        reportPermission: action.payload || true,
      };
    },

  },
};
