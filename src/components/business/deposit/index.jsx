/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useCallback, useEffect, useState } from 'react';
import I18n from '@models/i18n';
import Router from '@models/router';
import Web3 from '@models/web3v2';
import User from '@models/user';
import Market from '@models/market';
import Utils from '@models/utils';
import SitePage from '@common/sitePage';
import FormattedMessage from '@common/formattedMessage';
import message from '@utils/message';
import { fromAmountToFixedAmount, times10, tryGetErrorFromWeb3Error } from '@utils/';
import CONFIG from '../../../config';
import DashboardDepositList from './list';

import './style.scss';

const { TOKENS } = CONFIG;

const initialListData = Object.values(TOKENS).map(v => ({
  ...v,
  bankBalance: 0,
  walletBalance: 0,
  apr: '0',
}));


function Deposit() {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState([]);
  const [userData, setUserData] = useState(null);
  const [assetList, setAssetList] = useState(initialListData);
  const {
    web3,
    currentAccount,
  } = Web3.useContainer();
  const {
    getCurrentUserAccountData,
    getCurrentAccountTokenWalletBalance,
    getCurrentUserReserveData,
  } = User.useContainer();
  const {
    getMarketReserveData,
    getAllAssetsUSDPrices,
  } = Market.useContainer();

  useEffect(() => {
    setLoading(true);
    if (web3 && currentAccount) {
      getCurrentUserAccountData().then((data) => {
        setLoading(false);
        setUserData(data);
      });
    }
  }, [web3, currentAccount]);

  useEffect(() => {
    if (web3) {
      getAllAssetsUSDPrices().then(setPrices);
    }
  }, [web3]);

  // 更新list数据
  const updateAssetListValue = useCallback((symbol, key, value) => {
    const newAssetList = [...assetList];
    const asset = newAssetList.find(a => a.symbol === symbol);
    if (asset) {
      asset[key] = value;
      setAssetList(newAssetList);
    }
  }, [assetList]);

  const updateData = useCallback(() => {
    Object.keys(TOKENS).forEach((symbol) => {
      // 获取市场数据
      getMarketReserveData(TOKENS[symbol].tokenAddress).then((reserve) => {
        updateAssetListValue(symbol, 'apr', times10(reserve.liquidityRate, -25, 2));
      });
      // 获取个人数据
      getCurrentAccountTokenWalletBalance(TOKENS[symbol].tokenAddress).then((balance) => {
        updateAssetListValue(symbol, 'walletBalance', balance);
      });
      // 获取个人数据
      getCurrentUserReserveData(TOKENS[symbol].tokenAddress).then((reserve) => {
        updateAssetListValue(symbol, 'bankBalance', reserve.currentATokenBalance);
      });
    });
  }, [getMarketReserveData, getCurrentAccountTokenWalletBalance, updateAssetListValue]);

  useEffect(() => {
    if (web3 && currentAccount) {
      updateData();
    }
  }, [web3, currentAccount]);

  return (
    <SitePage
      id="deposit"
      className="business-page"
    >
      <div className="title"><FormattedMessage id="business_header_deposit" /></div>
      <DashboardDepositList data={assetList} prices={prices} />
    </SitePage>
  );
}


export default Deposit;
