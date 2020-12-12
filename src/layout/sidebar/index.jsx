/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import FormattedMessage from '@common/formattedMessage';
import I18n from '@models/i18n';
import Router from '@models/router';
import ASSETS from '@common/assets';
import { Dropdown, Menu } from '@common/antd';
import { UserOutlined, HistoryOutlined, CustomerServiceOutlined, CrownOutlined } from '@ant-design/icons';
import ism from '@utils/isMobile';

import './style.scss';

const logo = ism() ? ASSETS.logoIcon : ASSETS.logo;

function Sidebar() {
  const routerModel = Router.useContainer();

  const { goto, currentPageConfig } = routerModel;

  const { sidebar } = currentPageConfig;

  return (
    <div id="sidebar">
      <div className="sidebar-container">
        <div className="logo">
          <a onClick={() => goto('/')}>
            <img src={logo} />
          </a>
        </div>
        <div className="menu">
          <div className="menu-content">
            <div className={classnames('menu-item', { active: sidebar.active === 'home' })}>
              <a onClick={() => goto('/')}><FormattedMessage id="sidebar_menu_home" /></a>
            </div>
            <div className={classnames('menu-item', { active: sidebar.active === 'dashboard' })}>
              <a onClick={() => goto('/dashboard')}><FormattedMessage id="sidebar_menu_dashboard" /></a>
            </div>
            <div className={classnames('menu-item', { active: sidebar.active === 'deposit' })}>
              <a onClick={() => goto('/deposit')}><FormattedMessage id="sidebar_menu_deposit" /></a>
            </div>
            <div className={classnames('menu-item', { active: sidebar.active === 'borrow' })}>
              <a onClick={() => goto('/borrow')}><FormattedMessage id="sidebar_menu_borrow" /></a>
            </div>
            <div className={classnames('menu-item', { active: sidebar.active === 'history' })}>
              <a onClick={() => goto('/history')}><FormattedMessage id="sidebar_menu_history" /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
