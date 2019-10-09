import React from 'react';
import {HeaderBar} from './../components/HeaderBar';
import moment from 'moment';
import { getDailyTotalItem } from '../brains/foodItems';
import {connect} from 'react-redux';

class DailyTotalItems extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      date: moment().format('DD/MM/YYYY'),
      items: {
        food: [],
        beverage: []
      }
    }
  }

  submitSearch(){
    console.log('click submit');
    getDailyTotalItem({date: this.state.date}, (status, data) => {
      if(status){
        this.setState({
          items: {
            food: data.filter(item => item.category_name !== 'เครื่องดื่ม').sort((a,b) => a.item_code > b.item_code),
            beverage: data.filter(item => item.category_name === 'เครื่องดื่ม').sort((a,b) => a.item_code > b.item_code)
          }
        })
        console.log(this.state.items);
      }else{

      }
    })
  }

  dateOnChange = (e) => {
    this.setState({
      date: e.target.value
    })
  }

  render(){
    return(
      <div className="container">
      <HeaderBar
        buttonFunction={() => {
          this.props.history.push('/tables');
        }}
        buttonLabel="กลับหน้าโต๊ะ"
        name={this.props.user.name}
      />
        <div className="row mt-3">
          <div className="col-sm-4">
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">วันที่</span>
              </div>
              <input type="text" className="form-control" onChange={this.dateOnChange} value={this.state.date} placeholder={moment().format('DD/MM/YYYY')} />
            </div>
          </div>
          <div className="col-sm-4">
            <button className="btn btn-info" onClick={() => this.submitSearch()}>ค้นหา</button>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-sm-6 text-center">
            <h4>เครื่องดื่ม</h4>
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>รายการ</th>
                  <th>จำนวน</th>
                </tr>
              </thead>
        {this.state.items.beverage.length !== 0 || this.state.items.beverage.length !== undefined ?
          <tbody>
            {this.state.items.beverage.map(item => (
              <tr>
                <td>{item.item_code}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
          :
          <tbody>
              <tr>
                <td colSpan='2'>ไม่มีข้อมูล</td>
              </tr>
          </tbody>
        }
        </table>
        </div>
        <div className="col-sm-6 text-center">
          <h4>อาหาร</h4>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>รายการ</th>
                <th>จำนวน</th>
              </tr>
            </thead>
      {this.state.items.food.length !== 0 || this.state.items.food.length !== undefined ?
        <tbody>
          {this.state.items.food.map(item => (
            <tr>
              <td>{item.item_code}</td>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
        :
        <tbody>
            <tr>
              <td>ไม่มีข้อมูล</td>
            </tr>
        </tbody>
      }
      </table>
      </div>
      </div>
      </div>
    )
  }
}

const mapStateToprops = state => {
  return {
    user: state.user
  };
};

export default connect(mapStateToprops)(DailyTotalItems);
