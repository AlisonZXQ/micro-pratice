import { getTimeBoxByTime, getTimeBoxIssueByTime } from '@services/time_box';
import { message } from 'antd';

export default {

  namespace: 'timeBox',

  state: {
    timeBoxList: [],
    timeBoxIssue: [],
  },

  effects: {
    *getTimeBoxByTime({ payload }, { put, call }) {
      try {
        const res = yield call(getTimeBoxByTime, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveTimeBoxByTime', payload: res.result || [] });
      } catch (e) {
        return message.error(`获取时间盒异常，${e || e.message}`);
      }
    },

    *getTimeBoxIssueByTime({ payload }, { put, call }) {
      try {
        const res = yield call(getTimeBoxIssueByTime, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveTimeBoxIssueByTime', payload: res.result });
      } catch (e) {
        return message.error(`获取时间盒内容异常，${e || e.message}`);
      }
    },
  },

  reducers: {
    saveTimeBoxByTime(state, action) {
      return {
        ...state,
        timeBoxList: action.payload || [],
      };
    },

    saveTimeBoxIssueByTime(state, action) {
      return {
        ...state,
        timeBoxIssue: action.payload || [],
      };
    },
  }
};
