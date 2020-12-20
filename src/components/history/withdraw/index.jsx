/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useCallback, useEffect, useState } from 'react';
import I18n from '@models/i18n';
import Router from '@models/router';
import Web3 from '@models/web3v2';
import User from '@models/user';
import Market from '@models/market';
import SitePage from '@common/sitePage';
import FormattedMessage from '@common/formattedMessage';
import Table from '@common/table';
import message from '@utils/message';
import { fromAmountToFixedAmount, times10, formatHash, humanReadableNumber, formatDatetime } from '@utils/';
import CONFIG from '../../../config';

import './style.scss';

const {
  ETH_EXPORER_URL,
} = CONFIG;

function getColumns(prices, t) {
  return [{
    title: t('history_withdraw_table_asset'),
    dataIndex: 'symbol',
    key: 'symbol',
    className: 'symbol',
    render: (text, row) => (
      <>
        <span className="icon">
          <svg aria-hidden="true">
            <use xlinkHref={'#icon-' + row.tokenMeta.symbol} />
          </svg>
        </span>
        <span>{row.tokenMeta.symbol || '--'}</span>
      </>
    ),
  }, {
    title: t('history_withdraw_table_amount'),
    dataIndex: 'amount',
    key: 'amount',
    className: 'amount',
    render: (text, row) => (
      <>
        <div>{humanReadableNumber(fromAmountToFixedAmount(text, row.tokenMeta, 2))} {row.tokenMeta.symbol}</div>
        <div className="tx-gray">{`$ ${humanReadableNumber(parseFloat(fromAmountToFixedAmount(text, row.tokenMeta) * parseFloat((prices.find(p => p.tokenAddress === row.tokenMeta.tokenAddress) || { price: 0 }).price)).toFixed(2))}`}</div>
      </>
    ),
    props: {
      'data-label': t('history_deposit_table_datetime'),
    },
  }, {
    title: t('history_withdraw_table_datetime'),
    dataIndex: 'timestamp',
    key: 'timestamp',
    className: 'timestamp',
    render: text => formatDatetime(parseInt(text, 10) * 1000),
    props: {
      'data-label': t('history_deposit_table_datetime'),
    },
  }, {
    title: t('history_withdraw_table_hash'),
    dataIndex: 'transactionHash',
    key: 'transactionHash',
    className: 'hash',
    render: text => <a href={`${ETH_EXPORER_URL}/tx/${text}`} target="_blank">{formatHash(text)}</a>,
    props: {
      'data-label': t('history_deposit_table_datetime'),
    },
  }];
}

function DepositHistory() {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState([]);
  const [data, setData] = useState([]);
  const {
    web3,
    currentAccount,
  } = Web3.useContainer();
  const {
    getWithdrawHistory,
  } = User.useContainer();
  const {
    getAllAssetsUSDPrices,
  } = Market.useContainer();
  const { t } = I18n.useContainer();
  const { goto } = Router.useContainer();

  useEffect(() => {
    setLoading(true);
    if (web3 && currentAccount) {
      Promise.all([
        getWithdrawHistory(),
        getAllAssetsUSDPrices(),
      ]).then(([events, prs]) => {
        setLoading(false);
        const filterd = events.filter(event => event.tokenMeta);
        filterd.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
        setData(filterd);
        setPrices(prs);
      });
    }
  }, [web3, currentAccount]);

  const columns = getColumns(prices, t);
  return (
    <SitePage
      id="withdrawHistory"
      className="history-page"
      header={(
        <>
          <a onClick={() => goto('/history/deposit')}><FormattedMessage id="history_header_deposit" /></a>
          <a className="active"><FormattedMessage id="history_header_withdraw" /></a>
          <a onClick={() => goto('/history/borrow')}><FormattedMessage id="history_header_borrow" /></a>
          <a onClick={() => goto('/history/repay')}><FormattedMessage id="history_header_repay" /></a>
        </>
      )}
    >
      <Table
        rowKey="timestamp"
        dataSource={data}
        columns={columns}
      />
    </SitePage>
  );
}


export default DepositHistory;
