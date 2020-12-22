import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import Decimal from 'decimal.js-light';
import FormattedMessage from '@common/formattedMessage';
import { Spin } from '@common/antd';
import { times10, fromAmountToFixedAmount } from '@utils/';

function getData(reserveData) {
  if (!reserveData) {
    return {
      tokenInfo: null,
      utilizationRate: 0,
      totalBorrow: '0',
      totalLiquidity: '0',
      availableLiquidity: '0',
      availableRate: '0',
    };
  }

  const {
    meta,
    utilizationRate: ur,
    availableLiquidity,
    totalLiquidity,
    totalBorrowsStable,
    totalBorrowsVariable,
  } = reserveData;

  const utilizationRate = parseFloat(times10(ur, -27, 4));
  const totalBorrow = new Decimal(totalBorrowsStable).add(totalBorrowsVariable);
  const availableRate = parseFloat(totalLiquidity) === 0 ? 0 : new Decimal(availableLiquidity).div(totalLiquidity);

  return {
    tokenInfo: meta,
    utilizationRate,
    totalBorrow,
    totalLiquidity,
    availableLiquidity,
    availableRate,
  };
}

function Ring({ percent, className, size = 80, stroke = 8, color = '#fff' }) {
  const r = size / 2 - stroke / 2;
  const circumference = r * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - percent * circumference;

  return (
    <div className={classnames('ring', className)}>
      <svg
        className="progress"
        width={size}
        height={size}
      >
        <circle
          className="progress-circle-bg"
          strokeWidth={stroke}
          fill="transparent"
          r={r}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="progress-circle"
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          r={r}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray,
            strokeDashoffset,
          }}
        />
      </svg>
    </div>
  );
}

export default function DetailSize({ reserveData, price }) {
  const data = getData(reserveData);
  const {
    tokenInfo,
    utilizationRate,
    availableRate,
    totalBorrow,
    availableLiquidity,
  } = data;
  return (
    <div className="size">
      <div className="pad-title"><FormattedMessage id="detail_size" /></div>
      <div className="content">
        <div className="utilization-ring">
          <Ring
            percent={utilizationRate}
            color="#A0DFBC"
          />
        </div>
        <div className="utilization-rate-data">
          <div className="label"><FormattedMessage id="detail_size_utilization_rate" /></div>
          <div className="value">{(parseFloat(utilizationRate) * 100).toFixed(2)} %</div>
        </div>
        <div className="borrow-data">
          <div className="label"><FormattedMessage id="detail_size_borrow" /></div>
          {tokenInfo ? (
            <div className="value">{fromAmountToFixedAmount(totalBorrow, tokenInfo, 2)} {tokenInfo.symbol}</div>
          ) : (
            <div className="value">--</div>
          )}
          <div className="sub">{(parseFloat(fromAmountToFixedAmount(totalBorrow, tokenInfo, Infinity)) * price).toFixed(2)} USD</div>
        </div>
        <div className="available-ring">
          <Ring
            percent={availableRate}
            color="#F52C46"
          />
        </div>
        <div className="available-rate-data">
          <div className="label"><FormattedMessage id="detail_size_available_rate" /></div>
          <div className="value">{(parseFloat(availableRate) * 100).toFixed(2)} %</div>
        </div>
        <div className="available-data">
          <div className="label"><FormattedMessage id="detail_size_available" /></div>
          {tokenInfo ? (
            <div className="value">{fromAmountToFixedAmount(availableLiquidity, tokenInfo, 2)} {tokenInfo.symbol}</div>
          ) : (
            <div className="value">--</div>
          )}
          <div className="sub">{(parseFloat(fromAmountToFixedAmount(availableLiquidity, tokenInfo, Infinity)) * price).toFixed(2)} USD</div>
        </div>
      </div>
    </div>
  );
}
