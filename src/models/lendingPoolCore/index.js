/* eslint-disable prefer-promise-reject-errors */
import { useState, useEffect, useCallback, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { isEth } from '@utils';
import { toChecksumAddress } from 'ethereum-checksum-address';
import Web3 from '../web3v2';
import CONFIG from '../../config';
import ABI from './abi.json';

const {
  ADDRESS_LENDING_POOL_CORE,
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
    getErcContract,
  } = Web3.useContainer();

  const getContract = useCallback(() => getWeb3Contract(ABI, ADDRESS_LENDING_POOL_CORE), [web3, getWeb3Contract]);

  const getAllowance = useCallback((tokenAddress) => {
    if (!web3 || !currentAccount || !tokenAddress) return Promise.resolve('0');
    if (isEth(tokenAddress)) return Promise.resolve(MAX_VAL);
    const ercContract = getErcContract(tokenAddress);
    return ercContract.allowance(currentAccount, ADDRESS_LENDING_POOL_CORE);
  }, [web3, currentAccount]);

  const approve = useCallback((tokenAddress) => {
    if (!web3 || !currentAccount || !tokenAddress) return Promise.reject({ code: 9999 });
    if (isEth(tokenAddress)) return Promise.resolve(true);
    const ercContract = getErcContract(tokenAddress);
    return ercContract.approve(currentAccount, ADDRESS_LENDING_POOL_CORE);
  }, [web3, currentAccount]);

  return {
    getContract,
    getAllowance,
    approve,
  };
}

const LendingPoolCore = createContainer(useLendingPoolCore);

export default LendingPoolCore;
