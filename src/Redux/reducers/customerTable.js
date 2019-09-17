const customerTableReducerDefaultState = {};

export default (state = customerTableReducerDefaultState, action) => {
  switch (action.type){
    case 'SET_SELECTED_TABLE':
      return action.payload;
    case 'LOAD_TABLES_LOGS':
      return {
        ...state,
        logs: action.logs
      };
    case 'LOAD_CURRENT_ORDERS':
      return {
        ...state,
        currentOrders: action.orders
      }
    case 'SET_TABLE_STATUS':
    return {
      ...state,
      status: action.status
    }
    default:
      return state;
  }
};
