import { serverIpAddress } from './../constanst';
import { store } from './../App';
import { loadAllFoodItems, setSelectedFoodItems } from './../Redux/actions/foodItems';

const axios = require('axios');

export const getAllFoodItems = (callback) => {
  const url =`${ serverIpAddress }api/restaurant/items/menu-items`;
  axios.get(url).then(response => {
    callback(response.data);
  }).catch(err => console.log(err));
}
