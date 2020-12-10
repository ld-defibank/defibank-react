/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useCallback } from 'react';
import I18n from '@models/i18n';
import { Spin } from '@common/antd';
import SitePage from '@common/sitePage';
import message from '@utils/message';
import MarketInfo from './market';
import './style.scss';

function Index() {
  const { t } = I18n.useContainer();

  return (
    <SitePage id="index">
      <MarketInfo />
    </SitePage>
  );
}


export default Index;
