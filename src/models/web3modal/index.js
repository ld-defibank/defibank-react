import Web3 from 'web3';
import { createContainer } from 'unstated-next';
import { useState, useEffect, useCallback } from 'react';
import Web3Modal from 'web3modal';
import WalletLink from 'walletlink';
import WalletConnectProvider from '@walletconnect/web3-provider';
import ASSETS from '@common/assets';
import createLedgerSubprovider from './ledgerProvider';

import './style.scss';

function getProviderOptions({ setLoading }) {
  const providerOptions = {
    /* See Provider Options Section */
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: '4bfc4d0a258a44d397e0a90b986c8dab',
      },
    },

    // fortmatic: {
    //   package: Fortmatic,
    //   options: {
    //     // Mikko's TESTNET api key
    //     key: "pk_test_391E26A3B43A3350"
    //   },
    // },

    'custom-coinbase': {
      display: {
        logo: ASSETS.coinbaseWalletIcon,
        name: 'Coinbase Wallet',
        description: 'Scan with Coinbase Wallet to connect',
      },
      package: WalletLink,
      connector: (providerPackage, options) => {
        const walletLink = new providerPackage(options);

        const provider = walletLink.makeWeb3Provider(
          'https://mainnet.infura.io/v3/4bfc4d0a258a44d397e0a90b986c8dab',
          1,
        );

        return provider.enable().then(() => provider);
      },
      options: {
        appName: 'coinbase',
        appLogoUrl: ASSETS.coinbaseWalletIcon,
        darkMode: false,
      },
    },
    'custom-ledger': {
      display: {
        logo: ASSETS.ledgerWalletIcon,
        name: 'Ledger',
        description: 'Connect to Ledger Wallet',
      },
      package: createLedgerSubprovider,
      connector: (providerPackage, options) => {
        setLoading(true);
        const provider = providerPackage(options.rpcUrl);

        provider.on('error', (e) => {
          console.log(e);
        });

        return new Promise((resolve) => {
          let inited = false;

          provider.on('latest', (block) => {
            // 获取到首次获取到block认为初始化成功。
            if (block && !inited) {
              inited = true;
              setLoading(false);
              resolve(provider);
            }
          });
          provider.start();
        });
      },
      options: {
        rpcUrl: 'http://localhost:8545',
      },
    },
  };
  return providerOptions;
}

function useWeb3Modal() {
  const [web3Modal, setWeb3Modal] = useState(null);
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(null);

  const init = useCallback((setLoading = () => {}) => {
    const instance = new Web3Modal({
      network: 'mainnet', // optional
      cacheProvider: false, // optional
      providerOptions: getProviderOptions({ setLoading }), // required
    });
    setWeb3Modal(instance);
  }, [setWeb3Modal]);

  const connect = useCallback(() => {
    console.log('user connect wallet');
    return web3Modal.connect().then((p) => {
      setProvider(p);
      const web3instance = new Web3(p);
      setWeb3(web3instance);
      return web3instance;
    });
  }, [web3Modal]);

  const disconnect = useCallback(() => {
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      return web3.currentProvider.close().then(() => {
        setProvider(null);
        setWeb3(null);
      });
    }
    return Promise.resolve().then(() => {
      setProvider(null);
      setWeb3(null);
    });
  }, [provider, web3]);

  return {
    init,
    web3Modal,
    web3,
    provider,
    connect,
    disconnect,
  };
}

const Web3ModalProvider = createContainer(useWeb3Modal);

export default Web3ModalProvider;
