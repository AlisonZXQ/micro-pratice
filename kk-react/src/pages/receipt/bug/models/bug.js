import { getBugDetail, getBugHistory } from '@services/bug';
import { message } from 'antd';

export default {

  namespace: 'bug',

  state: {
    bugDetail: {},
    bugHistory: [],
  },


  effects: {
    *getBugDetail({ payload }, { put, call }) {
      try {
        const res = yield call(getBugDetail, payload);
        if (res.code !== 200) {
          yield put({ type: 'receipt/saveDrawerIssueId', payload: '' });
          return message.error(res.msg);
        }
        yield put({ type: 'saveBugDetail', payload: res.result });
      } catch (e) {
        yield put({ type: 'receipt/saveDrawerIssueId', payload: '' });
        return message.error(`获取缺陷详情异常，${e || e.message}`);
      }
    },

    *getBugHistory({ payload }, { put, call }) {
      try {
        const res = yield call(getBugHistory, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveBugHistory', payload: res.result });
      } catch (e) {
        return message.error(`获取缺陷详情异常，${e || e.message}`);
      }
    },
  },

  reducers: {
    saveBugDetail(state, action) {
      return {
        ...state,
        bugDetail: action.payload || {},
      };
    },

    saveBugHistory(state, action) {
      return {
        ...state,
        bugHistory: action.payload || [],
      };
    }
  }
};
