import React, { useState, useEffect } from 'react';
import Table from '@common/table';
import RadioGroup from '@common/radioGroup';
import I18n from '@models/i18n';
import FormattedMessage from '@common/formattedMessage';
import { fromAmountToFixedAmount, humanReadableNumber } from '@utils/';
import { Spin } from '@common/antd';
import CONST from '../../../const';

const { BORROW_RATE_MODE } = CONST;

function getColumns(data, prices, userData, t, handleModeChange) {
  const radioGroupOptions = [{
    key: 'stable',
    value: BORROW_RATE_MODE.stable,
    label: t('dashboard_borrow_table_mode_stable'),
  }, {
    key: 'variable',
    value: BORROW_RATE_MODE.variable,
    label: t('dashboard_borrow_table_mode_no_variable'),
  }];

  const availableBorrowsETH = userData ? userData.availableBorrowsETH : '0';

  return [{
    title: t('dashboard_borrow_table_asset'),
    dataIndex: 'symbol',
    key: 'symbol',
    className: 'symbol',
    render: text => (
      <>
        <span className="icon">
          <svg aria-hidden="true">
            <use xlinkHref={'#icon-' + text} />
          </svg>
        </span>
        <span>{text || '--'}</span>
      </>
    ),
  }, {
    title: t('dashboard_borrow_table_available'),
    dataIndex: 'available',
    key: 'available',
    className: 'available',
    render: (text, row) => {
      if (row.loading) return <Spin size="small" />;
      const priceInfo = prices.find(p => p.tokenAddress === row.tokenAddress) || { priceAsEth: 0, price: 0 };
      const { price, priceAsEth } = priceInfo;
      let available;
      if (parseFloat(price) === 0 || parseFloat(priceAsEth) === 0) {
        available = 0;
      } else {
        available = parseFloat(availableBorrowsETH) / parseFloat(priceAsEth);
      }

      return `${humanReadableNumber(available.toFixed(2))} ${row.symbol}`;
    },
    props: {
      'data-label': t('dashboard_borrow_table_available'),
    },
  }, {
    title: (
      <>
        <div><FormattedMessage id="dashboard_borrow_table_stable_apr" /></div>
        <div><FormattedMessage id="dashboard_borrow_table_variable_apr" /></div>
      </>
    ),
    dataIndex: 'apr',
    key: 'apr',
    className: 'apr',
    render: (text, row) => {
      const { borrowRateMode, variableApr, stableApr } = row;
      if (borrowRateMode === BORROW_RATE_MODE.stable) {
        return (
          <>
            <div className="tx-green">{stableApr} %</div>
            <div className="tx-gray">{variableApr} %</div>
          </>
        );
      }
      if (borrowRateMode === BORROW_RATE_MODE.variable) {
        return (
          <>
            <div className="tx-gray">{stableApr} %</div>
            <div className="tx-green">{variableApr} %</div>
          </>
        );
      }
      return (
        <>
          <div className="tx-green">{stableApr} %</div>
          <div className="tx-green">{variableApr} %</div>
        </>
      );
    },
    props: {
      'data-label': t('dashboard_deposit_apr'),
    },
  }, {
    title: t('dashboard_borrow_table_mode'),
    dataIndex: 'borrowRateMode',
    key: 'borrowRateMode',
    className: 'borrowratemode',
    render: (text, row) => {
      if (text === BORROW_RATE_MODE.noborrow) {
        return <span className="tx-gray"><FormattedMessage id="dashboard_borrow_table_mode_noborrow" /></span>;
      }
      return <RadioGroup options={radioGroupOptions} value={text} onChange={c => handleModeChange(row, c)} />;
    },
    props: {
      'data-label': t('dashboard_deposit_collateral'),
    },
  }, {
    title: t('dashboard_deposit_table_opt'),
    dataIndex: 'opt',
    key: 'opt',
    className: 'opt',
    // render: text => ,
    props: {
      'data-label': t('dashboard_deposit_opt'),
    },
  }];
}

export default function DashboardBorrowList({ data, prices, userData, onModeChange }) {
  const { t, locale } = I18n.useContainer();

  const columns = getColumns(data, prices, userData, t, onModeChange);
  return (
    <div className="dashboard-list">
      <Table
        rowKey="symbol"
        dataSource={data}
        columns={columns}
      />
    </div>
  );
}
