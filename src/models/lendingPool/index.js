/* eslint-disable prefer-promise-reject-errors */
import { useState, useEffect, useCallback, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { isEth } from '@utils';
import { toChecksumAddress } from 'ethereum-checksum-address';
import Web3 from '../web3v2';
import CONFIG from '../../config';
import ABI from './abi.json';

const {
  ADDRESS_LENDING_POOL,
} = CONFIG.INTERFACE;

const defaultStates = {
};

function useLendingPool(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const {
    web3,
    currentAccount,
    getContract: getWeb3Contract,
  } = Web3.useContainer();

  const getContract = useCallback(() => getWeb3Contract(ABI, ADDRESS_LENDING_POOL), [web3, getWeb3Contract]);

  const getReserveData = useCallback(tokenAddress => getContract().call('getReserveData', [tokenAddress]), [web3, currentAccount, getContract]);

  const getReserveConfigurationData = useCallback(tokenAddress => getContract().call('getReserveConfigurationData', [tokenAddress]), [web3, currentAccount, getContract]);

  const getUserAccountData = useCallback(() => getContract().call('getUserAccountData', [currentAccount]), [web3, currentAccount, getContract]);

  const getUserReserveData = useCallback(tokenAddress => getContract().call('getUserReserveData', [tokenAddress, currentAccount]), [web3, currentAccount, getContract]);

  return {
    getContract,
    getReserveData,
    getReserveConfigurationData,
    getUserAccountData,
    getUserReserveData,
  };
}

const LendingPool = createContainer(useLendingPool);

export default LendingPool;
