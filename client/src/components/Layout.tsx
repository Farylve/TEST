'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Функция для отслеживания состояния сайдбара
  const handleSidebarToggle = (isOpen: boolean) => {
    setSidebarOpen(isOpen);
  };

  return (
    <div className={styles.layout}>
      <Sidebar onToggle={handleSidebarToggle} />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}