import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import Decimal from 'decimal.js-light';
import SimpleBar from 'simplebar-react';
import FormattedMessage from '@common/formattedMessage';
import Switch from '@common/switch';
import { Spin } from '@common/antd';
import { times10, fromAmountToFixedAmount } from '@utils/';

// 11. 最大质押率
// 12. 清算⻔槛
// 13. 清算惩罚
// 14. 是否用作质押物
// 15. 改为Stable Borrowing，是否使用固定利率
// 16. 存款资料
//   1. 存款年利息
//   2. 过去三十日平均利息
// 17. 固定利率借贷Stable Borrowing
//   1. 借贷利率Borrow APR
//   2. 过去三十日平均Past 30D AVG
//   2. 借贷占比 Over Total，与下面浮动利率借贷占比相加等于100%
// 18. 下面还有一个类目为「浮动利率借贷Variable Borrow」
//   1. 借贷利率Borrow APR
//   2. 过去三十日平均Past 30D AVG
//   3. 借贷占比Over Total，与上面固定利率借贷占比相加等于100%
function getData(reserveData, reserveConfigData, aggregationData) {
  if (!reserveData || !reserveConfigData) {
    return {
      tokenInfo: null,
      ltv: 0,
      liquidationThreshold: 0,
      usageAsCollateralEnabled: true,
      stableBorrowRateEnabled: true,
      liquidityRate: 0,
      stableBorrowRate: 0,
      totalBorrowsStable: 0,
      variableBorrowRate: 0,
      totalBorrowsVariable: 0,
      totalBorrow: 1,
    };
  }

  const {
    meta,
    liquidityRate,
    stableBorrowRate,
    variableBorrowRate,
    totalBorrowsStable,
    totalBorrowsVariable,
  } = reserveData;

  const {
    ltv,
    liquidationThreshold,
    usageAsCollateralEnabled,
    stableBorrowRateEnabled,
    liquidationBonus,
  } = reserveConfigData;

  const {
    liquidityRate: aggregationLiquidityRate,
    stableBorrowRate: aggregationStableBorrowRate,
    variableBorrowRate: aggregationVariableBorrowRate,
  } = (aggregationData || {});

  const totalBorrow = fromAmountToFixedAmount(new Decimal(totalBorrowsStable).add(totalBorrowsVariable).toFixed(0), meta, Infinity);
  const liquidationPunishment = parseInt(liquidationBonus, 10) - 100;
  return {
    tokenInfo: meta,
    ltv,
    liquidationThreshold,
    liquidationPunishment,
    usageAsCollateralEnabled,
    stableBorrowRateEnabled,
    liquidityRate: times10(liquidityRate, -25, 2),
    stableBorrowRate: times10(stableBorrowRate, -25, 2),
    totalBorrowsStable: fromAmountToFixedAmount(totalBorrowsStable, meta, Infinity),
    variableBorrowRate: times10(variableBorrowRate, -25, 2),
    totalBorrowsVariable: fromAmountToFixedAmount(totalBorrowsVariable, meta, Infinity),
    totalBorrow: totalBorrow === '0' ? '1' : totalBorrow,
    aggregationLiquidityRate: times10(aggregationLiquidityRate || 0, -25, 2),
    aggregationStableBorrowRate: times10(aggregationStableBorrowRate || 0, -25, 2),
    aggregationVariableBorrowRate: times10(aggregationVariableBorrowRate || 0, -25, 2),
  };
}

export default function DetailData({ reserveData, reserveConfigData, aggregationData }) {
  const data = getData(reserveData, reserveConfigData, aggregationData);
  const {
    tokenInfo,
    ltv,
    liquidationThreshold,
    liquidationPunishment,
    usageAsCollateralEnabled,
    stableBorrowRateEnabled,
    liquidityRate,
    stableBorrowRate,
    totalBorrowsStable,
    variableBorrowRate,
    totalBorrowsVariable,
    totalBorrow,
    aggregationLiquidityRate,
    aggregationStableBorrowRate,
    aggregationVariableBorrowRate,
  } = data;
  return (
    <div className="data">
      <div className="pad-title"><FormattedMessage id="detail_data" /></div>
      <SimpleBar className="content" autoHide={false}>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_data_ltv" /></div>
          <div className="value">{ltv} %</div>
        </div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_data_liquidation_threshold" /></div>
          <div className="value">{liquidationThreshold} %</div>
        </div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_data_liquidation_punishment" /></div>
          <div className="value">{liquidationPunishment} %</div>
        </div>
        <div className="row block">
          <div className="label"><FormattedMessage id="detail_data_is_collateral" /></div>
          <div className="value"><Switch checked={usageAsCollateralEnabled} /></div>
        </div>
        <div className="row block">
          <div className="label"><FormattedMessage id="detail_data_is_stable" /></div>
          <div className="value"><Switch checked={stableBorrowRateEnabled} /></div>
        </div>
        <div className="pad-title"><FormattedMessage id="detail_data_deposit" /></div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_data_liquidity" /></div>
          <div className="value">{liquidityRate} %</div>
        </div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_data_liquidity_avg" /></div>
          <div className="value">{parseFloat(aggregationLiquidityRate).toFixed(2)} %</div>
        </div>
        <div className="pad-title"><FormattedMessage id="detail_data_stable" /></div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_data_stable_apr" /></div>
          <div className="value">{parseFloat(stableBorrowRate).toFixed(2)} %</div>
        </div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_data_stable_apr_avg" /></div>
          <div className="value">{parseFloat(aggregationStableBorrowRate).toFixed(2)} %</div>
        </div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_data_total_stable" /></div>
          <div className="value">{parseFloat(totalBorrowsStable).toFixed(2)} {tokenInfo && tokenInfo.symbol}</div>
        </div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_data_total_stable_per" /></div>
          <div className="value">{(parseFloat(totalBorrowsStable) / parseFloat(totalBorrow) * 100).toFixed(2)} %</div>
        </div>
        <div className="pad-title"><FormattedMessage id="detail_data_variable" /></div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_data_variable_apr" /></div>
          <div className="value">{parseFloat(variableBorrowRate).toFixed(2)} %</div>
        </div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_data_variable_apr_avg" /></div>
          <div className="value">{parseFloat(aggregationVariableBorrowRate).toFixed(2)} %</div>
        </div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_data_total_variable" /></div>
          <div className="value">{parseFloat(totalBorrowsVariable).toFixed(2)} {tokenInfo && tokenInfo.symbol}</div>
        </div>
        <div className="row">
          <div className="label"><FormattedMessage id="detail_data_total_variable_per" /></div>
          <div className="value">{(parseFloat(totalBorrowsVariable) / parseFloat(totalBorrow) * 100).toFixed(2)} %</div>
        </div>
      </SimpleBar>
    </div>
  );
}
