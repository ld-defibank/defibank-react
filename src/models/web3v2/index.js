/* eslint-disable prefer-promise-reject-errors */
import { useState, useEffect, useCallback, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { toChecksumAddress } from 'ethereum-checksum-address';
import { isEth } from '@utils/';
import initProvider from './providers';
import ERC20_ABI from './erc20_abi.json';

const defaultStates = {
  isInited: false,
  web3: null,
  accounts: [],
  currentAccount: null,
};

function useWeb3(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const [currentProvider, setCurrentProvider] = useState(null);
  const web3 = useRef(initialStates.web3);
  const [accounts, setAccounts] = useState(initialStates.accounts);
  const [currentAccount, setCurrentAccount] = useState(initialStates.currentAccount);
  const connectHandler = useRef(null);

  const updateAccounts = useCallback((web3instance) => {
    const instance = web3instance || web3.current;
    return instance.eth.getAccounts().then((as) => {
      setAccounts(as);
      return as;
    });
  }, [web3, accounts]);

  useEffect(() => {
    setCurrentAccount(accounts[0] || null);
  }, [accounts]);

  // provider event
  const onProviderConnet = useCallback(() => {
    console.log('wallet event: connect');
  }, []);
  const onProviderAccountsChanged = useCallback(() => {
    updateAccounts();
  }, [web3]);
  const onProviderChainChanged = useCallback(() => {
    console.log('wallet event: chainChanged');
  }, []);

  const initMetamask = useCallback(() => {
    if (currentProvider === 'metamask') return Promise.resolve();
    return initProvider('metamask').then(([web3Instance, connectMethod, handleConnect, handleAccountsChanged, handleChainChanged]) => {
      web3.current = web3Instance;
      connectHandler.current = connectMethod;
      handleConnect(onProviderConnet);
      handleAccountsChanged(onProviderAccountsChanged);
      handleChainChanged(onProviderChainChanged);
      setCurrentProvider('metamask');
    });
  }, [web3, updateAccounts, currentProvider]);

  const init = useCallback((provider) => {
    if (provider === 'metamask') {
      return initMetamask();
    }
    return Promise.reject({ code: -1 });
  }, [web3, currentProvider]);

  const connect = useCallback(() => {
    const handler = connectHandler.current;
    if (!handler) return Promise.reject({ code: -1 });
    return handler().then(() => updateAccounts());
  }, [connectHandler, updateAccounts, web3]);

  const getContract = useCallback((ABI, address) => new web3.current.eth.Contract(ABI, toChecksumAddress(address)), [web3]);

  const getErcContract = useCallback(address => getContract(ERC20_ABI, address), [web3]);

  const getCurrentAccountTokenWalletBalance = useCallback((tokenAddress) => {
    if (!web3 || !currentAccount || !tokenAddress) return Promise.resolve('0');
    if (isEth(tokenAddress)) {
      // eth
      return web3.current.eth.getBalance(currentAccount);
    }
    const ercContract = getErcContract(tokenAddress);
    return ercContract.methods.balanceOf(currentAccount).call();
  }, [web3, currentAccount]);

  return {
    web3,
    accounts,
    currentAccount,
    currentProvider,
    init,
    connect,
    getContract,
    getErcContract,
    getCurrentAccountTokenWalletBalance,
  };
}

const Web3 = createContainer(useWeb3);

export default Web3;
