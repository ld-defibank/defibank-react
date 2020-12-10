import React, { useState, useEffect } from 'react';
import Web3 from '@models/web3v2';
import Market from '@models/market';
import { fromAmountToFixedAmount, humanReadableNumber } from '@utils/';
import FormattedMessage from '@common/formattedMessage';
import CONFIG from '../../config';

const {
  TOKENS,
} = CONFIG;

const {
  USDT,
  ETH,
} = TOKENS;

function processData({ reserves, prices }) {
  const processedReserves = reserves.map((reserve) => {
    const price = (prices.find(p => p.tokenAddress === reserve.tokenAddress) || { price: 0 }).price;
    const totalUsd = parseFloat(fromAmountToFixedAmount(reserve.totalLiquidity, reserve.meta)) * price;
    const borrowUsd = (
      parseFloat(fromAmountToFixedAmount(reserve.totalBorrowsStable, reserve.meta))
      + parseFloat(fromAmountToFixedAmount(reserve.totalBorrowsVariable, reserve.meta))
    ) * price;
    const depositUsd = totalUsd - borrowUsd;

    return {
      totalUsd,
      borrowUsd,
      depositUsd,
    };
  });

  window.aaa = processedReserves;

  const marketSize = processedReserves.map(a => a.totalUsd).reduce((a, b) => a + b, 0);
  const borrowed = processedReserves.map(a => a.borrowUsd).reduce((a, b) => a + b, 0);
  const deposited = processedReserves.map(a => a.depositUsd).reduce((a, b) => a + b, 0);

  return {
    marketSize,
    borrowed,
    deposited,
  };
}

export default function MarketInfo() {
  const [marketSize, setMarketSize] = useState(0);
  const [borrowed, setBorrowed] = useState(0);
  const [deposited, setDeposited] = useState(0);

  const {
    web3,
  } = Web3.useContainer();
  const {
    getMarketAllReserveData,
    getAllReservePrice,
  } = Market.useContainer();

  useEffect(() => {
    if (web3) {
      Promise.all([
        getMarketAllReserveData(),
        getAllReservePrice(),
      ]).then((data) => {
        const processedData = processData({
          reserves: data[0],
          prices: data[1],
        });
        setMarketSize(processedData.marketSize);
        setBorrowed(processedData.borrowed);
        setDeposited(processedData.deposited);
      });
    }
  }, [web3]);

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
            <div className="value">{humanReadableNumber(marketSize.toFixed(2))}</div>
            <div className="unit">USD</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">
            <FormattedMessage id="index_market_borrow" />
          </div>
          <div className="card-value">
            <div className="value">{humanReadableNumber(borrowed.toFixed(2))}</div>
            <div className="unit">USD</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">
            <FormattedMessage id="index_market_deposit" />
          </div>
          <div className="card-value">
            <div className="value">{humanReadableNumber(deposited.toFixed(2))}</div>
            <div className="unit">USD</div>
          </div>
        </div>
      </div>
    </div>
  );
}
