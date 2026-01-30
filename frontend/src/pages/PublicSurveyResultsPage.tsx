//  PublicSurveyResultsPage.tsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublicSurveyResultsByToken } from '../api/client';

export function PublicSurveyResultsPage() {
  const { token } = useParams();
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

  if (loading) return <div className="page page--container"><div className="card">Загрузка...</div></div>;
  if (err) return <div className="page page--container"><div className="card error">Ошибка: {err}</div></div>;
  if (!data) return <div className="page page--container"><div className="card">Не найдено</div></div>;

  return (
    <div className="page page--container">
      <div className="card">
        <div className="success" style={{ marginBottom: 12 }}>
            Ответ отправлен.
        </div>
        <h2>Результаты</h2>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre>

        {token && (
          <div style={{ marginTop: 16 }}>
            <Link to={`/s/${token}`} className="btn">Назад к опросу</Link>
          </div>
        )}
      </div>
    </div>
  );
}
