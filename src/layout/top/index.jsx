/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import I18n from '@models/i18n';
import Router from '@models/router';
import Utils from '@models/utils';
import { Menu, Dropdown } from '@common/antd';
import { CaretDownOutlined, SyncOutlined } from '@ant-design/icons';
import FormattedMessage from '@common/formattedMessage';
import ASSETS from '@common/assets';
import Wallet from './wallet';

import './style.scss';

export default function Top() {
  const [pendingVisible, showPending] = useState(false);

  const {
    locale,
    setLocale,
  } = I18n.useContainer();

  const {
    upsertTransaction,
    transactionCache,
  } = Utils.useContainer();

  const {
    goto,
  } = Router.useContainer();

  const menu = (
    <Menu>
      <Menu.Item>
        <a onClick={() => setLocale('en')}>English</a>
      </Menu.Item>
      <Menu.Item>
        <a onClick={() => setLocale('zh-cn')}>简体中文</a>
      </Menu.Item>
    </Menu>
  );


  useEffect(() => {
    const pendingTxs = transactionCache.filter(tx => !tx.receipt);
    showPending(!!pendingTxs.length);
  }, [transactionCache, showPending]);

  return (
    <div id="top">
      <div className="top-container">
        {pendingVisible && (
          <span className="pending-btn" onClick={() => upsertTransaction()}>
            <SyncOutlined spin />
          </span>
        )}
        <Wallet />
        <Dropdown overlay={menu} placement="bottomRight">
          <a className="lang-menu">
            <FormattedMessage id={`top_language_${locale}`} />
            <CaretDownOutlined />
          </a>
        </Dropdown>
      </div>
    </div>
  );
}
