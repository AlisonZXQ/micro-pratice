import { getKanbanList, getRequirementIssue } from '@services/requirement_board';
import { message } from 'antd';

export default {

  namespace: 'requirementBoard',

  state: {
    kanbanList: [],
    kanbanIssue: [],
  },

  effects: {
    *getKanbanList({ payload }, { put, call }) {
      try {
        const res = yield call(getKanbanList, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveKanbanList', payload: res.result });
      } catch (e) {
        return message.error(`获取时间盒内容异常，${e || e.message}`);
      }
    },

    *getRequirementIssue({ payload }, { put, call }) {
      try {
        const res = yield call(getRequirementIssue, payload);
        if (res.code !== 200) { return message.error(res.msg) }
        yield put({ type: 'saveRequirementIssue', payload: res.result });
      } catch (e) {
        return message.error(`获取时间盒内容异常，${e || e.message}`);
      }
    },
  },

  reducers: {
    saveKanbanList(state, action) {
      return {
        ...state,
        kanbanList: action.payload || [],
      };
    },

    saveRequirementIssue(state, action) {
      return {
        ...state,
        kanbanIssue: action.payload || [],
      };
    },
  }
};
