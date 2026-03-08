//  frontend/src/components/result/RadarMaturityWidget.tsx
import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Тип одной записи (направления)
export type DirectionPoint = {
  key: string;
  title: string;
  current: number;
  target: number;
  weight?: number;
};

// Пропсы виджета
export type RadarMaturityWidgetProps = {
  directions: DirectionPoint[];
  max?: number;
  min?: number;
  stepMajor?: number;
  seriesLabels?: { current: string; target: string };
  height?: number;
  colors?: {
    current: string;
    target: string;
  };
  angleFormatter?: (label: string, index: number) => string;
};

// Хелпер: округление до шага 0.1
function clamp01(x: number, min: number, max: number) {
  if (Number.isNaN(x)) return min;
  return Math.max(min, Math.min(max, Math.round(x * 10) / 10));
}

// Хелпер: собрать данные для Recharts
function toChartData(directions: DirectionPoint[], min: number, max: number) {
  return directions.map((d) => ({
    axis: d.title,
    current: clamp01(d.current, min, max),
    target: clamp01(d.target, min, max),
    key: d.key
  }));
}

// Виджет радиальной диаграммы зрелости
const RadarMaturityWidget: React.FC<RadarMaturityWidgetProps> = ({
  directions,
  max = 5,
  min = 0,
  stepMajor = 1,
  seriesLabels = { current: 'Текущий уровень', target: 'Целевой уровень' },
  height = 420,
  colors = { current: '#E85D5D', target: '#33A6FF' },
  angleFormatter
}) => {
  const data = toChartData(directions, min, max);

  // Количество делений радиальной оси
  const tickCount = Math.max(2, Math.floor((max - min) / stepMajor) + 1);

  return (
    <div className="radar-maturity-widget" style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RadarChart data={data} margin={{ top: 24, right: 24, bottom: 24, left: 24 }}>
          <PolarGrid radialLines={true} />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fontSize: 12 }}
            tickFormatter={angleFormatter}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[min, max]}
            tick={{ fontSize: 10 }}
            tickCount={tickCount}
          />
          <Radar
            name={seriesLabels.current}
            dataKey="current"
            stroke={colors.current}
            fill={colors.current}
            fillOpacity={0.25}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Radar
            name={seriesLabels.target}
            dataKey="target"
            stroke={colors.target}
            fill={colors.target}
            fillOpacity={0.18}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip
            formatter={(value: any, name: any) => {
              const n = typeof value === 'number' ? (Math.round(value * 10) / 10).toFixed(1) : value;
              return [n, name];
            }}
            labelFormatter={(label: any) => String(label)}
          />
          <Legend verticalAlign="top" />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarMaturityWidget;

// -------------------------
// Пример подготовки данных:
// -------------------------
export type RawDirection = {
  key: string;
  title: string;
  current: number;
  target: number;
  weight?: number;
};

// Добавляет префикс номера "01 " и "01_" к title/key.
export function withNumbering(rows: RawDirection[]): DirectionPoint[] {
  return rows.map((row, idx) => {
    const n = String(idx + 1).padStart(2, '0');
    return {
      key: `${n}_${row.key}`,
      title: `${n} ${row.title}`,
      current: row.current,
      target: row.target,
      weight: row.weight
    };
  });
}
