
import  {serverIpAddress} from './../constanst';

const { axios } = require('./networking');

export function login(number, passcode, callback){
  const url = `${ serverIpAddress }api/users/staffs/login`;
  axios.post(url, { number, passcode, platform: 'web-app-cashier' })
    .then((res) => {
      callback({
        status: true,
        data: res.data
      });
    }).catch(e => {
      const msg = e.response !== undefined ? e.response.data.msg : 'ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้' ;
      callback({
        status: false,
        msg
      });
    });
}

export const logout = (id) => {
  const url = `${ serverIpAddress }api/users/staffs/logout`;
  axios.post(url, {id}).then();
}
