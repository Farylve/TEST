'use client';

import React from 'react';
import Sidebar from './Sidebar';
import ServerStatus from './ServerStatus';
import styles from './Layout.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Функция для отслеживания состояния сайдбара
  const handleSidebarToggle = () => {
    // Логика обработки состояния сайдбара
  };

  return (
    <div className={styles.layout}>
      <Sidebar onToggle={handleSidebarToggle} />
      <main className={styles.main}>
        {children}
      </main>
      <ServerStatus />
    </div>
  );
}