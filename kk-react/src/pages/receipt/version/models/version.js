import {
  getRequirementList, getVersionList, getVersionSelect, getVersionKanban, getVersionSelectList,
  getPoolUserList, getVersionUserList, getKanbanResponseUserList, getKanbanRequireUserList
} from '@services/version';
import { message } from 'antd';

export default {

  namespace: 'version',

  state: {
    requirementList: [],
    versionList: [],
    versionSelect: {},
    versionSelectList: [],
    versionKanban: {},
    poolUserList: [],
    versionUserList: [],
    kanbanResponseUserList: [],
    kanbanRequireUserList: []
  },


  effects: {
    // 获取需求列表
    // *getRequirementList({ payload }, { put, call }) {
    //   try {
    //     const res = yield call(getRequirementList, payload);
    //     if (res.code !== 200) return message.error(`获取需求列表信息失败, ${res.msg}`);
    //     yield put({ type: 'saveRequirementList', payload: res.result });
    //   } catch (e) {
    //     return message.error(e || e.message);
    //   }
    // },

    // 获取版本列表
    *getVersionList({ payload }, { put, call }) {
      try {
        const res = yield call(getVersionList, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveVersionList', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取已选版本信息
    *getVersionSelect({ payload }, { put, call }) {
      try {
        const res = yield call(getVersionSelect, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveVersionSelect', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取已选版本下的全部内容
    *getVersionSelectList({ payload }, { put, call }) {
      try {
        const res = yield call(getVersionSelectList, payload);
        if (res.code !== 200) return message.error(res.msg);
        const list = res.result; //浅拷贝
        list && list.map(it => {
          const issueKey = it.issueKey.split('-')[0];
          if(issueKey === 'Task' || issueKey === 'Subtask') {
            it.type = 'task';
          }else if(issueKey === 'Feature') {
            it.type = 'requirement';
          }else if(issueKey === 'Bug') {
            it.type = 'bug';
          }
        });
        yield put({ type: 'saveVersionSelectList', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取版本详情信息
    *getVersionKanban({ payload }, { put, call }) {
      try {
        const res = yield call(getVersionKanban, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveVersionKanban', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取需求池负责人列表
    *getPoolUserList({ payload }, { put, call }) {
      try {
        const res = yield call(getPoolUserList, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'savePoolUserList', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },
    // 获取版本负责人列表
    *getVersionUserList({ payload }, { put, call }) {
      try {
        const res = yield call(getVersionUserList, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveVersionUserList', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取看板负责人列表
    *getKanbanResponseUserList({ payload }, { put, call }) {
      try {
        const res = yield call(getKanbanResponseUserList, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveKanbanResponseUserList', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },


    // 获取看板验证人列表
    *getKanbanRequireUserList({ payload }, { put, call }) {
      try {
        const res = yield call(getKanbanRequireUserList, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveKanbanRequireUserList', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

  },

  reducers: {
    // saveRequirementList(state, action) {
    //   return {
    //     ...state,
    //     requirementList: action.payload || [],
    //   };
    // },

    saveVersionList(state, action) {
      return {
        ...state,
        versionList: action.payload || [],
      };
    },

    saveVersionSelect(state, action) {
      return {
        ...state,
        versionSelect: action.payload || {},
      };
    },

    saveVersionSelectList(state, action) {
      return {
        ...state,
        versionSelectList: action.payload || [],
      };
    },

    saveVersionKanban(state, action) {
      return {
        ...state,
        versionKanban: action.payload || {},
      };
    },

    savePoolUserList(state, action) {
      return {
        ...state,
        poolUserList: action.payload || [],
      };
    },

    saveVersionUserList(state, action) {
      return {
        ...state,
        versionUserList: action.payload || [],
      };
    },

    saveKanbanResponseUserList(state, action) {
      return {
        ...state,
        kanbanResponseUserList: action.payload || [],
      };
    },

    saveKanbanRequireUserList(state, action) {
      return {
        ...state,
        kanbanRequireUserList: action.payload || [],
      };
    },
  }
};
