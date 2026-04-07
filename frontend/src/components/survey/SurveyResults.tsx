// frontend/src/components/survey/SurveyResults.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import './SurveyResults.css';

// Виджет и нумерация направлений
import RadarMaturityWidget, {
  withNumbering,
  type RawDirection
} from '../result/RadarMaturityWidget';

// === NEW: импорт расчёта зрелости
import { computeCompanyMaturity } from '../../surveys/v3/logic/computeMaturity';
import { buildComputeInputFromV3 } from '../../surveys/v3/logic/buildInput';
import type { SurveyTemplate } from '../survey/v3/types';

type SectionRating = {
  score?: number;
  rating?: string | null;
  weight?: number;
  sectionKey?: string;
  answeredCount?: number;
  questionCount?: number;
  missingRequiredIds?: string[];
};

type ApiResultsPayload = {
  rating?: number | string | null;
  band?: string | null;
  riskLevel?: string | null;
  results?: {
    sectionRatings?: Record<string, SectionRating>;
    [k: string]: any;
  };
  SurveyResponse?: any;
  response?: any;
  result?: any;
  answers?: Record<string, any>;
  schema?: SurveyTemplate;         // <-- если API отдаёт схему, используем её
  [k: string]: any;
};

// Вспомогательные хелперы
const canonicalId = (raw: string) => {
  let s = String(raw).trim().toLowerCase();
  s = s.replace(/s@/g, 's0');
  s = s.replace(/\s+/g, '_');
  s = s.replace(/[^a-z0-9._-]/g, '_');
  s = s.replace(/__+/g, '_').replace(/\.\.+/g, '.').replace(/--+/g, '-');
  return s;
};
const z2 = (n: number | string) => String(n).padStart(2, '0');

// Fallback: если схемы нет, строим минимальные секции из ответов
function buildMinimalSchemaFromAnswers(answers: Record<string, any>): SurveyTemplate {
  // Сопоставим NN -> title по твоему перечню (16 направлений — можно расширить)
  const defaultTitles: Record<string, string> = {
    '01': 'Организационная структура',
    '02': 'Управление ИТ‑активами',
    '03': 'Риск‑ориентированный подход',
    '04': 'Архитектура КБ',
    '05': 'Стратегия КБ',
    '06': 'Отчётность и метрики',
    '07': 'Управление изменениями',
    '08': 'Управление доступом',
    '09': 'Сетевая безопасность',
    '10': 'Безопасность конечных устройств',
    '11': 'Безопасность данных',
    '12': 'Мониторинг КБ',
    '13': 'Управление уязвимостями',
    '14': 'Тесты на проникновение',
    '15': 'Управление инцидентами КБ',
    '16': 'Культура КБ',
  };

  // Соберём список уникальных вопросовых id
  const ids = Object.keys(answers).map(canonicalId);
  // Вытащим NN из «sNN.*»
  const secSet = new Set<string>();
  ids.forEach((id) => {
    const m = id.match(/^s(\d{1,2})(?=[._-])/);
    if (m) secSet.add(z2(m[1]));
  });
  const nnList = Array.from(secSet.values()).sort();

  // Секции без реальных опций/метаданных (достаточно для вычисления без валидации)
  const sections = nnList.map((nn, idx) => ({
    key: `sec_${nn}`,
    title: defaultTitles[nn] || `Секция ${nn}`,
    questions: [], // пусто — buildInput не будет включать sectionMap => валидация опций пропускается
    order: idx + 1,
  }));

  return { version: 'v3', sections } as unknown as SurveyTemplate;
}

// Преобразование результата зрелости в directions для виджета
function resultToDirections(params: {
  schema: SurveyTemplate;
  result: ReturnType<typeof computeCompanyMaturity>;
}): RawDirection[] {
  const { schema, result } = params;
  return result.sectionScores.map((s, i) => {
    const sec = schema.sections?.find((x) => x.key === s.sectionKey);
    const name = sec?.title || `Секция ${i + 1}`;
    const U = Math.max(1, s.hygieneWindowU);
    // Нормируем sum (0..U) к 0..5
    const responses = (s.sum / U) * 5;
    return {
      key: s.sectionKey,
      title: name,
      sanitary: 2.0,  // гигиенический минимум 2.0
      target: 4.0,    // целевой уровень
      responses: Number(responses.toFixed(2)),
    };
  });
}

export const SurveyResults: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ApiResultsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);
        const payload = await api.getSurveyResults(token);
        setData(payload ?? null);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || err?.message || 'Ошибка при загрузке результатов'
        );
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [token]);

  const ratingNum = useMemo(() => {
    const r = data?.rating;
    const n = typeof r === 'string' ? Number(r) : (r ?? 0);
    return Number.isFinite(n) ? Number(n) : 0;
  }, [data]);

  // Где искать answers:
  const answers: Record<string, any> = useMemo(() => {
    return (
      (data?.answers as Record<string, any>) ||
      (data as any)?.response?.answers ||
      (data as any)?.result?.answers ||
      (data as any)?.SurveyResponse?.answers ||
      {}
    );
  }, [data]);

  const sectionRatings: Record<string, SectionRating> | undefined =
    (data?.results && data?.results.sectionRatings) ||
    (data as any)?.response?.results?.sectionRatings ||
    (data as any)?.SurveyResponse?.results?.sectionRatings;

  const band = (data?.band as string | undefined) ?? '';
  const riskLevel = (data?.riskLevel as string | undefined) ?? '';

  // === NEW: получаем схему (если нет — строим минимальную)
  const schema: SurveyTemplate | null = useMemo(() => {
    return (
      (data?.schema as SurveyTemplate | undefined) ||
      ((data as any)?.response?.schema as SurveyTemplate | undefined) ||
      ((data as any)?.SurveyResponse?.schema as SurveyTemplate | undefined) ||
      null
    );
  }, [data]);

  // === NEW: directions из реальных ответов
  const directionsReal: RawDirection[] = useMemo(() => {
    try {
      const effectiveSchema = schema ?? buildMinimalSchemaFromAnswers(answers);
      // Если у нас минимальная схема (без вопросов), buildComputeInputFromV3 может требовать sectionMap.
      // Наш buildInput допускает пустые questions и пропустит validate (sectionMap не критичен).
      const input = buildComputeInputFromV3({ schema: effectiveSchema, answers });
      // Если effectiveSchema пришла «минимальная», валидация в computeCompanyMaturity пройдёт, т.к. sectionMap есть, но пустой; при необходимости можно удалить поле sectionMap.
      if (!schema) {
        // Уберём sectionMap, чтобы validateYesNoNaOptions пропустила проверку
        delete (input as any).sectionMap;
      }
      const result = computeCompanyMaturity(input);
      return withNumbering(resultToDirections({ schema: effectiveSchema, result }));
    } catch (e) {
      console.warn('maturity compute failed, fallback to empty directions', e);
      return [];
    }
  }, [schema, answers]);

  // Для таблицы и виджета используем directionsReal
  const numberedDirections = directionsReal;

  if (!token) return <div className="results-error">Не указан token</div>;
  if (loading) return <div className="results-loading">Загрузка результатов...</div>;
  if (error) return <div className="results-error">{error}</div>;
  if (!data) return <div className="results-error">Результаты не найдены</div>;

  return (
    <div className="survey-results-container">
      <div className="results-header">
        <h2>Результаты оценки</h2>
        <button
          className="btn btn-outline"
          type="button"
          onClick={() => setShowRaw((v) => !v)}
        >
          {showRaw ? 'Скрыть сырой ответ' : 'Показать сырой ответ API'}
        </button>
      </div>

      <div className="rating-section">
        <div className="rating-box">
          <div className="rating-number">{ratingNum}</div>
          <div className="rating-max">/ 10</div>
          {!!band && <div className="rating-band">{band}</div>}
        </div>

        <div className="rating-interpretation">
          {!!riskLevel && (
            <p>
              Уровень риска: <strong>{riskLevel}</strong>
            </p>
          )}
          <p className="rating-description">
            Ваша компания показала{' '}
            {ratingNum > 7 ? 'хороший' : ratingNum > 5 ? 'удовлетворительный' : 'слабый'} уровень
            кибербезопасности.
          </p>
        </div>
      </div>

      {/* Диаграмма зрелости (на реальных данных) */}
      <section className="card">
        <h3>Диаграмма зрелости по направлениям</h3>
        {numberedDirections.length === 0 ? (
          <div className="answers-empty">Недостаточно данных для построения диаграммы.</div>
        ) : (
          <RadarMaturityWidget
            directions={numberedDirections}
            max={5}
            min={0}
            stepMajor={1}
            seriesLabels={{ sanitary: 'Санитарная (2.0)', target: 'Целевая (4.0)', responses: 'Ответы' }}
            colors={{ sanitary: '#D9534F', target: '#3CB371', responses: '#1E88E5' }}
            height={520}
          />
        )}
      </section>

      {/* Таблица значений по всем направлениям (реальные) */}
      <section className="card">
        <h3>Таблица значений по направлениям</h3>
        {numberedDirections.length === 0 ? (
          <div className="answers-empty">Нет данных для отображения таблицы.</div>
        ) : (
          <div className="table-responsive">
            <table className="results-table">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>№</th>
                  <th>Направление</th>
                  <th style={{ textAlign: 'right' }}>Санитарная</th>
                  <th style={{ textAlign: 'right' }}>Целевая</th>
                  <th style={{ textAlign: 'right' }}>Ответы</th>
                </tr>
              </thead>
              <tbody>
                {numberedDirections.map((d, idx) => (
                  <tr key={d.key}>
                    <td>{idx + 1}</td>
                    <td>{d.title}</td>
                    <td style={{ textAlign: 'right' }}>{Number(d.sanitary).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{Number(d.target).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{Number(d.responses).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {sectionRatings ? (
        <div className="sections-summary">
          <h3>Разделы</h3>
          <div className="sections-grid">
            {Object.entries(sectionRatings).map(([key, sr]) => (
              <div key={key} className="section-card">
                <div className="section-title">{sr.sectionKey || key}</div>
                <div className="section-metrics">
                  <div>Ответов: {sr.answeredCount ?? 0} / {sr.questionCount ?? 0}</div>
                  <div>Оценка: {sr.score ?? 0}</div>
                  {sr.missingRequiredIds && sr.missingRequiredIds.length > 0 ? (
                    <details>
                      <summary>Обязательные без ответа ({sr.missingRequiredIds.length})</summary>
                      <ul>
                        {sr.missingRequiredIds.map((id) => (
                          <li key={id}>{id}</li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="answers-section">
        <h3>Ваши ответы</h3>
        {Object.keys(answers).length === 0 ? (
          <div className="answers-empty">
            Ответы не найдены в payload API. Проверьте, что сервер возвращает поле answers.
          </div>
        ) : (
          <div className="answers-list">
            {Object.entries(answers).map(([key, value]) => (
              <div key={key} className="answer-item">
                <div className="answer-question">{key}</div>
                <div className="answer-value">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRaw ? (
        <div className="raw-block">
          <h3>Сырой ответ API</h3>
          <pre className="raw-pre">{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : null}

      <div className="results-actions">
        <button className="btn btn-primary" type="button" disabled>
          Скачать PDF
        </button>
        <button className="btn btn-secondary" type="button" disabled>
          Отправить на email
        </button>
        <button
          className="btn btn-outline"
          type="button"
          onClick={() => (window.location.href = '/')}
        >
          На главную
        </button>
      </div>
    </div>
  );
};
