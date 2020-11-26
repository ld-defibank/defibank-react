import Decimal from 'decimal.js-light';

function factorialize(num) {
  if (num === 1 || num === 0) {
    return 1;
  }
  return (num * factorialize(num - 1));
}

function cumulate(num) {
  if (num === 1) return 1;
  return num + cumulate(num - 1);
}

function t100(v) {
  if (!v) return 0;
  return new Decimal(v).times(100).toNumber();
}

function d100(v) {
  if (!v) return 0;
  return new Decimal(v).div(100).toNumber();
}

export {
  factorialize,
  cumulate,
  t100,
  d100,
};
