import '@babel/polyfill';
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Clipboard from 'clipboard';
import Router from './router';
// import models from '../models';
import message from './utils/message';

import './style.scss';

const seed = new Date().getTime();

window.SEED = seed;

window.clipboard = new Clipboard('.clipboard-target');
window.clipboard.on('success', (e) => {
  message.success('复制成功');
  e.clearSelection();
});

window.clipboard.on('error', () => {
  message.success('复制失败');
});

function render() {
  ReactDOM.render(
    <Router />,
    document.getElementById('root'),
  );
}

$(() => {
  render();
});
