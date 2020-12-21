import React, { useState, useEffect } from 'react';

export default function CreateOverview({ title, rows = [] }) {
  return (
    <div className="business-create-overview">
      <div className="title">{title}</div>
      <div className="rows">
        {rows.map(row => (
          <div className="row" key={row.label}>
            <div className="label tx-gray">{row.label}</div>
            <div className="value">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
