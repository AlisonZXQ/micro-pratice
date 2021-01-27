import {
  getUserProduct, getProductFlag, getAdminProduct, getProductUser, getAllSubProductList,
  getAllUserByProductId, setLastProduct, getSameCompanyProduct
} from '@services/product';
import { message } from 'antd';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';

export default {

  namespace: 'product',

  state: {
    productList: [], // 当前用户有权限的产品列表
    userProductFlag: {
      isProductAdmin: true, // 默认有权限，避免403
    }, // 当前用户选择的子产品是否有管理员权限
    lastProduct: {
      productAdmin: true,
    },
    adminProductList: [],
    productUser: [], // 产品下的用户
    allProductUser: [],
    productPermission: true, // 该用户是否有可用的子产品

    allProductList: [], // 平台所有的产品
    subProductAll: [], // 产品下的所有子产品
    enableSubProductList: [], // 所有可用状态的子产品
  },

  effects: {
    *getUserProduct({ payload }, { put, call }) {
      try {
        const res = yield call(getUserProduct);
        if (res.code !== 200) return message.error(res.msg);
        if (res.result && res.result.length) {
          const arr = [];
          res.result.forEach(it => {
            arr.push({
              ...it.product,
              productAdmin: it.productAdmin,
              lastProduct: it.lastProduct,
              perssionList: it.perssionList,
              productOwner: it.productOwner,
              productRoleVOList: it.productRoleVOList || [],
            });
          });

          yield put({ type: 'saveUserProduct', payload: arr });

          // 用户最后选择的产品
          const obj = arr.find(it => it.lastProduct) || {};
          yield put({ type: 'saveLastProduct', payload: obj });

          if (arr.length === 1) {
            yield put({ type: 'createProject/saveProductList', payload: arr });
          }
        } else {
          // 没有任何产品权限
          yield put({ type: 'saveProductPermission', payload: false });
        }

      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getAdminProduct({ payload }, { put, call }) {
      try {
        const res = yield call(getAdminProduct);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveAdminProduct', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取当前登录在指定子产品中的角色标记
    *getProductFlag({ payload }, { put, call }) {
      try {
        const res = yield call(getProductFlag, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveProductFlag', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    // 获取当前登录在指定子产品中的角色标记
    *getProductUser({ payload }, { put, call }) {
      try {
        const res = yield call(getProductUser, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveProductUser', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getAllSubProductList({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getAllSubProductList, payload.productid);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveAllSubProductList', payload: res.result });

        const enableSubProductList = res.result.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];
        yield put({ type: 'saveEnableSubProductList', payload: enableSubProductList });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getAllUserByProductId({ payload }, { put, call, fork }) {
      try {
        const res = yield call(getAllUserByProductId, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveAllUserByProductId', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *setLastProduct({ payload }, { put, call, select }) {
      try {
        const res = yield call(setLastProduct, payload);
        if (res.code !== 200) return message.error(res.msg);
        // 成功了直接更新productList，不再调用get
        yield put({ type: 'getUserProduct' });

      } catch (e) {
        return message.error(e || e.message);
      }
    },

    *getSameCompanyProduct({ payload }, { put, call, select }) {
      try {
        const res = yield call(getSameCompanyProduct, payload);
        if (res.code !== 200) return message.error(res.msg);
        yield put({ type: 'saveAllProduct', payload: res.result });
      } catch (e) {
        return message.error(e || e.message);
      }
    },
  },

  reducers: {
    saveUserProduct(state, action) {
      return {
        ...state,
        productList: action.payload || [],
      };
    },

    saveAdminProduct(state, action) {
      return {
        ...state,
        adminProductList: action.payload || [],
      };
    },

    saveProductFlag(state, action) {
      return {
        ...state,
        userProductFlag: action.payload || {},
      };
    },

    // 最后一次选择的子产品
    saveLastProduct(state, action) {
      return {
        ...state,
        lastProduct: action.payload || {},
      };
    },

    saveProductUser(state, action) {
      return {
        ...state,
        productUser: action.payload || [],
      };
    },

    saveAllSubProductList(state, action) {
      return {
        ...state,
        subProductAll: action.payload || [],
      };
    },

    saveEnableSubProductList(state, action) {
      return {
        ...state,
        enableSubProductList: action.payload || [],
      };
    },

    saveAllUserByProductId(state, action) {
      return {
        ...state,
        allProductUser: action.payload || [],
      };
    },

    saveProductPermission(state, action) {
      return {
        ...state,
        productPermission: action.payload,
      };
    },

    saveAllProduct(state, action) {
      return {
        ...state,
        allProductList: action.payload || [],
      };
    }

  },
};
