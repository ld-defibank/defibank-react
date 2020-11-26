import React from 'react';
import { Input } from '@common/antd';

let handler;
let lastInputTime = new Date().getTime();
const TIME_SPAN = 500;

export default function SearchInput({ onChange, onSearch, ...rest }) {
  const handleModalInputChange = (e) => {
    const v = e.target.value;
    const time = new Date().getTime();
    if (time - lastInputTime < TIME_SPAN && handler) {
      clearTimeout(handler);
    }
    onChange(v);
    lastInputTime = time;
    handler = setTimeout(() => {
      onSearch(v);
    }, TIME_SPAN);
  };

  return (
    <Input
      onChange={handleModalInputChange}
      {...rest}
    />
  );
}
