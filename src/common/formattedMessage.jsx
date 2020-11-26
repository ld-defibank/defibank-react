import React from 'react';
import I18n from '../models/i18n';

function FormattedMessage({
  id, data = {}, className, ...rest
}) {
  const i18n = I18n.useContainer();
  let text = i18n.i18n[id];
  if (!text) {
    text = id;
    console.warn('Missing i18n tag: ' + id);
  }
  Object.keys(data).forEach((key) => {
    const reg = new RegExp(`{${key}}`, 'ig');
    text = text.replace(reg, data[key]);
  });
  return (
    <span className={className} {...rest}>{text}</span>
  );
}

export default FormattedMessage;
