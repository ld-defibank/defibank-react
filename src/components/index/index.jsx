/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState } from 'react';
import I18n from '@models/i18n';
import { Spin } from '@common/antd';
import SitePage from '@common/sitePage';
import message from '@utils/message';
import { fromAmountToFixedAmount, times10 } from '@utils/';
import Web3 from '@models/web3v2';
import Market from '@models/market';
import MarketInfo from './market';
import MarketList from './list';
import './style.scss';

function processData({ reserves, prices }) {
  const processedReserves = reserves.map((reserve) => {
    const price = (prices.find(p => p.tokenAddress === reserve.tokenAddress) || { price: 0 }).price;
    const total = parseFloat(fromAmountToFixedAmount(reserve.totalLiquidity, reserve.meta));
    const totalUsd = total * price;
    const borrow = (
      parseFloat(fromAmountToFixedAmount(reserve.totalBorrowsStable, reserve.meta))
      + parseFloat(fromAmountToFixedAmount(reserve.totalBorrowsVariable, reserve.meta))
    );
    const borrowUsd = borrow * price;
    const deposit = total - borrow;
    const depositUsd = deposit * price;

    return {
      symbol: reserve.meta.symbol,
      tokenAddress: reserve.tokenAddress,
      aTokenAddress: reserve.aTokenAddress,
      total,
      totalUsd,
      borrow,
      borrowUsd,
      deposit,
      depositUsd,
      depositAPR: times10(reserve.liquidityRate, -25, 2),
      borrowAPR: times10(reserve.variableBorrowRate, -25, 2),
    };
  });

  return processedReserves;
}

function Index() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const { t } = I18n.useContainer();

  const {
    web3,
  } = Web3.useContainer();
  const {
    getMarketAllReserveData,
    getAllAssetsUSDPrices,
  } = Market.useContainer();

  useEffect(() => {
    setLoading(true);
    if (web3) {
      Promise.all([
        getMarketAllReserveData(),
        getAllAssetsUSDPrices(),
      ]).then((resp) => {
        const processedData = processData({
          reserves: resp[0],
          prices: resp[1],
        });
        setData(processedData);
        setLoading(false);
      });
    }
  }, [web3]);

  return (
    <SitePage id="index">
      <MarketInfo data={data} loading={loading} />
      <MarketList data={data} loading={loading} />
    </SitePage>
  );
}


export default Index;
