import React from 'react';
// 工具和配置
import I18n from './i18n';
import Utils from './utils';
import Router from './router';
// 基础设施
import Web3 from './web3v2';
import Web3Modal from './web3modal';
// 合约底层
import AToken from './aToken';
import LendingPoolCore from './lendingPoolCore';
import LendingPool from './lendingPool';
import LendingPoolDataProvider from './lendingPoolDataProvider';
import ChainlinkProxyPriceProvider from './chainlinkProxyPriceProvider';
// 业务层
import Market from './market';
import User from './user';

const models = {
  I18n,
  Utils,
  Router,
  Web3Modal,
  Web3,
  AToken,
  LendingPoolCore,
  LendingPool,
  LendingPoolDataProvider,
  ChainlinkProxyPriceProvider,
  Market,
  User,
};


function compose(containers) {
  return function Component(props) {
    return containers.reduceRight((children, Container) => <Container.Provider>{children}</Container.Provider>, props.children);
  };
}

const ComposedStore = compose(Object.values(models));

function Store({ children }) {
  console.log('global contexts have been re-rendered at: ' + Date.now());

  return (
    <ComposedStore>
      {children}
    </ComposedStore>
  );
}

function connect(ms) {
  return function linkMap(mapStateToProps) {
    return function wrapComponent(Component) {
      return function ConnectComponet(props) {
        const state = mapStateToProps(ms.map(model => model.useContainer()));
        return (
          <Component {...props} {...state} />
        );
      };
    };
  };
}

export default React.memo(Store);
export {
  connect,
};
