/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import Table from '@common/table';
import RadioGroup from '@common/radioGroup';
import I18n from '@models/i18n';
import Router from '@models/router';
import FormattedMessage from '@common/formattedMessage';
import { fromAmountToFixedAmount, humanReadableNumber } from '@utils/';
import { Spin } from '@common/antd';
import CONST from '../../../const';

const { BORROW_RATE_MODE } = CONST;


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

function getColumns(prices, userData, t, goto) {
  const availableBorrowsETH = userData ? userData.availableBorrowsETH : '0';

  return [{
    title: t('borrow_table_asset'),
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
    title: t('borrow_table_available'),
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
      'data-label': t('borrow_table_available'),
    },
  }, {
    title: t('borrow_table_borrowed'),
    dataIndex: 'borrowed',
    key: 'borrowed',
    className: 'borrowed',
    render: (text, row) => {
      if (row.loading) return <Spin size="small" />;
      return `${humanReadableNumber(fromAmountToFixedAmount(text, row, 2))} ${row.symbol}`;
    },
    props: {
      'data-label': t('borrow_table_available'),
    },
  }, {
    title: t('borrow_table_variable_apr'),
    dataIndex: 'variableApr',
    key: 'variableApr',
    className: 'variableapr',
    render: text => <span className="tx-green">{text} %</span>,
    props: {
      'data-label': t('borrow_table_available'),
    },
  }, {
    title: t('borrow_table_stable_apr'),
    dataIndex: 'stableApr',
    key: 'stableApr',
    className: 'stableapr',
    render: text => <span className="tx-green">{text} %</span>,
    props: {
      'data-label': t('borrow_table_available'),
    },
  }, {
    title: t('borrow_table_opt'),
    dataIndex: 'opt',
    key: 'opt',
    className: 'opt',
    render: (text, row) => (
      <>
        <a onClick={() => goto('/detail/' + row.tokenAddress)}><FormattedMessage id="borrow_table_opt_detail" /></a>
      </>
    ),
    props: {
      'data-label': t('deposit_opt'),
    },
  }];
}

function sortData(data, prices) {
  if (!data || data.length === 0) return [];
  const usedArr = data.filter(d => d.borrowed !== '0');
  const restArr = data.filter(d => d.borrowed === '0');
  if (usedArr.length) {
    usedArr.sort((a, b) => {
      const priceA = getTokenValue(a.borrowed, a, prices);
      const priceB = getTokenValue(b.borrowed, b, prices);
      if (priceA > priceB) return -1;
      return 1;
    });
  }
  return [usedArr.concat(restArr), usedArr.length - 1];
}

export default function DashboardBorrowList({ data, prices, userData }) {
  const { t, locale } = I18n.useContainer();
  const { goto } = Router.useContainer();

  const [sortedData, dividerIndex] = sortData(data, prices);
  const columns = getColumns(prices, userData, t, goto);
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
