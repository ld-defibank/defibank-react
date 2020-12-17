/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState, useCallback } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import Decimal from 'decimal.js-light';
import I18n from '@models/i18n';
import Router from '@models/router';
import Web3 from '@models/web3v2';
import User from '@models/user';
import Market from '@models/market';
import Utils from '@models/utils';
import SitePage from '@common/sitePage';
import FormattedMessage from '@common/formattedMessage';
import RadioGroup from '@common/radioGroup';
import { Spin } from '@common/antd';
import message from '@utils/message';
import { fromAmountToFixedAmount, fromFixedAmountToAmount, times10, tryGetErrorFromWeb3Error } from '@utils/';
import CreatePad from '../createPad';
import CreateOverview from '../createOverview';
import CONFIG from '../../../config';
import CONST from '../../../const';

import './style.scss';


const { TOKENS } = CONFIG;
const { BORROW_RATE_MODE, BORROW_RATE_MODE_CODE } = CONST;


function getPadOpts({
  amount,
  handleBorrow,
}) {
  const disableBorrow = !(
    parseFloat(amount) > 0
  );
  const padOpts = [{
    key: 'borrow',
    text: <FormattedMessage id="create_borrow_opt_borrow" />,
    onClick: handleBorrow,
    props: {
      disabled: disableBorrow,
    },
  }];
  return padOpts;
}

function CreateBorrow({ match }) {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [availableBalance, setAvailableBalance] = useState('0');
  const [price, setPrice] = useState(0);
  const [amount, setAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('0');
  const [rateMode, setRateMode] = useState(BORROW_RATE_MODE.stable);
  const [lockRateMode, setLockRateMode] = useState(false);

  const {
    web3,
    currentAccount,
  } = Web3.useContainer();
  const {
    getCurrentUserAccountData,
    getCurrentUserReserveData,
    getCurrentAccountTokenWalletBalance,
    borrow,
  } = User.useContainer();
  const {
    getAssetUSDPrice,
    getAssetETHPrice,
  } = Market.useContainer();
  const { setGlobalLoading } = Utils.useContainer();
  const { t } = I18n.useContainer();
  const { goto, goBack } = Router.useContainer();

  // 初始化
  useEffect(() => {
    if (match && match.params && match.params.tokenAddress) {
      setTokenInfo(Object.values(TOKENS).find(token => token.tokenAddress === match.params.tokenAddress));
    }
  }, []);

  // 初始化钱包数据
  const updateWalletBalance = useCallback(() => {
    if (web3 && currentAccount && tokenInfo) {
      Promise.all([
        getCurrentUserReserveData(tokenInfo.tokenAddress),
        getCurrentUserAccountData(tokenInfo.tokenAddress),
        getAssetETHPrice(tokenInfo.tokenAddress),
      ]).then(([reverseData, userData, assetEthPrice]) => {
        const { borrowRateMode } = reverseData;
        // 锁定rate mode
        if (borrowRateMode !== BORROW_RATE_MODE_CODE.noborrow) {
          setRateMode(BORROW_RATE_MODE[borrowRateMode]);
          setLockRateMode(true);
        }
        const { availableBorrowsETH } = userData;
        const balance = fromFixedAmountToAmount(new Decimal(availableBorrowsETH).div(assetEthPrice).toFixed(tokenInfo.decimals, Decimal.ROUND_DOWN), tokenInfo);
        setAvailableBalance(balance);
        // 更新amount最大值
        if (parseInt(balance, 10) === 0) return;
        setMaxAmount(fromAmountToFixedAmount(balance, tokenInfo, Infinity));
      });
    }
  }, [web3, currentAccount, getCurrentAccountTokenWalletBalance, tokenInfo, setAvailableBalance]);

  const updatePrice = useCallback(() => {
    if (web3 && currentAccount && tokenInfo) {
      getAssetUSDPrice(tokenInfo.tokenAddress).then(setPrice);
    }
  }, [web3, currentAccount, setPrice, tokenInfo, getAssetUSDPrice]);


  useEffect(() => {
    updateWalletBalance();
    updatePrice();
  }, [web3, currentAccount, tokenInfo]);

  if (!tokenInfo) {
    return (
      <SitePage
        id="createBorrow"
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
        <Spin />
      </SitePage>
    );
  }


  const handleBorrow = () => {
    if (tokenInfo) {
      setGlobalLoading(true);
      borrow(tokenInfo.tokenAddress, fromFixedAmountToAmount(amount, tokenInfo), BORROW_RATE_MODE_CODE[rateMode]).then(() => {
        updateWalletBalance();
        setGlobalLoading(false);
        message.success(t('create_borrow_success'));
      }).catch((e) => {
        const error = tryGetErrorFromWeb3Error(e);
        if (error.code !== 4001) {
          message.error(t.try(`create_borrow_e_${error.code}`, 'common_web3_error', { code: error.code }));
        }
        setGlobalLoading(false);
      });
    }
  };

  const padOpts = getPadOpts({
    t,
    amount,
    handleBorrow,
  });
  const radioGroupOptions = [{
    key: 'stable',
    value: BORROW_RATE_MODE.stable,
    label: t('create_borrow_mode_stable'),
  }, {
    key: 'variable',
    value: BORROW_RATE_MODE.variable,
    label: t('create_borrow_mode_variable'),
  }];
  return (
    <SitePage
      id="createBorrow"
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
      <div className="opt">
        <CreatePad
          title={<FormattedMessage id="create_borrow_title" />}
          tokenInfo={tokenInfo}
          balance={availableBalance}
          price={price}
          amount={amount}
          onAmountChange={setAmount}
          hasMax
          maxAmount={maxAmount}
          opts={padOpts}
          extra={(
            <div className="radio-group-container">
              <FormattedMessage id="create_borrow_mode" className="label" />
              <RadioGroup options={radioGroupOptions} value={rateMode} onChange={setRateMode} optionWidth={100} disabled={lockRateMode} />
            </div>
          )}
        />
        <CreateOverview />
      </div>
    </SitePage>
  );
}

export default CreateBorrow;
