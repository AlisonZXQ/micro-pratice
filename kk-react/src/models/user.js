import { getCurrentUserInfo, getCurrentMemberInfo, queryUser } from '@services/project';
import { message } from 'antd';

export default {

  namespace: 'user',
  
  state: {
    currentUser: {}, // 当前用户
    currentMemberInfo: {}, // 当前项目下的用户
    queryUser: [],
  },

  effects: {
    *getCurrentUser({ payload }, { put, call }) {
      try {
        const res = yield call(getCurrentUserInfo, payload);
        if (res.code !== 200) return message.error(`获取当前用户信息失败, ${res.msg}`);
        yield put({ type: 'saveUserInfo', payload: res.result });
      } catch(e) {
        return message.error(`获取当前用户信息异常，${e || e.message}`);
      }
    },

    *getCurrentMemberInfo({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getCurrentMemberInfo, payload.id);
        if (res.code !== 200) return message.error(`获取当前成员信息失败, ${res.msg}`);
        yield put({ type: 'saveCurrentMemberInfo', payload: res.result });
      } catch (e) {
        message.error(e || e.message);
      }
    },

    *queryUser({ payload }, { put, call, fork }) {
      try {
        const res = yield call(queryUser, payload);
        if (res.code !== 200) return message.error(`获取当前成员信息失败, ${res.msg}`);
        yield put({ type: 'saveQueryUser', payload: res.result || []});
      } catch (e) {
        message.error(e || e.message);
      }
    },
  },
  
  reducers: {
    saveUserInfo(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },

    saveCurrentMemberInfo(state, action) {
      return {
        ...state,
        currentMemberInfo: action.payload || {},
      };
    },

    saveQueryUser(state, action) {
      return {
        ...state,
        queryUser: action.payload || [],
      };
    }
  },
};
  