import React, { useState, useEffect } from 'react';
import classnames from 'classnames';

import './switch.scss';

export default function Switch({ checked, yesText = 'YES', noText = 'NO' }) {
  return (
    <div className="ez-switch">
      <span className={classnames('ez-switch-label', { active: checked })}>{yesText}</span>
      <span className={classnames('ez-switch-label', { active: !checked })}>{noText}</span>
    </div>
  );
}
