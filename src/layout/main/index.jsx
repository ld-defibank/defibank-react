import React from 'react';
import { withRouter } from 'react-router-dom';

import './style.scss';

function Main({ children }) {
  return (
    <div id="main">
      {children}
    </div>
  );
}

export default withRouter(Main);
