import React from 'react';
import classnames from 'classnames';
import FormattedMessage from './formattedMessage';

import './sitePage.scss';

export default function SitePage({ id, header, children, className }) {
  return (
    <div id={id} className={classnames('site-page', className)}>
      <div className="site-page-header">{header}</div>
      <div className="site-content">{children}</div>
      <div className="site-footer">
        <div className="links">
          <a href="">Twitter</a>
          <a href="">Facebook</a>
          <a href="">Telegram</a>
          <a href="">Medium</a>
          <a href="">Reddit</a>
        </div>
        <div className="right"><FormattedMessage id="footer_right" />{' '}<FormattedMessage id="footer_version" data={{ version: __VERSION__ }} /></div>
      </div>
    </div>
  );
}
