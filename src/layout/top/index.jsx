/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import classnames from 'classnames';
import I18n from '@models/i18n';
import Router from '@models/router';
import { Menu, Dropdown } from '@common/antd';
import { CaretDownOutlined } from '@ant-design/icons';
import FormattedMessage from '@common/formattedMessage';
import ASSETS from '@common/assets';
import Wallet from './wallet';

import './style.scss';

function Top() {
  const {
    locale,
    setLocale,
  } = I18n.useContainer();

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

  return (
    <div id="top">
      <div className="top-container">
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

export default Top;
