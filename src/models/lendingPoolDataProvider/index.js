/* eslint-disable prefer-promise-reject-errors */
import { useState, useEffect, useCallback, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { isEth } from '@utils';
import { toChecksumAddress } from 'ethereum-checksum-address';
import Web3 from '../web3v2';
import CONFIG from '../../config';
import ABI from './abi.json';

const {
  ADDRESS_LENDING_POOL_DATA_PROVIDER,
} = CONFIG.INTERFACE;

const {
  MAX_VAL,
} = CONFIG;

const defaultStates = {
};

function useLendingPoolCore(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const {
    web3,
    currentAccount,
    getContract: getWeb3Contract,
  } = Web3.useContainer();

  const getContract = useCallback(() => getWeb3Contract(ABI, ADDRESS_LENDING_POOL_DATA_PROVIDER), [web3, getWeb3Contract]);

  const getReserveData = useCallback((tokenAddress) => {
    if (!currentAccount) return Promise.resolve(null);
    return getContract().call('getReserveData', [
      tokenAddress,
    ]);
  }, [getContract, currentAccount]);

  const getUserReserveData = useCallback((tokenAddress) => {
    if (!currentAccount) return Promise.resolve(null);
    return getContract().call('getUserReserveData', [
      tokenAddress,
      currentAccount,
    ]);
  }, [getContract, currentAccount]);

  const getUserAccountData = useCallback(() => {
    if (!currentAccount) return Promise.resolve(null);
    return getContract().call('getUserAccountData', [
      currentAccount,
    ]);
  }, [getContract, currentAccount]);

  return {
    getReserveData,
    getUserReserveData,
    getUserAccountData,
  };
}

const LendingPoolCore = createContainer(useLendingPoolCore);

export default LendingPoolCore;
