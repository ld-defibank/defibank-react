/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useCallback, useEffect, useState } from 'react';
import I18n from '@models/i18n';
import Router from '@models/router';
import Web3 from '@models/web3v2';
import User from '@models/user';
import Market from '@models/market';
import SitePage from '@common/sitePage';
import FormattedMessage from '@common/formattedMessage';
import message from '@utils/message';
import { fromAmountToFixedAmount, times10 } from '@utils/';
import CONFIG from '../../../config';
import DashboardDepositUserInfo from './userInfo';
import DashboardDepositList from './list';

import './style.scss';

const { TOKENS } = CONFIG;

const initialListData = Object.values(TOKENS).map(v => ({
  ...v,
  balance: 0,
  apr: '0',
  isCollateral: true,
  loading: true,
}));


function DashboardDeposit() {
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
    getCurrentUserReserveData,
  } = User.useContainer();
  const {
    getMarketReserveData,
    getAllAssetsUSDPrices,
  } = Market.useContainer();
  const { t } = I18n.useContainer();
  const { goto } = Router.useContainer();

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

  useEffect(() => {
    if (web3 && currentAccount) {
      Object.keys(TOKENS).forEach((symbol) => {
        // 获取市场数据
        getMarketReserveData(TOKENS[symbol].tokenAddress).then((reserve) => {
          updateAssetListValue(symbol, 'apr', times10(reserve.liquidityRate, -27, 2));
        });
        // 获取个人数据
        getCurrentUserReserveData(TOKENS[symbol].tokenAddress).then((reserve) => {
          updateAssetListValue(symbol, 'balance', reserve.currentATokenBalance);
          updateAssetListValue(symbol, 'isCollateral', reserve.usageAsCollateralEnabled);
          updateAssetListValue(symbol, 'loading', false);
        });
      });
    }
  }, [web3, currentAccount]);

  const handleCollateralChange = (asset, isCollateral) => {
    updateAssetListValue(asset.symbol, 'isCollateral', isCollateral);
    // TODO:
  };

  return (
    <SitePage
      id="dashboardDeposit"
      className="dashboard-page"
      header={(
        <>
          <a className="active"><FormattedMessage id="dashboard_header_deposit" /></a>
          <a onClick={() => goto('/dashboard/borrow')}><FormattedMessage id="dashboard_header_borrow" /></a>
        </>
      )}
    >
      <DashboardDepositUserInfo data={userData} prices={prices} assetList={assetList} />
      <DashboardDepositList data={assetList} prices={prices} onCollateralChange={handleCollateralChange} />
    </SitePage>
  );
}


export default DashboardDeposit;
