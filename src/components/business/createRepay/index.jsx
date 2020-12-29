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
  tokenInfo,
  marketConfig,
  userData,
}) {
  if (!tokenInfo || !marketConfig || !userData) return [];
  const {
    ltv,
    liquidationThreshold,
    liquidationBonus,
  } = marketConfig;
  const {
    totalCollateralETH,
    totalBorrowsETH,
  } = userData;

  // 1. 当前质押率
  const currentltv = new Decimal(totalBorrowsETH).div(totalCollateralETH).toFixed(2);
  // 2. 最大质押率
  // 3. 清算⻔槛
  // 4. 改为清算惩罚「Liquidation panalty」
  const liquidationPunishment = parseInt(liquidationBonus, 10) - 100;

  return [{
    label: t('create_repay_overview_current_ltv'),
    value: `${currentltv} %`,
  }, {
    label: t('create_repay_overview_ltv'),
    value: `${ltv} %`,
  }, {
    label: t('create_repay_overview_threshold'),
    value: `${liquidationThreshold} %`,
  }, {
    label: t('create_repay_overview_punishment'),
    value: `${liquidationPunishment} %`,
  }];
}

function getPadOpts({
  amount,
  handleRepay,
}) {
  const disableRepay = !(
    parseFloat(amount) > 0
  );
  const padOpts = [{
    key: 'repay',
    text: <FormattedMessage id="create_repay_opt_repay" />,
    onClick: handleRepay,
    props: {
      disabled: disableRepay,
    },
  }];
  return padOpts;
}

function CreateRepay({ match }) {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [borrowedBalance, setBorrowedBalance] = useState('0');
  const [marketConfig, setMarketConfig] = useState(null);
  const [userData, setUserData] = useState(null);
  const [principalBorrowBalance, setPrincipalBorrowBalance] = useState('0');
  const [originationFee, setOriginationFee] = useState('0');
  const [price, setPrice] = useState(0);
  const [amount, setAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('0');
  const [isMax, setIsMax] = useState(false);

  const {
    web3,
    currentAccount,
  } = Web3.useContainer();
  const {
    getCurrentUserAccountData,
    getCurrentUserReserveData,
    getCurrentAccountTokenWalletBalance,
    repayForMyself,
  } = User.useContainer();
  const {
    getAssetUSDPrice,
    getAssetETHPrice,
    getMarketReserveConfigurationData,
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
        setUserData(userDataResp);
        const { currentBorrowBalance } = reverseData;
        setBorrowedBalance(currentBorrowBalance);
        setPrincipalBorrowBalance(reverseData.principalBorrowBalance);
        setOriginationFee(reverseData.originationFee);
        // 更新amount最大值
        if (parseInt(currentBorrowBalance, 10) === 0) return;
        setMaxAmount(fromAmountToFixedAmount(currentBorrowBalance, tokenInfo, Infinity));
      });
    }
  }, [web3, currentAccount, getCurrentAccountTokenWalletBalance, tokenInfo, setBorrowedBalance]);

  const updateTokenMarketInfo = useCallback(() => {
    if (web3 && currentAccount && tokenInfo) {

      Promise.all([
        getAssetUSDPrice(tokenInfo.tokenAddress),
        getMarketReserveConfigurationData(tokenInfo.tokenAddress),
      ]).then((resp) => {
        setPrice(resp[0]);
        setMarketConfig(resp[1]);
      });
      getAssetUSDPrice(tokenInfo.tokenAddress).then(setPrice);
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
      <a onClick={() => goto(`/borrow/borrow/${tokenInfo.tokenAddress}`)}><FormattedMessage id="business_header_borrow" /></a>
      <a className="active"><FormattedMessage id="business_header_repay" /></a>
    </>
  );

  if (!tokenInfo) {
    return (
      <SitePage
        id="createRepay"
        className="business-page"
        header={header}
      >
        <Spin />
      </SitePage>
    );
  }


  const handleRepay = () => {
    if (tokenInfo) {
      setGlobalLoading(true);
      repayForMyself(tokenInfo.tokenAddress, new Decimal(fromFixedAmountToAmount(amount, tokenInfo)).add(originationFee).toFixed(0), isMax).then(() => {
        updateWalletBalance();
        setGlobalLoading(false);
        message.success(t('create_repay_success'));
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
    handleRepay,
  });
  const overivewRows = getOverviewRows({
    t,
    userData,
    tokenInfo,
    marketConfig,
  });
  return (
    <SitePage
      id="createRepay"
      className="business-page"
      header={header}
    >
      <div className="opt">
        <CreatePad
          title={<FormattedMessage id="create_repay_title" />}
          tokenInfo={tokenInfo}
          balance={borrowedBalance}
          price={price}
          amount={amount}
          onAmountChange={setAmount}
          hasMax
          maxAmount={maxAmount}
          isMax={isMax}
          setIsMax={setIsMax}
          opts={padOpts}
          extra={amount && (
            <div className="info-container">
              <div className="row">
                <div className="label"><FormattedMessage id="create_repay_info_borrowed" /></div>
                <div className="value">{fromAmountToFixedAmount(fromFixedAmountToAmount(amount, tokenInfo), tokenInfo, 6)} <span className="tx-weak">{tokenInfo.symbol}</span></div>
              </div>
              <div className="row">
                <div className="label"><FormattedMessage id="create_repay_info_fee" /></div>
                <div className="value">{fromAmountToFixedAmount(originationFee, tokenInfo, 6)} <span className="tx-weak">{tokenInfo.symbol}</span></div>
              </div>
              <div className="row">
                <div className="label"><FormattedMessage id="create_repay_info_total" /></div>
                <div className="value">
                  {
                    fromAmountToFixedAmount(new Decimal(fromFixedAmountToAmount(amount, tokenInfo)).add(originationFee), tokenInfo, 6)
                  } <span className="tx-weak">{tokenInfo.symbol}</span>
                </div>
              </div>
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

export default CreateRepay;
