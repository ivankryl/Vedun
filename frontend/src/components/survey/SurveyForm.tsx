// frontend/src/components/survey/SurveyForm.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import type { SurveyLink } from '../../types/survey';
import './SurveyForm.css';

interface SurveyFormProps {
  onSubmit?: (results: any) => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit }) => {
  const { token } = useParams<{ token: string }>();

  const [surveyLink, setSurveyLink] = useState<SurveyLink | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSurvey = async () => {
      if (!token) {
        setError('Не указан token');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const link = await api.getSurveyLink(token);
        setSurveyLink(link as any);

        await api.openSurvey(token);

        // Если потом добавишь drafts на бэке — здесь можно восстановить getCurrentResponse
        // const draft = await api.getCurrentResponse(token);
        // if (draft) setAnswers(draft.answers || {});
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Ошибка при загрузке опроса');
      } finally {
        setLoading(false);
      }
    };

    initializeSurvey();
  }, [token]);

  const questions = useMemo(() => {
    const sections = (surveyLink as any)?.survey?.schema?.sections ?? [];
    return sections.flatMap((s: any) => s?.questions ?? []);
  }, [surveyLink]);

  const totalQuestions = questions.length || 1;
  const completenessPercent = Math.round((Object.keys(answers).length / totalQuestions) * 100);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

    const handleSaveDraft = async () => {
      if (!token) return;
      try {
        setSaving(true);
        await api.saveSurveyResponse(token, { answers, respondentMeta: { completenessPercent } });
        alert('Ответы сохранены. Вы можете вернуться позже.');
      } catch (err: any) {
        alert('Ошибка при сохранении: ' + (err?.response?.data?.message || err?.message));
      } finally {
        setSaving(false);
      }
    };

    const handleSubmit = async () => {
      if (!token) return;

      try {
        setSaving(true);

        const result = await api.submitSurveyResponse(token, {
          answers,
          respondentMeta: { completenessPercent },
        });
        onSubmit?.(result);

        window.location.href = `/s/${token}/results`;
      } catch (err: any) {
        alert('Ошибка при отправке: ' + (err?.response?.data?.message || err?.message));
      } finally {
        setSaving(false);
      }
    };


  if (loading) return <div className="survey-loading">Загрузка опроса...</div>;
  if (error) return <div className="survey-error">{error}</div>;
  if (!surveyLink) return <div className="survey-error">Опрос не найден</div>;
  if (!questions.length) return <div className="survey-error">В опросе нет вопросов</div>;

  const question = questions[currentQuestion];

  return (
    <div className="survey-form-container">
      <div className="survey-header">
        <h2>{(surveyLink as any).survey?.title}</h2>
        <p>Компания: {(surveyLink as any).insuree?.name}</p>
      </div>

      <div className="survey-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${completenessPercent}%` }} />
        </div>
        <p>
          {completenessPercent}% заполнено ({Object.keys(answers).length}/{questions.length} вопросов)
        </p>
      </div>

      <div className="survey-question">
        <h3>
          {currentQuestion + 1}. {question.text}
        </h3>

          {question.type === 'select' && (
            <select
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="form-control"
            >
              <option value="">-- Выберите ответ --</option>
              {question.options?.map((opt: any) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {question.type === 'radio' && (
            <div className="radio-options">
              {question.options?.map((opt: any) => (
                <label key={opt.id} className="radio-label">
                  <input
                    type="radio"
                    name={question.id}
                    value={opt.id}
                    checked={answers[question.id] === opt.id}
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
          type="button"
        >
          ← Назад
        </button>

        <div className="nav-info">
          {currentQuestion + 1} из {questions.length}
        </div>

        <button
          onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
          disabled={currentQuestion === questions.length - 1}
          className="btn btn-secondary"
          type="button"
        >
          Далее →
        </button>
      </div>

      <div className="survey-actions">
        <button onClick={handleSaveDraft} disabled={saving} className="btn btn-outline" type="button">
          {saving ? 'Сохранение...' : 'Сохранить и продолжить позже'}
        </button>

        <button
          onClick={handleSubmit}
          disabled={saving || Object.keys(answers).length === 0}
          className="btn btn-primary"
          type="button"
        >
          {saving ? 'Отправка...' : 'Завершить опрос'}
        </button>
      </div>
    </div>
  );
};
