import React, { useState, useEffect, useCallback } from 'react';
import { notification } from '@common/antd';
import classnames from 'classnames';
import { CheckCircleOutlined, Loading3QuartersOutlined } from '@ant-design/icons';
import Utils from '@models/utils';
import I18n from '@models/i18n';
import CONFIG from '../../config';
import { fromAmountToFixedAmount } from '@utils/';

import './style.scss';

const key = 'updatable';
const { TOKENS, ETH_EXPORER_URL } = CONFIG;

export default function TransactionCache() {
  const { transactionCache } = Utils.useContainer();
  const { t } = I18n.useContainer();

  const getText = useCallback((transaction) => {
    const { method, args, options, receipt, tx } = transaction;
    if (method === 'deposit') {
      const tokenInfo = Object.values(TOKENS).find(token => token.tokenAddress === args[0]);
      if (tokenInfo) {
        return `${fromAmountToFixedAmount(args[1], tokenInfo, 2)} ${tokenInfo.symbol}`;
      }
      return '';
    }
    if (method === 'borrow') {
      const tokenInfo = Object.values(TOKENS).find(token => token.tokenAddress === args[0]);
      if (tokenInfo) {
        return `${fromAmountToFixedAmount(args[1], tokenInfo, 2)} ${tokenInfo.symbol}`;
      }
      return '';
    }
    if (method === 'repay') {
      const tokenInfo = Object.values(TOKENS).find(token => token.tokenAddress === args[0]);
      if (tokenInfo) {
        if (options.isMax) {
          return t('transactioncache_all', { symbol: tokenInfo.symbol });
        }
        return `${fromAmountToFixedAmount(args[1], tokenInfo, 2)} ${tokenInfo.symbol}`;
      }
      return '';
    }
    if (method === 'redeem') {
      const tokenInfo = Object.values(TOKENS).find(token => token.tokenAddress === options.tokenAddress);
      if (tokenInfo) {
        if (options.isMax) {
          return t('transactioncache_all', { symbol: tokenInfo.symbol });
        }
        return `${fromAmountToFixedAmount(args[0], tokenInfo, 2)} ${tokenInfo.symbol}`;
      }
      return '';
    }
    if (method === 'approve') {
      const tokenInfo = Object.values(TOKENS).find(token => token.tokenAddress === args[0]);
      if (tokenInfo) {
        return tokenInfo.symbol;
      }
      return '';
    }
    if (method === 'setUserUseReserveAsCollateral') {
      const tokenInfo = Object.values(TOKENS).find(token => token.tokenAddress === args[0]);
      if (tokenInfo) {
        if (args[1]) {
          return t('transactioncache_set_collateral', { symbol: tokenInfo.symbol });
        }
        return t('transactioncache_set_not_collateral', { symbol: tokenInfo.symbol });
      }
      return '';
    }
    if (method === 'swapBorrowRateMode') {
      return t('transactioncache_swap_rate_mode');
    }
    return '';
  }, [t]);

  const updateNotification = useCallback(() => {
    if (!transactionCache || !transactionCache.length) {
      notification.close(key);
      return;
    }
    const args = {
      key,
      message: t('transactioncache_title'),
      description: (
        <div id="transactioncache">
          {transactionCache.map(transaction => (
            <div className={classnames('transaction', { pending: !transaction.receipt })} key={transaction.tx} onClick={() => window.open(`${ETH_EXPORER_URL}/tx/${transaction.tx}`, '_blank')}>
              <div className="desc">
                <div className="tag">{t(`transactioncache_method_${transaction.method}`)}</div>
                <div className="text">{getText(transaction)}</div>
              </div>
              <div className="status">{transaction.receipt ? <CheckCircleOutlined /> : <Loading3QuartersOutlined spin /> }</div>
            </div>
          ))}
        </div>
      ),
    };
    const pendingTxs = transactionCache.filter(tx => !tx.receipt);
    if (pendingTxs.length === 0) {
      args.duration = 4.5;
    } else {
      args.duration = 0;
    }
    notification.open(args);
  }, [transactionCache, t]);

  useEffect(() => {
    updateNotification();
  }, [transactionCache]);

  return <></>;
}
