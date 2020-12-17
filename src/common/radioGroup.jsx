import React, { useState, useEffect } from 'react';
import classnames from 'classnames';

import './radioGroup.scss';

export default function RadioGroup({ options = [], value, onChange, optionWidth = 60, disabled = false }) {
  const checkedIndex = options.findIndex(option => option.value === value);
  const handleOptionClick = (v) => {
    if (v === value || disabled) return;
    onChange(v);
  };

  return (
    <span className={classnames('ez-radio-group', { disabled })}>
      {checkedIndex > -1 && (
        <span className="ez-radio-group-checked" style={{ width: optionWidth, left: checkedIndex * optionWidth }} />
      )}
      {options.map(option => (
        <span
          key={option.key}
          className={classnames('ez-radio-group-option', { checked: option.value === value })}
          style={{ width: optionWidth }}
          onClick={() => handleOptionClick(option.value)}
        >
          <span>{option.label || option.value}</span>
        </span>
      ))}
    </span>
  );
}
