import { useState, useEffect, useCallback } from 'react';
import { createContainer } from 'unstated-next';
import fetch from '@utils/fetch';
import QUERYS from '../querys';


const getStateCodeCallback = () => fetch.get(QUERYS.STATE_CODE);
const defaultStates = {};

function useUtils(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };

  const getStateCode = useCallback(() => getStateCodeCallback(), []);

  return {
    getStateCode,
  };
}

const Router = createContainer(useUtils);

export default Router;
