//  MainLayout.tsx
import React, { ReactNode } from 'react';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  showHeader = true
}) => {
  return (
    <div className="main-layout">
      {showHeader && (
        <header className="main-header">
          <div className="header-content">
            <div className="logo">
              <h1>🛡️ Vedun</h1>
              <p>Cyber Risk Assessment Platform</p>
            </div>
            <nav className="main-nav">
              <a href="/">Home</a>
              <a href="/dashboard">Dashboard</a>
              <a href="/about">About</a>
            </nav>
          </div>
        </header>
      )}

      <main className="main-content">
        {title && <h1 className="page-title">{title}</h1>}
        {children}
      </main>

      <footer className="main-footer">
        <p>&copy; 2024 Vedun. Cyber Risk Assessment Platform</p>
      </footer>
    </div>
  );
};
