/* eslint-disable prefer-promise-reject-errors */
import { useState, useEffect, useCallback, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { toChecksumAddress } from 'ethereum-checksum-address';
import { isEth } from '@utils/';
import Web3Modal from '@models/web3modal';
import ERC20_ABI from './erc20_abi.json';

const defaultStates = {
  isInited: false,
  accounts: [],
  currentAccount: null,
};

function useWeb3(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const [accounts, setAccounts] = useState(initialStates.accounts);
  const [currentAccount, setCurrentAccount] = useState(initialStates.currentAccount);
  const {
    web3,
    web3Modal,
    provider,
    init,
    connect,
    disconnect,
  } = Web3Modal.useContainer();

  const updateAccounts = useCallback((web3instance) => {
    const instance = (web3instance || web3);
    instance.eth.getAccounts().then((as) => {
      setAccounts(as);
    });
  }, [web3, accounts]);

  useEffect(() => {
    if (!web3) {
      setAccounts(initialStates.accounts);
    } else {
      updateAccounts();
    }
  }, [web3]);

  useEffect(() => {
    setCurrentAccount(accounts[0] || null);
  }, [accounts]);

  useEffect(() => {
    if (!provider) return;
    provider.on('accountsChanged', () => {
      updateAccounts();
    });

    // Subscribe to chainId change
    provider.on('chainChanged', () => {
      console.log('ETH event: chainChanged');
    });

    // Subscribe to provider connection
    provider.on('connect', () => {
      console.log('ETH event: connect');
    });

    // Subscribe to provider disconnection
    provider.on('disconnect', () => {
      console.log('ETH event: disconnect');
    });
  }, [provider]);

  const getContract = useCallback((ABI, address) => new web3.eth.Contract(ABI, toChecksumAddress(address)), [web3]);

  const getErcContract = useCallback(address => getContract(ERC20_ABI, address), [web3]);

  const getCurrentAccountTokenWalletBalance = useCallback((tokenAddress) => {
    if (!web3 || !currentAccount || !tokenAddress) return Promise.resolve('0');
    if (isEth(tokenAddress)) {
      // eth
      return web3.eth.getBalance(currentAccount);
    }
    const ercContract = getErcContract(tokenAddress);
    return ercContract.methods.balanceOf(currentAccount).call();
  }, [web3, currentAccount]);

  return {
    web3,
    web3Modal,
    accounts,
    currentAccount,
    provider,
    init,
    connect,
    disconnect,
    getContract,
    getErcContract,
    getCurrentAccountTokenWalletBalance,
  };
}

const Web3 = createContainer(useWeb3);

export default Web3;
