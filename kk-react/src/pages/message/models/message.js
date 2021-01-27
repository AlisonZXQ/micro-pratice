import { getCurrentMessageCount } from '@services/message';
import { message } from 'antd';

export default {

  namespace: 'message',

  state: {
    messageCount: 0,
  },


  effects: {
    *getCurrentMessageCount({ payload }, { put, call }) {
      try {
        const res = yield call(getCurrentMessageCount);
        if (res.code !== 200) return message.error(`获取当前用户消息数量失败, ${res.msg}`);
        yield put({ type: 'saveMessageCount', payload: res.result });
      } catch (e) {
        return message.error(`获取当前用户消息数量异常，${e || e.message}`);
      }
    },
  },

  reducers: {
    saveMessageCount(state, action) {
      return {
        ...state,
        messageCount: action.payload || 0,
      };
    },
  },
};
