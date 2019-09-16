import React from 'react';
import {TopBuffer} from './../helpers/utilities';
import Logo from '../assets/jep_logo.png';

export class HeaderBar extends React.Component{

  render(){
    return(
      <div>
        <div className="row" style={headerStyle}>
          <div className="col-sm-2">
            <img className="ml-4" height="100px" alt="Jep's Logo" src={Logo}/>
            <p>Jep's Restaurant POS</p>
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
            <button className='btn btn-danger' onClick={this.props.buttonFunction}
              style={{marginTop:'10px'}}>{this.props.buttonLabel}</button>
              <br /><br />
              <p className="text-left" style={appBarStyle}>User: {this.props.name}</p>
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
}

const appNameStyle = {
  color: '#5291ff',
  fontSize: '20px',
  fontWeight:'bold'
}

const appBarStyle = {
  fontSize: '15px',
}
