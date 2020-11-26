/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useCallback, useState } from 'react';
import I18n from '@models/i18n';
import { Spin, Button } from '@common/antd';
import message from '@utils/message';
import LendingPool from '@models/lendingPool';
import LendingPoolCore from '@models/lendingPoolCore';
import LendingPoolCoreProvider from '@models/lendingPoolDataProvider';
import Web3 from '@models/web3v2';
import { fromAmountToFixedAmount, fromFixedAmountToAmount } from '@utils/';
import CONFIG from '../../config';
import './style.scss';

const {
  TOKENS,
} = CONFIG;

const {
  USDT,
  ETH,
} = TOKENS;

// 测试rinkeby网路下usdt和eth

function Index() {
  const [USDTallowance, setUSDTAllowance] = useState('0');
  const [USDTwalletBalance, setUSDTWalletBalance] = useState('0');
  const [USDTdepositBalance, setUSDTdepositBalance] = useState('0');
  const [ETHwalletBalance, setETHWalletBalance] = useState('0');
  const [ETHdepositBalance, setETHdepositBalance] = useState('0');

  const {
    currentAccount,
    getCurrentAccountTokenWalletBalance,
  } = Web3.useContainer();
  const {
    getAllowance,
    approve,
  } = LendingPoolCore.useContainer();
  const {
    deposit,
  } = LendingPool.useContainer();
  const {
    getUserReserveData,
    getUserAccountData,
  } = LendingPoolCoreProvider.useContainer();
  const { t } = I18n.useContainer();

  const updateAllowance = useCallback(() => {
    getAllowance(USDT.address).then(setUSDTAllowance);
  }, [currentAccount, getAllowance, setUSDTAllowance]);
  const updateBalance = useCallback(() => {
    getCurrentAccountTokenWalletBalance(USDT.address).then(setUSDTWalletBalance);
    getCurrentAccountTokenWalletBalance(ETH.address).then(setETHWalletBalance);
  }, [currentAccount, getCurrentAccountTokenWalletBalance, setUSDTAllowance]);
  const updateReserveData = useCallback(() => {
    getUserReserveData(USDT.address).then((d) => {
      setUSDTdepositBalance(d.currentATokenBalance);
    });
    getUserReserveData(ETH.address).then((d) => {
      setETHdepositBalance(d.currentATokenBalance);
    });
  }, [currentAccount, getUserReserveData, setUSDTdepositBalance]);
  const updateAccountData = useCallback(() => {
    getUserAccountData().then((d) => {
      console.log(d);
    });
  }, [currentAccount, getUserAccountData]);

  useEffect(() => {
    updateBalance();
    updateAllowance();
    updateReserveData();
    updateAccountData();
  }, [currentAccount]);

  const handleApprove = () => {
    if (parseInt(USDTallowance, 10) > 0) return;
    approve(USDT.address).then((d) => {
      updateAllowance();
    });
  };

  const handleDeposit = (amount, coin) => {
    deposit(coin.address, fromFixedAmountToAmount(amount, coin)).then((d) => {
      updateBalance();
      updateReserveData();
    });
  };

  const approved = parseInt(USDTallowance, 10) > 0;
  return (
    <div id="test" className="site-page">
      <h1>Wallet Balance</h1>
      <div>
        <span>USDT allowance: {USDTallowance}</span>
        {!approved && <Button type="primary" onClick={handleApprove}>Approve</Button>}
      </div>
      <div>
        <span>USDT wallet Balance: {fromAmountToFixedAmount(USDTwalletBalance, USDT)}</span>
      </div>
      <div>
        <span>ETH wallet Balance: {fromAmountToFixedAmount(ETHwalletBalance, ETH)}</span>
      </div>
      <h1>Deposit Balance</h1>
      <div>
        <span>USDT: {fromAmountToFixedAmount(USDTdepositBalance, USDT)}</span>
      </div>
      <div>
        <span>ETH: {fromAmountToFixedAmount(ETHdepositBalance, ETH)}</span>
      </div>
      <h1>Deposit</h1>
      <div>
        <Button type="primary" disabled={!approved} onClick={() => handleDeposit(1, USDT)}>存入 1 USDT</Button>
        <Button type="primary" disabled={!approved} onClick={() => handleDeposit(0.1, ETH)}>存入 0.1 ETH</Button>
      </div>
    </div>
  );
}


export default Index;
