import React from 'react';
import FormattedMessage from '@common/formattedMessage';
import Web3 from '@models/web3v2';

function formatAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function Wallet() {
  const web3Model = Web3.useContainer();

  const { currentAccount, connect } = web3Model;

  if (currentAccount) {
    return (
      <button className="wallet-connect connected">
        <span className="dot" />
        <span>{formatAddress(currentAccount)}</span>
      </button>
    );
  }

  return (
    <button className="wallet-connect" onClick={connect}><FormattedMessage id="top_wallet_connect" /></button>
  );
}

export default Wallet;
