/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useCallback } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import SitePage from '@common/sitePage';
import FormattedMessage from '@common/formattedMessage';
import { Spin } from '@common/antd';
import Router from '@models/router';
import Web3 from '@models/web3v2';
import User from '@models/user';
import Market from '@models/market';
import CONFIG from '../../config';
import DetailSize from './size';
import DetailData from './data';
import DetailUser from './user';

import './style.scss';

const { TOKENS } = CONFIG;

export default function Detail({ match }) {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [reserveData, setReserveData] = useState(null);
  const [reserveConfigData, setReserveConfigData] = useState(null);
  const [userReserveData, setUserReserveData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [price, setPrice] = useState(0);
  const [ETHPrice, setETHPrice] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const {
    web3,
    currentAccount,
  } = Web3.useContainer();
  const {
    getMarketReserveData,
    getMarketReserveConfigurationData,
    getAssetUSDPrice,
    getAssetETHPrice,
  } = Market.useContainer();
  const {
    getCurrentUserReserveData,
    getCurrentUserAccountData,
    getCurrentAccountTokenWalletBalance,
  } = User.useContainer();
  const { goto, goBack } = Router.useContainer();

  // 初始化
  useEffect(() => {
    if (match && match.params && match.params.tokenAddress) {
      setTokenInfo(Object.values(TOKENS).find(token => token.tokenAddress === match.params.tokenAddress));
    }
  }, []);

  const updateTokenMarketInfo = useCallback(() => {
    if (web3 && currentAccount && tokenInfo) {
      const { tokenAddress } = tokenInfo;
      getMarketReserveData(tokenAddress).then(setReserveData);
      getMarketReserveConfigurationData(tokenAddress).then(setReserveConfigData);
      getAssetUSDPrice(tokenAddress).then(setPrice);
      getAssetETHPrice(tokenAddress).then(setETHPrice);
      getCurrentUserReserveData(tokenAddress).then(setUserReserveData);
      getCurrentUserAccountData().then(setUserData);
      getCurrentAccountTokenWalletBalance(tokenAddress).then(setWalletBalance);
    }
  }, [web3, currentAccount, tokenInfo, getMarketReserveData]);

  useEffect(() => {
    updateTokenMarketInfo();
  }, [web3, currentAccount, tokenInfo]);

  const header = (
    <>
      <a className="back-btn" onClick={goBack}>
        <span className="icon"><LeftOutlined /></span>
        <FormattedMessage id="business_header_back" />
      </a>
    </>
  );

  if (!tokenInfo) {
    return (
      <SitePage
        id="detail"
        header={header}
      >
        <Spin />
      </SitePage>
    );
  }

  return (
    <SitePage
      id="detail"
      header={header}
    >
      <div className="title">
        <span className="icon">
          <svg aria-hidden="true">
            <use xlinkHref={'#icon-' + tokenInfo.symbol} />
          </svg>
        </span>
        <span className="symbol">{tokenInfo.symbol || '--'}</span>
      </div>
      <div className="row1">
        <DetailSize reserveData={reserveData} price={price} />
        <DetailData reserveData={reserveData} price={price} reserveConfigData={reserveConfigData} />
      </div>
      <div className="title"><FormattedMessage id="detail_user_info" /></div>
      <DetailUser reserveData={reserveData} price={price} userReserveData={userReserveData} userData={userData} ETHPrice={ETHPrice} walletBalance={walletBalance} />
    </SitePage>
  );
}
