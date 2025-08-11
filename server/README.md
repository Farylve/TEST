# Portfolio Server

Express.js сервер для портфолио приложения с полной системой аутентификации, безопасности и работы с базой данных.

## 🚀 Возможности

- **Аутентификация и авторизация**: JWT токены, refresh токены, роли пользователей
- **Безопасность**: CORS, Helmet, Rate limiting, валидация данных
- **База данных**: PostgreSQL с Prisma ORM
- **Email система**: Верификация email, сброс пароля
- **Логирование**: Структурированные логи с разными уровнями
- **Валидация**: Express-validator для проверки входящих данных
- **TypeScript**: Полная типизация
- **Тестирование**: Jest для unit тестов

## 📋 Требования

Перед установкой убедитесь, что у вас установлены:

- **Node.js** (версия 18 или выше)
- **PostgreSQL** (версия 12 или выше)
- **npm** или **yarn**

## 🛠 Установка

### 1. Установка зависимостей

```bash
cd server
npm install
```

### 2. Настройка PostgreSQL

#### Установка PostgreSQL:

**Windows:**
1. Скачайте PostgreSQL с [официального сайта](https://www.postgresql.org/download/windows/)
2. Запустите установщик и следуйте инструкциям
3. Запомните пароль для пользователя `postgres`

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Создание базы данных:

```bash
# Подключение к PostgreSQL
psql -U postgres

# Создание базы данных
CREATE DATABASE portfolio_db;

# Создание пользователя (опционально)
CREATE USER portfolio_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;

# Выход
\q
```

### 3. Настройка переменных окружения

1. Скопируйте файл `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Отредактируйте `.env` файл:
```env
# Обновите строку подключения к базе данных
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/portfolio_db?schema=public"

# Измените секретные ключи
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production

# Настройте email (для Gmail):
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password  # Используйте App Password для Gmail
EMAIL_FROM=your-email@gmail.com
```

### 4. Настройка базы данных

```bash
# Генерация Prisma клиента
npx prisma generate

# Применение миграций
npx prisma db push

# Заполнение базы данных начальными данными (опционально)
npx prisma db seed
```

### 5. Настройка Email (Gmail)

Для использования Gmail:

1. Включите двухфакторную аутентификацию в Google аккаунте
2. Создайте App Password:
   - Перейдите в [Google Account settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Создайте новый App Password для "Mail"
   - Используйте этот пароль в `EMAIL_PASS`

## 🚀 Запуск

### Режим разработки:
```bash
npm run dev
```

### Продакшн:
```bash
npm run build
npm start
```

### Тестирование:
```bash
npm test
```

## 📁 Структура проекта

```
server/
├── src/
│   ├── config/          # Конфигурационные файлы
│   │   ├── cors.ts      # Настройки CORS
│   │   ├── database.ts  # Подключение к БД
│   │   └── rateLimit.ts # Rate limiting
│   ├── controllers/     # Контроллеры
│   │   ├── authController.ts
│   │   └── userController.ts
│   ├── middleware/      # Middleware
│   │   ├── auth.ts      # Аутентификация
│   │   ├── errorHandler.ts
│   │   ├── notFound.ts
│   │   └── validation.ts
│   ├── routes/          # Маршруты
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   └── index.ts
│   ├── utils/           # Утилиты
│   │   ├── email.ts     # Email сервис
│   │   └── logger.ts    # Логирование
│   └── index.ts         # Точка входа
├── prisma/
│   └── schema.prisma    # Схема базы данных
├── logs/                # Логи (создается автоматически)
├── .env                 # Переменные окружения
├── .env.example         # Пример переменных
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 API Endpoints

### Аутентификация (`/api/auth`)
- `POST /register` - Регистрация пользователя
- `POST /login` - Вход в систему
- `POST /logout` - Выход из системы
- `POST /refresh-token` - Обновление токена
- `POST /forgot-password` - Запрос сброса пароля
- `POST /reset-password` - Сброс пароля
- `GET /verify-email/:token` - Верификация email
- `POST /resend-verification` - Повторная отправка верификации

### Пользователи (`/api/users`)
- `GET /profile` - Получение профиля
- `PUT /profile` - Обновление профиля
- `PUT /change-password` - Смена пароля
- `DELETE /account` - Удаление аккаунта
- `GET /` - Список пользователей (админ)
- `GET /:id` - Пользователь по ID (админ)
- `PUT /:id` - Обновление пользователя (админ)
- `DELETE /:id` - Удаление пользователя (админ)

### Общие
- `GET /health` - Проверка состояния сервера
- `GET /api` - Информация об API

## 🔒 Безопасность

- **Helmet**: Защита от основных веб-уязвимостей
- **CORS**: Настроенная политика CORS
- **Rate Limiting**: Ограничение количества запросов
- **JWT**: Безопасная аутентификация
- **bcrypt**: Хеширование паролей
- **Валидация**: Проверка всех входящих данных
- **HTTPS**: Рекомендуется для продакшна

## 🧪 Тестирование

```bash
# Запуск всех тестов
npm test

# Запуск тестов в watch режиме
npm run test:watch

# Покрытие кода
npm run test:coverage
```

## 📝 Логирование

Логи сохраняются в папку `logs/` и выводятся в консоль. Уровни логирования:
- `error` - Ошибки
- `warn` - Предупреждения
- `info` - Информационные сообщения
- `debug` - Отладочная информация

## 🚀 Деплой

### Переменные окружения для продакшна:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
ALLOWED_ORIGINS=https://yourdomain.com
CLIENT_URL=https://yourdomain.com
```

### Docker (опционально):

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Разработка

### Добавление новых маршрутов:

1. Создайте контроллер в `src/controllers/`
2. Добавьте маршруты в `src/routes/`
3. Подключите маршруты в `src/routes/index.ts`
4. Добавьте валидацию если необходимо

### Работа с базой данных:

```bash
# Просмотр базы данных
npx prisma studio

# Создание миграции
npx prisma migrate dev --name migration-name

# Сброс базы данных
npx prisma migrate reset
```

## 📞 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте логи в папке `logs/`
2. Убедитесь, что PostgreSQL запущен
3. Проверьте переменные окружения
4. Убедитесь, что все зависимости установлены

## 📄 Лицензия

MIT License