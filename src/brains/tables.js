import  {serverIpAddress} from './../constanst';

const axios = require('axios');

export const getTables = (callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/tables`;
  axios.get(url).then((response) => {
    callback(response.data);
  });
}

export const isTableOnHold = (table_number, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/tables/${table_number}`;
  axios.get(url).then(response => {
    console.log(response);
    const body = response.data[0][0];
    if(body.status === 'available'){
      callback({status: 'available'});
    }else{
      callback({
        status: body.status,
        short_name: body.short_name
      })
    }
  });
}

export const updateTableStatus = (number, status, userId) => {
  console.log('Update talbaes Statius', number, status, userId);
  const url = `${ serverIpAddress }api/restaurant/tables/tables/update-table-status`;
  axios.put(url, {
    number, status, hold_by: userId
  }).then().catch(e => console.log(e));
}

// export const createCustomerTable = ({
//   table_number,
//   number_of_guest,
//   language,
//   zone,
//   create_by
// }) => {
//   const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/add`;
//   axios.post(url, {
//     table_number,
//     number_of_guest,
//     language,
//     zone,
//     create_by
//   }).then().catch(err => console.log(err));
// }
