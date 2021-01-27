import { getJiraToEp, getEpToJira, getAllJiraStatus, getModuleListById, getSubproductByPage, 
  getUserGroupByProductId, getUserGroupDetail, getProductRole,
  getUserObjByPage } from '@services/product_setting';
import { message } from 'antd';

export default {

  namespace: 'productSetting',

  state: {
    jiraToEp: [],
    epToJira: [],
    jiraStatus: [],
    moduleList: [],
    subProductObj: {},
    userGroup: [], // 产品下的所有用户组
    groupDetail: {}, // 用户组详情
    productRole: [],
    userObj: [], // 产品下所有用户
  },

  effects: {
    // jiraToEp
    *getJiraToEp({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getJiraToEp, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveJiraToEp', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // jiraToEp
    *getEpToJira({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getEpToJira, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveEpToJira', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getAllJiraStatus({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getAllJiraStatus, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveAllJiraStatus', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getModuleListById({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getModuleListById, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveModuleById', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getSubproductByPage({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getSubproductByPage, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveSubproductByPage', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getUserGroupByProductId({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getUserGroupByProductId, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveUserGroupByProductId', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getUserGroupDetail({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getUserGroupDetail, payload.groupid);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveUserGroupDetail', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getProductRole({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getProductRole, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveProductRole', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getUserObjByPage({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getUserObjByPage, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveUserObjByPage', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },
    
  },

  reducers: {
    saveJiraToEp(state, action) {
      return {
        ...state,
        jiraToEp: action.payload || [],
      };
    },

    saveEpToJira(state, action) {
      return {
        ...state,
        epToJira: action.payload || [],
      };
    },

    saveAllJiraStatus(state, action) {
      return { 
        ...state,
        jiraStatus: action.payload || [], 
      };
    },

    saveModuleById(state, action) {
      return { 
        ...state,
        moduleList: action.payload || [], 
      };
    },

    saveSubproductByPage(state, action) {
      return { 
        ...state,
        subProductObj: action.payload || {}, 
      };
    },

    saveUserGroupByProductId(state, action) {
      return { 
        ...state,
        userGroup: action.payload || [], 
      };
    },

    saveUserGroupDetail(state, action) {
      return { 
        ...state,
        groupDetail: action.payload || [], 
      };
    },

    saveProductRole(state, action) {
      return { 
        ...state,
        productRole: action.payload || [], 
      };
    },

    saveUserObjByPage(state, action) {
      return { 
        ...state,
        userObj: action.payload || [], 
      };
    },
    
  },
};
