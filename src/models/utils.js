import { useState, useEffect, useCallback } from 'react';
import { createContainer } from 'unstated-next';
import fetch from '@utils/fetch';
import QUERYS from '../querys';


const getStateCodeCallback = () => fetch.get(QUERYS.STATE_CODE);
const defaultStates = {
  globalLoading: false,
  theme: 'dark',
};

function useUtils(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const [globalLoading, setGlobalLoading] = useState(initialStates.globalLoading);
  const [theme, setThemeProp] = useState(initialStates.theme);

  const getStateCode = useCallback(() => getStateCodeCallback(), []);

  const setTheme = useCallback((t) => {
    window.document.documentElement.setAttribute('data-theme', t);
    setThemeProp(t);
  }, [setThemeProp]);

  return {
    getStateCode,
    globalLoading,
    setGlobalLoading,
    theme,
    setTheme,
  };
}

const Utils = createContainer(useUtils);

export default Utils;
