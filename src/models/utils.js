import { useState, useEffect, useCallback } from 'react';
import { createContainer } from 'unstated-next';
import fetch from '@utils/fetch';
import QUERYS from '../querys';


const getStateCodeCallback = () => fetch.get(QUERYS.STATE_CODE);
const defaultStates = {
  globalLoading: false,
};

function useUtils(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const [globalLoading, setGlobalLoading] = useState(initialStates.globalLoading);

  const getStateCode = useCallback(() => getStateCodeCallback(), []);

  return {
    getStateCode,
    globalLoading,
    setGlobalLoading,
  };
}

const Router = createContainer(useUtils);

export default Router;
