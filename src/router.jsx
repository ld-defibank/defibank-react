import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Main from './layout/main';
import Sidebar from './layout/sidebar';
import ConnectWallet from './layout/connectWallet';
import Top from './layout/top';
import Index from './components/index';
import { Deposit, Borrow, CreateDeposit } from './components/business';
import Dashboard from './components/dashboard';
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
              <Route path="/deposit" exact component={Deposit} />
              <Route path="/deposit/deposit/:tokenAddress" exact component={CreateDeposit} />
              <Route path="/borrow" exact component={Borrow} />
              <Route path="/dashboard" exact component={Dashboard} />
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
