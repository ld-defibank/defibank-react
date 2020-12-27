import React, { useState, useEffect, useRef } from 'react';
import { times10 } from '@utils/';
import FormattedMessage from '@common/formattedMessage';

const getTag = timestamp => parseInt(new Date(timestamp).getTime() / 1000 / 60 / 60, 10);
const getRate = rate => parseFloat(times10(rate, -25, 4));
// const getRate = rate => rate;

// FIXME:
// const exp = [
//   1, 1.1, 1.1, 1.1, 1.2,
//   1.33, 1.33, 1.31, 1.2, 1.2,
//   1.22, 1.18, 1.16, 1.1, 1.1,
//   1, 1, 1, 1, 1,
//   1, 1, 1, 1, 1,
//   1, 1, 1, 1, 1,
// ];
// const rates = [];
// for (let i = 0; i < 30; i += 1) {
//   rates.push({
//     variableBorrowRate: exp[i],
//     stableBorrowRate: exp[i],
//     utilizationRate: exp[i],
//     liquidityRate: exp[i],
//   });
// }

function getData(historyData) {
  if (!historyData || historyData.length < 2) {
    return {
      variableBorrowRates: [],
      stableBorrowRates: [],
      utilizationRates: [],
      liquidityRates: [],
    };
  }

  const list = [...historyData];
  // const list = rates;
  list.reverse();

  const times = list.map(row => getTag(row.timestamp));
  const variableBorrowRates = list.map(row => getRate(row.variableBorrowRate));
  const stableBorrowRates = list.map(row => getRate(row.stableBorrowRate));
  const utilizationRates = list.map(row => getRate(row.utilizationRate));
  const liquidityRates = list.map(row => getRate(row.liquidityRate));

  return {
    variableBorrowRates: variableBorrowRates.map((rate, i) => [times[i], rate]),
    stableBorrowRates: stableBorrowRates.map((rate, i) => [times[i], rate]),
    utilizationRates: utilizationRates.map((rate, i) => [times[i], rate]),
    liquidityRates: liquidityRates.map((rate, i) => [times[i], rate]),
  };
}

function getSvgPoint(point, height, width, offsetX, offsetY, paddingTop, paddingBottom) {
  const [x, y] = point;
  const useHeight = height - paddingTop - paddingBottom;
  const svgX = x / offsetX * width;
  let svgY;
  if (offsetY === 0) {
    svgY = 0.5 * useHeight + paddingTop;
  } else {
    svgY = (offsetY - y) / offsetY * useHeight + paddingTop;
  }
  return [svgX, svgY];
}

const line = (pointA, pointB) => {
  const lengthX = pointB[0] - pointA[0];
  const lengthY = pointB[1] - pointA[1];
  return {
    length: Math.sqrt(lengthX ** 2 + lengthY ** 2),
    angle: Math.atan2(lengthY, lengthX),
  };
};
const controlPoint = (current, previous, next, reverse) => {
  const p = previous || current;
  const n = next || current;
  const smoothing = 0.2;
  const o = line(p, n);
  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;
  const x = current[0] + Math.cos(angle) * length;
  const y = current[1] + Math.sin(angle) * length;
  return [x, y];
};
const bezierCommand = (point, i, a) => {
  const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
  const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
  return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
};
// const lineCommand = point => `L ${point[0]} ${point[1]}`;
function buildD(points, command) {
  const d = points.reduce((acc, point, i, a) => (i === 0
    // if first point
    ? `M ${point[0]},${point[1]}`
    // else
    : `${acc} ${command(point, i, a)}`),
  '');
  return d;
}

function DetailHistoryCard({ title, data, color, paddingTop, paddingBottom }) {
  const svg = useRef(null);
  const id = useRef(parseInt(Math.random() * 1000, 10));
  const [path, setPath] = useState('');
  const [area, setArea] = useState('');
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const $svg = svg.current;
    if (!data || data.length < 2 || !$svg) {
      setPath('');
      setArea('');
      return;
    }
    const rect = $svg.getBoundingClientRect();
    setHeight(rect.height);
    setWidth(rect.width);
    // 1. 获取x,y各自最小值
    const xs = data.map(row => row[0]);
    const ys = data.map(row => row[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const offsetX = maxX - minX;
    const offsetY = maxY - minY;
    // 2. 数据相对处理
    const relativeXs = xs.map(x => x - minX);
    const relativeYs = ys.map(y => y - minY);
    const relativePoints = relativeXs.map((x, i) => [x, relativeYs[i]]);
    // 3. 转化svg坐标
    const relativeSvgPoints = relativePoints.map(point => getSvgPoint(point, rect.height, rect.width, offsetX, offsetY, paddingTop, paddingBottom));

    const d = buildD(relativeSvgPoints, bezierCommand);
    setPath(d);
    setArea(`${d} L ${rect.width} ${rect.height} L ${0} ${rect.height} Z`);
  }, [data]);

  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="card-content">
        <svg ref={svg} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id={`historyCardChartBg${id.current}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.8} />
              <stop offset="82%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {area && <path d={area} fill={`url(#historyCardChartBg${id.current})`} stroke="none" />}
          {path && <path d={path} fill="none" stroke={color} strokeWidth="4" />}
        </svg>
      </div>
    </div>
  );
}

export default function DetailHistory({ historyData }) {
  const data = getData(historyData);

  return (
    <div className="history">
      <DetailHistoryCard
        title={<FormattedMessage id="detail_history_variable_borrow_rates" />}
        data={data.variableBorrowRates}
        color="#F52C46"
        paddingTop={10}
        paddingBottom={28}
      />
      <DetailHistoryCard
        title={<FormattedMessage id="detail_history_stable_borrow_rates" />}
        data={data.stableBorrowRates}
        color="#C7976A"
        paddingTop={10}
        paddingBottom={28}
      />
      <DetailHistoryCard
        title={<FormattedMessage id="detail_history_liquidity_rates" />}
        data={data.liquidityRates}
        color="#12B157"
        paddingTop={10}
        paddingBottom={28}
      />
    </div>
  );
}
