import React, { useState, useEffect } from 'react';
import FormattedMessage from '@common/formattedMessage';
import { humanReadableNumber, fromAmountToFixedAmount } from '@utils/';

function filterData(data) {
  return data.filter(row => row.percent > 0);
}

function checkEmpty(data) {
  if (!data || data.length < 1) return true;
  return false;
}

export default function UserInfoBar({ data = [] }) {
  const filtedData = filterData(data);
  const isEmpty = checkEmpty(filtedData);

  if (isEmpty) {
    return (
      <div className="dashboard-user-info-bar empty">
        <FormattedMessage id="dashboard_user_info_bar_empty" />
      </div>
    );
  }

  return (
    <div className="dashboard-user-info-bar">
      {filtedData.map(asset => (
        <div className="asset" key={asset.symbol} style={{ width: `${parseFloat(asset.percent * 100).toFixed(3)}%` }}>
          <div className="tip">
            <span>{asset.symbol}</span>
            <span>{humanReadableNumber(parseFloat(asset.amount).toFixed(2))}</span>
            <span>{`${parseFloat(asset.percent * 100).toFixed(2)}%`}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
