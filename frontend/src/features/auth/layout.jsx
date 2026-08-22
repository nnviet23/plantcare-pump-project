import React from 'react';
import styles from './auth.module.css';

export default function AuthLayout({ children }) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span>🌱</span> SmartFarm
        </div>
      </header>

      <main className={styles.mainContent}>
        {children}
      </main>

      <footer className={styles.footer}>
        <p>© 2026 SmartFarm Project. Designed with Azure Serverless Architecture.</p>
      </footer>
    </div>
  );
}