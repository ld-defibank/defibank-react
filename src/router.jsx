import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Main from './layout/main';
import Sidebar from './layout/sidebar';
import ConnectWallet from './layout/connectWallet';
import Top from './layout/top';
import Index from './components/index';
import { DashboardDeposit, DashboardBorrow } from './components/dashboard';
import Test from './components/test';
import Store from './models';

function MyRouter(props) {
  return (
    <Router {...props}>
      <Store>
        <div id="app">
          <Sidebar />
          <Main>
            <Top />
            <Switch>
              <Route path="/" exact component={Index} />
              <Route path="/dashboard/deposit" exact component={DashboardDeposit} />
              <Route path="/dashboard/borrow" exact component={DashboardBorrow} />
              <Route path="/test" exact component={Test} />
            </Switch>
          </Main>
        </div>
        <ConnectWallet />
      </Store>
    </Router>
  );
}

export default MyRouter;
