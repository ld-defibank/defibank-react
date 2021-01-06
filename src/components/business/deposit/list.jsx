/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import Table from '@common/table';
import RadioGroup from '@common/radioGroup';
import FormattedMessage from '@common/formattedMessage';
import I18n from '@models/i18n';
import Router from '@models/router';
import { fromAmountToFixedAmount, humanReadableNumber } from '@utils/';
import { Spin } from '@common/antd';

function getTokenValue(balance, token, prices) {
  const priceInfo = prices.find(p => p.tokenAddress === token.tokenAddress) || { priceAsEth: 0, price: 0 };
  const { price } = priceInfo;
  let value;
  if (parseFloat(price) === 0 || parseFloat(price) === 0) {
    value = 0;
  } else {
    value = parseFloat(fromAmountToFixedAmount(balance, token)) * parseFloat(price);
  }
  return value;
}

function getColumns(prices, t, goto) {
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
    title: t('deposit_table_wallet_balance'),
    dataIndex: 'walletBalance',
    key: 'walletBalance',
    className: 'walletbalance',
    render: (text, row) => (
      row.loading ? (
        <Spin size="small" />
      ) : (
        <>
          <div>{humanReadableNumber(fromAmountToFixedAmount(text, row, 2))} {row.symbol}</div>
          <div>{`$ ${humanReadableNumber(parseFloat(getTokenValue(text, row, prices)).toFixed(2))}`}</div>
        </>
      )
    ),
    props: {
      'data-label': t('deposit_balance'),
    },
  }, {
    title: t('deposit_table_bank_balance'),
    dataIndex: 'bankBalance',
    key: 'bankBalance',
    className: 'bankbalance',
    render: (text, row) => (
      row.loading ? (
        <Spin size="small" />
      ) : (
        <>
          <div>{humanReadableNumber(fromAmountToFixedAmount(text, row, 2))} {row.symbol}</div>
          <div>{`$ ${humanReadableNumber(parseFloat(getTokenValue(text, row, prices)).toFixed(2))}`}</div>
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
    title: t('deposit_table_opt'),
    dataIndex: 'opt',
    key: 'opt',
    className: 'opt',
    render: (text, row) => (
      <>
        <a onClick={() => goto('/detail/' + row.tokenAddress)}><FormattedMessage id="deposit_table_opt_detail" /></a>
      </>
    ),
    props: {
      'data-label': t('deposit_opt'),
    },
  }];
}

function sortData(data, prices) {
  if (!data || data.length === 0) return [];
  const usedArr = data.filter(d => d.bankBalance !== '0');
  const restArr = data.filter(d => d.bankBalance === '0');
  if (usedArr.length) {
    usedArr.sort((a, b) => {
      const priceA = getTokenValue(a.bankBalance, a, prices);
      const priceB = getTokenValue(b.bankBalance, b, prices);
      if (priceA > priceB) return -1;
      return 1;
    });
  }
  return [usedArr.concat(restArr), usedArr.length - 1];
}

export default function DashboardDepositList({ data, prices }) {
  const { t, locale } = I18n.useContainer();
  const { goto } = Router.useContainer();

  const [sortedData, dividerIndex] = sortData(data, prices);
  const columns = getColumns(prices, t, goto);
  return (
    <div className="business-list">
      <Table
        rowKey="symbol"
        dataSource={sortedData}
        columns={columns}
        dividerIndex={dividerIndex}
      />
    </div>
  );
}
