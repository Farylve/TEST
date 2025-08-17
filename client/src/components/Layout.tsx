'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ServerStatus from './ServerStatus';
import styles from './Layout.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // Функция для отслеживания состояния сайдбара
  const handleSidebarToggle = () => {
    // Логика обработки состояния сайдбара
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={styles.layout}>
      <Sidebar onToggle={handleSidebarToggle} />
      <main className={styles.main}>
        <>
          <h1>PORTFOLIO</h1>
          <small>Build date: {mounted ? new Date().toLocaleDateString() : 'Loading...'}</small>
        </>
        {children}
      </main>
      <ServerStatus />
    </div>
  );
}