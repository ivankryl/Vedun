// frontend/src/pages/InsuredPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAuthed } from '../auth/token';
import {
  getInsuredById,
  listSurveyLinksByInsuredId,
  createSurveyLinkForInsured,
} from '../api/client';

type SurveyLinkItem = {
  id: string;
  token: string;
  status: string;
  createdAt: string;
  survey: { version: string; title: string; status: string };
  responses: Array<{ id: string; status: string; submittedAt?: string | null }>;
};

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
  const [links, setLinks] = useState<SurveyLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authed) {
      setLoading(false);
      setError(null);
      setInsured(null);
      setLinks([]);
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

        const l = await listSurveyLinksByInsuredId(id);
        if (cancelled) return;
        setLinks(l ?? []);
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
          <button className="btn" onClick={() => navigate(-1)}>
            Назад
          </button>
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
        <div className="card-header card-header--row">
          <h2>Опросы клиента</h2>
          <button
            className="btn"
            onClick={async () => {
              if (!id) return;
              const created = await createSurveyLinkForInsured(id);
              const url = `${window.location.origin}/s/${created.token}`;
              await navigator.clipboard?.writeText(url);
              alert(`Ссылка скопирована:\n${url}`);
              const l = await listSurveyLinksByInsuredId(id);
              setLinks(l ?? []);
            }}
          >
            Создать опрос
          </button>
        </div>

        {!links.length ? (
          <p>Пока нет созданных опросов.</p>
        ) : (
          <ul>
            {links.map((x) => (
              <li key={x.id}>
                {x.survey.title} ({x.survey.version}) — {x.status} —{' '}
                <a href={`/s/${x.token}`} target="_blank" rel="noreferrer">
                  открыть
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
