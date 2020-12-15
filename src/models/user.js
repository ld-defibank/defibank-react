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

function useUser(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const {
    getUserAccountData,
    getUserReserveData,
  } = LendingPool.useContainer();

  const getCurrentUserAccountData = useCallback(() => getUserAccountData(), [getUserAccountData]);

  const getCurrentUserReserveData = useCallback(tokenAddress => getUserReserveData(tokenAddress).then(data => ({
    ...data,
    tokenAddress,
    meta: Object.values(TOKENS).find(token => token.tokenAddress === tokenAddress),
  })), [getUserReserveData]);

  return {
    getCurrentUserAccountData,
    getCurrentUserReserveData,
  };
}

const User = createContainer(useUser);

export default User;
