// frontend/src/components/survey/SurveyResults.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import './SurveyResults.css';

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
  // Нередко бэкенд кладёт агрегаты сюда:
  results?: {
    sectionRatings?: Record<string, SectionRating>;
    [k: string]: any;
  };
  // Иногда отвечает целым объектом SurveyResponse
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
