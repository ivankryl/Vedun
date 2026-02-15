//
//  frontend/src/pages/InsuredPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAuthed } from '../auth/token';
import {
  createSurveyLinkForInsured,
  getInsuredById,
  listSurveyLinksByInsuredId,
} from '../services/api';

type SurveyLinkItem = {
  id: string;
  uuid: string; // ✅ нужно для удаления (лучше, чем token)
  token: string;
  status: string;
  createdAt: string;
  survey?: { version?: string; title?: string | null; status?: string };
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

function getApiBase(): string {
  return (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
}

function getAuthHeader(): Record<string, string> {
  const token =
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    '';

  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

  async function reloadLinks() {
    if (!id) return;
    const l = await listSurveyLinksByInsuredId(id);
    setLinks(l ?? []);
  }

  async function deleteLink(link: SurveyLinkItem) {
    if (!id) return;

    if (!link.uuid) {
      alert(
        'Удаление пока невозможно: в данных ссылки нет uuid. ' +
          'Нужно добавить uuid в listSurveyLinksByInsuredId на бэке.',
      );
      return;
    }

    if (!confirm('Удалить приглашение на опрос?')) return;

    const apiBase = getApiBase();
    const resp = await fetch(`${apiBase}/api/surveys/links/${link.uuid}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Ошибка удаления (${resp.status}): ${text || resp.statusText}`);
    }

    await reloadLinks();
  }

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
              try {
                if (!id) throw new Error('No insured id in route');

                const created = await createSurveyLinkForInsured(id);

                const apiBase = getApiBase();

                // ✅ Правильный public URL: HTML страница на бэке /s/:token
                // Если бэк отдал created.url — используем его, иначе собираем сами.
                const url = (created as any).url ?? `${apiBase}/s/${(created as any).token}`;

                try {
                  await navigator.clipboard.writeText(url);
                  alert(`Ссылка скопирована:\n${url}`);
                } catch (e) {
                  console.warn('Clipboard copy failed', e);
                  alert(`Опрос создан.\nСсылка:\n${url}`);
                }

                await reloadLinks();
              } catch (e: any) {
                console.error('[createSurveyLink] failed', e);
                alert(`Не удалось создать опрос: ${e?.message || e}`);
              }
            }}
          >
            Создать опрос
          </button>
        </div>

        {!links.length ? (
          <p>Пока нет созданных опросов.</p>
        ) : (
          <ul>
            {links.map((x) => {
              const apiBase = getApiBase();

              // ✅ открыть HTML (а не JSON)
              const publicUrl = `${apiBase}/s/${x.token}`;

              return (
                <li key={x.id}>
                  {(x.survey?.title ?? 'Опрос')} ({x.survey?.version ?? '—'}) — {x.status} —{' '}
                  <a href={publicUrl} target="_blank" rel="noreferrer">
                    открыть
                  </a>{' '}
                  —{' '}
                  <button
                    className="btn btn--danger"
                    onClick={async () => {
                      try {
                        await deleteLink(x);
                      } catch (e: any) {
                        console.error('[deleteLink] failed', e);
                        alert(`Не удалось удалить: ${e?.message || e}`);
                      }
                    }}
                  >
                    удалить
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
