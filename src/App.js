import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import Tables from './screens/Tables';
import CustomerTable from './screens/CustomerTable';
import {Playground} from './screens/Playground';
import LoginPage from './screens/LoginPage';

import configureStore from './Redux/store/configureStore';

export const store = configureStore();

const jsx = (
  <Provider store={store}>
    <Router>
      <Route path="/" exact component={LoginPage} />
      <Route path="/tables" exact component={Tables} />
      <Route path="/customer-table" exact component={CustomerTable} />
      <Route path="/playground" exact component={Playground} />
    </Router>
  </Provider>
);

export default () => {
  return (jsx);
}
