import React from 'react';
import {TopBuffer} from './../helpers/utilities';
import Logo from '../assets/jep_logo.png';
import swal from 'sweetalert';

export class HeaderBar extends React.Component{
  changeShift = () => {
    swal({
      title: 'คุณต้องการบันทึกชิพรอบเช้า ?',
      content: {
        element: "input",
        attributes: {
          placeholder: "กรุณาใส่รหัสเพื่อยืนยัน",
          type: "password",
        },
      },
    }).then(data => {
      this.props.changeShift(data);
    });
  }

  activeMorningShift = () => {
    swal({
      title: 'คุณต้องการเปิดชิพรอบเช้า ?',
      buttons: {
        cancel: "ปิด",
        confirm: "ยืนยัน",
        }
    }).then((data) => {
      if(data){
        this.props.activeMorningShift();
      }
    });
  }

  resetTableNUser = () => {
      swal({
        title: 'คุณต้องการ Reset สถานะโต๊ะและผู้ใช้ ?',
        content: {
          element: "input",
          attributes: {
            placeholder: "กรุณาใส่รหัสเพื่อยืนยัน",
            type: "password",
          },
        },
      }).then(data => {
        this.props.resetTableNUser(data);
      });
  }

  render(){
    return(
      <div>
        <div className="row fixed-content" style={headerStyle}>
          <div className="col-sm-2 mt-3">
            <img className="ml-4" height="100px" alt="Jep's Logo" src={Logo}/>
          </div>
          {this.props.info !== undefined ?
            <div className="col-sm-5">
            <TopBuffer />
            <p>โต๊ะ: <span style={tableNumberStyle}>{this.props.info.table_number}</span><br/>Zone: {this.props.info.zone}<br />จำนวนลูกค้า: {this.props.info.number_of_guest}</p>
          </div>
        : <div className="col-sm-5">

        </div>
      }
          <div className="col-sm-5">
            <TopBuffer />
            <div className="row">
              <div className="col-sm-6">
                <button className='btn btn-danger' onClick={this.props.buttonFunction}
                  style={{marginTop:'10px'}}>{this.props.buttonLabel}</button>
                  <br /><br />
                  <p className="text-left" style={appBarStyle}>User: {this.props.name}</p>
              </div>
              {this.props.buttonLabel === "ออกจากระบบ" ?

              <div className="col-sm-6">
                  {
                    this.props.currentShift.status === "active" ?

                    this.props.currentShift.period === 'morning' ?
                      <button className='btn btn-info' onClick={() => this.changeShift()}
                        style={{marginTop:'10px'}}>บันทึกรอบเช้า</button>:
                      <button className='btn btn-info' onClick={() => this.changeShift()}
                        style={{marginTop:'10px'}}>บันทึกรอบเย็น</button>

                  :
                    <button className='btn btn-info' onClick={() => this.activeMorningShift()}
                      style={{marginTop:'10px'}}>เปิดรอบเช้า</button>
                    }<br />
                    <button className='btn btn-warning' onClick={() => this.resetTableNUser()}
                      style={{marginTop:'10px'}}>Reset สถานะโต๊ะและผู้ใช้</button>
              </div>
              :
              <div>

              </div>
            }
            </div>

          </div>
        </div>

      </div>
    )
  }
}

const tableNumberStyle = {
  fontSize: '40px',
  color: 'blue'
}

const headerStyle = {
  background: '#EDEDED',
  color: 'black'
}

const appNameStyle = {
  color: '#5291ff',
  fontSize: '20px',
  fontWeight:'bold'
}

const appBarStyle = {
  fontSize: '15px',
}
