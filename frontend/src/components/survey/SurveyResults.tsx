// frontend/src/components/survey/SurveyResults.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import './SurveyResults.css';

// Импорт виджета и хелпера нумерации направлений
import RadarMaturityWidget, {
  withNumbering,
  type RawDirection
} from '../result/RadarMaturityWidget';

type SectionRating = {
  score?: number;
  rating?: string | null;
  weight?: number;
  sectionKey?: string;
  answeredCount?: number;
  questionCount?: number;
  missingRequiredIds?: string[];
};

type ApiResultsPayload = {
  rating?: number | string | null;
  band?: string | null;
  riskLevel?: string | null;
  results?: {
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

  // Где искать answers:
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

  // -----------------------------
  // ДАННЫЕ ДЛЯ РАДИАЛЬНОЙ ДИАГРАММЫ (примерные, 16 направлений)
  // Формат: sanitary / target / responses
  // -----------------------------
  const exampleRaw: RawDirection[] = [
    { key: 'org_structure',       title: 'Организационная структура',        sanitary: 1.0, target: 4.0, responses: 2.7 },
    { key: 'it_asset_mgmt',       title: 'Управление ИТ‑активами',           sanitary: 1.0, target: 4.0, responses: 2.9 },
    { key: 'risk_based',          title: 'Риск‑ориентированный подход',      sanitary: 1.0, target: 4.0, responses: 2.4 },
    { key: 'security_arch',       title: 'Архитектура КБ',                   sanitary: 1.0, target: 4.0, responses: 1.8 },
    { key: 'security_strategy',   title: 'Стратегия КБ',                     sanitary: 1.0, target: 4.0, responses: 2.2 },
    { key: 'metrics_reporting',   title: 'Отчётность и метрики',             sanitary: 1.0, target: 4.0, responses: 1.9 },
    { key: 'change_mgmt',         title: 'Управление изменениями',           sanitary: 1.0, target: 4.0, responses: 2.1 },
    { key: 'access_mgmt',         title: 'Управление доступом',              sanitary: 1.0, target: 4.0, responses: 2.6 },
    { key: 'network_security',    title: 'Сетевая безопасность',             sanitary: 1.0, target: 4.0, responses: 2.0 },
    { key: 'endpoint_security',   title: 'Безопасность конечных устройств',  sanitary: 1.0, target: 4.0, responses: 1.7 },
    { key: 'data_security',       title: 'Безопасность данных',              sanitary: 1.0, target: 4.0, responses: 2.3 },
    { key: 'soc_monitoring',      title: 'Мониторинг КБ',                    sanitary: 1.0, target: 4.0, responses: 1.6 },
    { key: 'vuln_mgmt',           title: 'Управление уязвимостями',          sanitary: 1.0, target: 4.0, responses: 2.2 },
    { key: 'pentesting',          title: 'Тесты на проникновение',           sanitary: 1.0, target: 4.0, responses: 1.8 },
    { key: 'incident_mgmt',       title: 'Управление инцидентами КБ',        sanitary: 1.0, target: 4.0, responses: 2.0 },
    { key: 'security_culture',    title: 'Культура КБ',                      sanitary: 1.0, target: 4.0, responses: 1.5 }
  ];

  const numberedDirections = useMemo(() => withNumbering(exampleRaw), []);

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

      {/* Диаграмма зрелости (виджет) */}
      <section className="card">
        <h3>Диаграмма зрелости по направлениям</h3>
        <RadarMaturityWidget
          directions={numberedDirections}
          max={5}
          min={0}
          stepMajor={1}
          seriesLabels={{ sanitary: 'Санитарная', target: 'Целевая (4.0)', responses: 'Ответы' }}
          colors={{ sanitary: '#D9534F', target: '#3CB371', responses: '#1E88E5' }}
          height={520}
        />
      </section>

      {sectionRatings ? (
        <div className="sections-summary">
          <h3>Разделы</h3>
          <div className="sections-grid">
            {Object.entries(sectionRatings).map(([key, sr]) => (
              <div key={key} className="section-card">
                <div className="section-title">{sr.sectionKey || key}</div>
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
