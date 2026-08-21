import React from 'react';
import styles from './auth.module.css';

export default function AuthLayout({ children }) {
  return (
    <div className={styles.container}>
      {/* Header phong cách ChàGee */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span>🌱</span> SmartFarm
        </div>
      </header>

      {/* Khung nội dung chính */}
      <main className={styles.mainContent}>
        {children}
      </main>

      {/* Footer khối Navy đậm */}
      <footer className={styles.footer}>
        <p>© 2026 SmartFarm Project. Designed with Azure Serverless Architecture.</p>
      </footer>
    </div>
  );
}