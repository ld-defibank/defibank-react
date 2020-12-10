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

  const sendContract = useCallback((method, args = [], options = {}) => {
    const contract = getContract();
    return contract.methods[method](...args).estimateGas(options)
      // gas多一点防止出问题
      .then(gas => parseInt(gas * 1.05, 10))
      .then(gas => contract.methods[method](...args).send({
        gas,
        ...options,
      }));
  }, [getContract]);

  const callContract = useCallback((method, args = []) => {
    const contract = getContract();
    return contract.methods[method](...args).call();
  }, [getContract]);

  const deposit = useCallback((tokenAddress, amount, referralCode = '0') => {
    const options = {
      from: currentAccount,
      value: 0,
    };
    if (isEth(tokenAddress)) {
      options.value = amount;
    }
    return sendContract('deposit', [
      toChecksumAddress(tokenAddress),
      amount,
      referralCode,
    ], options);
  }, [web3, currentAccount, sendContract]);

  const getReserveData = useCallback(tokenAddress => callContract('getReserveData', [tokenAddress]), [web3, currentAccount, sendContract]);

  return {
    deposit,
    getReserveData,
  };
}

const LendingPool = createContainer(useLendingPool);

export default LendingPool;
