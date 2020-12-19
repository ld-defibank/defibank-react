/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState, useCallback } from 'react';
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
import CONST from '../../../const';
import DashboardBorrowUserInfo from './userInfo';
import DashboardBorrowList from './list';

import './style.scss';


const { TOKENS } = CONFIG;
const { BORROW_RATE_MODE } = CONST;

const initialListData = Object.values(TOKENS).map(v => ({
  ...v,
  available: 0,
  variableApr: '0',
  stableApr: '0',
  balance: '0',
  borrowed: '0',
  isStableApr: true,
  isCollateral: true,
  loading: true,
  utilizationRate: '0',
  borrowRateMode: BORROW_RATE_MODE[0],
}));

function Borrow() {
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
    swapBorrowRateMode,
  } = User.useContainer();
  const {
    getMarketReserveData,
    getAllAssetsUSDPrices,
  } = Market.useContainer();
  const { t } = I18n.useContainer();
  const { goto } = Router.useContainer();
  const { setGlobalLoading } = Utils.useContainer();

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
        updateAssetListValue(symbol, 'variableApr', times10(reserve.variableBorrowRate, -25, 2));
        updateAssetListValue(symbol, 'stableApr', times10(reserve.stableBorrowRate, -25, 2));
        updateAssetListValue(symbol, 'utilizationRate', times10(reserve.utilizationRate, -25, 2));
      });
      // 获取个人数据
      getCurrentUserReserveData(TOKENS[symbol].tokenAddress).then((reserve) => {
        updateAssetListValue(symbol, 'balance', reserve.currentATokenBalance);
        updateAssetListValue(symbol, 'borrowed', reserve.currentBorrowBalance);
        updateAssetListValue(symbol, 'isCollateral', reserve.usageAsCollateralEnabled);
        updateAssetListValue(symbol, 'borrowRateMode', BORROW_RATE_MODE[reserve.borrowRateMode]);
        updateAssetListValue(symbol, 'loading', false);
      });
    });
  }, [getMarketReserveData, getCurrentUserReserveData, updateAssetListValue]);

  useEffect(() => {
    if (web3 && currentAccount) {
      updateData();
    }
  }, [web3, currentAccount]);

  const onModeChange = (asset, mode) => {
    setGlobalLoading(true);
    swapBorrowRateMode(asset.tokenAddress).then((recept) => {
      if (recept.status) {
        updateData();
        setGlobalLoading(false);
      }
    }).catch((e) => {
      const error = tryGetErrorFromWeb3Error(e);
      if (error.code !== 4001) {
        message.error(t.try(`borrow_swap_ratemode_e_${error.code}`, 'common_web3_error', { code: error.code }));
      }
      setGlobalLoading(false);
    });
  };

  return (
    <SitePage
      id="borrow"
      className="business-page"
      header={(
        <>
          <a onClick={() => goto('/deposit')}><FormattedMessage id="business_header_deposit" /></a>
          <a className="active"><FormattedMessage id="business_header_borrow" /></a>
        </>
      )}
    >
      <DashboardBorrowUserInfo data={userData} prices={prices} assetList={assetList} />
      <DashboardBorrowList data={assetList} prices={prices} userData={userData} onModeChange={onModeChange} />
    </SitePage>
  );
}

export default Borrow;
