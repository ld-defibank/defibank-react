import qs from 'qs';
import $ from 'jquery';
import message from './message';
import { storage } from './index';

function getAjaxPromise(options) {
  return new Promise((resolve) => {
    $.ajax(options).done((data) => {
      if (data.success) {
        resolve(data.data);
      } else if (data.msg) {
        message.error(data.msg);
      }
    });
  });
}

const privateFetch = {
  get(url, data, options = {}) {
    let queryUrl = url;
    if (data) {
      const params = qs.stringify({ ...data, locale: window.locale });
      queryUrl += '?' + params;
    }
    return getAjaxPromise({
      ...options,
      url: queryUrl,
      dataType: 'json',
    });
  },
  post(url, data = {}, options = {}) {
    const body = {
      // utf8: '✓',
      locale: window.locale,
      ...data,
    };
    return getAjaxPromise({
      ...options,
      url,
      dataType: 'json',
      contentType: 'application/json',
      method: 'POST',
      data: JSON.stringify(body),
    });
  },
  delete(url, data = {}, options = {}) {
    const body = {
      // utf8: '✓',
      locale: window.locale,
      ...data,
    };
    return getAjaxPromise({
      ...options,
      url,
      dataType: 'json',
      contentType: 'application/json',
      method: 'DELETE',
      data: JSON.stringify(body),
    });
  },
  ajax(jQueryAjaxOptions) {
    return getAjaxPromise({
      ...jQueryAjaxOptions,
    });
  },
};

const fetch = {
  private: privateFetch,
  get(url, data, options = {}) {
    let queryUrl = url;
    if (data) {
      const params = qs.stringify({ ...data, locale: window.locale });
      queryUrl += '?' + params;
    }
    return getAjaxPromise({
      ...options,
      url: queryUrl,
      dataType: 'json',
    });
  },
  post(url, data = {}, options = {}) {
    const body = {
      // utf8: '✓',
      locale: window.locale,
      ...data,
    };
    return getAjaxPromise({
      ...options,
      url,
      dataType: 'json',
      contentType: 'application/json',
      method: 'POST',
      data: JSON.stringify(body),
    });
  },
  ajax(jQueryAjaxOptions) {
    return getAjaxPromise({
      ...jQueryAjaxOptions,
    });
  },
  jsonp(url, data) {
    let queryUrl = url;
    if (data) {
      const params = qs.stringify({ ...data, locale: window.locale });
      queryUrl += '?' + params;
    }
    return new Promise((resolve) => {
      $.ajax({
        url: queryUrl,
        dataType: 'jsonp',
        jsonp: 'callback',
        success: resolve,
      });
    });
  },
};

export default fetch;
