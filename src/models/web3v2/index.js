/* eslint-disable prefer-promise-reject-errors */
import { useState, useEffect, useCallback, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { toChecksumAddress } from 'ethereum-checksum-address';
import { isEth } from '@utils/';
import Web3Modal from '@models/web3modal';
import ERC20_ABI from './erc20_abi.json';
import CONFIG from '../../config';

const defaultStates = {
  isInited: false,
  accounts: [],
  currentAccount: null,
};

const {
  MAX_VAL,
} = CONFIG;

export class Contract {
  constructor(web3, ABI, address) {
    this.ABI = ABI;
    this.address = address;
    this.contract = new web3.eth.Contract(ABI, toChecksumAddress(address));
  }

  _log(event, method, extraData = {}) {
    console.groupCollapsed(`合约调用 - ${event} - ${method}`);
    console.table({
      合约地址: { value: this.address },
      调用方法: { value: method },
      ...extraData,
    });
    console.groupEnd();
  }

  _upsertTransaction(...args) {
    if (window.__upsertTransaction__) {
      window.__upsertTransaction__(...args);
    }
  }

  call(method, args = []) {
    return this.contract.methods[method](...args).call().then((data) => {
      this._log('call', method, {
        方法入参: { value: args },
        结果: { value: data },
      });
      return data;
    });
  }

  send(method, args = [], options = {}) {
    return this.estimateGas(method, args, { ...options })
      .then(gas => new Promise((resolve, reject) => {
        this.contract.methods[method](...args).send({
          gas,
          ...options,
        })
          .on('transactionHash', (hash) => {
            this._upsertTransaction({
              method,
              args,
              options,
            }, hash);
          })
          // .on('confirmation', (confirmationNumber, receipt) => {
          //   console.log(confirmationNumber, receipt);
          // })
          .on('receipt', (receipt) => {
            this._log('send', method, {
              方法入参: { value: args },
              调用参数: { value: options },
              结果: { value: receipt },
            });
            this._upsertTransaction({
              method,
              args,
              options,
            }, receipt.transactionHash, receipt);
            resolve(receipt);
          })
          .on('error', (error, receipt) => {
            reject(error);
          });
      }));
  }

  estimateGas(method, args = [], options = {}) {
    return this.contract.methods[method](...args).estimateGas(options)
      // gas多一点防止出问题
      .then((gas) => {
        this._log('estimateGas', method, {
          方法入参: { value: args },
          调用参数: { value: options },
          预测gas: { value: gas },
          调整gas: { value: parseInt(gas * 1.05, 10) },
        });
        return parseInt(gas * 1.05, 10);
      });
  }

  getPastEvents(eventName, filter) {
    return this.contract.getPastEvents(eventName, filter).then((data) => {
      this._log('getPastEvents', eventName, {
        过滤: { value: filter },
        结果: { value: data },
      });
      return data;
    });
  }
}

export class Erc20Contract extends Contract {
  constructor(web3, address, ABI = ERC20_ABI) {
    super(web3, ABI, address);
  }

  balanceOf(account) {
    return this.call('balanceOf', [account]);
  }

  allowance(account, tokenAddress) {
    return this.call('allowance', [account, toChecksumAddress(tokenAddress)]);
  }

  approve(account, tokenAddress) {
    return this.send('approve', [toChecksumAddress(tokenAddress), MAX_VAL], {
      from: account,
    });
  }
}

function useWeb3(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const [accounts, setAccounts] = useState(initialStates.accounts);
  const [currentAccount, setCurrentAccount] = useState(initialStates.currentAccount);
  const {
    web3,
    web3Modal,
    provider,
    init,
    connect,
    disconnect,
  } = Web3Modal.useContainer();

  const updateAccounts = useCallback((web3instance) => {
    const instance = (web3instance || web3);
    instance.eth.getAccounts().then((as) => {
      setAccounts(as);
    });
  }, [web3, accounts]);

  useEffect(() => {
    if (!web3) {
      setAccounts(initialStates.accounts);
    } else {
      updateAccounts();
    }
  }, [web3]);

  useEffect(() => {
    setCurrentAccount(accounts[0] || null);
  }, [accounts]);

  useEffect(() => {
    if (!provider) return;
    provider.on('accountsChanged', () => {
      updateAccounts();
    });

    // Subscribe to chainId change
    provider.on('chainChanged', () => {
      console.log('ETH event: chainChanged');
    });

    // Subscribe to provider connection
    provider.on('connect', () => {
      console.log('ETH event: connect');
    });

    // Subscribe to provider disconnection
    provider.on('disconnect', () => {
      console.log('ETH event: disconnect');
    });
  }, [provider]);

  const getContract = useCallback((ABI, address) => new Contract(web3, ABI, toChecksumAddress(address)), [web3]);

  const getErcContract = useCallback(address => new Erc20Contract(web3, address), [web3]);

  const getCurrentAccountTokenWalletBalance = useCallback((tokenAddress) => {
    if (!web3 || !currentAccount || !tokenAddress) return Promise.resolve('0');
    if (isEth(tokenAddress)) {
      // eth
      return web3.eth.getBalance(currentAccount);
    }
    const ercContract = getErcContract(tokenAddress);
    return ercContract.balanceOf(currentAccount);
  }, [web3, currentAccount]);

  return {
    web3,
    web3Modal,
    accounts,
    currentAccount,
    provider,
    init,
    connect,
    disconnect,
    getContract,
    getErcContract,
    getCurrentAccountTokenWalletBalance,
  };
}

const Web3 = createContainer(useWeb3);

export default Web3;
