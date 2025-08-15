'use client';

import { useState, useEffect } from 'react';
import styles from './ServerStatus.module.css';

interface ServerStatusProps {
  serverUrl?: string;
}

export default function ServerStatus({ serverUrl = 'http://localhost:5000' }: ServerStatusProps) {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Добавляем timeout для быстрой проверки
        signal: AbortSignal.timeout(5000),
      });
      
      if (response.ok) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch (error) {
      setIsOnline(false);
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    // Проверяем статус при загрузке компонента
    checkServerStatus();

    // Устанавливаем интервал для периодической проверки (каждые 30 секунд)
    const interval = setInterval(checkServerStatus, 30000);

    return () => clearInterval(interval);
  }, [serverUrl]);

  const getStatusText = () => {
    if (isOnline === null) return 'Проверка...';
    return isOnline ? 'Сервер онлайн' : 'МАКС: ЛОХ 200 ок';
  };

  const getStatusClass = () => {
    if (isOnline === null) return styles.checking;
    return isOnline ? styles.online : styles.offline;
  };

  return (
    <div className={styles.serverStatus}>
      <div className={`${styles.indicator} ${getStatusClass()}`}>
        <div className={styles.dot}></div>
        <span className={styles.text}>{getStatusText()}</span>
      </div>
      {lastChecked && (
        <div className={styles.lastChecked}>
          Последняя проверка: {lastChecked.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}