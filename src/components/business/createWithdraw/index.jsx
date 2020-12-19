/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState, useCallback } from 'react';
import { LeftOutlined, WarningOutlined } from '@ant-design/icons';
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
import { Spin, Alert } from '@common/antd';
import message from '@utils/message';
import { fromAmountToFixedAmount, fromFixedAmountToAmount, tryGetErrorFromWeb3Error } from '@utils/';
import CreatePad from '../createPad';
import CreateOverview from '../createOverview';
import CONFIG from '../../../config';

import './style.scss';


const { TOKENS } = CONFIG;

function getSliderPercent(amount, maxAmount) {
  if (!amount || !maxAmount) return 0;
  const fAmount = parseFloat(amount);
  const fMaxAmount = parseFloat(maxAmount);
  if (!fMaxAmount) return 0;
  if (fAmount > fMaxAmount) return 1;
  if (fAmount < 0) return 0;
  return fAmount / fMaxAmount;
}

function getPadOpts({
  amount,
  handleWithdraw,
}) {
  const disableWithdraw = !(
    parseFloat(amount) > 0
  );
  const padOpts = [{
    key: 'withdraw',
    text: <FormattedMessage id="create_withdraw_opt_withdraw" />,
    onClick: handleWithdraw,
    props: {
      disabled: disableWithdraw,
    },
  }];
  return padOpts;
}

function CreateWithdraw({ match }) {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [availableBalance, setAvailableBalance] = useState('0');
  const [price, setPrice] = useState(0);
  const [amount, setAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('0');
  const [showWarning, setShowWarning] = useState(false);
  const [canWithdrawMax, setCanWithdrawMax] = useState(false);
  const [isMax, setIsMax] = useState(false);

  const {
    web3,
    currentAccount,
  } = Web3.useContainer();
  const {
    getCurrentUserAccountData,
    getCurrentUserReserveData,
    getCurrentAccountTokenWalletBalance,
    withdraw,
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
        const { currentATokenBalance, usageAsCollateralEnabled } = reverseData;
        const { totalBorrowsETH, totalFeesETH, totalCollateralETH } = userData;
        if (usageAsCollateralEnabled && totalBorrowsETH !== '0') {
          setShowWarning(true);
          // 如果是作为抵押，则计算最大值
          // 1. 计算借款价值+fee
          const dBorrowedETH = new Decimal(totalBorrowsETH).add(totalFeesETH);
          // 2. 计算自身价值和其余资产价值
          const assetAmount = fromAmountToFixedAmount(currentATokenBalance, tokenInfo, Infinity);
          const dAssetETH = new Decimal(assetAmount).times(assetEthPrice);
          const dOtherAssetETH = new Decimal(totalCollateralETH).minus(dAssetETH);
          // 如果其余资产价值大于借款价值，则可全额提取
          if (dOtherAssetETH.gte(dBorrowedETH)) {
            setAvailableBalance(currentATokenBalance);
            // 更新amount最大值
            if (parseInt(currentATokenBalance, 10) === 0) return;
            setMaxAmount(fromAmountToFixedAmount(currentATokenBalance, tokenInfo, Infinity));
            setCanWithdrawMax(true);
            return;
          }
          // 3. 计算可提取最大值
          const dMaxAmountETH = dAssetETH.minus(dBorrowedETH.minus(dOtherAssetETH));
          const fMaxAmount = dMaxAmountETH.toFixed(0) / assetEthPrice;
          const balance = fromFixedAmountToAmount(fMaxAmount, tokenInfo);
          setAvailableBalance(balance);
          // 更新amount最大值
          if (parseInt(balance, 10) === 0) return;
          setMaxAmount(fromAmountToFixedAmount(balance, tokenInfo, Infinity));
          setCanWithdrawMax(false);
        } else {
          setShowWarning(false);
          setAvailableBalance(currentATokenBalance);
          // 更新amount最大值
          if (parseInt(currentATokenBalance, 10) === 0) return;
          setMaxAmount(fromAmountToFixedAmount(currentATokenBalance, tokenInfo, Infinity));
          setCanWithdrawMax(true);
        }
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

  const header = (
    <>
      <a className="back-btn" onClick={goBack}>
        <span className="icon"><LeftOutlined /></span>
        <FormattedMessage id="business_header_back" />
      </a>
      <a onClick={() => goto(`/deposit/deposit/${tokenInfo.tokenAddress}`)}><FormattedMessage id="business_header_deposit" /></a>
      <a className="active"><FormattedMessage id="business_header_withdraw" /></a>
    </>
  );

  if (!tokenInfo) {
    return (
      <SitePage
        id="createWithdraw"
        className="business-page"
        header={header}
      >
        <Spin />
      </SitePage>
    );
  }


  const handleWithdraw = () => {
    if (tokenInfo) {
      setGlobalLoading(true);
      withdraw(tokenInfo.tokenAddress, fromFixedAmountToAmount(amount, tokenInfo), isMax).then(() => {
        updateWalletBalance();
        setGlobalLoading(false);
        message.success(t('create_withdraw_success'));
      }).catch((e) => {
        const error = tryGetErrorFromWeb3Error(e);
        if (error.code !== 4001) {
          message.error(t.try(`create_withdraw_e_${error.code}`, 'common_web3_error', { code: error.code }));
        }
        setGlobalLoading(false);
      });
    }
  };

  const padOpts = getPadOpts({
    t,
    amount,
    handleWithdraw,
  });
  const percent = getSliderPercent(amount, maxAmount);
  const handleMaxClick = (max) => {
    if (max) {
      // 只有非抵押状态，或者其余资产足够抵押，才能全额提取
      if (canWithdrawMax) {
        setIsMax(max);
      }
    } else {
      setIsMax(max);
    }
  };
  return (
    <SitePage
      id="createWithdraw"
      className="business-page"
      header={header}
    >
      <div className="opt">
        <CreatePad
          title={<FormattedMessage id="create_withdraw_title" />}
          tokenInfo={tokenInfo}
          balance={availableBalance}
          price={price}
          amount={amount}
          onAmountChange={setAmount}
          hasMax={canWithdrawMax}
          maxAmount={maxAmount}
          isMax={isMax}
          setIsMax={handleMaxClick}
          opts={padOpts}
          extra={percent > 0.8 && showWarning && (
            <div className="alert-container">
              <Alert message={t('create_withdraw_warning')} type="error" showIcon icon={<WarningOutlined />} />
            </div>
          )}
        />
        <CreateOverview />
      </div>
    </SitePage>
  );
}

export default CreateWithdraw;
