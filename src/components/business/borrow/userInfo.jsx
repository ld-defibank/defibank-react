import React, { useState, useEffect } from 'react';
import FormattedMessage from '@common/formattedMessage';
import { humanReadableNumber, fromAmountToFixedAmount } from '@utils/';
import CONFIG from '../../../config';
import UserInfoBar from '../userInfoBar';

const { TOKENS } = CONFIG;

function getBorrowed(data, prices) {
  if (!data) return '0';
  const totalEth = data.totalBorrowsETH;
  const ethPriceInfo = prices.find(price => price.tokenAddress === TOKENS.ETH.tokenAddress);
  if (!totalEth || !ethPriceInfo) return '0';
  const usd = parseFloat(fromAmountToFixedAmount(totalEth, TOKENS.ETH, Infinity)) * parseFloat(ethPriceInfo.price);
  return usd.toFixed(2);
}

function getCollateral(data, prices) {
  if (!data) return '0';
  const totalEth = data.totalCollateralETH;
  const ethPriceInfo = prices.find(price => price.tokenAddress === TOKENS.ETH.tokenAddress);
  if (!totalEth || !ethPriceInfo) return '0';
  const usd = parseFloat(fromAmountToFixedAmount(totalEth, TOKENS.ETH, Infinity)) * parseFloat(ethPriceInfo.price);
  return usd.toFixed(2);
}

// TODO: 需要处理0的情况
function getBorrowedBarData(data, prices) {
  const barData = data.map((asset) => {
    const priceInfo = prices.find(price => price.tokenAddress === asset.tokenAddress) || { price: 0 };
    const price = priceInfo.price;
    const amount = fromAmountToFixedAmount(asset.borrowed, asset, Infinity);
    const usd = parseFloat(amount) * parseFloat(price);

    return {
      symbol: asset.symbol,
      price,
      amount,
      usd,
    };
  });
  const totalUsd = barData.map(d => d.usd).reduce((a, b) => a + b, 0);
  barData.forEach((asset, i) => {
    barData[i].percent = (asset.usd / totalUsd) || 0;
  });
  return barData;
}
function getCollateralBarData(data, prices) {
  const isCollateralData = data.filter(d => d.isCollateral);
  const barData = isCollateralData.map((asset) => {
    const priceInfo = prices.find(price => price.tokenAddress === asset.tokenAddress) || { price: 0 };
    const price = priceInfo.price;
    const amount = fromAmountToFixedAmount(asset.balance, asset, Infinity);
    const usd = parseFloat(amount) * parseFloat(price);

    return {
      symbol: asset.symbol,
      price,
      amount,
      usd,
    };
  });
  const totalUsd = barData.map(d => d.usd).reduce((a, b) => a + b, 0);
  barData.forEach((asset, i) => {
    barData[i].percent = (asset.usd / totalUsd) || 0;
  });
  return barData;
}

export default function DashboardBorrowUserInfo({ data, prices, assetList = [] }) {
  // 渲染数据
  const borrowed = getBorrowed(data, prices);
  const collateral = getCollateral(data, prices);
  const borrowedBarData = getBorrowedBarData(assetList, prices);
  const collateralbarData = getCollateralBarData(assetList, prices);
  return (
    <>
      <div className="user-info">
        <div className="info">
          <div className="label"><FormattedMessage id="borrow_info_borrowed" /></div>
          <div className="value">{humanReadableNumber(borrowed)} <span className="unit">USD</span></div>
        </div>
        <div className="composition">
          <div className="label"><FormattedMessage id="borrow_info_borrow_composition" /></div>
          <div className="value"><UserInfoBar data={borrowedBarData} /></div>
        </div>
      </div>
      <div className="user-info">
        <div className="info">
          <div className="label"><FormattedMessage id="borrow_info_collateral" /></div>
          <div className="value">{humanReadableNumber(collateral)} <span className="unit">USD</span></div>
        </div>
        <div className="composition">
          <div className="label"><FormattedMessage id="borrow_info_collateral_composition" /></div>
          <div className="value"><UserInfoBar data={collateralbarData} /></div>
        </div>
      </div>
    </>
  );
}
