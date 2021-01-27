import {
  getAdviseDetail, getRequirementTotal, getRequirementByPage, getRelateRequirement,
  getAdviseHistory
} from '@services/advise';
import { message } from 'antd';

export default {

  namespace: 'advise',

  state: {
    adviseDetail: {},
    reqTotal: 0, // ep来源查询需求总数
    reqList: [], // ep来源查询需求分页
    relateReq: [], // 建议下关联的需求列表
    adviseHistory: [], //建议历史
  },


  effects: {
    *getAdviseDetail({ payload }, { put, call }) {
      try {
        const res = yield call(getAdviseDetail, payload);
        if (res.code !== 200) {
          yield put({ type: 'receipt/saveDrawerIssueId', payload: '' });
          return message.error(res.msg);
        }
        yield put({ type: 'saveAdviseDetail', payload: res.result || {} });
      } catch (e) {
        yield put({ type: 'receipt/saveDrawerIssueId', payload: '' });
        return message.error(`获取建议详情异常，${e || e.message}`);
      }
    },

    *getRequirementTotal({ payload }, { put, call }) {
      try {
        const res = yield call(getRequirementTotal, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveRequirementTotal', payload: res.result });
      } catch (e) {
        return message.error(`获取需求总数异常，${e || e.message}`);
      }
    },

    *getRequirementByPage({ payload }, { put, call }) {
      try {
        const res = yield call(getRequirementByPage, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveRequirementByPage', payload: res.result });
      } catch (e) {
        return message.error(`获取需求分页异常，${e || e.message}`);
      }
    },

    *getRelateRequirement({ payload }, { put, call }) {
      try {
        const res = yield call(getRelateRequirement, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveRelateRequirement', payload: res.result });
      } catch (e) {
        return message.error(`获取关联需求异常，${e || e.message}`);
      }
    },

    *getAdviseHistory({ payload }, { put, call }) {
      try {
        const res = yield call(getAdviseHistory, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveAdviseHistory', payload: res.result });
      } catch (e) {
        return message.error(`获取建议历史异常，${e || e.message}`);
      }
    },
  },

  reducers: {
    saveAdviseDetail(state, action) {
      return {
        ...state,
        adviseDetail: action.payload || {},
      };
    },

    saveRequirementTotal(state, action) {
      return {
        ...state,
        reqTotal: action.payload || 0,
      };
    },

    saveRequirementByPage(state, action) {
      return {
        ...state,
        reqList: action.payload || [],
      };
    },

    saveRelateRequirement(state, action) {
      return {
        ...state,
        relateReq: action.payload || [],
      };
    },

    saveAdviseHistory(state, action) {
      return {
        ...state,
        adviseHistory: action.payload || [],
      };
    }
  },
};
