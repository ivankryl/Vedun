// frontend/src/components/result/RadarMaturityWidget.tsx
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

// Тип одной записи (направления) — теперь 3 серии: sanitary, target, responses
export type DirectionPoint = {
  key: string;
  title: string;
  sanitary: number;   // "санитарная" минимальная планка
  target: number;     // "целевая" (например, 4.0)
  responses: number;  // фактические ответы (или демо)
  weight?: number;
};

export type RadarMaturityWidgetProps = {
  directions: DirectionPoint[];
  max?: number;
  min?: number;
  stepMajor?: number;
  seriesLabels?: { sanitary: string; target: string; responses: string };
  height?: number;
  colors?: {
    sanitary: string;
    target: string;
    responses: string;
  };
  angleFormatter?: (label: string, index: number) => string;
};

function clamp01(x: number, min: number, max: number) {
  if (Number.isNaN(x)) return min;
  return Math.max(min, Math.min(max, Math.round(x * 10) / 10));
}

function toChartData(directions: DirectionPoint[], min: number, max: number) {
  return directions.map((d) => ({
    axis: d.title,
    sanitary: clamp01(d.sanitary, min, max),
    target: clamp01(d.target, min, max),
    responses: clamp01(d.responses, min, max),
    key: d.key
  }));
}

const RadarMaturityWidget: React.FC<RadarMaturityWidgetProps> = ({
  directions,
  max = 5,
  min = 0,
  stepMajor = 1,
  seriesLabels = { sanitary: 'Санитарная', target: 'Целевая', responses: 'Ответы' },
  height = 420,
  colors = { sanitary: '#D9534F', target: '#3CB371', responses: '#1E88E5' },
  angleFormatter
}) => {
  const data = toChartData(directions, min, max);
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
          {/* Санитарная — тонкая красная линия */}
          <Radar
            name={seriesLabels.sanitary}
            dataKey="sanitary"
            stroke={colors.sanitary}
            fill={colors.sanitary}
            fillOpacity={0.06}
            strokeWidth={1}
            dot={false}
            isAnimationActive={false}
          />
          {/* Целевая — тонкая зелёная линия */}
          <Radar
            name={seriesLabels.target}
            dataKey="target"
            stroke={colors.target}
            fill={colors.target}
            fillOpacity={0.08}
            strokeWidth={1}
            dot={false}
            isAnimationActive={false}
          />
          {/* Ответы — толстая синяя линия */}
          <Radar
            name={seriesLabels.responses}
            dataKey="responses"
            stroke={colors.responses}
            fill={colors.responses}
            fillOpacity={0.18}
            strokeWidth={3}
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
  sanitary?: number;
  target?: number;
  responses?: number;
  weight?: number;
};

// Добавляет префикс номера "01 " и "01_" к title/key.
export function withNumbering(rows: RawDirection[]): DirectionPoint[] {
  return rows.map((row, idx) => {
    const n = String(idx + 1).padStart(2, '0');
    return {
      key: `${n}_${row.key}`,
      title: `${n} ${row.title}`,
      sanitary: row.sanitary ?? 1.0,
      target: row.target ?? 4.0,
      responses: row.responses ?? 2.0,
      weight: row.weight
    };
  });
}
