import { useState, useEffect, useCallback } from 'react';
import { createContainer } from 'unstated-next';
import fetch from '@utils/fetch';
import { isEth, isUsdt } from '@utils/';
import QUERYS from '../querys';
import LendingPool from './lendingPool';
import ChainlinkProxyPriceProvider from './chainlinkProxyPriceProvider';
import CONFIG from '../config';

const {
  TOKENS,
} = CONFIG;

const getMarketReserveHistoryDataCall = data => fetch.get(QUERYS.HISTORY_RESERVE, data);

const defaultStates = {
};

function useMarket(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const {
    getReserveData,
    getReserveConfigurationData,
  } = LendingPool.useContainer();
  const {
    getAssetPrice,
    getAssetsPrices,
  } = ChainlinkProxyPriceProvider.useContainer();

  const getMarketReserveData = useCallback(tokenAddress => getReserveData(tokenAddress).then(data => ({
    ...data,
    tokenAddress,
    meta: Object.values(TOKENS).find(token => token.tokenAddress === tokenAddress),
  })), [getReserveData]);

  const getMarketReserveConfigurationData = useCallback(tokenAddress => getReserveConfigurationData(tokenAddress).then(data => ({
    ...data,
    tokenAddress,
    meta: Object.values(TOKENS).find(token => token.tokenAddress === tokenAddress),
  })), [getReserveData]);

  const getMarketAllReserveData = useCallback(() => {
    const tokenAddresses = Object.keys(TOKENS).map(key => TOKENS[key].tokenAddress);
    return Promise.all(tokenAddresses.map(address => getMarketReserveData(address)));
  }, [getMarketReserveData]);

  const getAssetETHPrice = useCallback(tokenAddress => getAssetPrice(tokenAddress), [getAssetPrice]);

  const getAssetsETHPrices = useCallback(tokenAddresses => getAssetsPrices(tokenAddresses).then(prices => prices.map((price, i) => ({
    tokenAddress: tokenAddresses[i],
    priceAsEth: price,
  }))), [getAssetsPrices]);

  const getETHUSDPrice = useCallback(() => getAssetPrice(TOKENS.USDT.tokenAddress).then(price => 1e18 / parseInt(price, 10)), [getAssetPrice]);

  const getAllAssetsETHPrices = useCallback(() => getAssetsETHPrices(Object.values(TOKENS).map(token => token.tokenAddress)), [getAssetsETHPrices]);

  const getAssetUSDPrice = useCallback((tokenAddress) => {
    if (isEth(tokenAddress)) {
      return getETHUSDPrice();
    }
    if (isUsdt(tokenAddress)) {
      return Promise.resolve(1);
    }
    return Promise.all([
      getAssetETHPrice(tokenAddress),
      getETHUSDPrice(),
    ]).then(([priceAsEth, ethusdPrice]) => parseInt(priceAsEth, 10) / 1e18 * ethusdPrice);
  }, [getETHUSDPrice, getAssetETHPrice]);
  const getAllAssetsUSDPrices = useCallback(() => Promise.all([
    getAllAssetsETHPrices(),
    getETHUSDPrice(),
  ]).then(([prices, ethusdPrice]) => prices.map(token => ({
    tokenAddress: token.tokenAddress,
    price: token.tokenAddress === TOKENS.USDT.tokenAddress ? 1 : parseInt(token.priceAsEth, 10) / 1e18 * ethusdPrice,
    priceAsEth: token.priceAsEth,
  }))), [getAllAssetsETHPrices, getETHUSDPrice]);

  const getMarketReserveHistoryData = (tokenAddress, filter = 'day', limit = '10') => getMarketReserveHistoryDataCall({ token_address: tokenAddress, filter, limit });

  return {
    getMarketReserveData,
    getMarketReserveConfigurationData,
    getMarketAllReserveData,
    getETHUSDPrice,
    getAssetETHPrice,
    getAssetsETHPrices,
    getAllAssetsETHPrices,
    getAssetUSDPrice,
    getAllAssetsUSDPrices,
    getMarketReserveHistoryData,
  };
}

const Market = createContainer(useMarket);

export default Market;
