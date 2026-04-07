// frontend/src/components/survey/SurveyResults.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import './SurveyResults.css';

// Виджет и нумерация направлений
import RadarMaturityWidget, {
  withNumbering,
  type RawDirection,
  type DirectionPoint
} from '../result/RadarMaturityWidget';

type SectionRating = {
  score?: number; // масштаб зависит от бэка (уточните: 0..5, 0..1, 0..100)
  rating?: string | null;
  weight?: number;
  sectionKey?: string;
  answeredCount?: number;
  questionCount?: number;
  missingRequiredIds?: string[];
  title?: string;
};

type SectionScoreDTO = {
  sectionKey: string;
  title?: string;
  sum: number;           // сумма по секции (0..U)
  hygieneWindowU: number; // U (окно уровней)
  targetLevel?: number;   // опционально: целевой уровень (например, 4)
  sanitaryLevel?: number; // опционально: санитарный минимум (например, 2)
};

type MaturityResultDTO = {
  CS?: number;
  hygiene2Achieved?: boolean;
  sectionScores: SectionScoreDTO[];
};

type ApiResultsPayload = {
  rating?: number | string | null;
  band?: string | null;
  riskLevel?: string | null;
  results?: {
    // Рекомендуемый прямой формат от бэка: массив значений для радара
    radarDirections?: Array<{
      key: string;
      title: string;
      sanitary?: number;
      target?: number;
      responses?: number;
      weight?: number;
    }>;
    // Либо — сырые результаты зрелости
    maturity?: MaturityResultDTO;
    sectionRatings?: Record<string, SectionRating>;
    [k: string]: any;
  };
  SurveyResponse?: any;
  response?: any;
  result?: any;
  answers?: Record<string, any>;
  [k: string]: any;
};

export const SurveyResults: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ApiResultsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);
        const payload = await api.getSurveyResults(token);
        setData(payload ?? null);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || err?.message || 'Ошибка при загрузке результатов'
        );
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [token]);

  const ratingNum = useMemo(() => {
    const r = data?.rating;
    const n = typeof r === 'string' ? Number(r) : (r ?? 0);
    return Number.isFinite(n) ? Number(n) : 0;
  }, [data]);

  // Где искать answers — только для отображения внизу (не для расчётов)
  const answers: Record<string, any> = useMemo(() => {
    return (
      (data?.answers as Record<string, any>) ||
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

  const band = (data?.band as string | undefined) ?? '';
  const riskLevel = (data?.riskLevel as string | undefined) ?? '';

  // Адаптер: строим RawDirection[] из payload бэка
  const directionsRaw: RawDirection[] = useMemo(() => {
    const r = data?.results;

    // 1) Если бэк уже отдаёт готовые значения для радара — используем их напрямую.
    if (r?.radarDirections && Array.isArray(r.radarDirections)) {
      return r.radarDirections.map((d) => ({
        key: d.key,
        title: d.title,
        sanitary: d.sanitary ?? 2.0,
        target: d.target ?? 4.0,
        responses: d.responses ?? 0,
        weight: d.weight
      }));
    }

    // 2) Если есть сырые sectionScores: responses = (sum / U) * 5
    const maturity: MaturityResultDTO | undefined = r?.maturity;
    if (maturity?.sectionScores && Array.isArray(maturity.sectionScores)) {
      return maturity.sectionScores.map((s: SectionScoreDTO, idx: number): RawDirection => {
        const U = Math.max(1, s.hygieneWindowU || 0);
        const responses = (s.sum / U) * 5;
        const title = s.title || `Секция ${idx + 1}`;
        return {
          key: s.sectionKey || `sec_${idx + 1}`,
          title,
          sanitary: s.sanitaryLevel ?? 2.0,
          target: s.targetLevel ?? 4.0,
          responses: Number.isFinite(responses) ? Number(responses.toFixed(2)) : 0
        };
      });
    }

    // 3) Fallback: sectionRatings — если известно, что score уже в 0..5
    if (sectionRatings) {
      return Object.entries(sectionRatings).map(([key, sr], idx): RawDirection => {
        // Попробуем угадать шкалу score:
        // - Если score <= 5 — считаем, что уже 0..5
        // - Если score <= 1 — масштабируем на 5
        // - Если score > 5 — допустим, проценты 0..100 → делим на 20
        let responses = Number(sr.score ?? 0);
        if (!Number.isFinite(responses)) responses = 0;
        if (responses <= 1) responses = responses * 5;
        else if (responses > 5) responses = responses / 20;

        return {
          key: sr.sectionKey || key || `sec_${idx + 1}`,
          title: sr.sectionKey || key || `Секция ${idx + 1}`,
          sanitary: 2.0,
          target: 4.0,
          responses: Number(responses.toFixed(2))
        };
      });
    }

    // Нет данных — пусто
    return [];
  }, [data, sectionRatings]);

  // Преобразуем к формату виджета (DirectionPoint[]) и для таблицы
  const numberedDirections: DirectionPoint[] = useMemo(
    () => withNumbering(directionsRaw),
    [directionsRaw]
  );

  if (!token) return <div className="results-error">Не указан token</div>;
  if (loading) return <div className="results-loading">Загрузка результатов...</div>;
  if (error) return <div className="results-error">{error}</div>;
  if (!data) return <div className="results-error">Результаты не найдены</div>;

  return (
    <div className="survey-results-container">
      <div className="results-header">
        <h2>Результаты оценки</h2>
        <button
          className="btn btn-outline"
          type="button"
          onClick={() => setShowRaw((v) => !v)}
        >
          {showRaw ? 'Скрыть сырой ответ' : 'Показать сырой ответ API'}
        </button>
      </div>

      <div className="rating-section">
        <div className="rating-box">
          <div className="rating-number">{ratingNum}</div>
          <div className="rating-max">/ 10</div>
          {!!band && <div className="rating-band">{band}</div>}
        </div>

        <div className="rating-interpretation">
          {!!riskLevel && (
            <p>
              Уровень риска: <strong>{riskLevel}</strong>
            </p>
          )}
          <p className="rating-description">
            Ваша компания показала{' '}
            {ratingNum > 7 ? 'хороший' : ratingNum > 5 ? 'удовлетворительный' : 'слабый'} уровень
            кибербезопасности.
          </p>
        </div>
      </div>

      {/* Диаграмма зрелости (на реальных данных из БД/бэка) */}
      <section className="card">
        <h3>Диаграмма зрелости по направлениям</h3>
        {numberedDirections.length === 0 ? (
          <div className="answers-empty">Недостаточно данных для построения диаграммы.</div>
        ) : (
          <RadarMaturityWidget
            directions={numberedDirections}
            max={5}
            min={0}
            stepMajor={1}
            seriesLabels={{ sanitary: 'Санитарная (2.0)', target: 'Целевая (4.0)', responses: 'Ответы' }}
            colors={{ sanitary: '#D9534F', target: '#3CB371', responses: '#1E88E5' }}
            height={520}
          />
        )}
      </section>

      {/* Таблица значений по всем направлениям */}
      <section className="card">
        <h3>Таблица значений по направлениям</h3>
        {numberedDirections.length === 0 ? (
          <div className="answers-empty">Нет данных для отображения таблицы.</div>
        ) : (
          <div className="table-responsive">
            <table className="results-table">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>№</th>
                  <th>Направление</th>
                  <th style={{ textAlign: 'right' }}>Санитарная</th>
                  <th style={{ textAlign: 'right' }}>Целевая</th>
                  <th style={{ textAlign: 'right' }}>Ответы</th>
                </tr>
              </thead>
              <tbody>
                {numberedDirections.map((d, idx) => (
                  <tr key={d.key}>
                    <td>{idx + 1}</td>
                    <td>{d.title}</td>
                    <td style={{ textAlign: 'right' }}>{Number(d.sanitary).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{Number(d.target).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{Number(d.responses).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {sectionRatings ? (
        <div className="sections-summary">
          <h3>Разделы</h3>
          <div className="sections-grid">
            {Object.entries(sectionRatings).map(([key, sr]) => (
              <div key={key} className="section-card">
                <div className="section-title">{sr.title || sr.sectionKey || key}</div>
                <div className="section-metrics">
                  <div>Ответов: {sr.answeredCount ?? 0} / {sr.questionCount ?? 0}</div>
                  <div>Оценка: {sr.score ?? 0}</div>
                  {sr.missingRequiredIds && sr.missingRequiredIds.length > 0 ? (
                    <details>
                      <summary>Обязательные без ответа ({sr.missingRequiredIds.length})</summary>
                      <ul>
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

      <div className="answers-section">
        <h3>Ваши ответы</h3>
        {Object.keys(answers).length === 0 ? (
          <div className="answers-empty">
            Ответы не найдены в payload API. Проверьте, что сервер возвращает поле answers.
          </div>
        ) : (
          <div className="answers-list">
            {Object.entries(answers).map(([key, value]) => (
              <div key={key} className="answer-item">
                <div className="answer-question">{key}</div>
                <div className="answer-value">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRaw ? (
        <div className="raw-block">
          <h3>Сырой ответ API</h3>
          <pre className="raw-pre">{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : null}

      <div className="results-actions">
        <button className="btn btn-primary" type="button" disabled>
          Скачать PDF
        </button>
        <button className="btn btn-secondary" type="button" disabled>
          Отправить на email
        </button>
        <button
          className="btn btn-outline"
          type="button"
          onClick={() => (window.location.href = '/')}
        >
          На главную
        </button>
      </div>
    </div>
  );
};
