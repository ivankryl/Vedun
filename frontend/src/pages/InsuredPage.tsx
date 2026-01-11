//  frontend/src/pages/InsuredPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAuthed } from '../auth/token';
import { getInsuredById } from '../api/client';

type Insured = {
  id: string;
  name: string;
  inn: string;
  industry?: string | null;
  size?: string | null;
  status: string;
};

export function InsuredPage() {
  const authed = useMemo(() => isAuthed(), []);
  const { id } = useParams();
  const navigate = useNavigate();

  const [insured, setInsured] = useState<Insured | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authed) {
      setLoading(false);
      setError(null);
      setInsured(null);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!id) throw new Error('Не указан id страхователя');

        const data = await getInsuredById(id);
        if (cancelled) return;
        setInsured(data ?? null);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Ошибка загрузки клиента');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authed, id]);

  if (!authed) {
    return (
      <div className="page page--container">
        <div className="card">Нужно войти.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page page--container">
        <div className="card">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page page--container">
        <div className="card error">Ошибка: {error}</div>
      </div>
    );
  }

  if (!insured) {
    return (
      <div className="page page--container">
        <div className="card">Клиент не найден.</div>
      </div>
    );
  }

  return (
    <div className="page page--container">
      <section className="card">
        <div className="card-header card-header--row">
          <h2>Клиент: {insured.name}</h2>
          <button className="btn" onClick={() => navigate(-1)}>Назад</button>
        </div>

        <div className="org-info">
          <div className="org-row">
            <span className="label">ИНН:</span>
            <span>{insured.inn}</span>
          </div>
          <div className="org-row">
            <span className="label">Отрасль:</span>
            <span>{insured.industry || '—'}</span>
          </div>
          <div className="org-row">
            <span className="label">Размер:</span>
            <span>{insured.size || '—'}</span>
          </div>
          <div className="org-row">
            <span className="label">Статус:</span>
            <span>{insured.status}</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Опросы клиента</h2>
        <p>Дальше сюда добавим список опросов + кнопку “Создать опрос”.</p>
      </section>
    </div>
  );
}
