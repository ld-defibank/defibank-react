import React from 'react';
import classnames from 'classnames';

export default function SitePage({ id, header, children, className }) {
  return (
    <div id={id} className={classnames('site-page', className)}>
      <div className="site-page-header">{header}</div>
      <div className="site-content">{children}</div>
    </div>
  );
}
