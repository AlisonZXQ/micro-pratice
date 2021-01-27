import { getRequirementPool, getPlanVersion, getVersionDwInfo } from '@services/requirement_pool';
import { message } from 'antd';

export default {

  namespace: 'requirement_pool',

  state: {
    requirementPoolList: [],
    planVersionList: [],
    planVerisonDwInfo: {},
  },

  effects: {
    *getRequirementPool({ payload }, { put, call }) {
      try {
        const res = yield call(getRequirementPool, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveRequirementPool', payload: res.result });
      } catch (e) {
        return message.error(`获取需求池异常，${e || e.message}`);
      }
    },

    *getPlanVersion({ payload }, { put, call }) {
      try {
        const res = yield call(getPlanVersion, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'savePlanVersion', payload: res.result });
      } catch (e) {
        return message.error(`获取排期版本异常，${e || e.message}`);
      }
    },

    *getVersionDwInfo({ payload }, { put, call }) {
      try {
        const res = yield call(getVersionDwInfo, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveVersionDwInfo', payload: res.result });
      } catch (e) {
        return message.error(`获取排期版本异常，${e || e.message}`);
      }
    },

  },

  reducers: {
    saveRequirementPool(state, action) {
      return {
        ...state,
        requirementPoolList: action.payload || [],
      };
    },

    savePlanVersion(state, action) {
      return {
        ...state,
        planVersionList: action.payload || [],
      };
    },

    saveVersionDwInfo(state, action) {
      return {
        ...state,
        planVerisonDwInfo: action.payload || [],
      };
    }
  }
};
