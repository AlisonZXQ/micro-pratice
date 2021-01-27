import { getCascadeList, getCategoryList } from '@services/project';
import { deepCopy } from '@utils/helper';
import { message } from 'antd';

export default {

  namespace: 'projectCascade',
  
  state: {
    cascadeList: [], // 级联列表
    categoryObj: {}, 
  },
  
  effects: {
    *getCascadeList({ payload }, { put, call }) {
      try {
        const res = yield call(getCascadeList, payload);
        if (res.code !== 200) return message.error(`获取级联列表失败, ${res.msg}`);
        yield put({ type: 'saveCascadeList', payload: res.result });
      } catch(e) {
        return message.error(`获取级联列表异常，${e || e.message}`);
      }
    },

    *getCategoryList({ payload }, { put, call, select }) {
      try {
        const res = yield call(getCategoryList, payload);
        if (res.code !== 200) return message.error(`获取指定级联值列表失败, ${res.msg}`);
        const parent = res.result.levelone;
        const arr = [];
        parent.forEach(it => {
          arr.push({
            ...it,
            children: res.result[it.id] || [],
          });
        });
        
        const state = yield select(state => state.projectCascade);

        const newObj = deepCopy(state.categoryObj, {});
        newObj[payload.cascadefieldid] = arr;

        yield put({ type: 'saveCategoryObj', payload: newObj });
      } catch(e) {
        return message.error(`获取指定级联值列表异常，${e || e.message}`);
      }
    },
  },
  
  reducers: {
    saveCascadeList(state, action) {
      return {
        ...state,
        cascadeList: action.payload || [],
      };
    },

    saveCategoryObj(state, action) {
      return {
        ...state,
        categoryObj: action.payload || {},
      };
    },

  },
};
  