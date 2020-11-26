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
          <div className={classnames('menu-item', { active: sidebar.active === 'user' })}>
            <a onClick={() => goto('/')}><UserOutlined /><FormattedMessage id="sidebar_menu_user" /></a>
          </div>
          <div className={classnames('menu-item', { active: sidebar.active === 'missions' })}>
            <a onClick={() => goto('/missions')}><CrownOutlined /><FormattedMessage id="sidebar_menu_missions" /></a>
          </div>
          <div className={classnames('menu-item', { active: sidebar.active === 'history' })}>
            <a onClick={() => goto('/history')}><HistoryOutlined /><FormattedMessage id="sidebar_menu_history" /></a>
          </div>
          <div className={classnames('menu-item', { active: sidebar.active === 'contact' })}>
            <a onClick={() => goto('/contact')}><CustomerServiceOutlined /><FormattedMessage id="sidebar_menu_contact" /></a>
          </div>
        </div>
        <div className="copyright">All rights ANT-CLUB</div>
      </div>
    </div>
  );
}

export default Sidebar;
