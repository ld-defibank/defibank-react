import React from 'react';

export default function SitePage({ id, header, children }) {
  return (
    <div id={id} className="site-page">
      <div className="site-page-header">{header}</div>
      <div className="site-content">{children}</div>
    </div>
  );
}
