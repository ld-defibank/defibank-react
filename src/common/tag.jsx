import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import './tag.scss';


export default function Tag({ children, color }) {
  return (
    <span className={classnames('ez-tag', color)}>{children}</span>
  );
}
