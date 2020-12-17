import React, { useState, useEffect } from 'react';
import { Modal, Spin } from '@common/antd';
import Utils from '@models/utils';

export default function GlobalLoading() {
  const {
    globalLoading,
  } = Utils.useContainer();

  return (
    <Modal
      footer={null}
      visible={globalLoading}
      closable={false}
      width={80}
      style={{
        textAlign: 'center',
      }}
    >
      <Spin />
    </Modal>
  );
}
