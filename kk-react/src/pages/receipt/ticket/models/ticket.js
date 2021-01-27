import {
  getRequirementTotal, getRequirementByPage, getRelateRequirement,
} from '@services/advise';
import {
  getTicketDetail, getTicketHistory
} from '@services/ticket';
import { message } from 'antd';

export default {

  namespace: 'ticket',

  state: {
    ticketDetail: {},
    reqTotal: 0, // ep来源查询需求总数
    reqList: [], // ep来源查询需求分页
    relateReq: [], // 建议下关联的需求列表
    ticketHistory: [], //工单历史
  },


  effects: {
    *getTicketDetail({ payload }, { put, call }) {
      try {
        const res = yield call(getTicketDetail, payload);
        if (res.code !== 200) {
          yield put({ type: 'receipt/saveDrawerIssueId', payload: '' });
          return message.error(res.msg);
        }
        const list = res.result.ticketCustomFieldRelationInfoList; //浅拷贝
        list && list.map(it => {
          for(let label in it.ticketCustomFieldRelation){
            it.ticketCustomFieldRelation[label.toLowerCase()] = it.ticketCustomFieldRelation[label];
          }
        });
        yield put({ type: 'saveTicketDetail', payload: res.result || {} });
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

    *getTicketHistory({ payload }, { put, call }) {
      try {
        const res = yield call(getTicketHistory, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveTicketHistory', payload: res.result });
      } catch (e) {
        return message.error(`获取建议历史异常，${e || e.message}`);
      }
    },
  },

  reducers: {
    saveTicketDetail(state, action) {
      return {
        ...state,
        ticketDetail: action.payload || {},
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

    saveTicketHistory(state, action) {
      return {
        ...state,
        ticketHistory: action.payload || [],
      };
    }
  },
};
