const tablesReducerDefaultState = {
  allTables: [],
  sectionTables: [],
  currentShift: {status: 'inactive'}
};

export default (state = tablesReducerDefaultState, action) => {
  switch (action.type){
    case 'LOAD_TABLES':
      return {
        ...state,
        allTables: action.tables
      }
      case 'SET_CURRENT_SHIFT':
        return {
          ...state,
          currentShift: action.currentShift
        }
    case 'SET_SECTION_TABLES':
      return {
        ...state,
        sectionTables: action.tables
      }
    default:
      return state;
  }
};
