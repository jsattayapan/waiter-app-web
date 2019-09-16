
import  {serverIpAddress} from './../constanst';

const axios = require('axios');

export function login(number, passcode, callback){
  const url = `${ serverIpAddress }api/users/staffs/login`;
  axios.post(url, { number, passcode, platform: 'web-app' })
    .then((res) => {
      callback({
        status: true,
        data: res.data
      });
    }).catch(e => {
      callback({
        status: false,
        msg: e.response.data.msg 
      });
    });
}

export const logout = (id) => {
  const url = `${ serverIpAddress }api/users/staffs/logout`;
  axios.post(url, {id}).then();
}
