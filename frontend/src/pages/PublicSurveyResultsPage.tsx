// frontend/src/pages/PublicSurveyResultsPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublicSurveyResultsByToken } from '../services/api';
import RadarMaturityWidget, { withNumbering } from '../components/result/RadarMaturityWidget';
import type { DirectionPoint } from '../components/result/RadarMaturityWidget';

type SectionRating = {
  score?: number;
  rating?: string | null;
  weight?: number;
  sectionKey?: string;
  answeredCount?: number;
  questionCount?: number;
  missingRequiredIds?: string[];
};

export function PublicSurveyResultsPage() {
  const { token } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr(null);
        if (!token) throw new Error('No token');
        const d = await getPublicSurveyResultsByToken(token);
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

  const answers: Record<string, any> = useMemo(() => {
    return (
      (data as any)?.answers ||
      (data as any)?.response?.answers ||
      (data as any)?.result?.answers ||
      (data as any)?.SurveyResponse?.answers ||
      {}
    );
  }, [data]);

  const sectionRatings: Record<string, SectionRating> | undefined =
    (data?.results && data?.results.sectionRatings) ||
    (data as any)?.response?.results?.sectionRatings ||
    (data as any)?.SurveyResponse?.results?.sectionRatings;

  const ratingNum: number = useMemo(() => {
    const r = data?.rating;
    const n = typeof r === 'string' ? Number(r) : (r ?? 0);
    return Number.isFinite(n) ? Number(n) : 0;
  }, [data]);

  const band: string = (data?.band as string) || '';
  const riskLevel: string = (data?.riskLevel as string) || '';

  // Данные для радиальной диаграммы по разделам
  const radarDirections: DirectionPoint[] = useMemo(() => {
    if (!sectionRatings) return [];
    const rows: Array<{ key: string; title: string; current: number; target: number }> = [];

    for (const [key, sr] of Object.entries(sectionRatings)) {
      const title = sr.sectionKey || key;
      let sc = typeof sr.score === 'number' && Number.isFinite(sr.score) ? sr.score : 0;
      const current = sc > 5 ? Math.min(5, sc / 2) : Math.max(0, Math.min(5, sc));
      rows.push({
        key,
        title,
        current,
        target: current,
      });
    }

    return withNumbering(rows);
  }, [sectionRatings]);

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
          <button className="btn btn-outline" onClick={() => setShowRaw((v) => !v)} type="button">
            {showRaw ? 'Скрыть сырой ответ' : 'Показать сырой ответ API'}
          </button>
        </div>

        {/* Summary: общий рейтинг/бенд/риск */}
        <div style={{ marginTop: 16, display: 'flex', gap: 24, alignItems: 'baseline' }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{ratingNum}</div>
          <div style={{ opacity: 0.7 }}>/ 10</div>
          {band ? <div style={{ padding: '2px 8px', border: '1px solid #ddd', borderRadius: 6 }}>{band}</div> : null}
          {riskLevel ? <div style={{ opacity: 0.8 }}>Уровень риска: <b>{riskLevel}</b></div> : null}
        </div>

        {/* Диаграмма по разделам (до "Ваши ответы") */}
        {radarDirections.length > 0 ? (
          <div style={{ marginTop: 20, marginBottom: 12 }}>
            <RadarMaturityWidget
              directions={radarDirections}
              max={5}
              min={0}
              stepMajor={1}
              seriesLabels={{ current: 'Текущий', target: 'Целевой' }}
              colors={{ current: '#E85D5D', target: '#33A6FF' }}
              height={420}
              angleFormatter={(label) => label.replace(/^\d+\s/, '')}
            />
          </div>
        ) : null}

        {/* Секции (детализация) */}
        {sectionRatings ? (
          <div style={{ marginTop: 20 }}>
            <h3>Разделы</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {Object.entries(sectionRatings).map(([key, sr]) => (
                <div key={key} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>
                    {sr.sectionKey || key}
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div>Ответов: {sr.answeredCount ?? 0}/{sr.questionCount ?? 0}</div>
                    <div>Оценка: {sr.score ?? 0}</div>
                    {sr.missingRequiredIds && sr.missingRequiredIds.length > 0 ? (
                      <details>
                        <summary>Обязательные без ответа ({sr.missingRequiredIds.length})</summary>
                        <ul style={{ marginTop: 6 }}>
                          {sr.missingRequiredIds.map((id) => (
                            <li key={id}>{id}</li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

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
                  <div style={{ flex: 1 }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Сырой ответ для диагностики */}
        {showRaw ? (
          <>
            <h3 style={{ marginTop: 20 }}>Сырой ответ API</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre>
          </>
        ) : null}

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <Link to={`/`} className="btn">На главную</Link>
        </div>
      </div>
    </div>
  );
}
