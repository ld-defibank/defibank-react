import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Main from './layout/main';
import Sidebar from './layout/sidebar';
import ConnectWallet from './layout/connectWallet';
import Top from './layout/top';
import GlobalLoading from './layout/globalLoading';
import Index from './components/index';
import { Deposit, Borrow, CreateDeposit, CreateWithdraw, CreateBorrow, CreateRepay } from './components/business';
import { DepositHistory } from './components/history';
import Dashboard from './components/dashboard';
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
              <Route path="/borrow" exact component={Borrow} />
              <Route path="/deposit/deposit/:tokenAddress" exact component={CreateDeposit} />
              <Route path="/deposit/withdraw/:tokenAddress" exact component={CreateWithdraw} />
              <Route path="/borrow/borrow/:tokenAddress" exact component={CreateBorrow} />
              <Route path="/borrow/repay/:tokenAddress" exact component={CreateRepay} />
              <Route path="/dashboard" exact component={Dashboard} />
              <Route path="/history/deposit" exact component={DepositHistory} />
            </Switch>
          </Main>
        </div>
        <ConnectWallet />
        <GlobalLoading />
      </Store>
    </Router>
  );
}

export default MyRouter;
