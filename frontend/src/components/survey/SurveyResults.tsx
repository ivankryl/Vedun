//  SurveyResults.tsx
import React, { useState, useEffect } from 'react';
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
      try {
        setLoading(true);
        const response = await api.getSurveyResults(uuid!);
        setResults(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка при загрузке результатов');
      } finally {
        setLoading(false);
      }
    };

    if (uuid) {
      loadResults();
    }
  }, [uuid]);

  if (loading) {
    return <div className="results-loading">Загрузка результатов...</div>;
  }

  if (error) {
    return <div className="results-error">{error}</div>;
  }

  if (!results) {
    return <div className="results-error">Результаты не найдены</div>;
  }

  return (
    <div className="survey-results-container">
      <div className="results-header">
        <h2>Результаты оценки</h2>
      </div>

      <div className="rating-section">
        <div className="rating-box">
          <div className="rating-number">{results.rating || 0}</div>
          <div className="rating-max">/ 10</div>
          <div className="rating-band">{results.band}</div>
        </div>

        <div className="rating-interpretation">
          <p>Уровень риска: <strong>{results.riskLevel || 'Средний'}</strong></p>
          <p className="rating-description">
            Ваша компания показала {results.rating > 7 ? 'хороший' : results.rating > 5 ? 'удовлетворительный' : 'слабый'} уровень кибербезопасности.
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
          {results.recommendations?.map((rec: any, idx: number) => (
            <div key={idx} className={`recommendation recommendation-${rec.severity.toLowerCase()}`}>
              <div className="rec-header">
                <strong>{rec.title}</strong>
                <span className={`severity severity-${rec.severity.toLowerCase()}`}>
                  {rec.severity}
                </span>
              </div>
              <p>{rec.description}</p>
              {rec.actions && rec.actions.length > 0 && (
                <div className="rec-actions">
                  <strong>Действия:</strong>
                  <ul>
                    {rec.actions.map((action: string, idx: number) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="results-actions">
        <button className="btn btn-primary">Скачать PDF</button>
        <button className="btn btn-secondary">Отправить на email</button>
        <button className="btn btn-outline" onClick={() => window.location.href = '/'}>
          На главную
        </button>
      </div>
    </div>
  );
};
