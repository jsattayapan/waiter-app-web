import React from 'react';
import { connect } from 'react-redux';
import LoginForm from './LoginForm';
import { setUser } from './../Redux/actions/user';

const LoginPage = (props) => (
  <LoginForm onSubmit={(userInfo) => {
    props.dispatch(setUser(userInfo));
    props.history.push('/tables');
  }} />
);

const mapStateToprops = (state) => {
  return {
    user: state.user
  }
}

export default connect(mapStateToprops)(LoginPage);
