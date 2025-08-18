# Portfolio Application

Полнофункциональное приложение с фронтендом на Next.js и бэкендом на Node.js + Express, готовое для развертывания через Docker и GitHub Actions.

## Структура проекта

```
.
├── front/                 # Next.js фронтенд
├── back/                  # Node.js + Express бэкенд
├── .github/workflows/     # GitHub Actions
├── docker-compose.yml     # Локальная разработка
├── docker-compose.prod.yml # Продакшен
├── nginx.conf            # Nginx конфигурация
└── README.md
```

## Локальная разработка

### Требования
- Docker и Docker Compose
- Node.js 18+ (для локальной разработки без Docker)

### Запуск с Docker

```bash
# Клонировать репозиторий
git clone <your-repo-url>
cd portfolio

# Запустить приложение
docker-compose up --build
```

Приложение будет доступно:
- Фронтенд: http://localhost:3000
- Бэкенд API: http://localhost:5000

### Запуск без Docker

```bash
# Бэкенд
cd back
npm install
npm run dev

# Фронтенд (в новом терминале)
cd front
npm install
npm run dev
```

## Развертывание на сервере

### Настройка GitHub Secrets

Добавьте следующие секреты в настройках GitHub репозитория:

- `SERVER_HOST` - IP адрес или домен сервера
- `SERVER_USER` - пользователь для SSH подключения
- `SERVER_SSH_KEY` - приватный SSH ключ
- `SERVER_PORT` - порт SSH (по умолчанию 22)
- `SERVER_PATH` - путь к проекту на сервере (по умолчанию /opt/portfolio)
- `DOCKER_USERNAME` - (опционально) логин Docker Hub
- `DOCKER_PASSWORD` - (опционально) пароль Docker Hub

### Подготовка сервера

```bash
# Установить Docker и Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Клонировать репозиторий
sudo mkdir -p /opt/portfolio
sudo chown $USER:$USER /opt/portfolio
cd /opt/portfolio
git clone <your-repo-url> .
```

### Автоматическое развертывание

При пуше в ветку `main` или `master` GitHub Actions автоматически:
1. Соберет и протестирует приложение
2. Подключится к серверу по SSH
3. Обновит код
4. Пересоберет и запустит контейнеры
5. Проверит работоспособность

### Ручное развертывание

```bash
# На сервере
cd /opt/portfolio
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d
```

## API Endpoints

- `GET /` - Главная страница API
- `GET /api/health` - Проверка работоспособности
- `GET /api/info` - Информация о сервере
- `GET /api/test` - Тестовые данные

## Мониторинг

```bash
# Просмотр логов
docker-compose logs -f

# Статус контейнеров
docker-compose ps

# Проверка здоровья
curl http://localhost:5000/api/health
```

## Troubleshooting

### Проблемы с CORS
Убедитесь, что `CORS_ORIGIN` в бэкенде соответствует URL фронтенда.

### Проблемы с подключением
Проверьте, что `NEXT_PUBLIC_API_URL` в фронтенде указывает на правильный адрес бэкенда.

### Проблемы с Docker
```bash
# Очистка Docker
docker system prune -a
docker-compose down --volumes
```