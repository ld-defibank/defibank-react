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
import { Spin } from '@common/antd';
import message from '@utils/message';
import { fromAmountToFixedAmount, fromFixedAmountToAmount, times10, isEth } from '@utils/';
import CreatePad from '../createPad';
import CreateOverview from '../createOverview';
import CONFIG from '../../../config';
import CONST from '../../../const';

import './style.scss';


const { TOKENS } = CONFIG;
const { BORROW_RATE_MODE } = CONST;


function getPadOpts({
  allowance,
  amount,
  handleApprove,
  handleDeposit,
}) {
  const padOpts = [];
  if (allowance === '0') {
    padOpts.push({
      key: 'approve',
      text: <FormattedMessage id="create_deposit_opt_approve" />,
      onClick: handleApprove,
    });
  }
  const disableDeposit = !(
    allowance !== '0'
    && parseFloat(amount) > 0
  );
  padOpts.push({
    key: 'deposit',
    text: <FormattedMessage id="create_deposit_opt_deposit" />,
    onClick: handleDeposit,
    props: {
      disabled: disableDeposit,
    },
  });
  return padOpts;
}

function CreateDeposit({ match }) {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [walletBalance, setWalletBalance] = useState('0');
  const [price, setPrice] = useState(0);
  const [amount, setAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('0');
  const [allowance, setAllowance] = useState('0');

  const {
    web3,
    currentAccount,
  } = Web3.useContainer();
  const {
    getCurrentAccountTokenWalletBalance,
    estimateDepositETHGas,
    getAllowance,
    approve,
    deposit,
  } = User.useContainer();
  const {
    getMarketReserveData,
    getAssetUSDPrice,
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
      getCurrentAccountTokenWalletBalance(tokenInfo.tokenAddress).then((balance) => {
        setWalletBalance(balance);
        // 更新amount最大值
        if (parseInt(balance, 10) === 0) return;
        if (!isEth(tokenInfo.tokenAddress)) {
          setMaxAmount(fromAmountToFixedAmount(balance, tokenInfo, Infinity));
        } else {
          // TODO:
          // ETH先判定gas
          estimateDepositETHGas().then((gas) => {
            setMaxAmount(fromAmountToFixedAmount(new Decimal(balance).minus(gas).toFixed(0), tokenInfo, Infinity));
          });
        }
      });
    }
  }, [web3, currentAccount, getCurrentAccountTokenWalletBalance, tokenInfo, setWalletBalance]);

  const updatePrice = useCallback(() => {
    if (web3 && currentAccount && tokenInfo) {
      getAssetUSDPrice(tokenInfo.tokenAddress).then(setPrice);
    }
  }, [web3, currentAccount, setPrice, tokenInfo, getAssetUSDPrice]);

  const updateAllowance = useCallback(() => {
    if (web3 && currentAccount && tokenInfo) {
      getAllowance(tokenInfo.tokenAddress).then(setAllowance);
    }
  }, [web3, currentAccount, setAllowance, tokenInfo, getAllowance]);

  useEffect(() => {
    updateWalletBalance();
    updatePrice();
    updateAllowance();
  }, [web3, currentAccount, tokenInfo]);

  if (!tokenInfo) {
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
        <Spin />
      </SitePage>
    );
  }

  const handleApprove = () => {
    if (tokenInfo) {
      setGlobalLoading(true);
      approve(tokenInfo.tokenAddress).then(() => {
        updateAllowance();
        setGlobalLoading(false);
      });
    }
  };

  const handleDeposit = () => {
    if (tokenInfo) {
      setGlobalLoading(true);
      deposit(tokenInfo.tokenAddress, fromFixedAmountToAmount(amount, tokenInfo)).then(() => {
        updateWalletBalance();
        setGlobalLoading(false);
        message.success(t('create_deposit_success'));
      });
    }
  };

  const padOpts = getPadOpts({
    t,
    allowance,
    amount,
    handleApprove,
    handleDeposit,
  });
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
      <div className="opt">
        <CreatePad
          title={<FormattedMessage id="create_deposit_title" />}
          tokenInfo={tokenInfo}
          balance={walletBalance}
          price={price}
          amount={amount}
          onAmountChange={setAmount}
          hasMax
          maxAmount={maxAmount}
          opts={padOpts}
        />
        <CreateOverview />
      </div>
    </SitePage>
  );
}

export default CreateDeposit;
