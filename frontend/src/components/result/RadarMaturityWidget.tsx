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
  // Машинное имя с номером, например "01_org_structure"
  key: string;
  // Человекочитаемое имя с номером, например "01 Организационная структура"
  title: string;
  // Текущий/целевой уровень (0..5, допускается шаг 0.1)
  current: number;
  target: number;
  // Дополнительно — вес направления (опционально)
  weight?: number;
};

// Пропсы виджета
export type RadarMaturityWidgetProps = {
  directions: DirectionPoint[];         // 16 направлений
  max?: number;                          // default 5
  min?: number;                          // default 0
  stepMajor?: number;                    // крупный шаг сетки по радиусу (по умолчанию 1)
  seriesLabels?: { current: string; target: string }; // локализация подписей легенды
  height?: number;                       // высота контейнера (px)
  // Кастомные цвета серий
  colors?: {
    current: string; // обводка и заливка текущего
    target: string;  // обводка и заливка целевого
  };
  // Переопределение форматтера подписи осей (если захотите укоротить подписи)
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
    axis: d.title, // подпись на оси
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

  // Полосы радиальной оси: [min..max] с шагом stepMajor
  const ticks: number[] = [];
  for (let v = min; v <= max + 1e-9; v += stepMajor) ticks.push(Number(v.toFixed(2)));

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
            tickCount={ticks.length}
            ticks={ticks}
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
            formatter={(value: any, name: any, props: any) => {
              // показываем число с точностью до 0.1
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
  key: string;              // без номера, например "org_structure"
  title: string;            // без номера, например "Организационная структура"
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

// -------------------------
// Пример использования:
// -------------------------
// const raw: RawDirection[] = [
//   { key: 'org_structure', title: 'Организационная структура', current: 2.7, target: 3.6 },
//   { key: 'it_asset_mgmt', title: 'Управление ИТ-активами', current: 2.9, target: 3.2 },
//   { key: 'risk_based', title: 'Риск‑ориентированный подход', current: 2.4, target: 3.0 },
//   { key: 'security_arch', title: 'Архитектура КБ', current: 1.8, target: 2.5 },
//   { key: 'security_strategy', title: 'Стратегия КБ', current: 2.2, target: 3.1 },
//   { key: 'metrics_reporting', title: 'Отчётность и метрики', current: 1.9, target: 2.8 },
//   { key: 'change_mgmt', title: 'Управление изменениями', current: 2.1, target: 2.9 },
//   { key: 'access_mgmt', title: 'Управление доступом', current: 2.6, target: 3.4 },
//   { key: 'network_security', title: 'Сетевая безопасность', current: 2.0, target: 3.0 },
//   { key: 'endpoint_security', title: 'Безопасность конечных устройств', current: 1.7, target: 2.7 },
//   { key: 'data_security', title: 'Безопасность данных', current: 2.3, target: 3.3 },
//   { key: 'soc_monitoring', title: 'Мониторинг КБ', current: 1.6, target: 2.6 },
//   { key: 'vuln_mgmt', title: 'Управление уязвимостями', current: 2.2, target: 3.2 },
//   { key: 'pentesting', title: 'Тесты на проникновение', current: 1.8, target: 2.8 },
//   { key: 'incident_mgmt', title: 'Управление инцидентами КБ', current: 2.0, target: 3.0 },
//   { key: 'security_culture', title: 'Культура КБ', current: 1.5, target: 2.5 }
// ];
//
// const numbered = withNumbering(raw);
//
// <RadarMaturityWidget
//   directions={numbered}
//   max={5}
//   min={0}
//   stepMajor={1}
//   seriesLabels={{ current: 'Текущий уровень', target: 'Целевой уровень' }}
//   colors={{ current: '#E85D5D', target: '#33A6FF' }}
// />
