import { useState, useEffect, useCallback } from 'react';
import { createContainer } from 'unstated-next';
import Decimal from 'decimal.js-light';
import fetch from '@utils/fetch';
import { isEth, times10 } from '@utils/';
import { toChecksumAddress } from 'ethereum-checksum-address';
import QUERYS from '../querys';
import LendingPool from './lendingPool';
import LendingPoolCore from './lendingPoolCore';
import AToken from './aToken';
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
    getReserveData,
  } = LendingPool.useContainer();
  const {
    getAllowance,
    approve,
  } = LendingPoolCore.useContainer();
  const {
    getContract: getATokenContract,
  } = AToken.useContainer();
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

  const borrow = useCallback((tokenAddress, amount, interestRateMode, referralCode = '0') => {
    const options = {
      from: currentAccount,
      value: 0,
    };
    return getLendingPoolContract().send('borrow', [
      toChecksumAddress(tokenAddress),
      amount,
      interestRateMode,
      referralCode,
    ], options);
  }, [web3, currentAccount, getLendingPoolContract]);

  const repay = useCallback((tokenAddress, amount, onBehalfOf, isMax) => {
    const options = {
      from: currentAccount,
      value: 0,
    };
    if (isEth(tokenAddress)) {
      options.value = amount;
    }
    if (!isMax) {
      return getLendingPoolContract().send('repay', [
        toChecksumAddress(tokenAddress),
        amount,
        onBehalfOf,
      ], options);
    }
    return getReserveData(tokenAddress).then((data) => {
      const { aTokenAddress } = data;
      const aTokenContract = getATokenContract(aTokenAddress);
      return aTokenContract.call('UINT_MAX_VALUE');
    }).then((repayAmount) => {
      if (isEth(tokenAddress)) {
        // 如果是ETH，则加上1天的利息到value上
        return getUserReserveData(tokenAddress).then((data) => {
          const { borrowRate } = data;
          const value = new Decimal(amount).add(new Decimal(amount).times(times10(borrowRate, -27)).div(360)).toFixed(0);
          return value;
        }).then(value => getLendingPoolContract().send('repay', [
          toChecksumAddress(tokenAddress),
          repayAmount,
          onBehalfOf,
        ], {
          ...options,
          value,
        }));
      }
      return getLendingPoolContract().send('repay', [
        toChecksumAddress(tokenAddress),
        repayAmount,
        onBehalfOf,
      ], options);
    });
  }, [web3, currentAccount, getLendingPoolContract]);

  const repayForMyself = useCallback((tokenAddress, amount, isMax) => repay(tokenAddress, amount, currentAccount, isMax), [repay, currentAccount]);

  const withdraw = useCallback((tokenAddress, amount, isMax) => {
    const options = {
      from: currentAccount,
      value: 0,
    };
    return getReserveData(tokenAddress).then((data) => {
      const { aTokenAddress } = data;
      return getATokenContract(aTokenAddress);
    }).then((aTokenContract) => {
      if (isMax) {
        return aTokenContract.redeemAll(options);
      }
      return aTokenContract.redeem(amount, options);
    });
  }, [web3, currentAccount, getLendingPoolContract]);

  const setIsCollateral = useCallback((tokenAddress, isCollateral) => {
    return getLendingPoolContract().send('setUserUseReserveAsCollateral', [
      tokenAddress,
      isCollateral,
    ], {
      from: currentAccount,
      value: 0,
    });
  }, [web3, currentAccount]);

  const swapBorrowRateMode = useCallback((tokenAddress) => {
    return getLendingPoolContract().send('swapBorrowRateMode', [
      tokenAddress,
    ], {
      from: currentAccount,
      value: 0,
    });
  }, [web3, currentAccount]);

  const getHistory = useCallback(eventName => getLendingPoolContract().getPastEvents(eventName, {
    filter: { _user: currentAccount },
    fromBlock: 0,
    toBlock: 'latest',
  }), [web3, currentAccount]);

  const getDepositHistory = useCallback(() => getHistory('Deposit').then((events) => {
    return events.map(event => ({
      amount: event.returnValues._amount,
      referral: event.returnValues._referral,
      reserve: event.returnValues._reserve,
      timestamp: event.returnValues._timestamp,
      user: event.returnValues._user,
      tokenMeta: Object.values(TOKENS).find(token => token.tokenAddress === event.returnValues._reserve),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
    }));
  }), [web3, currentAccount, getHistory]);

  const getWithdrawHistory = useCallback(() => getHistory('RedeemUnderlying').then((events) => {
    return events.map(event => ({
      amount: event.returnValues._amount,
      reserve: event.returnValues._reserve,
      timestamp: event.returnValues._timestamp,
      user: event.returnValues._user,
      tokenMeta: Object.values(TOKENS).find(token => token.tokenAddress === event.returnValues._reserve),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
    }));
  }), [web3, currentAccount, getHistory]);

  return {
    estimateDepositETHGas,
    getCurrentUserAccountData,
    getCurrentUserReserveData,
    getCurrentAccountTokenWalletBalance,
    getAllowance,
    approve,
    deposit,
    borrow,
    repayForMyself,
    withdraw,
    setIsCollateral,
    swapBorrowRateMode,
    getDepositHistory,
    getWithdrawHistory,
  };
}

const User = createContainer(useUser);

export default User;
