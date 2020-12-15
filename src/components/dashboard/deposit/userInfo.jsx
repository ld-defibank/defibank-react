import React, { useState, useEffect } from 'react';
import FormattedMessage from '@common/formattedMessage';
import { humanReadableNumber, fromAmountToFixedAmount } from '@utils/';
import CONFIG from '../../../config';
import UserInfoBar from '../userInfoBar';

const { TOKENS } = CONFIG;

function getAggregated(data, prices) {
  if (!data) return '0';
  const totalEth = data.totalLiquidityETH;
  const ethPriceInfo = prices.find(price => price.tokenAddress === TOKENS.ETH.tokenAddress);
  if (!totalEth || !ethPriceInfo) return '0';
  const usd = parseFloat(fromAmountToFixedAmount(totalEth, TOKENS.ETH, Infinity)) * parseFloat(ethPriceInfo.price);
  return usd.toFixed(2);
}

// TODO: 需要处理0的情况
function getBarData(data, prices) {
  const barData = data.map((asset) => {
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

export default function DashboardDepositUserInfo({ data, prices, assetList = [] }) {
  // 渲染数据
  const aggregated = getAggregated(data, prices);
  const barData = getBarData(assetList, prices);
  return (
    <div className="user-info">
      <div className="info">
        <div className="label"><FormattedMessage id="dashboard_deposit_info_aggregated" /></div>
        <div className="value">{humanReadableNumber(aggregated)} <span className="unit">USD</span></div>
      </div>
      <div className="composition">
        <div className="label"><FormattedMessage id="dashboard_deposit_info_composition" /></div>
        <div className="value"><UserInfoBar data={barData} /></div>
      </div>
    </div>
  );
}
