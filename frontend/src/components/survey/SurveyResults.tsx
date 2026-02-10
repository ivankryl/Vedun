// frontend/src/components/survey/SurveyResults.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import './SurveyResults.css';

export const SurveyResults: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        // api.getSurveyResults теперь возвращает data напрямую (не response)
        const data = await api.getSurveyResults(token);
        setResults(data);
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

  if (!token) return <div className="results-error">Не указан token</div>;
  if (loading) return <div className="results-loading">Загрузка результатов...</div>;
  if (error) return <div className="results-error">{error}</div>;
  if (!results) return <div className="results-error">Результаты не найдены</div>;

  const rating = Number(results.rating ?? 0);

  return (
    <div className="survey-results-container">
      <div className="results-header">
        <h2>Результаты оценки</h2>
      </div>

      <div className="rating-section">
        <div className="rating-box">
          <div className="rating-number">{rating}</div>
          <div className="rating-max">/ 10</div>
          <div className="rating-band">{results.band}</div>
        </div>

        <div className="rating-interpretation">
          <p>
            Уровень риска: <strong>{results.riskLevel || 'Средний'}</strong>
          </p>
          <p className="rating-description">
            Ваша компания показала{' '}
            {rating > 7 ? 'хороший' : rating > 5 ? 'удовлетворительный' : 'слабый'} уровень
            кибербезопасности.
          </p>
        </div>
      </div>

      <div className="answers-section">
        <h3>Ваши ответы</h3>
        <div className="answers-list">
          {Object.entries(results.answers || {}).map(([key, value]) => (
            <div key={key} className="answer-item">
              <div className="answer-question">{key}</div>
              <div className="answer-value">{String(value)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="recommendations-section">
        <h3>Рекомендации</h3>
        <div className="recommendations-list">
          {results.recommendations?.map((rec: any, idx: number) => {
            const sev = String(rec?.severity || 'LOW').toLowerCase();
            return (
              <div key={idx} className={`recommendation recommendation-${sev}`}>
                <div className="rec-header">
                  <strong>{rec.title}</strong>
                  <span className={`severity severity-${sev}`}>{rec.severity}</span>
                </div>
                <p>{rec.description}</p>

                {rec.actions && rec.actions.length > 0 && (
                  <div className="rec-actions">
                    <strong>Действия:</strong>
                    <ul>
                      {rec.actions.map((action: string, aIdx: number) => (
                        <li key={aIdx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="results-actions">
        <button className="btn btn-primary" type="button">
          Скачать PDF
        </button>
        <button className="btn btn-secondary" type="button">
          Отправить на email
        </button>
        <button className="btn btn-outline" type="button" onClick={() => (window.location.href = '/')}>
          На главную
        </button>
      </div>
    </div>
  );
};
