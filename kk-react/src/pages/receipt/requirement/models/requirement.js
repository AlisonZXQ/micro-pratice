import {
  getReqirementDetail, getFullLink, getRelateadvise, getRelateTask, getSubscribeByType,
  queryTag, getTag, getCommentJIRA, getCommentEP, getReqHistory, getReqStateHistory, getRelateAdviseTotal,
  getRelateAdviseByPage, getJiraList
} from '@services/requirement';
import { message } from 'antd';
import { deepCopy } from '@utils/helper';

export default {
  namespace: 'requirement',

  state: {
    requirementDetail: {}, // 需求详情信息
    fullLink: {}, // 全链路信息
    relateadvise: [], // 需求下关联的建议
    relateTask: [], // 需求下关联的任务
    subscribeUser: [], // 关注人
    queryTag: [], // 查询的tag列表
    getTag: [], // 当前单据关联的tag
    commentJIRA: {}, // 单据下的JIRA备注
    commentEP: [], // 单据下的EP备注
    reqHistory: [], // 需求下的历史
    stateHistory: [], // 单据下的状态历史
    adviseTotal: 0, // 搜索建议总数
    adviseList: [], // 搜索建议集合
    jiraList: {}, // 由sql语句查询得到的
  },


  effects: {
    *getReqirementDetail({ payload }, { put, call }) {
      try {
        const res = yield call(getReqirementDetail, payload);
        if (res.code !== 200) {
          yield put({ type: 'receipt/saveDrawerIssueId', payload: '' });
          return message.error(res.msg);
        }
        yield put({ type: 'saveRequirementDetail', payload: res.result });
      } catch (e) {
        yield put({ type: 'receipt/saveDrawerIssueId', payload: '' });
        return message.error(`获取需求详情异常，${e || e.message}`);
      }
    },

    *getFullLink({ payload }, { put, call }) {
      try {
        const res = yield call(getFullLink, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveFullLink', payload: res.result });
      } catch (e) {
        return message.error(`获取全链路数据异常，${e || e.message}`);
      }
    },

    *getRelateadvise({ payload }, { put, call }) {
      try {
        const res = yield call(getRelateadvise, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveRelateadvise', payload: res.result });
      } catch (e) {
        return message.error(`获取关联建议异常，${e || e.message}`);
      }
    },

    *getRelateTask({ payload }, { put, call }) {
      try {
        const res = yield call(getRelateTask, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveRelateTask', payload: res.result });
      } catch (e) {
        return message.error(`获取一级拆分任务异常，${e || e.message}`);
      }
    },

    *getSubscribeByType({ payload }, { put, call }) {
      try {
        const res = yield call(getSubscribeByType, payload);
        if (res.code !== 200) return message.error(res.msg);
        const arr = [];
        if (res.result) {
          res.result.forEach(it => {
            arr.push({
              ...it.rbacUserGroup,
              ...it.user,
              groupProduct: it.groupProduct,
              subscribe: it.subscribe,
            });
          });
        }
        yield put({ type: 'saveSubscribeByType', payload: arr });
      } catch (e) {
        return message.error(`获取关注人异常，${e || e.message}`);
      }
    },

    *queryTag({ payload }, { put, call }) {
      try {
        const res = yield call(queryTag, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveQueryTag', payload: res.result });
      } catch (e) {
        return message.error(`查询标签异常，${e || e.message}`);
      }
    },

    *getTag({ payload }, { put, call }) {
      try {
        const res = yield call(getTag, payload);
        if (res.code !== 200) return message.error(res.msg);
        const arr = [];
        if (res.result) {
          res.result.forEach(it => {
            arr.push({
              ...it.tag,
              tagRelation: it.tagRelation,
            });
          });
        }
        yield put({ type: 'saveGetTag', payload: arr });
      } catch (e) {
        return message.error(`获取标签异常，${e || e.message}`);
      }
    },

    *getCommentJIRA({ payload }, { put, call }) {
      try {
        const res = yield call(getCommentJIRA, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveCommentJIRA', payload: res.result });
      } catch (e) {
        return message.error(`获取备注异常，${e || e.message}`);
      }
    },

    *getCommentEP({ payload }, { put, call }) {
      try {
        const res = yield call(getCommentEP, payload);
        if (res.code !== 200) return message.error(res.msg);
        let data = deepCopy(res.result, []);
        data.forEach(it => {
          // 存在父亲节点
          if (it.recomment) {
            const parentId = it.recomment.id;
            const obj = data.find(it => it.id === parentId) || {};
            if (Object.keys(obj).length) {
              obj.children = obj.children || [];
              obj.children.push(it);
            }
          } else {
            it.children = it.children || [];
          }
        });
        data = data.filter(it => it.children);
        yield put({ type: 'saveCommentEP', payload: data });
      } catch (e) {
        return message.error(`获取备注异常，${e || e.message}`);
      }
    },

    *getReqHistory({ payload }, { put, call }) {
      try {
        const res = yield call(getReqHistory, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveReqHistory', payload: res.result });
      } catch (e) {
        return message.error(`获取历史异常，${e || e.message}`);
      }
    },

    *getReqStateHistory({ payload }, { put, call }) {
      try {
        const res = yield call(getReqStateHistory, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveReqStateHistory', payload: res.result });
      } catch (e) {
        return message.error(`获取状态历史异常，${e || e.message}`);
      }
    },

    *getRelateAdviseTotal({ payload }, { put, call }) {
      try {
        const res = yield call(getRelateAdviseTotal, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveRelateAdviseTotal', payload: res.result });
      } catch (e) {
        return message.error(`获取建议总数异常，${e || e.message}`);
      }
    },

    *getRelateAdviseByPage({ payload }, { put, call }) {
      try {
        const res = yield call(getRelateAdviseByPage, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveRelateAdviseByPage', payload: res.result });
      } catch (e) {
        return message.error(`获取建议列表异常，${e || e.message}`);
      }
    },

    *getJiraList({ payload }, { put, call }) {
      try {
        const res = yield call(getJiraList, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveJiraList', payload: res.result });
      } catch (e) {
        return message.error(`获取issue列表异常，${e || e.message}`);
      }
    },

  },

  reducers: {
    saveRequirementDetail(state, action) {
      return {
        ...state,
        requirementDetail: action.payload || {},
      };
    },

    saveFullLink(state, action) {
      return {
        ...state,
        fullLink: action.payload || {},
      };
    },

    saveRelateadvise(state, action) {
      return {
        ...state,
        relateadvise: action.payload || [],
      };
    },

    saveRelateTask(state, action) {
      return {
        ...state,
        relateTask: action.payload || [],
      };
    },

    saveSubscribeByType(state, action) {
      return {
        ...state,
        subscribeUser: action.payload || [],
      };
    },

    saveQueryTag(state, action) {
      return {
        ...state,
        queryTag: action.payload || [],
      };
    },

    saveGetTag(state, action) {
      return {
        ...state,
        getTag: action.payload || [],
      };
    },

    saveCommentJIRA(state, action) {
      return {
        ...state,
        commentJIRA: action.payload || {},
      };
    },

    saveCommentEP(state, action) {
      return {
        ...state,
        commentEP: action.payload || [],
      };
    },

    saveReqStateHistory(state, action) {
      return {
        ...state,
        stateHistory: action.payload || [],
      };
    },

    saveRelateAdviseTotal(state, action) {
      return {
        ...state,
        adviseTotal: action.payload || 0,
      };
    },

    saveRelateAdviseByPage(state, action) {
      return {
        ...state,
        adviseList: action.payload || [],
      };
    },

    saveJiraList(state, action) {
      return {
        ...state,
        jiraList: action.payload || {},
      };
    },

    saveReqHistory(state, action) {
      return {
        ...state,
        reqHistory: action.payload || [],
      };
    }
  }
};
