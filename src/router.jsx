import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Main from './layout/main';
import Sidebar from './layout/sidebar';
import ConnectWallet from './layout/connectWallet';
import Top from './layout/top';
import GlobalLoading from './layout/globalLoading';
import TransactionCache from './layout/transactionCache';
import Index from './components/index';
import { Deposit, Borrow, CreateDeposit, CreateWithdraw, CreateBorrow, CreateRepay } from './components/business';
import { DepositHistory, WithdrawHistory, BorrowHistory, RepayHistory } from './components/history';
import { Deposit as DashboardDeposit, Borrow as DashboardBorrow } from './components/dashboard';
import Detail from './components/detail';
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
              <Route path="/detail/:tokenAddress" exact component={Detail} />
              <Route path="/deposit/deposit/:tokenAddress" exact component={CreateDeposit} />
              <Route path="/deposit/withdraw/:tokenAddress" exact component={CreateWithdraw} />
              <Route path="/borrow/borrow/:tokenAddress" exact component={CreateBorrow} />
              <Route path="/borrow/repay/:tokenAddress" exact component={CreateRepay} />
              <Route path="/dashboard/deposit" exact component={DashboardDeposit} />
              <Route path="/dashboard/borrow" exact component={DashboardBorrow} />
              <Route path="/history/deposit" exact component={DepositHistory} />
              <Route path="/history/withdraw" exact component={WithdrawHistory} />
              <Route path="/history/borrow" exact component={BorrowHistory} />
              <Route path="/history/repay" exact component={RepayHistory} />
            </Switch>
          </Main>
        </div>
        <ConnectWallet />
        <GlobalLoading />
        <TransactionCache />
      </Store>
    </Router>
  );
}

export default MyRouter;
