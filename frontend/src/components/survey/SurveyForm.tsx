//  SurveyForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { SurveyLink, SurveyResponse } from '../../types/survey';
import './SurveyForm.css';

interface SurveyFormProps {
  onSubmit?: (results: any) => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit }) => {
  const { token } = useParams<{ token: string }>();
  const [surveyLink, setSurveyLink] = useState<SurveyLink | null>(null);
  const [currentResponse, setCurrentResponse] = useState<SurveyResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Инициализация: загрузить опрос и текущие ответы
  useEffect(() => {
    const initializeSurvey = async () => {
      try {
        setLoading(true);

        // Получить информацию о ссылке
        const linkResponse = await api.getSurveyLink(token!);
        setSurveyLink(linkResponse.data);

        // Открыть опрос
        await api.openSurvey(token!);

        // Получить текущие ответы (если были сохранены)
        try {
          const responseData = await api.getCurrentResponse(token!);
          if (responseData.data) {
            setCurrentResponse(responseData.data);
            setAnswers(responseData.data.answers || {});
          }
        } catch (e) {
          // Нет сохраненных ответов - это нормально
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка при загрузке опроса');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      initializeSurvey();
    }
  }, [token]);

  if (loading) {
    return <div className="survey-loading">Загрузка опроса...</div>;
  }

  if (error) {
    return <div className="survey-error">{error}</div>;
  }

  if (!surveyLink) {
    return <div className="survey-error">Опрос не найден</div>;
  }

  const questions = surveyLink.survey.schema.sections.flatMap(s => s.questions);
  const totalQuestions = questions.length;
  const completenessPercent = Math.round((Object.keys(answers).length / totalQuestions) * 100);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      await api.saveSurveyResponse(token!, answers, completenessPercent);
      alert('Ответы сохранены. Вы можете вернуться позже.');
    } catch (err: any) {
      alert('Ошибка при сохранении: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const result = await api.submitSurveyResponse(token!, answers);
      if (onSubmit) {
        onSubmit(result.data);
      }
      // Перенаправить на результаты
      window.location.href = `/s/${token}/results`;
    } catch (err: any) {
      alert('Ошибка при отправке: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className="survey-form-container">
      <div className="survey-header">
        <h2>{surveyLink.survey.title}</h2>
        <p>Компания: {surveyLink.insuree.name}</p>
      </div>

      <div className="survey-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${completenessPercent}%` }}
          />
        </div>
        <p>{completenessPercent}% заполнено ({Object.keys(answers).length}/{totalQuestions} вопросов)</p>
      </div>

      <div className="survey-question">
        <h3>{currentQuestion + 1}. {question.text}</h3>

        {question.type === 'select' && (
          <select
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="form-control"
          >
            <option value="">-- Выберите ответ --</option>
            {question.options?.map(opt => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {question.type === 'radio' && (
          <div className="radio-options">
            {question.options?.map(opt => (
              <label key={opt.id} className="radio-label">
                <input
                  type="radio"
                  name={question.id}
                  value={opt.value}
                  checked={answers[question.id] === opt.value}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        )}

        {question.type === 'text' && (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="form-control"
            rows={4}
          />
        )}
      </div>

      <div className="survey-navigation">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="btn btn-secondary"
        >
          ← Назад
        </button>

        <div className="nav-info">
          {currentQuestion + 1} из {totalQuestions}
        </div>

        <button
          onClick={() => setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))}
          disabled={currentQuestion === totalQuestions - 1}
          className="btn btn-secondary"
        >
          Далее →
        </button>
      </div>

      <div className="survey-actions">
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className="btn btn-outline"
        >
          {saving ? 'Сохранение...' : 'Сохранить и продолжить позже'}
        </button>

        <button
          onClick={handleSubmit}
          disabled={saving || Object.keys(answers).length === 0}
          className="btn btn-primary"
        >
          {saving ? 'Отправка...' : 'Завершить опрос'}
        </button>
      </div>
    </div>
  );
};

