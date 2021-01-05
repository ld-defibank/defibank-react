import React, { useState, useEffect } from 'react';
import Table from '@common/table';
import I18n from '@models/i18n';
import { humanReadableNumber } from '@utils/';

function getColumns(data, t) {
  return [{
    title: t('index_table_token'),
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
    title: t('index_table_market_size'),
    dataIndex: 'totalUsd',
    key: 'totalUsd',
    className: 'totalusd',
    render: text => `$ ${humanReadableNumber(text.toFixed(2))}`,
    props: {
      'data-label': t('index_table_market_size'),
    },
  }, {
    title: t('index_table_deposit'),
    dataIndex: 'deposit',
    key: 'deposit',
    className: 'deposit',
    render: (text, row) => (
      <>
        <div>{humanReadableNumber(text.toFixed(2))} {row.symbol}</div>
        <div>{`$ ${humanReadableNumber(row.depositUsd.toFixed(2))}`}</div>
      </>
    ),
    props: {
      'data-label': t('index_table_deposit'),
    },
  }, {
    title: t('index_table_borrow'),
    dataIndex: 'borrow',
    key: 'borrow',
    className: 'borrow',
    render: (text, row) => (
      <>
        <div>{humanReadableNumber(text)} {row.symbol}</div>
        <div>{`$ ${humanReadableNumber(row.borrowUsd.toFixed(2))}`}</div>
      </>
    ),
    props: {
      'data-label': t('index_table_borrow'),
    },
  }, {
    title: t('index_table_deposit_apr'),
    dataIndex: 'depositAPR',
    key: 'depositAPR',
    className: 'depositapr',
    render: text => <span className="tx-green">{text} %</span>,
    props: {
      'data-label': t('index_table_deposit_apr'),
    },
  }, {
    title: t('index_table_borrow_apr'),
    dataIndex: 'borrowAPR',
    key: 'borrowAPR',
    className: 'borrowapr',
    render: text => <span className="tx-orange">{text} %</span>,
    props: {
      'data-label': t('index_table_borrow_apr'),
    },
  }];
}

export default function IndexTable({ data, loading }) {
  const { t } = I18n.useContainer();
  const columns = getColumns(data, t);

  return (
    <div className="market-list">
      <Table
        rowKey="tokenAddress"
        dataSource={data}
        columns={columns}
      />
    </div>
  );
}
