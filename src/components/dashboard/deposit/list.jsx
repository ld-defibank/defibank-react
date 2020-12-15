import React, { useState, useEffect } from 'react';
import Table from '@common/table';
import RadioGroup from '@common/radioGroup';
import I18n from '@models/i18n';
import { fromAmountToFixedAmount, humanReadableNumber } from '@utils/';
import { Spin } from '@common/antd';

function getColumns(data, prices, t, handleCollateralChange) {
  const radioGroupOptions = [{
    key: 'yes',
    value: true,
    label: t('dashboard_deposit_table_collateral_yes'),
  }, {
    key: 'no',
    value: false,
    label: t('dashboard_deposit_table_collateral_no'),
  }];

  return [{
    title: t('dashboard_deposit_table_asset'),
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
    title: t('dashboard_deposit_table_balance'),
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
      'data-label': t('dashboard_deposit_balance'),
    },
  }, {
    title: t('dashboard_deposit_table_apr'),
    dataIndex: 'apr',
    key: 'apr',
    className: 'apr',
    render: text => <span className="tx-green">{text} %</span>,
    props: {
      'data-label': t('dashboard_deposit_apr'),
    },
  }, {
    title: t('dashboard_deposit_table_collateral'),
    dataIndex: 'isCollateral',
    key: 'isCollateral',
    className: 'isCollateral',
    render: (text, row) => <RadioGroup options={radioGroupOptions} value={text} onChange={c => handleCollateralChange(row, c)} />,
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

export default function DashboardDepositList({ data, prices, onCollateralChange }) {
  const { t, locale } = I18n.useContainer();

  const columns = getColumns(data, prices, t, onCollateralChange);
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
