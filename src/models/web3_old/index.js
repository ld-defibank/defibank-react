/* eslint-disable prefer-promise-reject-errors */
import { useState, useEffect, useCallback } from 'react';
import { createContainer } from 'unstated-next';
import { isEth } from '@utils';
import message from '@utils/message';
import I18n from '../i18n';
import { init, CONTRACT_ACCS } from './instance';
import ERC20_ABI from './erc20_abi.json';

const defaultStates = {
  isInited: false,
  web3: null,
  accounts: [],
  currentAccount: null,
};

const MAX_VAL = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

function useWeb3(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const [isInited, setInited] = useState(initialStates.isInited);
  const [web3, setWeb3] = useState(initialStates.web3);
  const [accountsContract, setAccountsContract] = useState(null);
  const [definerContract, setDefinerContract] = useState(null);
  const [savingBankContract, setSavingBankContract] = useState(null);
  const [accounts, setAccounts] = useState(initialStates.accounts);
  const [currentAccount, setCurrentAccount] = useState(initialStates.currentAccount);
  const [instanceMethods, setInstanceMethods] = useState(() => {});
  const { t } = I18n.useContainer();

  const updateAccounts = useCallback((web3instance) => {
    (web3instance || web3).eth.getAccounts().then((as) => {
      setAccounts(as);
    });
  }, [web3, accounts]);

  useEffect(() => {
    setCurrentAccount(accounts[0] || null);
  }, [accounts]);

  const getCurrentAccountTokenDepositBalance = useCallback((tokenAddress) => {
    if (!accountsContract || !currentAccount) return Promise.resolve('0');
    return accountsContract.methods.getDepositBalanceCurrent(tokenAddress, currentAccount).call({
      from: currentAccount,
    });
  }, [web3, currentAccount, accountsContract]);

  const getCurrentAccountTokenBorrowBalance = useCallback((tokenAddress) => {
    if (!accountsContract || !currentAccount) return Promise.resolve('0');
    return accountsContract.methods.getBorrowBalanceCurrent(tokenAddress, currentAccount).call({
      from: currentAccount,
    });
  }, [web3, currentAccount, accountsContract]);

  const getContract = useCallback((ABI, address) => new web3.eth.Contract(ABI, address), [web3]);

  const getErcContract = useCallback(address => getContract(ERC20_ABI, address), [web3]);

  const getCurrentAccountTokenWalletBalance = useCallback((tokenAddress) => {
    if (!web3 || !currentAccount || !tokenAddress) return Promise.resolve('0');
    if (isEth(tokenAddress)) {
      // eth
      return web3.eth.getBalance(currentAccount);
    }
    const ercContract = getErcContract(tokenAddress);
    return ercContract.methods.balanceOf(currentAccount).call();
  }, [web3, currentAccount]);

  const getCurrentAccountTokenAllowance = useCallback((tokenAddress) => {
    if (!web3 || !currentAccount || !tokenAddress) return Promise.resolve('0');
    if (isEth(tokenAddress)) return Promise.resolve('999999999999999');
    const ercContract = getErcContract(tokenAddress);
    return ercContract.methods.allowance(currentAccount, CONTRACT_ACCS.SavingAccount).call();
  }, [web3, currentAccount]);

  const approveCurrentAccountToken = useCallback((tokenAddress) => {
    if (!web3 || !currentAccount || !tokenAddress) return Promise.reject({ code: 9999 });
    if (isEth(tokenAddress)) return Promise.resolve(true);
    const ercContract = getErcContract(tokenAddress);
    return ercContract.methods.approve(CONTRACT_ACCS.SavingAccount, MAX_VAL).send({
      from: currentAccount,
    });
  }, [web3, currentAccount]);

  const getPoolAmount = useCallback((tokenAddress) => {
    if (!savingBankContract) return Promise.resolve('0');
    return savingBankContract.methods.getPoolAmount(tokenAddress).call({
      from: currentAccount,
    });
  }, [web3, currentAccount, savingBankContract]);

  const estimateDefinerContractGas = useCallback(
    (method, value, ...args) => definerContract.methods[method](...args).estimateGas({ from: currentAccount, value }),
    [web3, currentAccount, definerContract],
  );

  const sendDefinerContractMethod = useCallback((method, sendData = {}, ...args) => definerContract.methods[method](...args).send({
    from: currentAccount,
    ...sendData,
  }), [web3, currentAccount, definerContract]);

  const getTokenData = useCallback((tokenAddress) => {
    const ercContract = getErcContract(tokenAddress);
    return Promise.all([
      ercContract.methods.symbol().call(),
      ercContract.methods.name().call(),
      ercContract.methods.decimals().call(),
    ]).then(([symbol, name, decimals]) => ({
      symbol,
      name,
      decimals: parseInt(decimals, 10),
      tokenAddress,
    })).catch(() => null);
  }, [web3]);

  const getCurrentAccountBorrowPower = useCallback(() => {
    if (!accountsContract || !currentAccount) return Promise.resolve('0');
    return accountsContract.methods.getBorrowPower(currentAccount).call();
  }, [web3, currentAccount, accountsContract]);

  return {
    web3,
    isInited,
    accounts,
    currentAccount,
    init: () => {
      const instance = init(updateAccounts);
      setWeb3(instance.web3);
      setAccountsContract(instance.accountsContract);
      setDefinerContract(instance.definerContract);
      setSavingBankContract(instance.savingBankContract);
      setInstanceMethods(instance.instanceMethods);
      setInited(true);
    },
    connect: () => {
      console.log('user connect wallet');
      instanceMethods.connect().catch((e) => {
        // if (e.code === 4001) {
        //   message.error(t('web3_user_reject'));
        // }
        if (e.code === -1) {
          message.error(t('web3_not_init'));
        }
      });
    },
    getCurrentAccountBorrowPower,
    getCurrentAccountTokenDepositBalance,
    getCurrentAccountTokenBorrowBalance,
    getContract,
    getErcContract,
    getCurrentAccountTokenWalletBalance,
    getCurrentAccountTokenAllowance,
    getPoolAmount,
    approveCurrentAccountToken,
    estimateDefinerContractGas,
    sendDefinerContractMethod,
    getTokenData,
  };
}

const Web3 = createContainer(useWeb3);

export default Web3;
