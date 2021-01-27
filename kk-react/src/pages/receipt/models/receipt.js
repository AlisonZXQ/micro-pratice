import { getRelationLink, getIssueTagList, getUserHistory,
  setCommentState, getAttachmentCount } from '@services/receipt';
import { getWorkLoad } from '@services/product';
import { message } from 'antd';

export default {

  namespace: 'receipt',

  state: {
    attachmentCount: 0,
    fullLinkData: {},
    issueTagList: [],
    userHistory: [],
    bottomActive: '',
    drawerIssueId: '',
    logList: [],
    customList: [], // 单据列表创建单据保存自定义字段的值
    currentTab: '', // 动态选中的tab
  },

  effects: {

    *getAttachmentCount({ payload }, { put, call }) {
      try {
        const res = yield call(getAttachmentCount, payload);
        if (res.code !== 200) {
          yield put({ type: 'saveAttachmentCount', payload: {} });
          return message.error(res.msg);
        }
        yield put({ type: 'saveAttachmentCount', payload: res.result });
      } catch (e) {
        yield put({ type: 'saveAttachmentCount', payload: {} });
        return message.error(`获取附件数量异常，${e || e.message}`);
      }
    },

    *getRelationLink({ payload }, { put, call }) {
      try {
        const res = yield call(getRelationLink, payload);
        if (res.code !== 200) {
          yield put({ type: 'saveRelationLink', payload: {} });
          return message.error(res.msg);
        }
        yield put({ type: 'saveRelationLink', payload: res.result });
      } catch (e) {
        yield put({ type: 'saveRelationLink', payload: {} });
        return message.error(`获取全链路异常，${e || e.message}`);
      }
    },

    *getIssueTagList({ payload }, { put, call }) {
      try {
        const res = yield call(getIssueTagList, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveTagList', payload: res.result });
      } catch (e) {
        return message.error(`获取标签异常，${e || e.message}`);
      }
    },

    *getUserHistory({ payload }, { put, call }) {
      try {
        const res = yield call(getUserHistory, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        const arr = [];
        res.result.forEach(it => {
          arr.push({
            ...it.user,
            name: it.user.realname,
            label: `${it.user.realname} ${it.user.email}`,
            value: it.user.email
          });
        });
        yield put({ type: 'saveUserHistory', payload: arr });
      } catch (e) {
        return message.error(`获取人员异常，${e || e.message}`);
      }
    },

    *getLogList({ payload }, { put, call }) {
      try {
        const res = yield call(getWorkLoad, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveLogList', payload: res.result });
      } catch (e) {
        return message.error(`获取日志异常，${e || e.message}`);
      }
    },

    *setCommentState({ payload }, { put, call }) {
      try {
        const res = yield call(setCommentState, payload);
        if (res.code !== 200) { return message.error(res.msg) }
      } catch (e) {
        return message.error(`更新备注状态异常，${e || e.message}`);
      }
    }
  },

  reducers: {
    saveAttachmentCount(state, action) {
      return {
        ...state,
        attachmentCount: action.payload || 0,
      };
    },

    saveRelationLink(state, action) {
      return {
        ...state,
        fullLinkData: action.payload || {},
      };
    },

    saveTagList(state, action) {
      return {
        ...state,
        issueTagList: action.payload || [],
      };
    },

    saveUserHistory(state, action) {
      return {
        ...state,
        userHistory: action.payload || [],
      };
    },

    saveBottomActive(state, action) {
      return {
        ...state,
        bottomActive: action.payload,
      };
    },

    saveDrawerIssueId(state, action) {
      return {
        ...state,
        drawerIssueId: action.payload,
      };
    },

    saveCurrentTab(state, action) {
      return {
        ...state,
        currentTab: action.payload,
      };
    },

    saveLogList(state, action) {
      return {
        ...state,
        logList: action.payload,
      };
    },

    saveCustomList(state, action) {
      return {
        ...state,
        customList: action.payload || {},
      };
    },
  }
};
