import React from 'react';
import classnames from 'classnames';
import './table.scss';

export default function Table({ dataSource, columns, rowKey, className, onRowClick }) {

  return (
    <div className={classnames('ez-table', className)}>
      <div className="thead">
        <div className="tr">
          {columns.map(col => (
            <div className={classnames('th', col.className)} key={col.key}>{col.title}</div>
          ))}
        </div>
      </div>
      <div className="tbody">
        {dataSource.map(row => (
          <div className="tr" key={row[rowKey]} onClick={() => onRowClick && onRowClick(row)}>
            {columns.map(col => (
              <div className={classnames('td', col.className)} key={col.key} {...(col.props || {})}>{col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}</div>
            ))}
          </div>
        ))}
        {(!dataSource || dataSource.length === 0) && (
          <div className="tr empty">No Data</div>
        )}
      </div>
    </div>
  );
}
