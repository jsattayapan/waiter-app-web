const foodItemsDefaultState = {
  allFoodItems: [],
  selectedFoodItems: []
};

export default (state = foodItemsDefaultState, action) => {
  switch (action.type){
    case 'SET_SELECTED_FOOD_ITEMS':
      return {
        ...state,
        selectedFoodItems: action.foodItems
      };
    case 'LOAD_ALL_FOOD_ITEMS':
      return {
        ...state,
        allFoodItems: action.foodItems
      };
    default:
      return state;
  }
};
