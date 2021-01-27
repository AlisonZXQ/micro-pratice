import {
  // 主页的五个接口
  getProjectBasic, getProjectEvent, getProjectMember, getProjectObjective, getProjectPlanning,
  queryEditContents, beginProjectContents,
  finishProjectContents, getPlanning, getIssueCondition, beginChangeAuditContents, getChangeVersionInfo,
  getRoleGroup, getOperationPerm, getChangeFlowEP, getChangeDetail, getChangeDetailById, getAuditResult
} from '@services/project';
import { message } from 'antd';

export default {

  namespace: 'project',

  state: {
    // 主页的五个信息
    projectBasic: {
      hasPermission: true,
    },
    projectEvent: [],
    projectMember: {},
    projectObjective: {},
    projectPlanning: {},

    currentUser: {},
    editContents: {}, // 编辑项目规划数据（当前规划内容，产品list...）
    issueCondition: {}, // 状态和类型
    projectBegin: {}, // 立项
    projectFinish: {}, // 结项
    projectChange: {},
    changeVersionInfo: {},
    roleGroup: {},
    operationPerm: {}, // 在审批流中判断是否有操作权限
    changeWorkFlow: [],
    changeDetail: [],

    projectId: 0,
    projectCode: '',

    auditResult: {}, // 审批结果页
  },

  effects: {
    // 获取项目主页（即将废弃）
    *getProject({ payload }, { put, call }) {
      try {

        yield put({ type: 'getProjectBasic', payload: { id: payload.id } });
        yield put({ type: 'getProjectEvent', payload: { projectId: payload.id } });
        yield put({ type: 'getProjectMember', payload: { id: payload.id } });
        yield put({ type: 'getProjectObjective', payload: { id: payload.id } });
        yield put({ type: 'getProjectPlanning', payload: { id: payload.id } });

      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取主页的一些基本信息，包括projectDetail，products，createCustomFileds，closureCustomFileds，projectClosureInforVO
    *getProjectBasic({ payload }, { put, call }) {
      try {
        const res = yield call(getProjectBasic, payload.id);
        if (res.code !== 200) {
          if (res.code === 403) {
            yield put({ type: 'saveProjectBasic', payload: { hasPermission: false } });
          }
          return message.error(res.msg);
        }
        yield put({ type: 'saveProjectBasic', payload: { ...res.result, hasPermission: true } });

        // 获取规划依赖的一些数据信息
        const params = {
          projectId: res.result && res.result.projectDetail && res.result.projectDetail.projectId,
          products: res.result && res.result.products && res.result.products.map(it => it.id),
        };

        yield put({ type: 'getPlanningData', payload: params });

      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取项目动态信息
    *getProjectEvent({ payload }, { put, call }) {
      try {
        const res = yield call(getProjectEvent, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveProjectEvent', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取项目目标
    *getProjectObjective({ payload }, { put, call }) {
      try {
        const res = yield call(getProjectObjective, payload.id);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveProjectObjective', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取项目成员信息
    *getProjectMember({ payload }, { put, call }) {
      try {
        const res = yield call(getProjectMember, payload.id);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveProjectMember', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取项目规划信息（包括里程碑和规划内容）
    *getProjectPlanning({ payload }, { put, call }) {
      try {
        const res = yield call(getProjectPlanning, payload.id);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveProjectPlanning', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取项目立项审批页
    *getProjectBegin({ payload }, { put, call, fork }) {
      try {
        const res = yield call(beginProjectContents, payload);
        if (res.code !== 200) return message.error(`获取项目立项审批信息失败, ${res.msg}`);
        yield put({ type: 'saveBeginContents', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取项目结项审批页
    *getProjectFinish({ payload }, { put, call, fork }) {
      try {
        const res = yield call(finishProjectContents, payload);
        if (res.code !== 200) return message.error(`获取项目结项审批信息失败, ${res.msg}`);
        yield put({ type: 'saveFinishContents', payload: res.result });
      } catch (e) {
        message.error(e || e.message);
      }
    },

    // 获取项目变更审批页
    *getProjectChange({ payload }, { put, call, fork }) {
      try {
        const res = yield call(beginChangeAuditContents, payload);
        if (res.code !== 200) return message.error(`获取项目立项审批信息失败, ${res.msg}`);
        yield put({ type: 'saveChangeContents', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取项目变更详情页
    *getChangeVersionInfo({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getChangeVersionInfo, payload.changeId);
        if (res.code !== 200) return message.error(`${res.msg}`);
        yield put({ type: 'saveChangeVersionInfo', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getEditContents({ payload }, { put, call, fork }) {
      try {
        const res = yield call(queryEditContents, payload);
        if (res.code !== 200) return message.error(`获取项目规划信息失败, ${res.msg}`);
        yield put({ type: 'saveEditContents', payload: res.result });
      } catch (e) {
        message.error(e || e.message);
      }
    },

    *getPlanningData({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getPlanning, payload);
        if (res.code !== 200) return message.error(`获取项目已规划信息失败, ${res.msg}`);
        if (res.result && res.result.issues) {
          // 保存已规划的contents
          yield put({ type: 'createProject/saveAllContents', payload: res.result.issues });
        }
      } catch (e) {
        message.error(e || e.message);
      }
    },

    *getRoleGroup({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getRoleGroup, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveRoleGroup', payload: res.result });
      } catch (e) {
        message.error(e || e.message);
      }
    },

    *getIssueCondition({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getIssueCondition, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveIssueCondition', payload: res.result });
      } catch (e) {
        message.error(e || e.message);
      }
    },

    *getOperationPerm({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getOperationPerm, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveOperationPerm', payload: res.result });
      } catch (e) {
        message.error(e || e.message);
      }
    },

    *getChangeFlowEP({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getChangeFlowEP, payload.projectId);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveChangeFlowEP', payload: res.result });
      } catch (e) {
        message.error(e || e.message);
      }
    },

    // 变更审批
    *getChangeDetail({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getChangeDetail, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveChangeDetail', payload: res.result || [] });
      } catch (e) {
        message.error(e || e.message);
      }
    },

    // 变更历史
    *getChangeDetailById({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getChangeDetailById, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveChangeDetail', payload: res.result || [] });
      } catch (e) {
        message.error(e || e.message);
      }
    },

    // 审批结果页
    *getAuditResult({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getAuditResult, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveAuditResult', payload: res.result || {} });
      } catch (e) {
        message.error(e || e.message);
      }
    },
  },

  reducers: {
    saveProjectBasic(state, action) {
      return {
        ...state,
        projectBasic: action.payload || {},
      };
    },

    saveProjectEvent(state, action) {
      return {
        ...state,
        projectEvent: action.payload || [],
      };
    },

    saveProjectMember(state, action) {
      return {
        ...state,
        projectMember: action.payload || {},
      };
    },

    saveProjectObjective(state, action) {
      return {
        ...state,
        projectObjective: action.payload || {},
      };
    },

    saveProjectPlanning(state, action) {
      return {
        ...state,
        projectPlanning: action.payload || {},
      };
    },

    saveEditContents(state, action) {
      return {
        ...state,
        editContents: action.payload || {},
      };
    },

    saveBeginContents(state, action) {
      return {
        ...state,
        projectBegin: action.payload || [],
      };
    },

    saveFinishContents(state, action) {
      return {
        ...state,
        projectFinish: action.payload || [],
      };
    },

    saveChangeContents(state, action) {
      return {
        ...state,
        projectChange: action.payload || {},
      };
    },

    saveChangeVersionInfo(state, action) {
      return {
        ...state,
        changeVersionInfo: action.payload || [],
      };
    },

    saveRoleGroup(state, action) {
      return {
        ...state,
        roleGroup: action.payload || {},
      };
    },

    saveIssueCondition(state, action) {
      return {
        ...state,
        issueCondition: action.payload || {},
      };
    },

    saveOperationPerm(state, action) {
      return {
        ...state,
        operationPerm: action.payload || {},
      };
    },

    saveChangeFlowEP(state, action) {
      return {
        ...state,
        changeWorkFlow: action.payload || [],
      };
    },

    saveChangeDetail(state, action) {
      return {
        ...state,
        changeDetail: action.payload || [],
      };
    },

    saveProjectId(state, action) {
      return {
        ...state,
        projectId: action.payload || 0,
      };
    },

    saveProjectCode(state, action) {
      return {
        ...state,
        projectCode: action.payload || '',
      };
    },

    saveAuditResult(state, action) {
      return {
        ...state,
        auditResult: action.payload || {},
      };
    },

  }
};
