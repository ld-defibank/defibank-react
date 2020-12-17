import React, { useState, useEffect, useCallback } from 'react';
import { fromAmountToFixedAmount, fromFixedAmountToAmount, times10, standardNumber } from '@utils/';
import { Slider } from '@common/antd';

const marks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%',
};

function getSliderPercent(amount, maxAmount) {
  if (!amount || !maxAmount) return 0;
  const fAmount = parseFloat(amount);
  const fMaxAmount = parseFloat(maxAmount);
  if (!fMaxAmount) return 0;
  if (fAmount > fMaxAmount) return 100;
  if (fAmount < 0) return 0;
  return parseInt(fAmount / fMaxAmount * 100, 10);
}

function parseAmountString(amount, tokenInfo) {
  const num = fromAmountToFixedAmount(fromFixedAmountToAmount(amount, tokenInfo), tokenInfo, Infinity);
  const output = standardNumber(num);
  return output;
}

export default function CreatePad({ title, tokenInfo, balance, price, amount, onAmountChange, hasMax, maxAmount, opts = [], extra }) {
  const handleAmountChange = useCallback((e) => {
    const { value } = e.target;
    if (value === '') {
      onAmountChange('');
      return;
    }
    const numValue = value.replace(/[^0-9.]/g, '') || '0';
    const [intValue, decValue] = numValue.split('.');
    const sIntValue = parseInt(intValue, 10).toString();
    let str;
    if (decValue === undefined) {
      str = sIntValue;
    } else if (decValue === '') {
      str = `${sIntValue}.`;
    } else {
      str = `${sIntValue}.${decValue}`;
    }
    onAmountChange(str);
  }, [amount, onAmountChange]);

  const handleMaxClick = useCallback(() => {
    onAmountChange(maxAmount);
  }, [onAmountChange, maxAmount]);

  const handleSliderChange = useCallback((percent) => {
    if (!maxAmount) return;
    if (percent === 0) {
      onAmountChange('');
      return;
    }
    if (percent === 0) {
      onAmountChange(maxAmount);
    }
    onAmountChange(fromAmountToFixedAmount(fromFixedAmountToAmount(parseFloat(maxAmount) * percent / 100, tokenInfo), tokenInfo, Infinity));
  }, [onAmountChange, maxAmount, amount, tokenInfo]);

  const handleAfterAmountChange = useCallback(() => {
    if (!amount) return;
    const parsed = parseAmountString(amount, tokenInfo);
    onAmountChange(parsed);
  }, [onAmountChange, amount, tokenInfo]);

  const sliderPercent = getSliderPercent(amount, maxAmount);
  return (
    <div className="business-create-pad">
      <div className="title">{title}</div>
      <div className="balance">
        <span>{fromAmountToFixedAmount(balance, tokenInfo, 2)}</span>
        <span className="symbol">{tokenInfo && tokenInfo.symbol}</span>
      </div>
      <div className="balance-value">
        {`$ ${(parseFloat(fromAmountToFixedAmount(balance, tokenInfo, Infinity)) * price).toFixed(2)}`}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          onBlur={handleAfterAmountChange}
          placeholder="0.00"
        />
        {hasMax && (<button className="max-btn" onClick={handleMaxClick}>MAX</button>)}
        <span className="icon">
          <svg aria-hidden="true">
            <use xlinkHref={'#icon-' + tokenInfo.symbol} />
          </svg>
        </span>
        <span className="symbol">{tokenInfo.symbol}</span>
      </div>
      <div className="slider-container">
        <Slider tipFormatter={v => `${v}%`} marks={marks} value={sliderPercent} onChange={handleSliderChange} onAfterChange={handleAfterAmountChange} />
      </div>
      {extra}
      <div className="opts">
        {opts.map(opt => (
          <button key={opt.key} onClick={opt.onClick} {...opt.props}>{opt.text}</button>
        ))}
      </div>
    </div>
  );
}
