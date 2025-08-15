# Graceful Degradation для PostgreSQL

Этот документ описывает реализацию graceful degradation для сервера, позволяющую ему продолжать работу даже при недоступности базы данных PostgreSQL.

## Обзор

Сервер теперь может:
- Запускаться без подключения к базе данных
- Автоматически переподключаться к БД при восстановлении доступности
- Предоставлять ограниченную функциональность без БД
- Возвращать понятные ошибки при недоступности БД

## Компоненты

### 1. Database Service (`src/services/database.ts`)

Основной сервис для управления подключением к PostgreSQL:

- **Автоматические переподключения**: До 5 попыток с интервалом 5 секунд
- **Проверка состояния**: Мониторинг доступности БД
- **Graceful shutdown**: Корректное закрытие соединений
- **Singleton pattern**: Единый экземпляр для всего приложения

#### Основные методы:

```typescript
// Подключение к БД
await databaseService.connect();

// Проверка доступности
const isConnected = await databaseService.checkConnection();

// Получение Prisma клиента
const prisma = databaseService.getPrismaClient();

// Принудительное переподключение
await databaseService.forceReconnect();

// Получение статуса
const status = databaseService.getConnectionStatus();
```

### 2. Database Middleware (`src/middleware/databaseCheck.ts`)

Middleware для проверки доступности БД:

#### `requireDatabase`
- Требует обязательного подключения к БД
- Возвращает 503 ошибку при недоступности
- Используется для критических операций (auth, user management)

#### `checkDatabase`
- Проверяет БД, но продолжает выполнение
- Добавляет информацию о БД в request объект
- Используется для некритических операций

#### `handleDatabaseReconnect`
- Endpoint для принудительного переподключения
- Доступен по `POST /api/health/reconnect`

### 3. Обновленные Routes

#### Health Routes (`src/routes/health.ts`)
- `GET /api/health` - Общий статус с информацией о БД
- `GET /api/health/ready` - Readiness probe (работает без БД)
- `GET /api/health/live` - Liveness probe
- `POST /api/health/reconnect` - Принудительное переподключение к БД

#### Auth Routes (`src/routes/auth.ts`)
Все маршруты аутентификации требуют БД (`requireDatabase`):
- Регистрация, вход, выход
- Восстановление пароля
- Верификация email

#### User Routes (`src/routes/users.ts`)
Все пользовательские операции требуют БД (`requireDatabase`):
- Профиль пользователя
- Управление пользователями (admin)

## Поведение при недоступности БД

### Запуск сервера
1. Сервер пытается подключиться к БД
2. При неудаче выводит предупреждение и продолжает запуск
3. Автоматически пытается переподключиться в фоне

### API Endpoints

#### Endpoints, работающие без БД:
- `GET /` - Главная страница
- `GET /api` - API информация
- `GET /api/health/live` - Liveness check
- `GET /api/health/ready` - Readiness check (с ограничениями)

#### Endpoints, требующие БД:
- Все `/api/auth/*` маршруты
- Все `/api/users/*` маршруты

При недоступности БД возвращают:
```json
{
  "success": false,
  "message": "Database service is currently unavailable. Please try again later.",
  "error": "DATABASE_UNAVAILABLE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Health Check Responses

#### С подключенной БД:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "memory": {
      "used": "50.5 MB",
      "total": "100.0 MB",
      "percentage": "50.50"
    }
  }
}
```

#### Без БД:
```json
{
  "status": "unhealthy",
  "services": {
    "database": "disconnected"
  }
}
```

## Мониторинг и Логирование

### Логи подключения
```
✅ Database connected successfully
⚠️  Server starting without database connection. Some features may be limited.
❌ Database connection failed (attempt 1/5): ...
```

### Логи операций
```
Database unavailable for POST /api/auth/login
Database unavailable for GET /api/users/profile - continuing with limited functionality
```

## Переменные окружения

Для настройки поведения можно использовать:

```env
# Максимальное количество попыток переподключения (по умолчанию: 5)
DB_MAX_RETRIES=5

# Задержка между попытками в миллисекундах (по умолчанию: 5000)
DB_RETRY_DELAY=5000

# Таймаут подключения к БД (по умолчанию: 10000)
DB_CONNECTION_TIMEOUT=10000
```

## Рекомендации по использованию

### В Production
1. Настройте мониторинг health endpoints
2. Используйте load balancer для проверки readiness
3. Настройте алерты на статус БД
4. Ограничьте доступ к `/api/health/reconnect`

### В Development
1. Используйте `GET /api/health` для проверки статуса
2. При проблемах с БД используйте `POST /api/health/reconnect`
3. Проверяйте логи для диагностики проблем

### Kubernetes/Docker
```yaml
livenessProbe:
  httpGet:
    path: /api/health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Устранение неполадок

### Сервер не подключается к БД
1. Проверьте `DATABASE_URL` в переменных окружения
2. Убедитесь, что PostgreSQL запущен и доступен
3. Проверьте сетевые настройки и файрвол
4. Используйте `POST /api/health/reconnect` для принудительного переподключения

### Частые переподключения
1. Проверьте стабильность сетевого соединения
2. Увеличьте `DB_RETRY_DELAY`
3. Проверьте настройки PostgreSQL (max_connections, timeout)

### Высокая нагрузка на БД
1. Мониторьте количество подключений
2. Настройте connection pooling в Prisma
3. Оптимизируйте запросы к БД