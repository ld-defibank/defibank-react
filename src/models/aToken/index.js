/* eslint-disable prefer-promise-reject-errors */
import { useState, useEffect, useCallback, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { isEth } from '@utils';
import { toChecksumAddress } from 'ethereum-checksum-address';
import Web3, { Erc20Contract } from '../web3v2';
import CONFIG from '../../config';
import ABI from './abi.json';


const defaultStates = {
};

class ATokenErc20Contract extends Erc20Contract {
  constructor(web3, address) {
    super(web3, address, ABI);
  }

  redeem(amount, options) {
    return this.send('redeem', [amount], options);
  }

  redeemAll(options) {
    return this.call('UINT_MAX_VALUE').then(maxValue => this.redeem(maxValue, options));
  }
}

function useAToken(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const {
    web3,
    currentAccount,
  } = Web3.useContainer();

  const getContract = useCallback(tokenAddress => new ATokenErc20Contract(web3, tokenAddress), [web3]);

  return {
    getContract,
  };
}

const AToken = createContainer(useAToken);

export default AToken;
