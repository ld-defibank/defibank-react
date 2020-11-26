import config from './config';

function getTimestamp() {
  const ts = new Date().getTime();
  // PRD环境每6分钟更新一次CDN
  return parseInt(ts / (config.PROXY_DOMAIN ? 60000 : 360000), 10);
}

const QUERYS = {
  STATE_CODE: '/static/state_code.json',
  LOGIN_TOKEN: () => `/api/v1/user_login_token.json?_=${new Date().getTime()}`,
  LOGIN: '/api/v1/user_login.json',
  USER_INFO: '/api/v1/user/me.json',
  UPLOAD_ATTACHMENT: '/api/v1/upload_attachment.json',
  CONNECT_MEDIUM: token => `/auth/medium?token=${token}`,
};

const { API } = config;

Object.keys(QUERYS).forEach((key) => {
  const api = API || '';

  if (typeof QUERYS[key] === 'string') {
    QUERYS[key] = api + QUERYS[key];
  } else if (typeof QUERYS[key] === 'function') {
    const tmp = QUERYS[key];
    QUERYS[key] = (...args) => api + tmp(...args);
  }
});

export default QUERYS;
