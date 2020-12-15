/* eslint-disable prefer-promise-reject-errors */
import { useState, useEffect, useCallback, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { isEth } from '@utils';
import { toChecksumAddress } from 'ethereum-checksum-address';
import Web3 from '../web3v2';
import CONFIG from '../../config';
import ABI from './abi.json';

const {
  CHAINLINK_PROXY_PRICE_PROVIDER,
} = CONFIG.INTERFACE;

const defaultStates = {
};

function useChainlinkProxyPriceProvider(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const {
    web3,
    currentAccount,
    getContract: getWeb3Contract,
  } = Web3.useContainer();

  const getContract = useCallback(() => getWeb3Contract(ABI, CHAINLINK_PROXY_PRICE_PROVIDER), [web3, getWeb3Contract]);

  const callContract = useCallback((method, args = []) => {
    const contract = getContract();
    return contract.methods[method](...args).call();
  }, [getContract]);

  const getAssetPrice = useCallback(tokenAddress => callContract('getAssetPrice', [tokenAddress]), [web3, currentAccount, callContract]);
  const getAssetsPrices = useCallback(tokenAddresses => callContract('getAssetsPrices', [tokenAddresses]), [web3, currentAccount, callContract]);

  return {
    getAssetPrice,
    getAssetsPrices,
  };
}

const ChainlinkProxyPriceProvider = createContainer(useChainlinkProxyPriceProvider);

export default ChainlinkProxyPriceProvider;
