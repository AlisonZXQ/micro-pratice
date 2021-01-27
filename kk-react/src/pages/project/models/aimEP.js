import { getObjectiveCustomEP } from '@services/project';
import { message } from 'antd';

export default {

  namespace: 'aimEP',

  state: {
    customSelect: {},
    customFileds: [],
  },


  effects: {

    // 获取子产品下的目标自定义字段
    *getObjectiveCustomEP({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getObjectiveCustomEP, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveObjectiveCustomEP', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

  },

  reducers: {
    saveObjectiveCustomEP(state, action) {
      return {
        ...state,
        customFileds: action.payload || [],
      };
    },

    // 存储下拉类型的自定义字段的选项值，包括单据里的自定义字段
    saveCustomSelect(state, action) {
      let oldValue = state.customSelect || {};
      let newValue = action.payload;
      for(let i in oldValue) {
        if (!newValue[i]) {
          newValue[i] = oldValue[i];
        }
      }
      return {
        ...state,
        customSelect: newValue || {},
      };
    },

  },
};
