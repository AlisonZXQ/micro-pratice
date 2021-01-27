import { getRequirementPlanList, getRequirementPlanDate, getRequirementPlanMap, getUnLinkedList } from '@services/requirement_plan';
import { message } from 'antd';

export default {

  namespace: 'requirementPlan',

  state: {
    planList: [],
    planDate: [],
    planMap: {},
    unLinkedObj: {},

    jumpId: 0,
  },

  effects: {
    *getRequirementPlanList({ payload }, { put, call }) {
      try {
        const res = yield call(getRequirementPlanList, payload);
        if (res.code !== 200) {
          return message.error(res.msg);
        }
        yield put({ type: 'saveRequirementPlanList', payload: res.result || [] });
      } catch (e) {
        return message.error(`获取需求规划列表异常，${e || e.message}`);
      }
    },

    *getRequirementPlanDate({ payload }, { put, call }) {
      try {
        const res = yield call(getRequirementPlanDate, payload);
        if (res.code !== 200) {
          return message.error(res.msg);
        }
        yield put({ type: 'saveRequirementPlanDate', payload: res.result || [] });

      } catch (e) {
        return message.error(`获取需求规划日历异常，${e || e.message}`);
      }
    },

    *getRequirementPlanMap({ payload }, { put, call }) {
      try {
        const res = yield call(getRequirementPlanMap, payload);
        if (res.code !== 200) {
          return message.error(res.msg);
        }
        yield put({ type: 'saveRequirementPlanMap', payload: res.result || {} });
      } catch (e) {
        return message.error(`获取需求规划日历异常，${e || e.message}`);
      }
    },

    *getUnLinkedList({ payload }, { put, call }) {
      try {
        const res = yield call(getUnLinkedList, payload);
        if (res.code !== 200) {
          return message.error(res.msg);
        }
        yield put({ type: 'savetUnLinkedList', payload: res.result || {} });
      } catch (e) {
        return message.error(`获取为规划需求异常，${e || e.message}`);
      }
    },
  },

  reducers: {
    saveRequirementPlanList(state, action) {
      return {
        ...state,
        planList: action.payload || [],
      };
    },

    saveRequirementPlanDate(state, action) {
      return {
        ...state,
        planDate: action.payload || [],
      };
    },

    saveRequirementPlanMap(state, action) {
      return {
        ...state,
        planMap: action.payload || {},
      };
    },

    savetUnLinkedList(state, action) {
      return {
        ...state,
        unLinkedObj: action.payload || {},
      };
    },

    saveJumpId(state, action){
      return {
        ...state,
        jumpId: action.payload || 0,
      };
    }
  }
};
