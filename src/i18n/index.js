import zhCn from './zh-cn.json';
import en from './en.json';

const defaultLang = en;

const I18N = {
  en,
  'zh-cn': {
    ...defaultLang,
    ...zhCn,
  },
};

export default I18N;
