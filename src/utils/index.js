/* eslint-disable no-restricted-properties */
import { matchPath } from 'react-router-dom';
import moment from 'moment';
import Decimal from 'decimal.js-light';
import isMobile from './isMobile';
import CONFIG from '../config';

const {
  TOKENS,
} = CONFIG;

const STORAGE_PREFIX = 'SEKAI_';

function storage(key, value) {
  if (value) {
    return window.localStorage.setItem(STORAGE_PREFIX + key, value);
  }
  return window.localStorage.getItem(STORAGE_PREFIX + key);
}

function clearStorage(key) {
  window.localStorage.removeItem(STORAGE_PREFIX + key);
}

function fastMatchPath(pathname, path) {
  return matchPath(pathname, { path, exact: true });
}

function formatDate(date) {
  if (!date) return '';
  return moment(date).format('YYYY-MM-DD');
}

function formatDatetime(date) {
  if (!date) return '';
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

function formatTime(date) {
  if (!date) return '';
  return moment(date).format('HH:mm:ss');
}

function formatTimespan(timespan) {
  const m = parseInt(timespan / 60, 10);
  const s = timespan % 60;
  return `${m}:${s > 9 ? s : ('0' + s)}`;
}

function formatNumber(num, fixed = 2) {
  return parseFloat(num).toFixed(fixed);
}

function randomInt(min, max) {
  const span = max - min;
  const r = Math.floor(Math.random() * span);
  return r + min;
}

let uid = 0;

function getUid() {
  uid += 1;
  return uid;
}

function times10(deciaml, pow10, fixed) {
  const dec = new Decimal(deciaml).times(new Decimal(10).pow(pow10));
  if (fixed) {
    return dec.toFixed(fixed, Decimal.ROUND_DOWN);
  }
  return dec.toString();
}

function fromAmountToFixedAmount(amount, TOKEN, fixed, side = Decimal.ROUND_DOWN) {
  const {
    decimals,
  } = TOKEN;
  let f = TOKEN.fixed || 2;
  if (fixed === Infinity) {
    f = TOKEN.decimals;
  } else if (fixed !== undefined) {
    f = fixed;
  }
  return new Decimal(amount).div(new Decimal(10).pow(decimals)).toFixed(f, side);
}

function fromFixedAmountToAmount(fixedAmount, TOKEN) {
  const {
    decimals,
  } = TOKEN;
  return new Decimal(fixedAmount).times(new Decimal(10).pow(decimals)).toFixed(0, Decimal.ROUND_DOWN);
}

function isEth(tokenAddress) {
  if (!tokenAddress) return false;
  return tokenAddress.toLowerCase() === TOKENS.ETH.tokenAddress.toLowerCase();
}

function isUsdt(tokenAddress) {
  if (!tokenAddress) return false;
  return tokenAddress.toLowerCase() === TOKENS.USDT.tokenAddress.toLowerCase();
}

function formatHash(hash) {
  if (hash.length <= 12) return hash;
  const pre = hash.slice(0, 8);
  const suf = hash.slice(-4);
  return `${pre}...${suf}`;
}

function millify(num, fixed = 2, split = 3, units = ['', 'K', 'M', 'B', 'T']) {
  if (num === null) { return null; } // terminate early
  if (num === 0) { return '0'; } // terminate early
  const f = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
  const b = (num).toPrecision(2).split('e'); // get power
  const k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / split); // floor at decimals, ceiling at trillions
  const c = k < 1 ? num.toFixed(0 + f) : (num / Math.pow(10, k * split)).toFixed(1 + f); // divide by power
  const d = c < 0 ? c : Math.abs(c); // enforce -0 is 0
  const e = d + units[k]; // append power
  return e;
}

function mobileNumber(number, chinese) {
  if (!isMobile()) return number;
  let opt = [];
  if (chinese) {
    opt = [
      2,
      4,
      ['', '万', '亿', '万亿', '亿亿'],
    ];
  }
  return millify(parseFloat(number), ...opt);
}

function humanReadableNumber(num) {
  const aNum = num.toString().split('.');
  aNum[0] = aNum[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  return aNum.join('.');
}

function standardNumber(num) {
  const [intPart, decimalPart] = num.toString().split('.');
  const iIntPart = parseInt(intPart, 10);
  if (!decimalPart) return iIntPart.toString();
  const reverseDecimalPart = decimalPart.split('').reverse().join('');
  const iReverseDecimalPart = parseInt(reverseDecimalPart, 10);
  if (!iReverseDecimalPart) return iIntPart.toString();
  return `${iIntPart}.${iReverseDecimalPart.toString().split('').reverse().join('')}`;
}

export {
  isMobile,
  storage,
  clearStorage,
  fastMatchPath,
  formatDatetime,
  formatTime,
  formatDate,
  formatNumber,
  randomInt,
  formatTimespan,
  formatHash,
  getUid,
  times10,
  fromAmountToFixedAmount,
  fromFixedAmountToAmount,
  isEth,
  isUsdt,
  mobileNumber,
  humanReadableNumber,
  standardNumber,
};
