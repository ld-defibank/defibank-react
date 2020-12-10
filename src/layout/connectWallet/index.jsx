import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import FormattedMessage from '@common/formattedMessage';
import ASSETS from '@common/assets';
import Web3 from '@models/web3v2';
import Router from '@models/router';
import { Spin } from '@common/antd';
import './style.scss';

export default function ConnectWallet() {
  const {
    currentAccount,
    init,
    web3,
    web3Modal,
    connect,
  } = Web3.useContainer();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (web3Modal && !currentAccount) {
      connect();
    }
  }, [web3Modal, currentAccount]);

  return (
    <div id="connectwallet" />
  );
}
