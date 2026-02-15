//
//  frontend/src/pages/InsuranceCompaniesPage.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface InsuranceCompany {
  id: string;
  name: string;
  email: string;
  phone?: string;
  taxId?: string;
  registrationId?: string;
  createdAt: string;
}

export const InsuranceCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    taxId: '',
    registrationId: '',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/insurance-companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Ошибка загрузки компаний:', error);
      alert('Ошибка загрузки компаний');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('Заполните обязательные поля: Название и Email');
      return;
    }

    try {
      await api.post('/insurance-companies', formData);
      setFormData({ name: '', email: '', phone: '', taxId: '', registrationId: '' });
      setShowForm(false);
      loadCompanies();
      alert('Компания добавлена успешно!');
    } catch (error: any) {
      alert('Ошибка: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены?')) return;
    
    try {
      await api.delete(`/insurance-companies/${id}`);
      loadCompanies();
      alert('Компания удалена');
    } catch (error) {
      alert('Ошибка удаления');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🏢 Страховые компании</h1>

      {/* ФОРМА ДОБАВЛЕНИЯ */}
      {showForm && (
        <div style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
        }}>
          <h2>Добавить новую компанию</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Название *</label>
              <input
                type="text"
                placeholder="ООО Компания"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Email *</label>
              <input
                type="email"
                placeholder="info@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Телефон</label>
              <input
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>ИНН</label>
              <input
                type="text"
                placeholder="7700000000"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>ОГРН</label>
              <input
                type="text"
                placeholder="1077700000000"
                value={formData.registrationId}
                onChange={(e) => setFormData({ ...formData, registrationId: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ✅ Сохранить
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '10px 20px',
                  background: '#999',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ❌ Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '16px',
          }}
        >
          ➕ Добавить компанию
        </button>
      )}

      {/* ТАБЛИЦА КОМПАНИЙ */}
      {loading ? (
        <div>Загрузка компаний...</div>
      ) : companies.length === 0 ? (
        <div style={{ color: '#999' }}>
          Нет страховых компаний. Добавьте первую!
        </div>
      ) : (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #ddd',
        }}>
          <thead style={{ background: '#f5f5f5' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                Название
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                Email
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                Телефон
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                ИНН
              </th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{company.name}</td>
                <td style={{ padding: '12px' }}>{company.email}</td>
                <td style={{ padding: '12px' }}>{company.phone || '—'}</td>
                <td style={{ padding: '12px' }}>{company.taxId || '—'}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleDelete(company.id)}
                    style={{
                      padding: '5px 10px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    🗑️ Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
