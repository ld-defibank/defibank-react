import zhCn from './zh-cn.json';
import en from './en.json';

const defaultLang = zhCn;

const I18N = {
  'zh-cn': zhCn,
  en: {
    ...defaultLang,
    ...en,
  },
};

export default I18N;
