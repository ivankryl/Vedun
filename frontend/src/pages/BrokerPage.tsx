// frontend/src/pages/BrokerPage.tsx
import { useEffect, useState } from 'react';
import { getOrgMe, getInsuredList } from '../api/client';
import { isAuthed } from '../auth/token';

export function BrokerPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [insuredList, setInsuredList] = useState<Insured[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 👇 Вариант A: без токена не дергаем защищённые эндпоинты
    if (!isAuthed()) {
      setLoading(false);
      setError(null); // или "Нужно войти"
      setOrg(null);
      setInsuredList([]);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [orgData, insuredData] = await Promise.all([
          getOrgMe(),
          getInsuredList(),
        ]);

        setOrg(orgData ?? null);
        setInsuredList(Array.isArray(insuredData) ? insuredData : []);
      } catch (e: any) {
        setError(e.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="card">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="card error">Ошибка: {error}</div>
      </div>
    );
  }
    // 👇 ВСТАВИТЬ ВОТ СЮДА (после if (error), перед основным return)
    if (!isAuthed()) {
      return (
        <div className="page">
          <section className="card">
            <h2>Профиль страховой компании / брокера</h2>
            <p>Нужно войти, чтобы увидеть данные организации и список страхователей.</p>
          </section>
        </div>
      );
    }

  return (
    <div className="page">
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
        <div className="card-header">
          <h2>Клиенты (страхователи)</h2>
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
                  <tr key={ins.id}>
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
    </div>
  );
}
