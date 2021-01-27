import { getUserGroup, getUser } from '@services/approvalflow';
import { message } from 'antd';

export default {

  namespace: 'approvalFlow',

  state: {
    usergroupList: [],
    userList: [],
  },


  effects: {
    // 获取当前产品下的用户组
    *getUserGroup({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getUserGroup, payload);
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          yield put({ type: 'saveUserGroup', payload: res.result });   
          const obj = res.result.find(it => it.rbacUserGroup.name === '产品用户');
          const params = {
            productId: payload.productId,
            usergroupId: obj.rbacUserGroup.id
          };
          yield put({ type: 'getUser', payload: params });
        }
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取当前产品下的用户
    *getUser({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getUser, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveUser', payload: res.result });
      } catch (e) {
        message.error(e || e.message);
      }
    },

  },

  reducers: {
    saveUserGroup(state, action) {
      return {
        ...state,
        usergroupList: action.payload || [],
      };
    },

    saveUser(state, action) {
      return {
        ...state,
        userList: action.payload || [],
      };
    },
  }
};
