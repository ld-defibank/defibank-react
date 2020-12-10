import { useState, useEffect, useCallback } from 'react';
import { createContainer } from 'unstated-next';
import fetch from '@utils/fetch';
import QUERYS from '../querys';
import LendingPool from './lendingPool';
import CONFIG from '../config';

const {
  TOKENS,
} = CONFIG;

const defaultStates = {
};

function useMarket(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const {
    getReserveData,
  } = LendingPool.useContainer();

  const getMarketReserveData = useCallback(tokenAddress => getReserveData(tokenAddress).then(data => ({
    ...data,
    tokenAddress,
    meta: Object.values(TOKENS).find(token => token.address === tokenAddress),
  })), [getReserveData]);

  const getMarketAllReserveData = useCallback(() => {
    const tokenAddresses = Object.keys(TOKENS).map(key => TOKENS[key].address);
    return Promise.all(tokenAddresses.map(address => getMarketReserveData(address)));
  }, [getMarketReserveData]);

  // TODO:
  const getAllReservePrice = useCallback(() => Promise.resolve(Object.values(TOKENS).map(token => ({
    tokenAddress: token.address,
    price: '1',
  }))), []);

  return {
    getMarketReserveData,
    getMarketAllReserveData,
    getAllReservePrice,
  };
}

const Router = createContainer(useMarket);

export default Router;
