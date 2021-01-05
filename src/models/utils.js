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
  const [theme, setTheme] = useState(initialStates.theme);

  const getStateCode = useCallback(() => getStateCodeCallback(), []);

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
