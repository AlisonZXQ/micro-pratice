export default {

  namespace: 'createProject',

  state: {
    projectContents: [], // 项目规划数据
    mileContents: [], // 项目里程碑数据
    productList: [], // 选择的product
    stoneName: '', // 里程碑联动筛选单据
    timeRange: [], // 已选项目起止时间的情况下限制里程碑截止时间
    hasUsedName: [], // 创建和编辑里程碑时校验是否重名
    hasSelectContents: [], // 创建项目时-》里程碑关联内容去掉已选择的
    selectSubProduct: {}, // 当前项目所选择的子产品

    clickStone: '',
  },

  effects: {
  },

  reducers: {
    saveAllContents(state, action) {
      return {
        ...state,
        projectContents: action.payload || [],
      };
    },

    savePartContents(state, action) {
      return {
        ...state,
        mileContents: action.payload || [],
      };
    },

    saveProductList(state, action) {
      return {
        ...state,
        productList: action.payload || [],
      };
    },

    saveStoneName(state, action) {
      return {
        ...state,
        stoneName: action.payload || '',
      };
    },

    saveTimeRange(state, action) {
      return {
        ...state,
        timeRange: action.payload || [],
      };
    },

    saveHasUsedName(state, action) {
      return {
        ...state,
        hasUsedName: action.payload || [],
      };
    },

    saveHasSelectContents(state, action) {
      return {
        ...state,
        hasSelectContents: action.payload || [],
      };
    },

    saveSelectSubProduct(state, action){
      return {
        ...state,
        selectSubProduct: action.payload || {},
      };
    },

    saveClickStone(state, action){
      return {
        ...state,
        clickStone: action.payload || '',
      };
    }
  },
};
