import { useState, useEffect, useCallback } from 'react';
import { createContainer } from 'unstated-next';
import fetch from '@utils/fetch';
import QUERYS from '../querys';


const getStateCodeCallback = () => fetch.get(QUERYS.STATE_CODE);
const defaultStates = {
  globalLoading: false,
  theme: 'dark',
  transactionCache: [],
  // transactionCache: [{
  //   method: 'deposit',
  //   tx: '0xd622f3e02d4fedb7869a6c2263316a1f7fa05108a1ba03cc59d81d061822da26',
  //   receipt: undefined,
  //   args: ['0xcDaA397060059E9AA2C3a6F7f544BB1Be7237a48', '10000000', '0'],
  //   options: { from: '0x8494dD6bA7c53a06e9Af731c92da8dB63fEeAa03', value: 0 },
  // }],
};

function useUtils(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const [globalLoading, setGlobalLoading] = useState(initialStates.globalLoading);
  const [theme, setThemeProp] = useState(initialStates.theme);
  const [transactionCache, setTransactionCache] = useState(initialStates.transactionCache);

  const getStateCode = useCallback(() => getStateCodeCallback(), []);

  const setTheme = useCallback((t) => {
    window.document.documentElement.setAttribute('data-theme', t);
    setThemeProp(t);
  }, [setThemeProp]);

  const upsertTransaction = useCallback((req, tx, receipt) => {
    const cache = [...transactionCache];
    if (!req) {
      setTransactionCache(cache);
      return;
    }
    const { method, args, options } = req;
    let transaction = cache.find(tran => tran.tx === tx);
    if (!transaction) {
      transaction = {
        method,
        args,
        options,
        tx,
        receipt,
      };
      setTransactionCache([transaction].concat(cache));
    } else if (receipt) {
      transaction.receipt = receipt;
      setTransactionCache(cache);
    }
  }, [transactionCache, setTransactionCache]);

  useEffect(() => {
    window.__upsertTransaction__ = upsertTransaction;
  }, [upsertTransaction]);

  return {
    getStateCode,
    globalLoading,
    setGlobalLoading,
    theme,
    setTheme,
    transactionCache,
    upsertTransaction,
  };
}

const Utils = createContainer(useUtils);

export default Utils;
