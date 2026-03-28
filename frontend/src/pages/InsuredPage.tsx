// frontend/src/pages/InsuredPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAuthed } from '../auth/token';
import {
  createSurveyLinkForInsured,
  getInsuredById,
  deleteSurveyLink,
  listSurveyLinksByInsuredId,
} from '../services/api';

type SurveyLinkItem = {
  uuid: string;
  token: string;
  status: string;
  createdAt: string;
  survey?: { version?: string; title?: string | null; status?: string };
  responses: Array<{ id: string; status: string; submittedAt?: string | null }>;
  lastSavedAt?: string | null;
  completenessPercent?: number | null;
  submittedAt?: string | null;
  openedAt?: string | null;
};

type Insured = {
  id: string;
  name: string;
  inn: string;
  industry?: string | null;
  size?: string | null;
  status: string;
};

function formatDt(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const DD = pad(d.getDate());
  const MM = pad(d.getMonth() + 1);
  const YY = String(d.getFullYear()).slice(-2);
  return `${hh}:${mm} ${DD}/${MM}/${YY}`;
}

export function InsuredPage() {
  const authed = useMemo(() => isAuthed(), []);
  const { id } = useParams();
  const navigate = useNavigate();

  const [insured, setInsured] = useState<Insured | null>(null);
  const [links, setLinks] = useState<SurveyLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Выбор версии опроса
  const [selectedVersion, setSelectedVersion] = useState<'v2' | 'v3'>('v2');

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
    if (!link.uuid) {
      alert('Удаление невозможно: в данных ссылки нет uuid.');
      return;
    }
    if (!confirm('Удалить приглашение на опрос?')) return;

    await deleteSurveyLink(link.uuid);
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
        <div className="card-header card-header--row" style={{ gap: 12, alignItems: 'center' }}>
          <h2>Опросы клиента</h2>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <label htmlFor="survey-version">Версия:</label>
            <select
              id="survey-version"
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value as 'v2' | 'v3')}
            >
              <option value="v2">v2</option>
              <option value="v3">v3</option>
            </select>

            <button
              className="btn"
              disabled={creating}
              onClick={async () => {
                if (creating) return;

                try {
                  setCreating(true);

                  if (!id) throw new Error('No insured id in route');

                  // Создаём ссылку через приватный API
                  const created = await createSurveyLinkForInsured(id, { version: selectedVersion });

                  // Публичная ссылка: по TOKEN (вариант A)
                  const token = (created as any)?.token || (created as any)?.link?.token;
                  const url =
                    (created as any).url ??
                    (token
                      ? `${window.location.origin}/survey/${encodeURIComponent(token)}`
                      : `${window.location.origin}/s/${encodeURIComponent((created as any).uuid)}`);

                  try {
                    await navigator.clipboard.writeText(url);
                    alert(`Ссылка (${selectedVersion}) скопирована:\n${url}`);
                  } catch (e) {
                    console.warn('Clipboard copy failed', e);
                    alert(`Опрос (${selectedVersion}) создан.\nСсылка:\n${url}`);
                  }

                  await reloadLinks();
                } catch (e: any) {
                  console.error('[createSurveyLink] failed', e);
                  alert(`Не удалось создать опрос: ${e?.message || e}`);
                } finally {
                  setCreating(false);
                }
              }}
            >
              {creating ? 'Создаю...' : `Создать опрос (${selectedVersion})`}
            </button>
          </div>
        </div>

        {!links.length ? (
          <p>Пока нет созданных опросов.</p>
        ) : (
          <ul>
            {links.map((x) => {
              const token = x.token; // ключевой идентификатор публичной анкеты

              // Публичные адреса по токену
              const surveyUrl = `/survey/${encodeURIComponent(token)}`;
              const resultsUrl = `/survey/${encodeURIComponent(token)}/results`;

              let timeLabel = '—';
              let pctLabel = '—';

              if (x.status === 'COMPLETED' || x.status === 'SUBMITTED') {
                timeLabel = formatDt(x.submittedAt ?? x.lastSavedAt ?? null);
                const pct =
                  typeof x.completenessPercent === 'number'
                    ? Math.max(0, Math.min(100, Math.round(x.completenessPercent)))
                    : 100;
                pctLabel = `${pct}%`;
              } else if (x.status === 'OPENED') {
                timeLabel = formatDt(x.lastSavedAt ?? x.openedAt ?? null);
                const pct =
                  typeof x.completenessPercent === 'number'
                    ? Math.max(0, Math.min(100, Math.round(x.completenessPercent)))
                    : null;
                pctLabel = pct === null ? '—' : `${pct}%`;
              } else if (x.status === 'CREATED') {
                timeLabel = formatDt(null);
                pctLabel = '0%';
              }

              const openHref =
                x.status === 'COMPLETED' || x.status === 'SUBMITTED'
                  ? resultsUrl
                  : surveyUrl;

              return (
                <li key={x.uuid}>
                  {(x.survey?.title ?? 'Опрос')} ({x.survey?.version ?? '—'}) — {x.status}
                  {x.status === 'OPENED' || x.status === 'COMPLETED' || x.status === 'SUBMITTED' ? (
                    <> — {timeLabel} — {pctLabel}</>
                  ) : (
                    <> — {pctLabel}</>
                  )}{' '}
                  —{' '}
                  <a href={openHref} target="_blank" rel="noreferrer">
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
