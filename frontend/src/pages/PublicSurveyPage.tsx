// frontend/src/pages/PublicSurveyPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPublicSurveyByToken, submitPublicSurveyByToken } from '../services/api';

export function PublicSurveyPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr(null);
        if (!token) throw new Error('No token');
        const d = await getPublicSurveyByToken(token);
        if (!cancelled) setData(d);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Ошибка загрузки опроса');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) return <div className="page page--container"><div className="card">Загрузка...</div></div>;
  if (err) return <div className="page page--container"><div className="card error">Ошибка: {err}</div></div>;
  if (!data) return <div className="page page--container"><div className="card">Не найдено</div></div>;

  const survey = data.survey;

  return (
    <div className="page page--container">
      <div className="card">
        <h2>{survey.title}</h2>
        <p>Версия: {survey.version}</p>

        <button
          className="btn"
          onClick={async () => {
            if (!token) return;
            await submitPublicSurveyByToken(token, { answers: { _mvp: true } });
            navigate(`/s/${token}/results`);
          }}
        >
          Отправить (MVP)
        </button>
      </div>
    </div>
  );
}
