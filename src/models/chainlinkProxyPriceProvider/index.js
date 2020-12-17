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

  const getAssetPrice = useCallback(tokenAddress => getContract().call('getAssetPrice', [tokenAddress]), [web3, currentAccount, getContract]);
  const getAssetsPrices = useCallback(tokenAddresses => getContract().call('getAssetsPrices', [tokenAddresses]), [web3, currentAccount, getContract]);

  return {
    getAssetPrice,
    getAssetsPrices,
  };
}

const ChainlinkProxyPriceProvider = createContainer(useChainlinkProxyPriceProvider);

export default ChainlinkProxyPriceProvider;
