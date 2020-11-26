/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable import/no-mutable-exports */
import Web3 from 'web3';
import CONFIG from '../../config';
import contractJson from './abi.json';
import accountData from './account.json';

let CONTRACT_ACCS;
if (CONFIG.REACT_APP_ENV === 'ORG') {
  CONTRACT_ACCS = accountData.org;
} else if (CONFIG.REACT_APP_ENV === 'TEST') {
  CONTRACT_ACCS = accountData.test;
} else {
  CONTRACT_ACCS = accountData.cn;
}

function init(updateAccounts = () => {}) {
  // //console.log("ABI", contractJson.contractName)
  // let CONTRACT_ACCS = '0xd93f2be7d64c52569dc21ebeb6b4c36dd3022f8a';
  let web3;
  let definerContract;
  let accountsContract;
  let savingBankContract;
  let otcContract;
  const instanceMethods = {
    connect: () => Promise.reject({ code: -1 }),
  };

  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    window.ethereum.on('connect', () => {
      console.log('ETH event: connect');
    });
    window.ethereum.on('accountsChanged', () => {
      updateAccounts(web3);
    });
    window.ethereum.on('chainChanged', () => {
      console.log('ETH event: chainChanged');
    });
    instanceMethods.connect = () => window.ethereum.request({ method: 'eth_requestAccounts' }).then(() => {
      updateAccounts(web3);
    });
    definerContract = new web3.eth.Contract(contractJson.saving_account_abi, CONTRACT_ACCS.SavingAccount);
    accountsContract = new web3.eth.Contract(contractJson.accounts_abi, CONTRACT_ACCS.Accounts);
    savingBankContract = new web3.eth.Contract(contractJson.saving_bank_abi, CONTRACT_ACCS.Bank);
    // rinkeby mainnet
    otcContract = new web3.eth.Contract(contractJson.otc_abi, CONTRACT_ACCS.otc_account.mainnet);
  } else if (window.web3) {
    web3 = new Web3(web3.currentProvider);
    definerContract = new web3.eth.Contract(contractJson.saving_account_abi, CONTRACT_ACCS.SavingAccount);
    accountsContract = new web3.eth.Contract(contractJson.accounts_abi, CONTRACT_ACCS.Accounts);
    savingBankContract = new web3.eth.Contract(contractJson.saving_bank_abi, CONTRACT_ACCS.Bank);
    // rinkeby mainnet
    otcContract = new web3.eth.Contract(contractJson.otc_abi, CONTRACT_ACCS.otc_account.mainnet);
    updateAccounts(web3);
  } else {
    // alert('当前没有Web3可执行环境，如 MetaMask/InToken!');
  }
  // console.log('web3网络', web3.currentProvider);
  // console.log('web3网络', web3.eth.net);

  return { web3, definerContract, accountsContract, savingBankContract, otcContract, instanceMethods };
}

export {
  init,
  CONTRACT_ACCS,
};
