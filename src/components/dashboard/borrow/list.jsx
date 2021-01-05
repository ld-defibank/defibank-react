/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import Table from '@common/table';
import RadioGroup from '@common/radioGroup';
import I18n from '@models/i18n';
import Router from '@models/router';
import FormattedMessage from '@common/formattedMessage';
import Tag from '@common/tag';
import { fromAmountToFixedAmount, humanReadableNumber } from '@utils/';
import { Spin } from '@common/antd';
import { CheckCircleFilled } from '@ant-design/icons';
import CONST from '../../../const';

const { BORROW_RATE_MODE } = CONST;

function getColumns(data, prices, userData, t, goto, handleModeChange) {
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
    title: t('dashboard_borrow_table_borrowed'),
    dataIndex: 'borrowed',
    key: 'borrowed',
    className: 'borrowed',
    render: (text, row) => {
      if (row.loading) return <Spin size="small" />;
      const priceInfo = prices.find(p => p.tokenAddress === row.tokenAddress) || { priceAsEth: 0, price: 0 };
      const { price, priceAsEth } = priceInfo;
      let borrowed;
      if (parseFloat(price) === 0 || parseFloat(priceAsEth) === 0) {
        borrowed = 0;
      } else {
        borrowed = parseFloat(text) / parseFloat(priceAsEth);
      }

      return `${humanReadableNumber(borrowed.toFixed(2))} ${row.symbol}`;
    },
    props: {
      'data-label': t('dashboard_borrow_table_borrowed'),
    },
  }, {
    title: <FormattedMessage id="dashboard_borrow_table_stable_apr" />,
    dataIndex: 'stableApr',
    key: 'stableApr',
    className: 'stableApr',
    render: (text, row) => {
      const { borrowRateMode, stableApr } = row;
      return (
        <span className="tx-green">
          {borrowRateMode === BORROW_RATE_MODE.stable && (<CheckCircleFilled />)}
          <span>{stableApr} %</span>
        </span>
      );
    },
    props: {
      'data-label': t('deposit_apr'),
    },
  }, {
    title: <FormattedMessage id="dashboard_borrow_table_variable_apr" />,
    dataIndex: 'variableApr',
    key: 'variableApr',
    className: 'variableApr',
    render: (text, row) => {
      const { borrowRateMode, variableApr } = row;
      return (
        <span className="tx-green">
          {borrowRateMode === BORROW_RATE_MODE.variable && (<CheckCircleFilled />)}
          <span>{variableApr} %</span>
        </span>
      );
    },
    props: {
      'data-label': t('deposit_apr'),
    },
  }, {
    title: t('dashboard_borrow_table_mode'),
    dataIndex: 'borrowRateMode',
    key: 'borrowRateMode',
    className: 'borrowratemode',
    render: (text, row) => {
      if (text === BORROW_RATE_MODE.noborrow) {
        return <Tag color="gray"><FormattedMessage id="not_available" /></Tag>;
      }
      return <RadioGroup options={radioGroupOptions} value={text} onChange={c => handleModeChange(row, c)} optionWidth={90} />;
    },
    props: {
      'data-label': t('deposit_collateral'),
    },
  }, {
    title: t('dashboard_borrow_table_opt'),
    dataIndex: 'opt',
    key: 'opt',
    className: 'opt',
    render: (text, row) => (
      <>
        <a onClick={() => goto('/borrow/borrow/' + row.tokenAddress)}><FormattedMessage id="dashboard_borrow_table_opt_borrow" /></a>
        <a onClick={() => goto('/borrow/repay/' + row.tokenAddress)}><FormattedMessage id="dashboard_borrow_table_opt_repay" /></a>
      </>
    ),
    props: {
      'data-label': t('deposit_opt'),
    },
  }];
}

export default function DashboardBorrowList({ data, prices, userData, onModeChange }) {
  const { t, locale } = I18n.useContainer();
  const { goto } = Router.useContainer();

  const columns = getColumns(data, prices, userData, t, goto, onModeChange);
  return (
    <div className="business-list">
      <Table
        rowKey="symbol"
        dataSource={data}
        columns={columns}
      />
    </div>
  );
}
