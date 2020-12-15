/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState, useCallback } from 'react';
import { LeftOutlined } from '@ant-design/icons';
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
import CONST from '../../../const';

import './style.scss';


const { TOKENS } = CONFIG;
const { BORROW_RATE_MODE } = CONST;


function CreateDeposit() {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState([]);
  const [userData, setUserData] = useState(null);
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
  const { goto, goBack } = Router.useContainer();


  return (
    <SitePage
      id="createDeposit"
      className="business-page"
      header={(
        <>
          <a className="back-btn" onClick={goBack}>
            <span className="icon"><LeftOutlined /></span>
            <FormattedMessage id="business_header_back" />
          </a>
          <a onClick={() => goto('/deposit')}><FormattedMessage id="business_header_deposit" /></a>
          <a className="active"><FormattedMessage id="business_header_borrow" /></a>
        </>
      )}
    >
      2222
    </SitePage>
  );
}

export default CreateDeposit;
