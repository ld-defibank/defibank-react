/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import Table from '@common/table';
import RadioGroup from '@common/radioGroup';
import FormattedMessage from '@common/formattedMessage';
import I18n from '@models/i18n';
import Router from '@models/router';
import { fromAmountToFixedAmount, humanReadableNumber } from '@utils/';
import { Spin } from '@common/antd';

function getColumns(data, prices, t, goto, handleCollateralChange) {
  const radioGroupOptions = [{
    key: 'yes',
    value: true,
    label: t('deposit_table_collateral_yes'),
  }, {
    key: 'no',
    value: false,
    label: t('deposit_table_collateral_no'),
  }];

  return [{
    title: t('deposit_table_asset'),
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
    title: t('deposit_table_balance'),
    dataIndex: 'balance',
    key: 'balance',
    className: 'balance',
    render: (text, row) => (
      row.loading ? (
        <Spin size="small" />
      ) : (
        <>
          <div>{humanReadableNumber(fromAmountToFixedAmount(text, row, 2))} {row.symbol}</div>
          <div>{`$ ${humanReadableNumber(parseFloat(fromAmountToFixedAmount(row.balance, row) * parseFloat((prices.find(p => p.tokenAddress === row.tokenAddress) || { price: 0 }).price)).toFixed(2))}`}</div>
        </>
      )
    ),
    props: {
      'data-label': t('deposit_balance'),
    },
  }, {
    title: t('deposit_table_apr'),
    dataIndex: 'apr',
    key: 'apr',
    className: 'apr',
    render: text => <span className="tx-green">{text} %</span>,
    props: {
      'data-label': t('deposit_apr'),
    },
  }, {
    title: t('deposit_table_collateral'),
    dataIndex: 'isCollateral',
    key: 'isCollateral',
    className: 'isCollateral',
    render: (text, row) => <RadioGroup options={radioGroupOptions} value={text} onChange={c => handleCollateralChange(row, c)} />,
    props: {
      'data-label': t('deposit_collateral'),
    },
  }, {
    title: t('deposit_table_opt'),
    dataIndex: 'opt',
    key: 'opt',
    className: 'opt',
    render: (text, row) => (
      <>
        <a onClick={() => goto('/deposit/deposit/' + row.tokenAddress)}><FormattedMessage id="deposit_table_opt_deposit" /></a>
        <a onClick={() => goto('/deposit/withdraw/' + row.tokenAddress)}><FormattedMessage id="deposit_table_opt_withdraw" /></a>
      </>
    ),
    props: {
      'data-label': t('deposit_opt'),
    },
  }];
}

export default function DashboardDepositList({ data, prices, onCollateralChange }) {
  const { t, locale } = I18n.useContainer();
  const { goto } = Router.useContainer();

  const columns = getColumns(data, prices, t, goto, onCollateralChange);
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
