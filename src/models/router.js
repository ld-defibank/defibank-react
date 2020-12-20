import { useState, useEffect } from 'react';
import $ from 'jquery';
import { useHistory, useLocation } from 'react-router-dom';
import { fastMatchPath } from '@utils';
import { createContainer } from 'unstated-next';

const defaultPathConfig = {
  header: {},
  sidebar: {},
  top: null,
  refresh: [],
};

const pathConfigs = {
  '/': {
    key: 'index',
    refresh: [],
    sidebar: {
      active: 'home',
    },
  },
  '/dashboard': {
    key: 'dashboard',
    refresh: [],
    sidebar: {
      active: 'dashboard',
    },
  },
  '/deposit': {
    key: 'deposit',
    refresh: [],
    sidebar: {
      active: 'deposit',
    },
  },
  '/borrow': {
    key: 'borrow',
    refresh: [],
    sidebar: {
      active: 'borrow',
    },
  },
  '/deposit/deposit/:tokenAddress': {
    key: 'create_deposit',
    refresh: [],
    sidebar: {
      active: 'deposit',
    },
  },
  '/deposit/withdraw/:tokenAddress': {
    key: 'create_withdraw',
    refresh: [],
    sidebar: {
      active: 'deposit',
    },
  },
  '/borrow/borrow/:tokenAddress': {
    key: 'create_borrow',
    refresh: [],
    sidebar: {
      active: 'borrow',
    },
  },
  '/borrow/repay/:tokenAddress': {
    key: 'create_repay',
    refresh: [],
    sidebar: {
      active: 'borrow',
    },
  },
  '/history/deposit': {
    key: 'history_deposit',
    refresh: [],
    sidebar: {
      active: 'history',
    },
  },
  '/history/withdraw': {
    key: 'history_withdraw',
    refresh: [],
    sidebar: {
      active: 'history',
    },
  },
  '/history/borrow': {
    key: 'history_borrow',
    refresh: [],
    sidebar: {
      active: 'history',
    },
  },
  '/history/repay': {
    key: 'history_repay',
    refresh: [],
    sidebar: {
      active: 'history',
    },
  },
};

const defaultStates = {
  currentPageConfig: defaultPathConfig,
  isConnectWalletVisible: false,
};

function useRouter(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const history = useHistory();
  const pageLocation = useLocation();
  const [isConnectWalletVisible, showConnectWallet] = useState(initialStates.isConnectWalletVisible);
  const [currentPageConfig, setCurrentPageConfig] = useState(initialStates.currentPageConfig);

  // 监听页面切换，替换页面配置
  useEffect(() => {
    const { pathname } = pageLocation;
    const c = Object.keys(pathConfigs).find(key => fastMatchPath(pathname, key));
    $(window).scrollTop(0);
    setCurrentPageConfig({ ...defaultPathConfig, ...(pathConfigs[c] || {}) });
  }, [pageLocation]);

  return {
    history,
    pageLocation,
    currentPageConfig,
    isConnectWalletVisible,
    showConnectWallet,
    goto: (goto) => {
      if (pageLocation.pathname === goto) return;
      history.push(goto);
    },
    goBack: () => {
      history.goBack();
    },
  };
}

const Router = createContainer(useRouter);

export default Router;
