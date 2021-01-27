import { getReportDepend, getWeekReportByPage, getWeekReportDetail, getWeekReportCreator, getWeekReportAll } from '@services/weekReport';
import { message } from 'antd';

export default {

  namespace: 'weekReport',
  
  state: {
    reportDepend: {}, // 预设字段
    reportObj: {}, // 周报列表对象
    reportDetail: {}, // 周报详情
    weekReportCreator: [],
    reportAll: [], // 全量的周报数据
  },

  
  effects: {
    *getReportDepend({ payload }, { put, call }) {
      try {
        const res = yield call(getReportDepend);
        if (res.code !== 200) return message.error(`获取周报字段值失败, ${res.msg}`);
        yield put({ type: 'saveReportDepend', payload: res.result });
      } catch(e) {
        return message.error(`获取周报字段值异常，${e || e.message}`);
      }
    },

    *getWeekReportByPage({ payload }, { put, call }) {
      try {
        const res = yield call(getWeekReportByPage, payload);
        if (res.code !== 200) return message.error(`获取周报列表失败, ${res.msg}`);
        yield put({ type: 'saveReportObj', payload: res.result });
      } catch(e) {
        return message.error(`获取周报列表异常，${e || e.message}`);
      }
    },

    *getWeekReportDetail({ payload }, { put, call }) {
      try {
        const res = yield call(getWeekReportDetail, payload);
        if (res.code !== 200) return message.error(`获取周报详情失败, ${res.msg}`);
        yield put({ type: 'saveReportDetail', payload: res.result });
      } catch(e) {
        return message.error(`获取周报详情异常，${e || e.message}`);
      }
    },

    *getWeekReportCreator({ payload }, { put, call }) {
      try {
        const res = yield call(getWeekReportCreator);
        if (res.code !== 200) return message.error(`获取周报创建人列表失败, ${res.msg}`);
        yield put({ type: 'saveWeekReportCreator', payload: res.result });
      } catch(e) {
        return message.error(`获取周报创建人列表异常，${e || e.message}`);
      }
    },

    *getWeekReportAll({ payload }, { put, call }) {
      try {
        const res = yield call(getWeekReportAll);
        if (res.code !== 200) return message.error(`获取周报列表失败, ${res.msg}`);
        yield put({ type: 'saveWeekReportAll', payload: res.result });
      } catch(e) {
        return message.error(`获取周报列表异常，${e || e.message}`);
      }
    },
  
  },
  
  reducers: {
    saveReportDepend(state, action) {
      return {
        ...state,
        reportDepend: action.payload || {},
      };
    },

    saveReportObj(state, action){
      return {
        ...state,
        reportObj: action.payload || {},
      };
    },

    saveReportDetail(state, action) {
      return {
        ...state,
        reportDetail: action.payload || {},
      };
    },

    saveWeekReportCreator(state, action) {
      return {
        ...state,
        weekReportCreator: action.payload || [],
      };
    },

    saveWeekReportAll(state, action) {
      return {
        ...state,
        reportAll: action.payload || [],
      };
    },
  },
};