import { getRiskList, getResponseUserList, getCreateUserList, getRiskAll } from '@services/risk';
import { getTaskDetail } from '@services/task';
import { message } from 'antd';

export default {

  namespace: 'risk',

  state: {
    riskObj: {}, // 风险列表分页获取
    riskAll: [], // 全量风险
    responseUserList: [],
    createUserList: [],

    taskDetail: {},
  },


  effects: {
    *getTaskDetail({ payload }, { put, call }) {
      try {
        const res = yield call(getTaskDetail, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveTaskDetail', payload: res.result });
      } catch (e) {
        return message.error(`获取任务详情异常，${e || e.message}`);
      }
    },

    *getRiskList({ payload }, { put, call }) {
      try {
        const res = yield call(getRiskList, payload);
        if (res.code !== 200) return message.error(`获取风险列表失败, ${res.msg}`);
        yield put({ type: 'saveRiskList', payload: res.result });
      } catch(e) {
        return message.error(`获取风险列表异常，${e || e.message}`);
      }
    },

    *getRiskAll({ payload }, { put, call }) {
      try {
        const res = yield call(getRiskAll, payload);
        if (res.code !== 200) return message.error(`获取风险列表失败, ${res.msg}`);
        yield put({ type: 'saveRiskAll', payload: res.result });
      } catch(e) {
        return message.error(`获取风险列表异常，${e || e.message}`);
      }
    },

    *getResponseUserList({ payload }, { put, call }) {
      try {
        const res = yield call(getResponseUserList);
        if (res.code !== 200) return message.error(`获取风险负责人列表失败，${res.msg}`);
        yield put({ type: 'saveResponseUserList', payload: res.result });
      } catch(e) {
        return message.error(`获取风险负责人列表失败，${e || e.message}`);
      }
    },

    *getCreateUserList({ payload }, { put, call }) {
      try {
        const res = yield call(getCreateUserList);
        if (res.code !== 200) return message.error(`获取风险创建人列表失败，${res.msg}`);
        yield put({ type: 'saveCreateUserList', payload: res.result });
      } catch(e) {
        return message.error(`获取风险创建人列表失败，${e || e.message}`);
      }
    }
  },

  reducers: {
    saveRiskList(state, action) {
      return {
        ...state,
        riskObj: action.payload || {},
      };
    },

    saveRiskAll(state, action) {
      return {
        ...state,
        riskAll: action.payload || [],
      };
    },

    saveResponseUserList(state, action) {
      return {
        ...state,
        responseUserList: action.payload || []
      };
    },

    saveCreateUserList(state, action) {
      return {
        ...state,
        createUserList: action.payload || []
      };
    },

    saveTaskDetail(state, action) {
      return {
        ...state,
        taskDetail: action.payload || {},
      };
    },
  },
};
