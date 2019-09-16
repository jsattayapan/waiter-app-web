import  {serverIpAddress} from './../constanst';

const axios = require('axios');

export const getCurrentOrder = (id, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/item-orders/${id}`;
  axios.get(url).then((response) => {
    callback(response.data);
  });
}

export const createCustomerTable = (payload, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/add`;
  axios.post(url, payload).then(response => {
    console.log('Resonse: ', response);
    callback(response.data);
  });
}

export const closeCustomerTable = (customer_table_id) => {
  const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/close`;
  axios.post(url, {customer_table_id}).then().catch(err => console.log(err));
}

export const sendNewOrderToServer = ({ userId, tableId, items }) => {
  const url = `${ serverIpAddress }api/restaurant/tables/item-orders/add`;
  axios.post(url, {
    userId, tableId, items: JSON.stringify(items)
  }).then((res) =>{
    console.log(res);
  }).catch(err => console.log(err));
}

export const cancelOrder = ({order_id, quantity, remark, create_by}, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/item-orders/cancel`;
  axios.post(url, {
    order_id,
    quantity,
    remark,
    create_by
  }).then((res) => {
    console.log(res);
    callback();
  }).catch(e => console.log(e.msg));
}

export const checkBill = ({customer_table_id, user_id}, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/check-bill`;
  axios.post(url, {customer_table_id, user_id}).then(res => {
    callback();
  }).catch(e => console.log(e));
}

export const getTableLogs = (table_id, callback) => {
  var logs = [];
  console.log('Get Table logs', table_id);
  let url = `${ serverIpAddress }api/restaurant/tables/customer-tables/get-table-status/${table_id}`;
  axios.get(url).then((res) => {
    for (const status of res.data){
      logs.push(status)
    }
    url = `${ serverIpAddress }api/restaurant/tables/item-orders/get-all-orders-status/${table_id}`;
    axios.get(url).then(res => {
      for(const status of res.data){
        logs.push(status)
      }
      logs.sort(function(a,b){
        return new Date(a.timestamp) - new Date(b.timestamp);
      });
      callback(logs);
    });
  });
}




// var detail = '';
// switch (status.status) {
//   case 'opened':
//     detail = 'เปิดโต๊ะ';
//     break;
//   case 'checked':
//     detail = 'เรียกเช็คบิล';
//     break;
//   default: detail = ''
// }



// create_by: "91a60d58-6803-44a4-acc7-49569e9d44f5"
// ​​
// id: "23b6daaa-2de9-4989-84f1-8ec1e4c68ba6"
// ​​
// language: "อังกฤษ"
// ​​
// number_of_guest: 5
// ​​
// status: "opened"
// ​​
// table_number: "Bar1"
// ​​
// timestamp: "2019-09-10T13:36:46.706Z"
// ​​
// zone: "B2"
