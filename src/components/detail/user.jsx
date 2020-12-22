import React, { useState, useEffect } from 'react';
import { times10, fromAmountToFixedAmount } from '@utils/';
import Router from '@models/router';
import Decimal from 'decimal.js-light';
import FormattedMessage from '@common/formattedMessage';

function getData(userReserveData, userData, ETHPrice) {
  if (!userReserveData || !userData) {
    return {
      tokenInfo: null,
      currentBorrowBalance: 0,
      healthFactor: 0,
      ltv: 0,
      available: 0,
      currentDepositBalance: 0,
    };
  }

  const {
    meta,
    currentBorrowBalance,
    currentATokenBalance,
  } = userReserveData;
  const {
    healthFactor,
    totalBorrowsETH,
    totalCollateralETH,
    availableBorrowsETH,
  } = userData;

  const health = parseFloat(times10(healthFactor, -18, 2));
  return {
    tokenInfo: meta,
    currentBorrowBalance: fromAmountToFixedAmount(currentBorrowBalance, meta, 2),
    healthFactor: health > 10 ? '> 10' : health,
    ltv: parseFloat(totalCollateralETH) === 0 ? 0 : new Decimal(totalBorrowsETH).div(totalCollateralETH).times(10).toFixed(2),
    available: parseFloat(ETHPrice) === 0 ? 0 : new Decimal(availableBorrowsETH).div(ETHPrice).toFixed(2),
    currentDepositBalance: fromAmountToFixedAmount(currentATokenBalance, meta, 2),
  };
}

export default function DetailUser({ userReserveData, userData, ETHPrice, walletBalance }) {
  const { goto } = Router.useContainer();
  const data = getData(userReserveData, userData, ETHPrice);
  const {
    tokenInfo,
    currentBorrowBalance,
    healthFactor,
    ltv,
    available,
    currentDepositBalance,
  } = data;
  const {
    symbol,
    tokenAddress,
  } = (tokenInfo || {});
  return (
    <div className="user">
      <div className="borrow">
        <div className="title"><FormattedMessage id="detail_user_borrow" /></div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_user_borrow_balance" /></div>
          <div className="value">{currentBorrowBalance} {symbol}</div>
        </div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_user_health" /></div>
          <div className="value">{healthFactor}</div>
        </div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_user_ltv" /></div>
          <div className="value">{ltv} %</div>
        </div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_user_available" /></div>
          <div className="value">{available} {symbol}</div>
        </div>
        <div className="opts">
          <button onClick={() => goto('/borrow/borrow/' + tokenAddress)}><FormattedMessage id="business_header_borrow" /></button>
          <button onClick={() => goto('/borrow/repay/' + tokenAddress)}><FormattedMessage id="business_header_repay" /></button>
        </div>
      </div>
      <div className="deposit">
        <div className="title"><FormattedMessage id="detail_user_deposit" /></div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_user_wallet_balance" /></div>
          <div className="value">{tokenInfo && fromAmountToFixedAmount(walletBalance, tokenInfo, 2)} {symbol}</div>
        </div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_user_deposit_balance" /></div>
          <div className="value">{tokenInfo && fromAmountToFixedAmount(currentDepositBalance, tokenInfo, 2)} {symbol}</div>
        </div>
        <div className="opts">
          <button onClick={() => goto('/deposit/deposit/' + tokenAddress)}><FormattedMessage id="business_header_deposit" /></button>
          <button onClick={() => goto('/deposit/withdraw/' + tokenAddress)}><FormattedMessage id="business_header_withdraw" /></button>
        </div>
      </div>
    </div>
  );
}
