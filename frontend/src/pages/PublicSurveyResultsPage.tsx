// frontend/src/pages/PublicSurveyResultsPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSurveyResultsByToken } from '../services/api';
import RadarMaturityWidget, { withNumbering } from '../components/result/RadarMaturityWidget';
import type { DirectionPoint, RawDirection } from '../components/result/RadarMaturityWidget';

type SectionRating = {
  score?: number;
  sectionKey?: string;
  title?: string;
  name?: string;
  answeredCount?: number;
  questionCount?: number;
  missingRequiredIds?: string[];
};

type SectionScoreDTO = {
  sectionKey: string;
  title?: string;
  sum: number;
  hygieneWindowU: number;
  targetLevel?: number;
  sanitaryLevel?: number;
};

type MaturityResultDTO = {
  CS?: number;
  hygiene2Achieved?: boolean;
  sectionScores: SectionScoreDTO[];
};

function getResultsBlock(data: any): any | undefined {
  return (
    data?.results ||
    data?.response?.results ||
    data?.result?.results ||
    data?.SurveyResponse?.results ||
    data?.respondentMeta?.results // НОВОЕ: поддержка вашего текущего payload
  );
}

// Безопасный stringify (переживает BigInt/циклы) — без неиспользуемого параметра key
function safeStringify(value: any) {
  const seen = new WeakSet();
  return JSON.stringify(
    value,
    (...args: any[]) => {
      const val = args[1];
      if (typeof val === 'bigint') return val.toString();
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
      }
      return val;
    },
    2
  );
}

// Белый список ровно из 16 направлений v3 — ключи, которые вы используете на бэке
// Белый список ровно из 16 направлений v3 — ключи, которые вы используете на бэке
const V3_SECTION_KEYS_16 = [
  'org_structure',
  'it_asset_mgmt',
  'risk_based',
  'security_architecture',
  'security_strategy',
  'reporting_metrics',
  'change_mgmt',
  'access_mgmt',
  'network_security',
  'endpoint_security',
  'data_security',
  'security_monitoring',
  'vulnerability_mgmt',
  'pentesting',
  'incident_mgmt',
  'security_culture',
] as const;

// Фильтр и упорядочивание по v3-списку
function filterDirectionsToV316<T extends { key?: string }>(items: T[]): T[] {
  if (!Array.isArray(items) || items.length === 0) return items;
  const byKey = new Map<string, T>();
  for (const it of items) {
    const k = String(it.key ?? '').trim();
    if (k) byKey.set(k, it);
  }
  const picked = V3_SECTION_KEYS_16
    .map((k) => byKey.get(k))
    .filter((x): x is T => !!x);
  return picked.length > 0 ? picked : items;
}



export function PublicSurveyResultsPage() {
  const { token } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [sourceUsed, setSourceUsed] = useState<'radarDirections' | 'maturity' | 'sectionRatings' | 'none'>('none');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setErr(null);
        if (!token) throw new Error('No token');
        const d = await getSurveyResultsByToken(token);
        if (!cancelled) setData(d);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Ошибка загрузки результатов');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Ответы пользователя
  const answers: Record<string, any> = useMemo(() => {
    return (
      (data as any)?.answers ||
      (data as any)?.response?.answers ||
      (data as any)?.result?.answers ||
      (data as any)?.SurveyResponse?.answers ||
      {}
    );
  }, [data]);

  // Секционные метрики (если backend их отдаёт отдельно)
  const sectionRatings: Record<string, SectionRating> | undefined = useMemo(() => {
    const r = getResultsBlock(data);
    const candidates: any[] = [
      r?.sectionRatings,
      r?.sections,
      (data as any)?.response?.results?.sectionRatings,
      (data as any)?.SurveyResponse?.results?.sectionRatings,
    ].filter(Boolean);
    const first = candidates[0];
    if (!first) return undefined;
    if (Array.isArray(first)) {
      const map: Record<string, SectionRating> = {};
      for (const it of first) {
        const k = it.sectionKey || it.key || it.id || it.name || it.title;
        if (!k) continue;
        map[k] = it;
      }
      return Object.keys(map).length ? map : undefined;
    }
    if (typeof first === 'object') return first;
    return undefined;
  }, [data]);

  const ratingNum: number = useMemo(() => {
    const r = data?.rating;
    const n = typeof r === 'string' ? Number(r) : (r ?? 0);
    return Number.isFinite(n) ? Number(n) : 0;
  }, [data]);

  const band: string = (data?.band as string) || '';
  const riskLevel: string = (data?.riskLevel as string) || '';

  // Сырые точки для радара (без нумерации)
  const directionsRaw: RawDirection[] = useMemo(() => {
    const r = getResultsBlock(data);

    // 1) Готовый массив для радара
      if (r?.radarDirections && Array.isArray(r.radarDirections) && r.radarDirections.length > 0) {
        setSourceUsed('radarDirections');
        const raw = r.radarDirections.map((d: any) => ({
          key: d.key,
          title: d.title,
          sanitary: d.sanitary ?? 2.0,
          target: d.target ?? 4.0,
          responses: d.responses ?? 0,
          weight: d.weight,
        }));
        // Оставляем только 16 секций v3 и упорядочиваем
        return filterDirectionsToV316(raw);
      }


    // 2) Сырые результаты зрелости: maturity.sectionScores
    const maturity: MaturityResultDTO | undefined =
      r?.maturity || data?.maturity || data?.response?.maturity || data?.result?.maturity;

      if (maturity?.sectionScores && Array.isArray(maturity.sectionScores) && maturity.sectionScores.length > 0) {
        setSourceUsed('maturity');
        const raw = maturity.sectionScores.map((s: SectionScoreDTO, idx: number): RawDirection => {
          const U = Math.max(1, Number(s.hygieneWindowU) || 0);
          const sum = Number(s.sum) || 0;
          const responses = U > 0 ? (sum / U) * 5 : 0;
          return {
            key: s.sectionKey || `sec_${idx + 1}`,
            title: s.title || `Секция ${idx + 1}`,
            sanitary: s.sanitaryLevel ?? 2.0,
            target: s.targetLevel ?? 4.0,
            responses: Number.isFinite(responses) ? Number(responses.toFixed(2)) : 0,
          };
        });
        // Оставляем только 16 секций v3 и упорядочиваем
        return filterDirectionsToV316(raw);
      }

    // 3) Fallback: строим из sectionRatings — даже если все значения 0
    if (sectionRatings && Object.keys(sectionRatings).length > 0) {
      setSourceUsed('sectionRatings');
      return Object.entries(sectionRatings).map(([key, sr], idx): RawDirection => {
        let responses = Number(sr.score ?? 0);
        if (!Number.isFinite(responses)) responses = 0;
        // Если score 0..1 — умножаем на 5 (переводим в шкалу 0..5).
        // Если score > 5 (например, проценты) — делим на 20.
        if (responses <= 1) responses *= 5;
        else if (responses > 5) responses = responses / 20;
        const title = sr.sectionKey || sr.title || sr.name || key || `Секция ${idx + 1}`;
        const k = sr.sectionKey || key || `sec_${idx + 1}`;
        return {
          key: k,
          title,
          sanitary: 2.0,
          target: 4.0,
          responses: Number(responses.toFixed(2))
        };
      });
    }

    setSourceUsed('none');
    return [];
  }, [data, sectionRatings]);

  // Нумерация для виджета
  const radarDirections: DirectionPoint[] = useMemo(
    () => withNumbering(directionsRaw),
    [directionsRaw]
  );

  // Диагностика источников
  const rDbg = useMemo(() => {
    const r = getResultsBlock(data);
    const radar = r?.radarDirections;
    const maturity = r?.maturity || data?.maturity || data?.response?.maturity || data?.result?.maturity;
    const sectionScores = maturity?.sectionScores;
    const sectionsRatingsCandidate =
      r?.sectionRatings ||
      r?.sections ||
      data?.response?.results?.sectionRatings ||
      data?.SurveyResponse?.results?.sectionRatings;

    return {
      hasResultsBlock: !!r,
      radarDirectionsLen: Array.isArray(radar) ? radar.length : 0,
      sectionScoresLen: Array.isArray(sectionScores) ? sectionScores.length : 0,
      sectionRatingsType: sectionsRatingsCandidate
        ? Array.isArray(sectionsRatingsCandidate) ? 'array' : typeof sectionsRatingsCandidate
        : 'none',
      sectionRatingsLen: Array.isArray(sectionsRatingsCandidate)
        ? sectionsRatingsCandidate.length
        : (sectionsRatingsCandidate ? Object.keys(sectionsRatingsCandidate).length : 0),
    };
  }, [data]);

  if (loading)
    return (
      <div className="page page--container">
        <div className="card">Загрузка...</div>
      </div>
    );
  if (err)
    return (
      <div className="page page--container">
        <div className="card error">Ошибка: {err}</div>
      </div>
    );
  if (!data)
    return (
      <div className="page page--container">
        <div className="card">Не найдено</div>
      </div>
    );

  return (
    <div className="page page--container">
      <div className="card">
        <div className="success" style={{ marginBottom: 12 }}>
          Ответ отправлен.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0 }}>Результаты</h2>
          <button
            className="btn btn-outline"
            onClick={() => setShowRaw((v) => !v)}
            type="button"
          >
            {showRaw ? 'Скрыть сырой ответ' : 'Показать сырой ответ API'}
          </button>
        </div>

        {/* Summary */}
        <div style={{ marginTop: 16, display: 'flex', gap: 24, alignItems: 'baseline' }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{ratingNum}</div>
          <div style={{ opacity: 0.7 }}>/ 10</div>
          {band ? <div style={{ padding: '2px 8px', border: '1px solid #ddd', borderRadius: 6 }}>{band}</div> : null}
          {riskLevel ? <div style={{ opacity: 0.8 }}>Уровень риска: <b>{riskLevel}</b></div> : null}
        </div>

        {/* Диаграмма по разделам */}
        <div style={{ marginTop: 20, marginBottom: 12 }}>
          {radarDirections.length === 0 ? (
            <div style={{ opacity: 0.8 }}>Недостаточно данных для построения диаграммы.</div>
          ) : (
            <>
              <RadarMaturityWidget
                directions={radarDirections}
                max={5}
                min={0}
                stepMajor={1}
                seriesLabels={{ sanitary: 'Санитарная (2.0)', target: 'Целевая (4.0)', responses: 'Ответы' }}
                colors={{ sanitary: '#D9534F', target: '#3CB371', responses: '#1E88E5' }}
                height={420}
                angleFormatter={(label) => label.replace(/^\d+\s/, '')}
              />
              <div style={{ marginTop: 8, opacity: 0.7, fontSize: 12 }}>
                Источник данных радара: <b>{sourceUsed}</b>
              </div>
              <div style={{ marginTop: 8, opacity: 0.6, fontSize: 12 }}>
                Debug: results={String(rDbg.hasResultsBlock)}; radarDirections={rDbg.radarDirectionsLen};
                sectionScores={rDbg.sectionScoresLen}; sectionRatings=({rDbg.sectionRatingsType}) {rDbg.sectionRatingsLen}
              </div>
            </>
          )}
        </div>

        {/* Ответы пользователя */}
        <div style={{ marginTop: 20 }}>
          <h3>Ваши ответы</h3>
          {Object.keys(answers).length === 0 ? (
            <div style={{ opacity: 0.8 }}>
              Ответы не найдены в payload API. Убедитесь, что сервер возвращает поле <code>answers</code>.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {Object.entries(answers).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 8 }}>
                  <div style={{ minWidth: 220, fontWeight: 500 }}>{k}</div>
                  <div style={{ flex: 1 }}>{typeof v === 'object' ? safeStringify(v) : String(v)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Сырой ответ для диагностики */}
        {showRaw ? (
          <>
            <h3 style={{ marginTop: 20 }}>Сырой ответ API</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{safeStringify(data)}</pre>
          </>
        ) : null}

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <Link to={`/`} className="btn">На главную</Link>
        </div>
      </div>
    </div>
  );
}
