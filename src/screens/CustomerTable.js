import React from 'react';
import { connect } from 'react-redux';
import {HeaderBar} from './../components/HeaderBar';
import 'font-awesome/css/font-awesome.min.css';
import './CustomerTableStyle.css';
import swal from 'sweetalert';

import { updateTableStatus } from './../brains/tables';
import { closeCustomerTable, sendNewOrderToServer, cancelOrder, checkBill } from './../brains/customerTable';
import { getAllFoodItems } from './../brains/foodItems';
import { getCurrentOrder } from './../brains/customerTable';

import { getFoodItemsByCategory } from './../Redux/selectors/foodItems';
import { loadAllFoodItems, setSelectedFoodItems } from './../Redux/actions/foodItems';
import { setCurrentOrders } from './../Redux/actions/customerTable';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faFireAlt, faTimesCircle,
   faEdit, faFileInvoiceDollar, faTrashAlt, faPercentage } from '@fortawesome/free-solid-svg-icons';

var moment = require('moment');


class CustomerTable extends React.Component {

  constructor(props){
    super(props);
    getAllFoodItems((foodItems) => {
      props.dispatch(loadAllFoodItems(foodItems));
      props.dispatch(setSelectedFoodItems(
        getFoodItemsByCategory(this.props.foodItems.allFoodItems, this.props.foodItems.allFoodItems[0].category)));
    });
    this.state = {
      newOrderItems: [],
      editNewItem: {
        show: false,
        payload: {}
      },
      deleteOrderItem: {
        show: false,
        payload: {}
      },
      discount: {
        show: true,
        payload: {}
      },
      codeInput: '',
      searchInput: '',
      filterItems: [],
      showLogs: false
    }
  }

    existButtonHandler = () => {
      updateTableStatus(this.props.customerTable.table_number, 'available' , '');
      this.props.history.push('/tables');
    }
    closeCustomerTableHandler = () => {
      updateTableStatus(this.props.customerTable.table_number, 'available' , '');
      closeCustomerTable(this.props.customerTable.id);
      this.props.history.push('/tables');
    }
    categoryButtonHandler = (category) => {
      this.setState({
        searchInput: ''
      })
      this.props.dispatch(setSelectedFoodItems(getFoodItemsByCategory(this.props.foodItems.allFoodItems, category)));
    }
    addNewItem = (payload) => {
      var currentItems = this.state.newOrderItems;
      var isExisted = false;
      currentItems.forEach(item => {
        if(payload.code === item.code){
          isExisted = true;
          item.quantity += payload.quantity;
          item.remark = payload.remark || item.remark
        }
      });
      if(!isExisted){
        currentItems.push(payload);
      }
      this.setState(() => ({
        newOrderItems: currentItems
      }))
    }
    newOrderItemsEdit = (order) => {
      this.setState({
        editNewItem: {
          show: true,
          payload: order
        }
      })
    }
    onEditClickClose = () => {
      this.setState({
        editNewItem: {
          show: false,
          payload: {}
        }
      })
    }
    onEditClickDelete = (code) => {
      var currentItems = this.state.newOrderItems.filter((item) => (item.code !== code));
      this.setState({
        editNewItem: {
            show: false,
            payload: {}
          },
        newOrderItems: currentItems
      })
    }
    onEditClickSave = ({ code, quantity, remark }) => {
      var currentItems = this.state.newOrderItems;
      currentItems.forEach(item => {
        if(code === item.code){
          item.quantity= quantity;
          item.remark = remark;
        }
      });
      this.setState(({
        editNewItem: {
            show: false,
            payload: {}
          },
        newOrderItems: currentItems
      }));
    }
    codeInputHandler = (e) => {
      this.setState({
        codeInput: e.target.value
      })
    }
    codeInputSubmit = (e) => {
      e.preventDefault();
      if(this.state.codeInput.trim() !== ''){
        const input = this.state.codeInput;
        const splitRemark = input.split('/');
        var errorQuantity = false;
        var remark;
        var quantity;
        if(splitRemark.length === 2){
          remark = splitRemark[1];
        }
        const splitQuantity = splitRemark[0].split('*');
        if(splitQuantity.length === 2){
          parseInt(splitQuantity[1]);
          quantity = parseInt(splitQuantity[1]);
          errorQuantity = isNaN(quantity);
        }

        var code = parseInt(splitQuantity[0]);
        var setItem;
        this.props.foodItems.allFoodItems.forEach((category) => {
          category.sub_category.forEach(sub_category => {
            sub_category.items.forEach(item => {
              if(item.code === code){
                setItem = item;
              }
            })
          })
        })
        if(setItem !== undefined && !errorQuantity){
          if(quantity !== undefined){
            const data = {
              code: code,
              name: setItem.name,
              quantity: quantity,
              remark: remark,
              price: setItem.price
            }
            this.addNewItem(data);
            this.setState({
              codeInput: ''
            });
          }else{
            const data = {
              code: code,
              name: setItem.name,
              quantity: 1,
              remark: remark,
              price: setItem.price
            }
            this.addNewItem(data);
            this.setState({
              codeInput: ''
            });
          }
        }else{
          if(setItem === undefined){
            swal("เกิดข้อผิดพลาด", "ไม่พบรายการอาหาร", "error");
            this.setState({
              codeInput: ''
            });
          }else{
            swal("เกิดข้อผิดพลาด", "จำนวนอาหารไม่ถูกต้อง", "error");
            this.setState({
              codeInput: ''
            });
          }
        }
      }
    }
    sendNewItemsHandler = () => {
      if(this.state.newOrderItems.length !== 0){
        const userId = this.props.user.id;
        const tableId = this.props.customerTable.id;
        const items = this.state.newOrderItems;
        if(!tableId || !userId){
          swal('เกิดข้อผิดพลาด','ไม่สามารถระบุไอดีของโต๊ะหรือผู้ใช้งานได้','warning');
        }else{
          sendNewOrderToServer({
            userId, tableId, items
          });
          swal('เสร็จสิ้น','รายการถูกบันทึก','success').then(() => {
            this.existButtonHandler();
          });
        }
      }else{
        swal('เกิดข้อผิดพลาด','ไม่พบรายการอาหารใหม่','warning');
      }
    }
    seachBoxChangeHandler = (e) => {
      if(e.target.value.length === 1){
        this.setState({
          searchInput: e.target.value.trim()
        });
      }else{
        this.setState({
          searchInput: e.target.value
        })
      }

      var filterItems = [];
      this.props.foodItems.allFoodItems.forEach((category) => {
        category.sub_category.forEach(sub_category => {
          sub_category.items.forEach(item => {
            if(item.name.toLowerCase().includes(e.target.value) || item.code.toString().includes(e.target.value)){
              filterItems.push(item);
            }
          })
        })
      })
      this.setState({
        filterItems: filterItems
      })
    }
    deleteOrderItem = (payload) => {
      this.setState({
        deleteOrderItem: {
          show: true,
          payload
        }
      })
    }
    deleteOrderItemClose = () => {
      this.setState({
        deleteOrderItem: {
          show: false,
          payload: {}
        }
      })
    }
    deleteOrderItemSubmit = (payload) => {
      this.setState({
        deleteOrderItem: {
          show: false,
          payload: {}
        }
      })
      cancelOrder({
        order_id: payload.id,
        quantity: payload.quantity,
        remark: payload.remark,
        create_by: this.props.user.id}, () => {
          getCurrentOrder(this.props.customerTable.id, (response) => {
            this.props.dispatch(setCurrentOrders(response));
            swal("สำเร็จ", "รายการถูกยกเลิกแล้ว", "success");
          })

        });
    }
    checkBill = () => {
      checkBill({
        customer_table_id: this.props.customerTable.id,
        user_id: this.props.user.id
      }, () => {
        swal('เสร็จสิ้น','รายการถูกบันทึก','success').then(() => {
          this.existButtonHandler();
        });
      })
    }
    toggleShowLogs = () => {
      this.setState({
        showLogs : !this.state.showLogs
      })
    }
    discountHandler = () => {
      this.setState({

      })
    }
    render(){
      return(
        <div className="container">
          {this.state.discount.show && <DiscountOption

          />}
          {this.state.editNewItem.show && <EditNewMenuItem
            onClickClose={this.onEditClickClose}
            onClickDelete={this.onEditClickDelete}
            onClickSave={this.onEditClickSave}
            payload={this.state.editNewItem.payload} />}

            {this.state.deleteOrderItem.show && <DeleteOrderItemOption
              onClickClose={this.deleteOrderItemClose}
              onClickDelete={this.deleteOrderItemSubmit}
              payload={this.state.deleteOrderItem.payload} />}
          {this.props.customerTable.currentOrders &&
            this.props.customerTable.currentOrders.length === 0
            ? <HeaderBar name={this.props.user.name} info={this.props.customerTable} buttonFunction={() => {this.closeCustomerTableHandler()}} buttonLabel="ปิดโต๊ะ"/>
            : <HeaderBar name={this.props.user.name} info={this.props.customerTable} buttonFunction={() => {this.existButtonHandler()}} buttonLabel="กลับ"/>}

          <div className="row mt-3">
            <div className="col-sm-2" style={menuSectionStyle}>
              {
                this.props.foodItems.allFoodItems.map(cat => (
                  <div className="row my-3">
                    <div className="col-sm-12">
                      {this.props.foodItems.selectedFoodItems.category === cat.category && this.state.searchInput === '' ? (
                        <button className="btn btn-info btn-lg btn-block" onClick={() => this.categoryButtonHandler(cat.category)}>
                          {cat.category}
                        </button>
                      ) : (
                        <button className="btn btn-success btn-lg btn-block" onClick={() => this.categoryButtonHandler(cat.category)}>
                          {cat.category}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
            <div className="col-sm-5">
              <div className="row" >
                <div className="col-sm-12" style={menuItemStyle}>
                { this.state.searchInput === '' &&
                  this.props.foodItems.selectedFoodItems.sub_category
                  && this.props.foodItems.selectedFoodItems.sub_category.map(sub_cat => {
                  if(sub_cat.items.length !== 0) {
                    return (<div>
                      <div className="row mx-auto">
                        {sub_cat.sub_category}
                      </div>
                      <div className="row mx-auto">
                        {sub_cat.items.map(item => (
                          <MenuItemBox label={item.name} price={item.price} code={item.code} onClick={this.addNewItem}/>
                        ))}
                      </div>
                    </div>)
                  }
                })}
                {
                  this.state.searchInput !== '' &&
                  <div className="row mx-auto">
                    {this.state.filterItems.map(item => <MenuItemBox label={item.name} price={item.price} code={item.code} onClick={this.addNewItem}/>)}
                  </div>
                }
                </div>
              </div>
              <div className="row">
                <div className="col-sm-12" style={seachBoxStyle}>
                  <div className="input-group mb-3 mt-3">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">ค้นหา</span>
                  </div>
                  <input
                    onChange={this.seachBoxChangeHandler}
                    type="text"
                    className="form-control"
                    placeholder="ชื่อรายการ หรือ รหัส"
                    value={this.state.searchInput}
                  />
                </div>
                </div>
              </div>
            </div>
            <div className="col-sm-5" style={orderListDivStyle}>
              <div className="col-sm-12" style={orderListPageStyle}>
                <div className="row" style={orderListTitleStyle}>
                  <div className="col-sm-5">
                  </div>
                  <div className="col-sm-2">
                    <h4 style={{margin: 'auto'}}>{!this.state.showLogs ? 'รายการ' : 'Logs'}</h4>
                  </div>
                  <div className="col-sm-1">
                  </div>
                  <div className="col-sm-4">
                    <button
                      onClick={() => this.toggleShowLogs()}
                      className="btn btn-link pull-right">ดู {this.state.showLogs ? 'รายการ' : 'Logs'}</button>
                  </div>
                </div>
                { !this.state.showLogs ?
                <div>
                <table width="100%">
                  <thead>
                    <tr>
                      <th style={{textAlign:'center'}} width="10%">จำนวน</th>
                      <th width="10%">สถานะ</th>
                      <th width="60%">รายการ</th>
                      <th width="20%">ราคา</th>
                    </tr>
                  </thead>
                </table>
                <div className="row" style={{margin: '5px 0', width: '100%', height:'440px', overflow: 'scroll'}}>
                  <table width="100%">
                  {this.props.customerTable.currentOrders && this.props.customerTable.currentOrders.map((order, index) => (

                    <tbody>
                    <tr>
                      <td width="10%" style={{textAlign:'center'}}>{order.quantity}</td>
                      <td width="10%" style={{textAlign:'center'}}>{order.status === 'sent' ?
                        <FontAwesomeIcon title={`ออเดอร์สถานะ: กำลังทำ | ส่งข้อมูลโดย: ${order.status_updateBy} | เวลา: ${moment(order.status_updateAt).format('hh:mm A')}`} icon={faFireAlt} color='orange' />
                      : order.status === 'complete' ?
                      <FontAwesomeIcon title={`ออเดอร์สถานะ: เสร็จ | อับเดตโดย: ${order.status_updateBy} | เวลา: ${moment(order.status_updateAt).format('hh:mm A')}`} icon={faCheckCircle} color='green' />
                      : <FontAwesomeIcon title={`ออเดอร์สถานะ: ยกเลิก | อับเดตโดย: ${order.status_updateBy} | เวลา: ${moment(order.status_updateAt).format('hh:mm A')}`} icon={faTimesCircle} color='red' />
                    }
                    </td>
                      <td className='orderItem' width="60%" title={`รับโดย: ${order.createBy} | เวลา: ${moment(order.createAt).format('hh:mm A')}`}>
                        {order.name}&nbsp;&nbsp;{order.status !== 'cancel' &&
                        <span onClick={() => this.deleteOrderItem({name: order.name, id: order.id, quantity: order.quantity})} title="ยกเลิก" className="newOrderItemsEdit deleteOrderIcon"><FontAwesomeIcon icon={faTrashAlt} color='red' /></span>
                      }
                      </td>
                      <td width="20%">{order.price * order.quantity}.-</td>
                    </tr>
                    </tbody>
                  ))}
                  {
                    this.state.newOrderItems.map((order, index) => (
                      <tbody>
                        <tr className='newOrderItems'>
                          <td style={{textAlign:'center'}} width="10%" className="quantity">{order.quantity}</td>
                          <td width="10%" style={{textAlign:'center'}}></td>
                          <td width="60%">
                            {order.name}&nbsp;&nbsp;
                            <span onClick={() => this.newOrderItemsEdit(order)} className="newOrderItemsEdit"><FontAwesomeIcon icon={faEdit} color='blue' /></span>
                          </td>
                          <td width="20%">{order.price * order.quantity}.-</td>
                        </tr>
                        {order.remark &&
                          <tr>
                            <td width="10%"></td>
                            <td width="10%"></td>
                            <td style={{color:'grey'}}>** {order.remark}</td>
                          </tr>}
                      </tbody>
                    ))
                  }
                  </table>
                </div>
              </div>
              :
              <div>
                <table width="100%">
                  <thead>
                    <tr>
                      <th width="15%">ส่งโดย</th>
                      <th width="10%">เวลา</th>
                      <th width="77%">รายละเอียด</th>

                    </tr>
                  </thead>
                </table>
                <div className="row" style={{margin: '5px 0', width: '100%', height:'440px', overflow: 'scroll'}}>
                  <table width="100%">
                    {this.props.customerTable.logs.map(log => (
                      <tbody>
                        <tr>
                          <td valign="top" width="15%">{log.short_name}</td>
                          <td valign="top" width="10%">{moment(log.timestamp).format('hh:mm')}</td>
                          {
                            (() => {
                              switch (log.status) {
                                case 'sent':
                                  return <td valid="top" width="75%">สั่งอาหาร:<b>{log.name}</b> | จำนวน:<b>{log.quantity}</b> {log.detail !== null ? `หมายเหตุ:${log.detail}`: ``}</td>;
                                  break;
                                case 'cancel':
                                  return  <td valid="top" width="75%">ยกเลิกอาหาร:<b>{log.name}</b> | จำนวน:<b>{log.quantity}</b> {log.detail !== null ? `หมายเหตุ:${log.detail}`: ``}</td>;
                                  break;
                                case 'complete':
                                  return  <td valid="top" width="75%">พร้อมเสริฟอาหาร:<b>{log.name}</b>| จำนวน:<b>{log.quantity}</b></td>;
                                  break;
                                case 'opened':
                                  return <td valid="top" width="75%">เปิดโต๊ะ</td>;
                                  break;
                                case 'checked':
                                return <td valid="top" width="75%">เรียกเช็คบิล</td>;
                                default: return <td valid="top" width="75%"></td>
                              }
                            })()
                          }
                        </tr>
                      </tbody>
                    ))}
                  </table>
                </div>
              </div>
            }
                <h4 style={{textAlign:'right'}}>รวม {
                  this.props.customerTable.currentOrders
                  && this.props.customerTable.currentOrders.reduce(
                    (sum,order) => (sum + (order.price * order.quantity))
                    ,0)
                  }.-</h4>
              </div>

              <div className="row mx-auto" >
                <div className="col-sm-2"><button className="btn btn-info"><span style={{fontSize:'25px'}}><i className="fa fa-exchange"></i></span></button></div>
                <div className="col-sm-2"><button onClick={() => this.discountHandler()} title='ลดราคา' className="btn btn-info"><span style={{fontSize:'25px'}}><FontAwesomeIcon icon={faPercentage} color='white' /></span></button></div>
                <div className="col-sm-2">{
                  this.props.customerTable.currentOrders && this.props.customerTable.currentOrders.length !== 0 ?
                  <button onClick={() => this.checkBill()} title='เช็คบิล' className="btn btn-info px-3"><span style={{fontSize:'25px'}}><FontAwesomeIcon icon={faFileInvoiceDollar} color='white' /></span></button>
                  :<button title='เช็คบิล' className="btn btn-secondary px-3" disabled><span style={{fontSize:'25px'}}><FontAwesomeIcon icon={faFileInvoiceDollar} color='white' /></span></button>
                }</div>
                <div className="col-sm-2">{
                  this.props.customerTable.status === 'checked' ?
                  <button title='รับเงิน' className="btn btn-info"><span style={{fontSize:'25px'}}><i className="fa fa-money"></i></span></button>
                  : <button title='รับเงิน' className="btn btn-secondary" disabled><span style={{fontSize:'25px'}}><i className="fa fa-money"></i></span></button>
                }</div>

                <div className="col-sm-2">{
                  this.state.newOrderItems.length !== 0 ?
                  <button title='ส่งรายการ' className="btn btn-info" onClick={() => this.sendNewItemsHandler()}><span style={{fontSize:'25px'}}><i className="fa fa-send"></i></span></button>
                  : <button title='ส่งรายการ' className="btn btn-secondary" disabled><span style={{fontSize:'25px'}}><i className="fa fa-send"></i></span></button>
                }</div>
              </div>
              <form onSubmit={this.codeInputSubmit}>
                <div className="row" style={{margin:'10px 0 0 0'}}>
                  <div className="input-group" style={{margin:'18px 0 0 0'}}>
                    <div className="input-group-prepend">
                      <span className="input-group-text" id="basic-addon1">Code: </span>
                    </div>
                    <input
                      autoFocus
                      type="text"
                      className="form-control"
                      placeholder="รหัส*จำนวน#หมายเหตุ"
                      onChange={this.codeInputHandler}
                      value={this.state.codeInput}
                     />
                      <div className="input-group-append">
                      <button className="btn btn-success" type="submit">เพิ่ม</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )
    }
  }


const mapStateToprops = (state) => {
  return {
    user: state.user,
    customerTable: state.customerTable,
    foodItems: state.foodItems
  }
}

export default connect(mapStateToprops)(CustomerTable);





class MenuItemBox extends React.Component{

  render(){
    const style = {
      background:'green',
      height:'100px',
      margin:'5px',
      borderRadius: '10px',
      color:'white',
      position: 'relative',

    }

    return (
      <div className="col-sm-2" style={style} onClick={() => this.props.onClick({
        quantity: 1,
        name: this.props.label,
        price: this.props.price,
        code:this.props.code})}>
        <p style={{position:'absolute', left: '3px', fontSize:'12px'}}>{this.props.code}</p>
        <p style={{position:'absolute', top:'20px',  left: '3px', textAlign:'center'}}>{this.props.label}</p>
        <p style={{position:'absolute', bottom:'-15px', right: '3px', fontSize:'12px'}}>{this.props.price}.-</p>
      </div>
    )
  }
}



const orderListTitleStyle = {
  margin: '10px auto',
  height: '40px',
  width: '80%',
  borderBottom: '1px solid black'
}

const orderListPageStyle = {
  background: '#fff',
  height: '80%',
  borderRadius: '10px'
}

const orderListDivStyle = {
  border:'2px solid black'
}

const menuItemStyle = {
  border:'2px solid black',
  height: '630px',
  overflow: 'scroll'
}

const seachBoxStyle = {
  border:'2px solid black',
  height: '70px'
}

const menuSectionStyle = {
  border:'2px solid black',
  height: '700px',
}


class EditNewMenuItem extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      quantity: this.props.payload.quantity,
      remark: this.props.payload.remark || ''
    }
  }
  remarkOnChangeHandler = (e) =>{
    this.setState({
      remark: e.target.value
    })
  }
  increaseQuantity = () => {
    const current = this.state.quantity;
    this.setState({
      quantity: current + 1
    });
  }
  decreaseQuantity = () => {
    const current = this.state.quantity;
    if(current > 1){
      this.setState({
        quantity: current - 1
      });
    }
  }
  render(){
    return(
      <div className="editNewMenuItemFill">
        <div className="editNewMenuItemContent">
          <div className="container">
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-12">
                <h4>รายการ: {this.props.payload.name}</h4>
              </div>
            </div>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-12">
                <h4 style={{margin: '10px'}}>จำนวน:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span><button className="btn btn-success" onClick={this.decreaseQuantity}>-</button></span>
                  &nbsp; {this.state.quantity} &nbsp;
                  <span><button className="btn btn-success" onClick={this.increaseQuantity}>+</button></span>
                </h4>
              </div>
            </div>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>หมายเหตุ</label>
                  <input type="text" className="form-control" onChange={this.remarkOnChangeHandler} value={this.state.remark} />
                </div>
              </div>
            </div>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-4">
                <button onClick={() => this.props.onClickClose()} className="btn btn-secondary">ปิด</button>
              </div>
              <div className="col-sm-4">
                <button onClick={() => this.props.onClickDelete(this.props.payload.code)} className="btn btn-danger">ลบ</button>
              </div>
              <div className="col-sm-4">
                <button
                  onClick={() => this.props.onClickSave({code: this.props.payload.code, quantity: this.state.quantity, remark: this.state.remark.trim()})}
                  className="btn btn-info">บันทึก</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class DeleteOrderItemOption extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      quantity: this.props.payload.quantity,
      remark: '',
      remarkError: false
    }
  }
  remarkOnChangeHandler = (e) =>{
    this.setState({
      remark: e.target.value
    })
  }
  increaseQuantity = () => {
    const current = this.state.quantity;
    if(current < this.props.payload.quantity){
      this.setState({
        quantity: current + 1
      });
    }
  }
  decreaseQuantity = () => {
    const current = this.state.quantity;
    if(current > 1){
      this.setState({
        quantity: current - 1
      });
    }
  }
  deleteBtnHandler = () => {
    if(this.state.remark.trim() !== ''){
      this.props.onClickDelete({
        id: this.props.payload.id,
        quantity: this.state.quantity,
        remark: this.state.remark,
      });
    }else{
      this.setState({
        remarkError: true,
        remark: ''
      })
    }
  }
  render(){
    return(
      <div className="editNewMenuItemFill">
        <div className="editNewMenuItemContent">
          <div className="container">
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-12 text-center">
                <h4>คุณต้องการยกเลิก</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12 text-center">
                <p>รายการ: {this.props.payload.name}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12 text-center">
                <h4 style={{margin: '10px'}}>จำนวน:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span><button className="btn btn-success" onClick={this.decreaseQuantity}>-</button></span>
                  &nbsp; {this.state.quantity} &nbsp;
                  <span><button className="btn btn-success" onClick={this.increaseQuantity}>+</button></span>
                </h4>
              </div>
            </div>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>หมายเหตุ {this.state.remarkError && <span style={{color: 'red'}}>*กรุณาใส่หมายเหตุ</span>}</label>
                  <input type="text" className="form-control" onChange={this.remarkOnChangeHandler} value={this.state.remark} />
                </div>
              </div>
            </div>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-6 text-center">
                <button onClick={() => this.props.onClickClose()} className="btn btn-secondary">ปิด</button>
              </div>
              <div className="col-sm-6 text-center">
                <button onClick={() => this.deleteBtnHandler()} className="btn btn-danger">ยกเลิก</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class DiscountOption extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      type: 'percentage'
    }
  }
  onTypeChange = (value) => {
    this.setState({
      type: value
    })
  }
  render(){
    return(
      <div className="editNewMenuItemFill">
        <div className="discountContent">
          <div className="container">
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-12 text-center">
                <h5>ส่วนลด</h5>
              </div>
            </div>
            <h6>ส่วนลดโดย:</h6>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-4 text-center">
                <label class="radio-inline"><input type="radio" onClick={() =>this.onTypeChange('percentage')} name="optradio" /> เปอร์เซ็นต์</label>
              </div>
              <div className="col-sm-4 text-center">
                <label class="radio-inline"><input type="radio" onClick={() =>this.onTypeChange('amount')} name="optradio" /> จำนวนเงิน</label>
              </div>
              <div className="col-sm-4 text-center">
                <label class="radio-inline"><input type="radio" onClick={() =>this.onTypeChange('complimentary')} name="optradio" /> Compl.</label>
              </div>
            </div>
            <br />
            <h6>รายการที่ใช้ส่วนลด:</h6>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-4 text-center">
                <label class="radio-inline"><input type="radio"  name="optradio" disabled={this.state.type !== 'percentage'} /> อาหาร & เครื่องดื่ม</label>
              </div>
              <div className="col-sm-4 text-center">
                <label class="radio-inline"><input type="radio"  name="optradio" disabled={this.state.type !== 'percentage'} /> เฉพาะอาหาร</label>
              </div>
              <div className="col-sm-4 text-center">
                <label class="radio-inline"><input type="radio"  name="optradio" disabled={this.state.type !== 'percentage'} /> เฉพาะเครื่องดื่ม</label>
              </div>
            </div>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-8 mx-auto">
                {this.state.type === 'percentage' ?
                <div className="input-group mb-3">
                  <input type="percentage" className="form-control" placeholder="จำนวน" aria-label="Recipient's username" aria-describedby="basic-addon2" />
                  <div className="input-group-append">
                    <span className="input-group-text" id="basic-addon2">%.</span>
                  </div>
                </div>
                : this.state.type === 'amount' ?
                <div className="input-group mb-3">
                  <input type="currency" className="form-control" placeholder="จำนวน" aria-label="Recipient's username" aria-describedby="basic-addon2" />
                  <div className="input-group-append">
                    <span className="input-group-text" id="basic-addon2">บาท.</span>
                  </div>
                </div> :
                <div className="input-group mb-3">
                  <input type="currency" className="form-control" placeholder="หมายเหตุ" aria-label="Recipient's username" aria-describedby="basic-addon2" />

                </div>
              }
              </div>
            </div>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-6 text-center">
                <button className="btn btn-secondary">ปิด</button>
              </div>
              <div className="col-sm-6 text-center">
                <button className="btn btn-warning">ยกเลิก</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
