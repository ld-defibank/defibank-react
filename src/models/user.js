import { useState, useEffect, useCallback } from 'react';
import { createContainer } from 'unstated-next';
import fetch from '@utils/fetch';
import { isEth } from '@utils/';
import { toChecksumAddress } from 'ethereum-checksum-address';
import QUERYS from '../querys';
import LendingPool from './lendingPool';
import LendingPoolCore from './lendingPoolCore';
import Web3 from './web3v2';
import CONFIG from '../config';

const {
  TOKENS,
} = CONFIG;

const defaultStates = {
};

function useUser(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const {
    getContract: getLendingPoolContract,
    getUserAccountData,
    getUserReserveData,
  } = LendingPool.useContainer();
  const {
    getAllowance,
    approve,
  } = LendingPoolCore.useContainer();
  const {
    web3,
    getErcContract,
    currentAccount,
  } = Web3.useContainer();

  const getCurrentUserAccountData = useCallback(() => getUserAccountData(), [getUserAccountData]);

  const getCurrentUserReserveData = useCallback(tokenAddress => getUserReserveData(tokenAddress).then(data => ({
    ...data,
    tokenAddress,
    meta: Object.values(TOKENS).find(token => token.tokenAddress === tokenAddress),
  })), [getUserReserveData]);

  const getCurrentAccountTokenWalletBalance = useCallback((tokenAddress) => {
    if (!web3 || !currentAccount || !tokenAddress) return Promise.resolve('0');
    if (isEth(tokenAddress)) {
      // eth
      return web3.eth.getBalance(currentAccount);
    }
    const ercContract = getErcContract(tokenAddress);
    return ercContract.balanceOf(currentAccount);
  }, [web3, currentAccount]);

  const estimateDepositETHGas = useCallback((referralCode = '0') => {
    const options = {
      from: currentAccount,
      value: '1',
    };
    return getLendingPoolContract().estimateGas('deposit', [
      toChecksumAddress(TOKENS.ETH.tokenAddress),
      '1',
      referralCode,
    ], options);
  }, [currentAccount, getLendingPoolContract]);

  const deposit = useCallback((tokenAddress, amount, referralCode = '0') => {
    const options = {
      from: currentAccount,
      value: 0,
    };
    if (isEth(tokenAddress)) {
      options.value = amount;
    }
    return getLendingPoolContract().send('deposit', [
      toChecksumAddress(tokenAddress),
      amount,
      referralCode,
    ], options);
  }, [web3, currentAccount, getLendingPoolContract]);

  return {
    estimateDepositETHGas,
    getCurrentUserAccountData,
    getCurrentUserReserveData,
    getCurrentAccountTokenWalletBalance,
    getAllowance,
    approve,
    deposit,
  };
}

const User = createContainer(useUser);

export default User;
