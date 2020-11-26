/* eslint-disable prefer-promise-reject-errors */
import Web3 from 'web3';

export default function init() {
  if (!window.ethereum) {
    return Promise.reject({ code: -1 });
  }
  const web3 = new Web3(window.ethereum);
  const handleConnect = (callback) => {
    window.ethereum.on('connect', callback);
  };
  const handleAccountsChanged = (callback) => {
    window.ethereum.on('accountsChanged', callback);
  };
  const handleChainChanged = (callback) => {
    window.ethereum.on('chainChanged', callback);
  };
  const connect = () => window.ethereum.request({ method: 'eth_requestAccounts' });
  return Promise.resolve([web3, connect, handleConnect, handleAccountsChanged, handleChainChanged]);
}
