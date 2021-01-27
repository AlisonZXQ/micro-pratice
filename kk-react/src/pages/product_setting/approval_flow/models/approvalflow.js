
export default {

  namespace: 'approvalflow',
  
  state: {
    flowData: {},
    currentNode: 0,
  },

  
  effects: {

  },
  
  reducers: {
    saveFlowData(state, action){
      return {
        ...state,
        flowData: action.payload || {},
      };
    },
    saveCurrentNode(state, action){
      return {
        ...state,
        currentNode: action.payload || {},
      };
    },
  },
};
  