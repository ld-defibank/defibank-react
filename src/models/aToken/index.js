/* eslint-disable prefer-promise-reject-errors */
import { useState, useEffect, useCallback, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { isEth } from '@utils';
import { toChecksumAddress } from 'ethereum-checksum-address';
import Web3 from '../web3v2';
import CONFIG from '../../config';
import ABI from './abi.json';


const defaultStates = {
};

function useAToken(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const {
    web3,
    currentAccount,
    getErcContract: getWeb3ErcContract,
  } = Web3.useContainer();

  const getContract = useCallback(tokenAddress => getWeb3ErcContract(tokenAddress, ABI), [web3, getWeb3ErcContract]);

  return {
    getContract,
  };
}

const AToken = createContainer(useAToken);

export default AToken;
