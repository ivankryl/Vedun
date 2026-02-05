// frontend/src/pages/BrokerPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { createInsured, getOrgMe, getInsuredList } from '../services/api';
import { isAuthed } from '../auth/token';
import { useNavigate } from 'react-router-dom';

type Organization = {
  id: string;
  type: 'INSURER' | 'BROKER' | 'PLATFORM';
  name: string;
  inn: string | null;
  status: 'ACTIVE' | 'INACTIVE';
};

type Insured = {
  id: string;
  name: string;
  inn: string;
  industry?: string | null;
  size?: string | null;
  status: string;
};

export function BrokerPage() {
  // вычислим один раз на рендер
  const authed = useMemo(() => isAuthed(), []);
  const navigate = useNavigate();

  const [org, setOrg] = useState<Organization | null>(null);
  const [insuredList, setInsuredList] = useState<Insured[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- create modal state (ВАЖНО: внутри компонента!) ----
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createInn, setCreateInn] = useState('');
  const [createIndustry, setCreateIndustry] = useState('');
  const [createSize, setCreateSize] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSaving, setCreateSaving] = useState(false);

  async function reloadInsured() {
    const insuredData = await getInsuredList();
    setInsuredList(Array.isArray(insuredData) ? insuredData : []);
  }

  async function onCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateSaving(true);

    try {
        await createInsured({
          name: createName.trim(),
          inn: createInn.trim(),
          industry: createIndustry.trim() || undefined,
          headcount: createSize.trim() || undefined, // ✅
        });


      // закрыть модалку + очистить форму
      setIsCreateOpen(false);
      setCreateName('');
      setCreateInn('');
      setCreateIndustry('');
      setCreateSize('');

      // обновить список
      await reloadInsured();
    } catch (err: any) {
      // красивые сообщения под твои 409 коды
      const code = err?.data?.code;

      if (err?.status === 409 && code === 'INSURED_INN_EXISTS_IN_THIS_ORG') {
        setCreateError('Страхователь с таким ИНН уже существует в вашей организации.');
      } else if (err?.status === 409 && code === 'INSURED_INN_EXISTS_IN_ANOTHER_ORG') {
        setCreateError('Страхователь с таким ИНН уже существует в базе (в другой организации).');
      } else {
        setCreateError(err?.message || 'Не удалось создать страхователя');
      }
    } finally {
      setCreateSaving(false);
    }
  }

  useEffect(() => {
    if (!authed) {
      setLoading(false);
      setError(null);
      setOrg(null);
      setInsuredList([]);
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [orgData, insuredData] = await Promise.all([getOrgMe(), getInsuredList()]);

        if (cancelled) return;

        setOrg(orgData ?? null);
        setInsuredList(Array.isArray(insuredData) ? insuredData : []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Ошибка загрузки данных');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [authed]);

  // ---- UI состояния ----

  if (!authed) {
    return (
      <div className="page page--container">
        <section className="card">
          <h2>Профиль страховой компании / брокера</h2>
          <p>Нужно войти, чтобы увидеть данные организации и список страхователей.</p>
        </section>
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

  return (
    <div className="page page--container">
      <section className="card">
        <h2>Профиль страховой компании / брокера</h2>
        {org ? (
          <div className="org-info">
            <div className="org-row">
              <span className="label">Название:</span>
              <span>{org.name}</span>
            </div>

            {org.inn && (
              <div className="org-row">
                <span className="label">ИНН:</span>
                <span>{org.inn}</span>
              </div>
            )}

            <div className="org-row">
              <span className="label">Тип:</span>
              <span>
                {org.type === 'BROKER'
                  ? 'Страховой брокер'
                  : org.type === 'INSURER'
                    ? 'Страховая компания'
                    : 'Платформа'}
              </span>
            </div>

            <div className="org-row">
              <span className="label">Статус:</span>
              <span>{org.status === 'ACTIVE' ? 'Активна' : 'Неактивна'}</span>
            </div>
          </div>
        ) : (
          <p>Организация не найдена.</p>
        )}
      </section>

      <section className="card">
        <div className="card-header card-header--row">
          <h2>Клиенты (страхователи)</h2>

          <button
            className="btn btn-primary"
            onClick={() => {
              setCreateError(null);
              setIsCreateOpen(true);
            }}
          >
            Новый страхователь
          </button>
        </div>

        {insuredList.length === 0 ? (
          <p>Пока нет ни одного страхователя.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>ИНН</th>
                  <th>Отрасль</th>
                  <th>Размер</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {insuredList.map((ins) => (
                    <tr
                        key={ins.id}
                        onClick={() => navigate(`/insured/${ins.id}`)}
                        style={{ cursor: 'pointer' }}
                        title="Открыть клиента"
                    >
                    <td>{ins.name}</td>
                    <td>{ins.inn}</td>
                    <td>{ins.industry || '—'}</td>
                    <td>{ins.size || '—'}</td>
                    <td>{ins.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isCreateOpen && (
        <div className="modal-backdrop" onMouseDown={() => setIsCreateOpen(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <h3>Новый страхователь</h3>

            <form onSubmit={onCreateSubmit} className="form">
              <label>
                Название *
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="ООО Ромашка"
                  required
                />
              </label>

              <label>
                ИНН *
                <input
                  value={createInn}
                  onChange={(e) => setCreateInn(e.target.value)}
                  placeholder="7701234567"
                  required
                />
              </label>

              <label>
                Отрасль (опц.)
                <input
                  value={createIndustry}
                  onChange={(e) => setCreateIndustry(e.target.value)}
                  placeholder="01"
                />
              </label>

                        <label>
                          Численность сотрудников (опц.)
                          <input
                            value={createSize}
                            onChange={(e) => setCreateSize(e.target.value)}
                            placeholder="например 200"
                            inputMode="numeric"
                          />
                        </label>

              {createError && <div className="error">{createError}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={createSaving}
                >
                  Отмена
                </button>

                <button type="submit" className="btn btn-primary" disabled={createSaving}>
                  {createSaving ? 'Сохранение...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
