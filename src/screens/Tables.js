import React from 'react';
import {connect} from 'react-redux';
import swal from 'sweetalert';

import peopleIcon from './../assets/icons/people.svg';
import {clearUser} from './../Redux/actions/user';
import {loadTables, setSectionTables, setHistoryTables} from './../Redux/actions/tables';
import {
  setSelectedTable,
  setCurrentOrders,
  setTableLogs
} from './../Redux/actions/customerTable';
import {getTablesBySection} from './../Redux/selectors/tables';
import LoadingScreen from '../components/LoadingScreen';
import {HeaderBar} from './../components/HeaderBar';
import {TopBuffer} from '../helpers/utilities';
import RegisterTablePopup from './../components/RegisterTable'

import {getTables, isTableOnHold, updateTableStatus, activeMorningShift, changeShift, getHistrotyTable} from './../brains/tables';
import {isAuth} from './../brains/authentication';
import {
  getCurrentOrder,
  createCustomerTable,
  getTableLogs
} from './../brains/customerTable';
import {logout, resetTableNUser} from '../brains/user';


import { formatNumber } from './../helpers/utilities';

import './Tables.css';

var moment = require('moment');

class Tables extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTablePage: [],
      showPopup: false,
      isLoading: false
    };
    //AUTHENTICATION
    isAuth(this.props.user.id, data => {
      if (data) {
        getHistrotyTable(tables => {
          this.props.dispatch(setHistoryTables(tables))
        })
        getTables(data => {
          this.props.dispatch(loadTables(data));
          this.props.dispatch(
            setSectionTables(
              getTablesBySection(
                this.props.tables.allTables,
                this.props.tables.allTables[0].section
              )
            )
          );
        });
      } else {
        this.props.dispatch(clearUser());
        this.props.history.push('/');
      }
    });
  }
  togglePopup = tableNumber => {
    if (this.state.showPopup) {
      console.log('Update statu to available');
      updateTableStatus(this.state.tableNumber, 'available', '');
    }
    this.setState(state => ({
      tableNumber,
      showPopup: !state.showPopup
    }));
  };
  tableBoxClick = tableInfo => {
    this.setState({
      isLoading: true
    })
    isTableOnHold(tableInfo.number, res => {
      if (res.status === 'available') {
        if (tableInfo.id !== null) {
          updateTableStatus(tableInfo.number, 'on_order', this.props.user.id);
          this.props.dispatch(setSelectedTable(tableInfo));
          getCurrentOrder(tableInfo.id, response => {
            this.props.dispatch(setCurrentOrders(response));
            getTableLogs(tableInfo.id, logs => {
              this.props.dispatch(setTableLogs(logs));
              this.props.history.push('/customer-table');
            });
          });
        } else {
          console.log('Tabble Info: ', tableInfo);
          if(tableInfo.complimentary === 0){
            this.setState({
              isLoading: false
            })
            updateTableStatus(tableInfo.number, 'on_create', this.props.user.id);
            this.togglePopup(tableInfo.number);
          }else{
            this.setState({
              isLoading: false
            });
            this.submitCreateTable({
              language: 'ไทย',
              number_of_guest: 1,
              tableNumber: tableInfo.number,
              zone: 'B1'
            });
          }
        }
      } else {
        this.setState({
          isLoading: false
        })
        console.log('Someone is useing');
        swal({
          icon: 'error',
          title: 'ไม่สามารถเข้าได้',
          text: `${res.short_name} กำลังให้บริการโต๊ะ ${tableInfo.number}`
        });
      }
    });
  };
  logoutButtonClick = () => {
    logout(this.props.user.id);
    this.props.dispatch(clearUser());
    this.props.history.push('/');
  };
  changeTableSection = section => {
    const result = getTablesBySection(this.props.tables.allTables, section);
    if (result !== this.props.tables.sectionTables) {
      this.props.dispatch(setSectionTables(result));
    }
  };
  submitCreateTable = ({language, number_of_guest, tableNumber, zone}) => {
    this.setState({
      showPopup: false,
      isLoading: true
    })
    updateTableStatus(tableNumber, 'on_order', this.props.user.id);
    const info = {
      table_number: tableNumber,
      number_of_guest,
      language,
      zone,
      create_by: this.props.user.id
    };
    createCustomerTable(info, data => {
      this.props.dispatch(setSelectedTable(data));
      getCurrentOrder(data.id, response => {
        this.props.dispatch(setCurrentOrders(response));
        getTableLogs(data.id, logs => {
          this.props.dispatch(setTableLogs(logs));
          this.props.history.push('/customer-table');
        });
      });
    });
  };


  activeMorningShift = () => {
    activeMorningShift(this.props.user.id, (response) => {
      if(!response.status){
        swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: response.msg
        });
      }
    });
  };

  changeShift = (passcode) => {
    changeShift(this.props.user.id, passcode, this.props.tables.currentShift.period, (status, msg) => {
      if(status){
        swal({
          icon: 'success',
          title: 'สำเร็จ',
          text: msg
        });
      }else{
        swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: msg
        });
      }
    });
  }

  resetTableNUser = (passcode) => {
    resetTableNUser(this.props.user.id, passcode, (status, msg) => {
      if(status){
        swal({
          icon: 'success',
          title: 'สำเร็จ',
          text: msg
        });
      }else{
        swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: msg
        });
      }
    });
  }

  linkToHistoryPage = () => {
    this.setState({
      showHistory: !this.state.showHistory
    })
  }

  render() {
    return (
      <div className="container">
        { this.state.isLoading && <LoadingScreen /> }
        {this.state.showPopup && (
          <RegisterTablePopup
            togglePopup={this.togglePopup}
            submitCreateTable={this.submitCreateTable}
            tableNumber={this.state.tableNumber}
          />
        )}
        <HeaderBar
          name={this.props.user.name}
          buttonFunction={this.logoutButtonClick}
          buttonLabel="ออกจากระบบ"
          activeMorningShift={this.activeMorningShift}
          currentShift={this.props.tables.currentShift}
          changeShift={this.changeShift}
          resetTableNUser={this.resetTableNUser}
        />
        {this.props.tables.currentShift.status === 'active'?
          <div className="row">
            { !this.state.showHistory ?
              <div className="col-sm-12 text-right">
                <button className="btn btn-link" onClick={() => this.linkToHistoryPage()}>โต๊ะที่รับเงินแล้ว</button>
              </div>:
              <div className="col-sm-12 text-right">
                <button className="btn btn-link" onClick={() => this.linkToHistoryPage()}>โต๊ะปัจจุบัน</button>
              </div>
            }
          </div>:
          <div></div>
        }
        {
          this.props.tables.currentShift.status === 'active' ?
          !this.state.showHistory ?
          <div className="row">
            <div className="col-sm-2" style={{background: '#ACC538'}}>
              {this.props.tables.allTables.map((section, index) => (
                <TableSection
                  label={section.section}
                  key={index}
                  onclick={this.changeTableSection}
                  currentShift={this.props.tables.currentShift}
                />
              ))}
            </div>
            <div className="col-sm-10">
              <div className="row">
                {this.props.tables.sectionTables.map((table, index) => (
                  <TableBox tableInfo={table} link={this.tableBoxClick} />
                ))}
              </div>
            </div>
          </div>:
          <div className="row">
            <div className="col-sm-12">
              <h4>โต๊ะที่รับเงินแล้ว</h4>
            </div>
            <div className="co-sm-12 ">
              <table className="table table-hover" style={{width: '1200px'}}>
                {console.log(this.props.tables.historyTables)}
                <thead>
                    <tr>
                      <th style={{ width: '10%', textAlign: 'left'}}>โต๊ะ</th>
                      <th style={{ width: '10%', textAlign: 'right'}}>ยอดชำระ</th>
                      <th style={{ width: '12%', textAlign: 'center'}}>จ่ายโดย</th>
                      <th style={{ width: '10%', textAlign: 'center'}}>จำนวนลูกค้า</th>
                      <th style={{ width: '10%', textAlign: 'center'}}>ภาษา</th>
                      <th style={{ width: '10%', textAlign: 'center'}}>เปิดโต๊ะโดย</th>
                      <th style={{ width: '10%', textAlign: 'center'}}>เวลาเข้า</th>
                      <th style={{ width: '10%', textAlign: 'center'}}>เวลาออก</th>
                    </tr>
                </thead>
              </table>
              {
                this.props.tables.historyTables.tables.length !== 0 && this.props.tables.historyTables.tables.map( table => (
                  <HistroyTableLine
                    id={table.id}
                    table_number={table.table_number}
                    number_of_guest={table.number_of_guest}
                    total_amount={table.total_amount}
                    short_name={table.short_name}
                    orders={table.order}
                    method={table.method}
                    language={table.language}
                    open_at={table.open_at}
                    close_at={table.close_at}
                  />
                ))
              }
            </div>
          </div>
          :
          <div className="row" style={{marginTop:'300px'}}>
            <div className="col-sm-12 text-center">
              <h3>ยินดีต้อนรับสู่ระบบร้านอาหาร</h3>
              <h5>กรุณากดปุ่ม "เปิดรอบเช้า" เพื่อเริ่ิมการทำงาน</h5>
            </div>
          </div>
        }

      </div>
    );
  }
}

const mapStateToprops = state => {
  return {
    user: state.user,
    tables: state.tables
  };
};

export default connect(mapStateToprops)(Tables);

class HistroyTableLine extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      showOrders: false
    }
  }
  showOrders = () => {
    this.setState({
      showOrders: !this.state.showOrders
    });
  }
  render(){
    return(
<div style={{marginTop:'-15px'}}>
      <table class="table table-hover mt-0">
        <tbody>
        <tr onClick={() => this.showOrders()}>
          <td style={{textAlign: 'left', width: '10%'}} >{this.props.table_number}</td>
          <td style={{textAlign: 'right', width: '10%'}} >{formatNumber(this.props.total_amount)}.-</td>
          <td style={{textAlign: 'center', width: '20%'}} >{this.props.method === 'cash' ? 'เงินสด' :
              this.props.method === 'card' ? 'บัตร' :
              this.props.method === 'room' ? 'ย้ายเข้าบัญชีห้องพัก' :
              'complimentary'
          }</td>
          <td style={{textAlign: 'left', width: '10%'}} >{this.props.number_of_guest}</td>
          <td style={{textAlign: 'left', width: '10%'}} >{this.props.language}</td>
          <td style={{textAlign: 'left', width: '10%'}} >{this.props.short_name}</td>
          <td style={{textAlign: 'left', width: '10%'}} >{moment(this.props.open_at).format('HH:mm')}</td>
          <td style={{textAlign: 'left', width: '10%'}} >{moment(this.props.close_at).format('HH:mm')}</td>
        </tr>
      </tbody>
    </table>
        {this.state.showOrders &&
          <table class="table table-borderless">
            <tbody>
          <tr>
          <td colSpan='9'>
            <div className='text-left pl-4'>
              <p><b>รายการอาหาร:</b></p>
              {this.props.orders.map(order => (
                <p>{order.quantity} x {order.name}</p>
              ))}
            </div>
          </td>
        </tr>

      </tbody>
    </table>}
    </div>
    )
  }
}

class TableSection extends React.Component {
  render() {
    const style = {
      margin: '10px',
      cursor: 'pointer',
      background: '#fff'
    };
    return (
      <div
        className="row"
        style={style}
        onClick={() => this.props.onclick(this.props.label)}
      >
        <div className="col-sm-12 text-center">
          <h4>{this.props.label}</h4>
        </div>
      </div>
    );
  }
}

const TableBox = props => {
  const style = {
    background:
      props.tableInfo.status === 'opened'
        ? '#5291ff'
        : props.tableInfo.status === 'checked' ? '#C82333' : '#C6E0F2'
  };
  const time = moment(props.tableInfo.timestamp);
  return (
    <div className="col-2">
      <div className="row">
        <div
          className="tableBox"
          style={style}
          onClick={() => props.link(props.tableInfo)}
        >
          <h3 style={{color: 'black'}}>{props.tableInfo.number}</h3>
          {props.tableInfo.status === null ? (
            ''
          ) : (
            <p style={{color: 'black'}}>
              <span>
                <img alt="Number of customer" src={peopleIcon} width="20px" />
              </span>{' '}
              x {props.tableInfo.number_of_guest} | Zone: {props.tableInfo.zone}
              <br /> {time.format('hh:mm A')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
