
export default {

  namespace: 'layout',

  state: {
    collapse: false,
  },

  effects: {
  },

  reducers: {
    saveCollapse(state, action) {
      return {
        ...state,
        collapse: action.payload || false,
      };
    },
  },
};
