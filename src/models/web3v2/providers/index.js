/* eslint-disable prefer-promise-reject-errors */
import initMetamask from './metamask';

export default function init(provider) {
  if (provider === 'metamask') {
    return initMetamask();
  }
  return Promise.reject({ code: -1 });
}
