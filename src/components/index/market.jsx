import React, { useState, useEffect } from 'react';
import { humanReadableNumber } from '@utils/';
import FormattedMessage from '@common/formattedMessage';
import { Spin } from '@common/antd';

function processData(processedReserves) {
  const marketSize = processedReserves.map(a => a.totalUsd).reduce((a, b) => a + b, 0);
  const borrowed = processedReserves.map(a => a.borrowUsd).reduce((a, b) => a + b, 0);
  const deposited = processedReserves.map(a => a.depositUsd).reduce((a, b) => a + b, 0);

  return {
    marketSize,
    borrowed,
    deposited,
  };
}

export default function MarketInfo({ data, loading }) {
  const [marketSize, setMarketSize] = useState(0);
  const [borrowed, setBorrowed] = useState(0);
  const [deposited, setDeposited] = useState(0);

  useEffect(() => {
    if (!loading && data && data.length > 0) {
      const processedData = processData(data);
      setMarketSize(processedData.marketSize);
      setBorrowed(processedData.borrowed);
      setDeposited(processedData.deposited);
    }
  }, [data, loading]);

  return (
    <div className="market-info">
      <div className="title">
        <FormattedMessage id="index_market_title" />
      </div>
      <div className="cards">
        <div className="card">
          <div className="card-title">
            <FormattedMessage id="index_market_size" />
          </div>
          <div className="card-value">
            <div className="value">{loading ? <Spin /> : humanReadableNumber(marketSize.toFixed(2))}</div>
            <div className="unit">USD</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">
            <FormattedMessage id="index_market_borrow" />
          </div>
          <div className="card-value">
            <div className="value">{loading ? <Spin /> : humanReadableNumber(borrowed.toFixed(2))}</div>
            <div className="unit">USD</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">
            <FormattedMessage id="index_market_deposit" />
          </div>
          <div className="card-value">
            <div className="value">{loading ? <Spin /> : humanReadableNumber(deposited.toFixed(2))}</div>
            <div className="unit">USD</div>
          </div>
        </div>
      </div>
    </div>
  );
}
