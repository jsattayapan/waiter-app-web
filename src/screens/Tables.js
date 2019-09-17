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

import {HeaderBar} from './../components/HeaderBar';
import {TopBuffer} from '../helpers/utilities';
import {
  LanguageToggleButton,
  ZoneToggleButton
} from './../components/toggleButton';

import {getTables, isTableOnHold, updateTableStatus} from './../brains/tables';
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
    console.log(this.props.user);
    this.state = {
      currentTablePage: [],
      showPopup: false
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
          updateTableStatus(tableInfo.number, 'on_create', this.props.user.id);
          this.togglePopup(tableInfo.number);
        }
      } else {
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
  render() {
    return (
      <div className="container">
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
        />
        <div className="row">
          <div className="col-sm-2" style={{background: '#ACC538'}}>
            {this.props.tables.allTables.map((section, index) => (
              <TableSection
                label={section.section}
                key={index}
                onclick={this.changeTableSection}
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

class RegisterTablePopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableNumber: props.tableNumber,
      zone: '',
      number_of_guest: 1,
      language: '',
      error: false
    };
  }
  setZone = zone => {
    this.setState({zone});
  };

  setLanguage = language => {
    this.setState({language});
  };
  increaseGuest = () => {
    const current = this.state.number_of_guest;
    this.setState({
      number_of_guest: current + 1
    });
  };
  decreaseGuest = () => {
    const current = this.state.number_of_guest;
    if (current > 1) {
      this.setState({
        number_of_guest: current - 1
      });
    }
  };
  popupScreenHandler = e => {
    if (e.target.className === 'registerTablePopup') {
      this.props.togglePopup();
    }
  };
  handleSubmit = () => {
    if (!this.state.zone || !this.state.language) {
      this.setState({error: true});
    } else {
      this.props.submitCreateTable(this.state);
    }
  };
  render() {
    return (
      <div className="registerTablePopup" onClick={this.popupScreenHandler}>
        <div className="registerTablePopupContent">
          <div className="container">
            <div className="row ">
              <h4 style={{margin: '10px'}}>โต๊ะ: {this.props.tableNumber}</h4>
              {this.state.error && (
                <span style={{margin: '10px', color: 'red', paddingTop: '5px'}}>
                  กรุณาเลือก Zone และ ภาษา
                </span>
              )}
            </div>

            <div className="row ">
              <h4 style={{margin: '10px'}}>Zone:</h4>
            </div>
            <div className="row">
              <ZoneToggleButton
                selected={this.state.zone === 'A1'}
                label="A1"
                setZone={this.setZone}
              />
              <ZoneToggleButton
                selected={this.state.zone === 'B1'}
                label="B1"
                setZone={this.setZone}
              />
              <ZoneToggleButton
                selected={this.state.zone === 'B2'}
                label="B2"
                setZone={this.setZone}
              />
              <ZoneToggleButton
                selected={this.state.zone === 'B3'}
                label="B3"
                setZone={this.setZone}
              />
              <ZoneToggleButton
                selected={this.state.zone === 'B4'}
                label="B4"
                setZone={this.setZone}
              />
              <ZoneToggleButton
                selected={this.state.zone === 'B5'}
                label="B5"
                setZone={this.setZone}
              />
              <ZoneToggleButton
                selected={this.state.zone === 'B6'}
                label="B6"
                setZone={this.setZone}
              />
              <ZoneToggleButton
                selected={this.state.zone === 'B7'}
                label="B7"
                setZone={this.setZone}
              />
            </div>
            <div className="row">
              <h4 style={{margin: '10px'}}>
                จำนวนลูกค้า:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span>
                  <button
                    className="btn btn-success"
                    onClick={() => this.decreaseGuest()}
                  >
                    -
                  </button>
                </span>
                &nbsp; {this.state.number_of_guest} &nbsp;
                <span>
                  <button
                    className="btn btn-success"
                    onClick={() => this.increaseGuest()}
                  >
                    +
                  </button>
                </span>
              </h4>
            </div>
            <div className="row">
              <h4 style={{margin: '10px'}}>ภาษา:</h4>
            </div>
            <div className="row">
              <LanguageToggleButton
                selected={this.state.language === 'ไทย'}
                label="ไทย"
                setLanguage={this.setLanguage}
              />
              <LanguageToggleButton
                selected={this.state.language === 'อังกฤษ'}
                label="อังกฤษ"
                setLanguage={this.setLanguage}
              />
            </div>
            <TopBuffer />
            <div className="row">
              <div className="col-sm-6 text-center">
                <button
                  className="btn btn-danger"
                  onClick={() => this.props.togglePopup()}
                >
                  ยกเลิก
                </button>
              </div>
              <div className="col-sm-6 text-center">
                <button className="btn btn-success" onClick={this.handleSubmit}>
                  เปิดโต๊ะ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
