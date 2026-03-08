// frontend/src/pages/PublicSurveyResultsPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublicSurveyResultsByToken } from '../services/api';
import RadarMaturityWidget, { withNumbering } from '../components/result/RadarMaturityWidget';
import type { DirectionPoint } from '../components/result/RadarMaturityWidget';

type SectionRating = {
  score?: number;
  sectionKey?: string;
  title?: string;
  name?: string;
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

  // 1) Берём answers для возможного фоллбека
  const answers: Record<string, any> = useMemo(() => {
    return (
      (data as any)?.answers ||
      (data as any)?.response?.answers ||
      (data as any)?.result?.answers ||
      (data as any)?.SurveyResponse?.answers ||
      {}
    );
  }, [data]);

  // 2) Пытаемся найти секционные метрики (если backend их отдаёт)
  const sectionRatings: Record<string, SectionRating> | undefined = useMemo(() => {
    const candidates: any[] = [
      (data as any)?.results?.sectionRatings,
      (data as any)?.results?.sections,
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

  // 3) Список направлений (названия).
  // Если секции пришли — используем их.
  // Если нет — используем ФИКСИРОВАННЫЕ 16 направлений из методики.
  const baseDirections = useMemo(() => {
    const keysFromRatings = sectionRatings
      ? Object.entries(sectionRatings).map(([key, sr]) => ({
          key,
          title: sr.sectionKey || sr.title || sr.name || key
        }))
      : null;
    return (
      keysFromRatings || [
        { key: 'org_structure',      title: 'Организационная структура' },
        { key: 'it_asset_mgmt',      title: 'Управление ИТ‑активами' },
        { key: 'risk_based',         title: 'Риск‑ориентированный подход' },
        { key: 'security_arch',      title: 'Архитектура КБ' },
        { key: 'security_strategy',  title: 'Стратегия КБ' },
        { key: 'metrics_reporting',  title: 'Отчётность и метрики' },
        { key: 'change_mgmt',        title: 'Управление изменениями' },
        { key: 'access_mgmt',        title: 'Управление доступом' },
        { key: 'network_security',   title: 'Сетевая безопасность' },
        { key: 'endpoint_security',  title: 'Безопасность конечных устройств' },
        { key: 'data_security',      title: 'Безопасность данных' },
        { key: 'soc_monitoring',     title: 'Мониторинг КБ' },
        { key: 'vuln_mgmt',          title: 'Управление уязвимостями' },
        { key: 'pentesting',         title: 'Тесты на проникновение' },
        { key: 'incident_mgmt',      title: 'Управление инцидентами КБ' },
        { key: 'security_culture',   title: 'Культура КБ' },
      ]
    );
  }, [sectionRatings]);

  // 4) Формируем три серии:
  // - sanitary: минимальная планка (1.0)
  // - target: фикс 4.0
  // - responses: из секций (если есть), иначе демо 1.0..3.5
  const radarDirections: DirectionPoint[] = useMemo(() => {
    const rows: Array<{ key: string; title: string; sanitary: number; target: number; responses: number }> = [];

    // Подготовим "responses" из данных, если доступны
    const responsesByKey: Record<string, number> = {};
    if (sectionRatings) {
      for (const [key, sr] of Object.entries(sectionRatings)) {
        const raw = typeof sr.score === 'number' ? sr.score : 0;
        // нормализуем в шкалу 0..5 (если вдруг приходит 0..10)
        const val = raw > 5 ? Math.min(5, raw / 2) : Math.max(0, Math.min(5, raw));
        responsesByKey[key] = val;
      }
    } else {
      // Демо-значения 1.0..3.5 (циклом по направлениям)
      const demoValues = [1.0, 1.4, 1.8, 2.2, 2.6, 3.0, 3.3, 3.5];
      baseDirections.forEach((d, i) => {
        responsesByKey[d.key] = demoValues[i % demoValues.length];
      });
    }

    for (const d of baseDirections) {
      rows.push({
        key: d.key,
        title: d.title,
        sanitary: 1.0,
        target: 4.0,
        responses: responsesByKey[d.key] ?? 2.0
      });
    }

    return withNumbering(rows);
  }, [baseDirections, sectionRatings]);

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

        {/* Summary */}
        <div style={{ marginTop: 16, display: 'flex', gap: 24, alignItems: 'baseline' }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{ratingNum}</div>
          <div style={{ opacity: 0.7 }}>/ 10</div>
          {band ? <div style={{ padding: '2px 8px', border: '1px solid #ddd', borderRadius: 6 }}>{band}</div> : null}
          {riskLevel ? <div style={{ opacity: 0.8 }}>Уровень риска: <b>{riskLevel}</b></div> : null}
        </div>

        {/* Диаграмма по разделам */}
        <div style={{ marginTop: 20, marginBottom: 12 }}>
          <RadarMaturityWidget
            directions={radarDirections}
            max={5}
            min={0}
            stepMajor={1}
            seriesLabels={{ sanitary: 'Санитарная', target: 'Целевая (4.0)', responses: 'Ответы' }}
            colors={{ sanitary: '#D9534F', target: '#3CB371', responses: '#1E88E5' }}
            height={420}
            angleFormatter={(label) => label.replace(/^\d+\s/, '')}
          />
          {!sectionRatings ? (
            <div style={{ marginTop: 8, opacity: 0.7, fontSize: 12 }}>
              Показаны демонстрационные значения для серии «Ответы» (1.0–3.5). Когда сервер начнёт отдавать секционные оценки, диаграмма подставит реальные данные автоматически.
            </div>
          ) : null}
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
