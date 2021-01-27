import { getEstimateHour, getByRequirementid, getReqAttachment, getUemSize } from '@services/requirement';
import { message } from 'antd';
import uuid from 'uuid';

export default {

  namespace: 'design',

  state: {
    workHour: {},
    uemReqInfo: {},
    reqAttachment: [],
    des: '',
    channelObj: [], // 包括sourceList, addSize, selectSize
    channelAll: {}, // 子产品下的所有渠道和尺寸
    spreadEdit: false, // 尺寸是否处理编辑状态，保存时提示
  },


  effects: {
    *getEstimateHour({ payload }, { put, call }) {
      try {
        const res = yield call(getEstimateHour, payload);
        if (res.code !== 200) {
          yield put({ type: 'saveEstimateHour', payload: {} });
          return message.error(res.msg);
        }
        yield put({ type: 'saveEstimateHour', payload: res.result });
      } catch (e) {
        return message.error(`获取预估工时异常，${e || e.message}`);
      }
    },

    *getByRequirementid({ payload }, { put, call }) {
      try {
        const res = yield call(getByRequirementid, payload);
        if (res.code !== 200) return message.error(res.msg);
        if (res.result && res.result.uemRequirement && res.result.uemRequirement.data) {
          const data = JSON.parse(res.result.uemRequirement.data);
          const workHour = data.workHour ? data.workHour : {};
          yield put({ type: 'saveEstimateHour', payload: workHour });
        }

        // 获取尺寸
        if (res.result) {
          const reqData = res.result.requirementInfo;
          const data = res.result.uemRequirement && res.result.uemRequirement.data && JSON.parse(res.result.uemRequirement.data);
          const productId = reqData && reqData.product && reqData.product.id;
          const params = {
            channelSave: (data && data.channel) || [],
            addSize: (data && data.addSize) || [],
            selectSize: (data && data.selectSize) || [],
            size: (data && data.size) || [],
          };
          yield put({ type: 'getUemSize', payload: { productid: productId, data: { ...params } } });
        }

        yield put({ type: 'saveByRequirementid', payload: res.result });
      } catch (e) {
        return message.error(`获取uem需求异常，${e || e.message}`);
      }
    },

    *getUemSize({ payload }, { put, call }) {
      try {
        const res = yield call(getUemSize, { productid: payload.productid });
        if (res.code !== 200) return message.error(res.msg);
        const data = payload.data || {};

        if (res.result) {
          yield put({ type: 'saveChannelAll', payload: res.result });

          let addSize = data.addSize || [];
          let selectSize = data.selectSize || [];
          let channelSave = data.channelSave || [];
          let obj = {};
          const findObj = (channelSave && !!channelSave.length && channelSave.find(item => `${item.id}`.includes('ZXQHAPPYSIZE'))) || {};

          if (data.size && data.size.length) {
            if (Object.keys(findObj).length) {
              obj = findObj;
            } else {
              obj = {
                id: `ZXQHAPPYSIZE-${uuid()}`,
                name: '自定义',
                sizeList: [],
              };
            }
            data.size.forEach(it => {
              // 自定义的尺寸存在
              obj.sizeList.push({
                id: `ZXQHAPPY-${uuid()}`,
                name: it,
              });
              addSize.push({
                id: `ZXQHAPPY-${uuid()}`,
                name: it,
              });
            });
          }

          if (!Object.keys(findObj).length) {
            channelSave.push(obj);
          }

          const params = {
            channel: res.result.channel || [],
            sizeMap: res.result.info || [],
            channelSave: channelSave,
            addSize: addSize,
            selectSize: selectSize,
          };

          yield put({ type: 'solveChannelList', payload: { ...params } });
        }
      } catch (e) {
        return message.error(`获取uem尺寸异常，${e || e.message}`);
      }
    },

    *solveChannelList({ payload }, { put, call }) {
      const channel = payload.channel || [];
      const sizeMap = payload.sizeMap || {};
      const channelSave = payload.channelSave || [];

      // 渠道需要加入checked和status和display
      // 尺寸需要加入checked和select和display

      channel.forEach(it => {
        it.display = true;

        const sourceObj = channelSave.find(item => item.id === it.id) || {};

        const sizeList = sizeMap[it.id]; // 当前子产品下总的尺寸

        const selectSize = sourceObj.sizeList || []; // 当前选择的尺寸
        // 这里应该是判断剩余的（去掉已删除的）选择的个数
        let selectNum = 0;
        sizeList.forEach(item => {
          // 是否已经被选择
          const flag = selectSize.some(i => i.id === item.id);
          if (flag) {
            selectNum += 1;
          }
          item.checked = flag;
          item.select = false;
          item.display = true;
        });

        it.sizeList = sizeList;

        const allLength = sizeList.length;
        // 全选
        if (allLength === selectNum && allLength !== 0) {
          it.checked = true;
          it.status = false;
        } else if (selectNum > 0 && selectNum < allLength) { // 半选
          it.checked = false;
          it.status = true;
        } else { // 没有选择
          it.checked = false;
          it.status = false;
        }
      });
      const params = {
        channelList: channel, // sourceList
        addSize: payload.addSize || [],
        selectSize: payload.selectSize || [],
        channelSave: payload.channelSave,
      };
      yield put({ type: 'saveUemSize', payload: { ...params } });
    },

    *getReqAttachment({ payload }, { put, call }) {
      try {
        const res = yield call(getReqAttachment, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveReqAttachment', payload: res.result });
      } catch (e) {
        return message.error(`获取uem需求附件异常，${e || e.message}`);
      }
    },
  },

  reducers: {
    saveEstimateHour(state, action) {
      return {
        ...state,
        workHour: action.payload || {},
      };
    },

    saveByRequirementid(state, action) {
      return {
        ...state,
        uemReqInfo: action.payload || {},
      };
    },

    saveReqAttachment(state, action) {
      return {
        ...state,
        reqAttachment: action.payload || [],
      };
    },

    saveDes(state, action) {
      return {
        ...state,
        des: action.payload || '',
      };
    },

    saveUemSize(state, action) {
      return {
        ...state,
        channelObj: action.payload || {},
      };
    },

    saveChannelAll(state, action) {
      return {
        ...state,
        channelAll: action.payload || {},
      };
    },

    saveSpreadEdit(state, action) {
      return {
        ...state,
        spreadEdit: action.payload,
      };
    },
  },
};
