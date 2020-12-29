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
import { fromAmountToFixedAmount, fromFixedAmountToAmount, tryGetErrorFromWeb3Error, times10 } from '@utils/';
import CreatePad from '../createPad';
import CreateOverview from '../createOverview';
import CONFIG from '../../../config';
import CONST from '../../../const';

import './style.scss';


const { TOKENS } = CONFIG;
const { BORROW_RATE_MODE, BORROW_RATE_MODE_CODE } = CONST;


function getOverviewRows({
  t,
  marketData,
  tokenInfo,
  price,
  marketConfig,
  userData,
  ethusdPrice,
}) {
  if (!marketData || !tokenInfo || !marketConfig || !userData) return [];
  const {
    utilizationRate,
    stableBorrowRate,
    variableBorrowRate,
  } = marketData;
  const {
    ltv,
    liquidationThreshold,
    liquidationBonus,
  } = marketConfig;
  const {
    totalBorrowsETH,
    availableBorrowsETH,
  } = userData;
  // 1. 已借贷金额，单位USD
  const borrowed = new Decimal(fromAmountToFixedAmount(totalBorrowsETH, TOKENS.ETH, Infinity)).times(ethusdPrice).toFixed(2);
  // 2. 账号可借贷金额，单位USD
  const availableBorrowsUSD = new Decimal(fromAmountToFixedAmount(availableBorrowsETH, TOKENS.ETH, Infinity)).times(ethusdPrice).toFixed(2);
  // 3. 平台内该币种利用率
  const utilization = times10(utilizationRate, -25, 2);
  // 4. 该币种当前价格
  const priceUSD = parseFloat(price || 0).toFixed(2);
  // 5. 固定利率
  const stableRate = times10(stableBorrowRate, -25, 2);
  // 6. 浮动利率
  const variableRate = times10(variableBorrowRate, -25, 2);
  // 7. 最大质押率
  // 8. 清算⻔槛
  // 9. 清算惩罚
  const liquidationPunishment = parseInt(liquidationBonus, 10) - 100;

  return [{
    label: t('create_borrow_overview_borrowed'),
    value: `${borrowed} USD`,
  }, {
    label: t('create_borrow_overview_available'),
    value: `${availableBorrowsUSD} USD`,
  }, {
    label: t('create_borrow_overview_utilization'),
    value: `${utilization} %`,
  }, {
    label: t('create_borrow_overview_price'),
    value: `${priceUSD} USD`,
  }, {
    label: t('create_borrow_overview_stable_apr'),
    value: `${stableRate} %`,
  }, {
    label: t('create_borrow_overview_variable_apr'),
    value: `${variableRate} %`,
  }, {
    label: t('create_borrow_overview_ltv'),
    value: `${ltv} %`,
  }, {
    label: t('create_borrow_overview_threshold'),
    value: `${liquidationThreshold} %`,
  }, {
    label: t('create_borrow_overview_punishment'),
    value: `${liquidationPunishment} %`,
  }];
}


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
  const [marketData, setMarketData] = useState(null);
  const [marketConfig, setMarketConfig] = useState(null);
  const [userData, setUserData] = useState(null);
  const [availableBalance, setAvailableBalance] = useState('0');
  const [price, setPrice] = useState(0);
  const [ethusdPrice, setETHUSDPrice] = useState(0);
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
    getMarketReserveData,
    getMarketReserveConfigurationData,
    getETHUSDPrice,
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
      ]).then(([reverseData, userDataResp, assetEthPrice]) => {
        const { borrowRateMode } = reverseData;
        setUserData(userDataResp);
        // 锁定rate mode
        if (borrowRateMode !== BORROW_RATE_MODE_CODE.noborrow) {
          setRateMode(BORROW_RATE_MODE[borrowRateMode]);
          setLockRateMode(true);
        }
        const { availableBorrowsETH } = userDataResp;
        const balance = fromFixedAmountToAmount(new Decimal(availableBorrowsETH).div(assetEthPrice).toFixed(tokenInfo.decimals, Decimal.ROUND_DOWN), tokenInfo);
        setAvailableBalance(balance);
        // 更新amount最大值
        if (parseInt(balance, 10) === 0) return;
        setMaxAmount(fromAmountToFixedAmount(balance, tokenInfo, Infinity));
      });
    }
  }, [web3, currentAccount, getCurrentAccountTokenWalletBalance, tokenInfo, setAvailableBalance]);

  const updateTokenMarketInfo = useCallback(() => {
    if (web3 && currentAccount && tokenInfo) {
      Promise.all([
        getMarketReserveData(tokenInfo.tokenAddress),
        getAssetUSDPrice(tokenInfo.tokenAddress),
        getMarketReserveConfigurationData(tokenInfo.tokenAddress),
        getETHUSDPrice(),
      ]).then((resp) => {
        setMarketData(resp[0]);
        setPrice(resp[1]);
        setMarketConfig(resp[2]);
        setETHUSDPrice(resp[3]);
      });
    }
  }, [web3, currentAccount, setPrice, tokenInfo, getAssetUSDPrice]);


  useEffect(() => {
    updateWalletBalance();
    updateTokenMarketInfo();
  }, [web3, currentAccount, tokenInfo]);

  const header = (
    <>
      <a className="back-btn" onClick={goBack}>
        <span className="icon"><LeftOutlined /></span>
        <FormattedMessage id="business_header_back" />
      </a>
      <a className="active"><FormattedMessage id="business_header_borrow" /></a>
      <a onClick={() => goto(`/borrow/repay/${tokenInfo.tokenAddress}`)}><FormattedMessage id="business_header_repay" /></a>
    </>
  );

  if (!tokenInfo) {
    return (
      <SitePage
        id="createBorrow"
        className="business-page"
        header={header}
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
  const overivewRows = getOverviewRows({
    t,
    userData,
    marketData,
    tokenInfo,
    price,
    marketConfig,
    ethusdPrice,
  });
  return (
    <SitePage
      id="createBorrow"
      className="business-page"
      header={header}
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
        <CreateOverview
          title={<FormattedMessage id="create_deposit_overview_title" />}
          rows={overivewRows}
        />
      </div>
    </SitePage>
  );
}

export default CreateBorrow;
