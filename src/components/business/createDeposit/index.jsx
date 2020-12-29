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
import { fromAmountToFixedAmount, fromFixedAmountToAmount, isEth, times10 } from '@utils/';
import CreatePad from '../createPad';
import CreateOverview from '../createOverview';
import CONFIG from '../../../config';

import './style.scss';


const { TOKENS } = CONFIG;

function getOverviewRows({
  t,
  marketData,
  tokenInfo,
  price,
  marketConfig,
}) {
  if (!marketData || !tokenInfo || !marketConfig) return [];
  const {
    utilizationRate,
    totalLiquidity,
    totalBorrowsStable,
    totalBorrowsVariable,
    variableBorrowRate,
    stableBorrowRate,
    liquidityRate,
  } = marketData;
  const {
    ltv,
    liquidationThreshold,
    usageAsCollateralEnabled,
    liquidationBonus,
  } = marketConfig;
  // 1. 资金是利用率，=已借出/已存入
  const utilization = times10(utilizationRate, -25, 2);
  // 2. 可借出金额，=已存入-已借出
  const available = new Decimal(totalLiquidity)
    .minus(totalBorrowsVariable)
    .minus(totalBorrowsStable)
    .toFixed(0);
  // 3. 币种价格，单位USD
  const priceUSD = parseFloat(price || 0).toFixed(2);
  // 4. 存款年利率，额外说明:此处的收益率为本币收益率+流动性挖矿收益率
  const rate = times10(liquidityRate, -25, 2);
  // 5. 是否可以用作抵押物，后面不是比率，是「是」或「否」
  // 6. 最大质押率
  // 7. 清算⻔槛
  // 8. 清算惩罚
  const liquidationPunishment = parseInt(liquidationBonus, 10) - 100;
  // 9. TODO: 历史利率曲线图

  return [{
    label: t('create_deposit_overview_utilization'),
    value: `${utilization} %`,
  }, {
    label: t('create_deposit_overview_available'),
    value: `${fromAmountToFixedAmount(available, tokenInfo, 2)} ${tokenInfo.symbol}`,
  }, {
    label: t('create_deposit_overview_price'),
    value: `${priceUSD} USDT`,
  }, {
    label: t('create_deposit_overview_apr'),
    value: `${rate} %`,
  }, {
    label: t('create_deposit_overview_collateral'),
    value: usageAsCollateralEnabled ? t('yes') : t('no'),
  }, {
    label: t('create_deposit_overview_ltv'),
    value: `${ltv} %`,
  }, {
    label: t('create_deposit_overview_threshold'),
    value: `${liquidationThreshold} %`,
  }, {
    label: t('create_deposit_overview_punishment'),
    value: `${liquidationPunishment} %`,
  }];
}

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
  const [marketData, setMarketData] = useState(null);
  const [marketConfig, setMarketConfig] = useState(null);
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
    getMarketReserveConfigurationData,
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
          // ETH先判定gas
          estimateDepositETHGas().then((gas) => {
            setMaxAmount(fromAmountToFixedAmount(new Decimal(balance).minus(gas).toFixed(0), tokenInfo, Infinity));
          });
        }
      });
    }
  }, [web3, currentAccount, getCurrentAccountTokenWalletBalance, tokenInfo, setWalletBalance]);

  const updateTokenMarketInfo = useCallback(() => {
    if (web3 && currentAccount && tokenInfo) {
      Promise.all([
        getMarketReserveData(tokenInfo.tokenAddress),
        getAssetUSDPrice(tokenInfo.tokenAddress),
        getMarketReserveConfigurationData(tokenInfo.tokenAddress),
      ]).then((resp) => {
        setMarketData(resp[0]);
        setPrice(resp[1]);
        setMarketConfig(resp[2]);
      });
    }
  }, [web3, currentAccount, setPrice, tokenInfo, getAssetUSDPrice]);

  const updateAllowance = useCallback(() => {
    if (web3 && currentAccount && tokenInfo) {
      getAllowance(tokenInfo.tokenAddress).then(setAllowance);
    }
  }, [web3, currentAccount, setAllowance, tokenInfo, getAllowance]);

  useEffect(() => {
    updateWalletBalance();
    updateTokenMarketInfo();
    updateAllowance();
  }, [web3, currentAccount, tokenInfo]);

  const header = (
    <>
      <a className="back-btn" onClick={goBack}>
        <span className="icon"><LeftOutlined /></span>
        <FormattedMessage id="business_header_back" />
      </a>
      <a className="active"><FormattedMessage id="business_header_deposit" /></a>
      <a onClick={() => goto(`/deposit/withdraw/${tokenInfo.tokenAddress}`)}><FormattedMessage id="business_header_withdraw" /></a>
    </>
  );

  if (!tokenInfo) {
    return (
      <SitePage
        id="createDeposit"
        className="business-page"
        header={header}
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
      }).catch(() => {
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
      }).catch(() => {
        setGlobalLoading(false);
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
  const overivewRows = getOverviewRows({
    t,
    marketData,
    tokenInfo,
    price,
    marketConfig,
  });
  return (
    <SitePage
      id="createDeposit"
      className="business-page"
      header={header}
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
        <CreateOverview
          title={<FormattedMessage id="create_deposit_overview_title" />}
          rows={overivewRows}
        />
      </div>
    </SitePage>
  );
}

export default CreateDeposit;
