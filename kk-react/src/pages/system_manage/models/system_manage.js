import { getProductListObj, getEntlist, getManPower, refreshManPower } from '@services/system_manage';
import { message } from 'antd';

export default {

  namespace: 'systemManage',
  
  state: {
    productListObj: {},
    entList: [], // 当前所有的企业
    manPower: [],
  },

  
  effects: {    
    // 获取系统管理下的产品列表
    *getProductListObj({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getProductListObj, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveProductListObj', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getEntlist({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getEntlist, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveEntlist', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getManPower({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getManPower, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveManPower', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *refreshManPower({ payload }, { put, call, fork }) {
      try {
        const res = yield call(refreshManPower, payload);
        if (res.code !== 200) return message.error(res.msg);
        message.success('刷新工作量成功！');
        yield put({ type: 'saveManPower', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },
  },
  
  reducers: {
    saveProductListObj(state, action) {
      return {
        ...state,
        productListObj: action.payload || {},
      };
    },

    saveEntlist(state, action) {
      return {
        ...state,
        entList: action.payload || [],
      };
    },

    saveManPower(state, action) {
      return {
        ...state,
        manPower: action.payload || {},
      }
    }
  },
};
  