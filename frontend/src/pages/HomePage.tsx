import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="page page--container">
      <section className="hero">
        <h1>Платформа оценки киберрисков «Ведун»</h1>
        <p className="hero-subtitle">
          Управление клиентами, опросами и рейтингами киберрисков для страховых компаний и брокеров.
        </p>
        <div className="hero-actions">
          <Link to="/broker" className="btn primary">
            Перейти к профилю компании
          </Link>
        </div>
      </section>

      <section className="feature-grid">
        <div className="feature-card">
          <h3>Клиенты</h3>
          <p>Ведение списка страхователей и доступ к их опросам по киберрискам.</p>
        </div>
        <div className="feature-card">
          <h3>Опросы</h3>
          <p>Управление анкетами оценки кибербезопасности и отправка ссылок клиентам.</p>
        </div>
        <div className="feature-card">
          <h3>Аналитика</h3>
          <p>Агрегация ответов, оценки киберрисков и отчётность для андеррайтинга.</p>
        </div>
      </section>
    </div>
  );
}
