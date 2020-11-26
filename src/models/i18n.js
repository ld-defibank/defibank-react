import { useState, useCallback } from 'react';
import { createContainer } from 'unstated-next';
import i18NJson from '../i18n';
import { storage } from '../utils';

window.locale = storage('LOCAL') || 'zh-cn';
window.i18n = i18NJson[window.locale];

const defaultStates = {
  locale: window.locale,
  i18n: window.i18n,
};

function useI18N(customInitialStates = {}) {
  const initialStates = {
    ...defaultStates,
    ...customInitialStates,
  };
  const [locale, setLocale] = useState(initialStates.locale);
  const [i18n, setI18n] = useState(initialStates.i18n);

  const t = useCallback((id, data = {}) => {
    let text = window.i18n[id];
    if (!text) {
      text = id;
      console.warn('Missing i18n tag: ' + id);
    }
    if (typeof data === 'object') {
      Object.keys(data).forEach((key) => {
        const reg = new RegExp(`{${key}}`, 'ig');
        text = text.replace(reg, data[key]);
      });
    }
    return text;
  }, [locale]);

  t.try = (id, data, defaultId, defaultData) => {
    const text = window.i18n[id];
    if (text) return t(id, data);
    if (typeof data === 'object') {
      if (defaultData) return t(defaultId, defaultData);
      return t(defaultId, data);
    }
    return t(data, defaultId);
  };

  return {
    locale,
    i18n,
    t,
    setLocale: (payload) => {
      const selectedI18n = i18NJson[payload];
      if (i18n) {
        // 一些全局變量以及LocalStorage
        window.locale = payload;
        window.i18n = selectedI18n;
        storage('LOCAL', payload);
        setLocale(payload);
        setI18n(selectedI18n);
      }
    },
  };
}

const I18N = createContainer(useI18N);

export default I18N;
