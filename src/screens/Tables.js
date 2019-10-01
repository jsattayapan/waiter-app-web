import React from 'react';
import {connect} from 'react-redux';
import swal from 'sweetalert';

import peopleIcon from './../assets/icons/people.svg';
import {clearUser} from './../Redux/actions/user';
import {loadTables, setSectionTables} from './../Redux/actions/tables';
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

import {getTables, isTableOnHold, updateTableStatus, activeMorningShift, changeShift} from './../brains/tables';
import {isAuth} from './../brains/authentication';
import {
  getCurrentOrder,
  createCustomerTable,
  getTableLogs
} from './../brains/customerTable';
import {logout} from '../brains/user';


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
        />
        {
          this.props.tables.currentShift.status === 'active' ?
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
