# Инструкция по деплою Portfolio через Docker

## Предварительные требования

### 1. Установка Docker

#### На Windows:
1. Скачайте Docker Desktop с [официального сайта](https://www.docker.com/products/docker-desktop/)
2. Установите Docker Desktop
3. Перезагрузите компьютер
4. Запустите Docker Desktop
5. Проверьте установку: `docker --version`

#### На Ubuntu/Debian:
```bash
# Обновите пакеты
sudo apt update

# Установите Docker
sudo apt install docker.io docker-compose-plugin

# Добавьте пользователя в группу docker
sudo usermod -aG docker $USER

# Перезайдите в систему или выполните
newgrp docker

# Проверьте установку
docker --version
docker compose version
```

### 2. Настройка GitHub Repository

#### Включите GitHub Container Registry:
1. Перейдите в Settings → Actions → General
2. В разделе "Workflow permissions" выберите "Read and write permissions"
3. Сохраните изменения

#### Настройте Secrets для деплоя на сервер:
Перейдите в Settings → Secrets and variables → Actions и добавьте:

```
HOST=your-server-ip
USERNAME=your-server-username
SSH_PRIVATE_KEY=your-private-ssh-key
SSH_PASSPHRASE=your-ssh-key-passphrase (если есть)
POSTGRES_DB=portfolio
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CORS_ORIGIN=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Локальная разработка

### 1. Клонирование и настройка
```bash
git clone <your-repo-url>
cd portfolio

# Скопируйте файл окружения
cp .env.example .env

# Отредактируйте .env файл с вашими настройками
```

### 2. Запуск через Docker Compose
```bash
# Запуск всех сервисов
docker compose up --build -d

# Проверка статуса
docker compose ps

# Просмотр логов
docker compose logs -f

# Остановка сервисов
docker compose down
```

### 3. Доступ к приложению
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

## Деплой на сервер

### 1. Подготовка сервера

#### Установите Docker на сервере:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo usermod -aG docker $USER
```

#### Создайте директорию для проекта:
```bash
sudo mkdir -p /var/www/portfolio
sudo chown $USER:$USER /var/www/portfolio
cd /var/www/portfolio
```

#### Создайте .env файл на сервере:
```bash
cat > .env << EOF
POSTGRES_DB=portfolio
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CORS_ORIGIN=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
EOF
```

### 2. Автоматический деплой через GitHub Actions

При пуше в ветку `main` автоматически:
1. Собираются Docker образы для сервера и клиента
2. Образы публикуются в GitHub Container Registry
3. На сервер копируются файлы конфигурации
4. Запускается обновленная версия приложения

### 3. Ручной деплой

Если нужно развернуть вручную:

```bash
# На сервере
cd /var/www/portfolio

# Скачайте docker-compose.prod.yml из репозитория
wget https://raw.githubusercontent.com/your-username/your-repo/main/docker-compose.yml

# Логин в GitHub Container Registry
echo "your-github-token" | docker login ghcr.io -u your-username --password-stdin

# Запуск приложения
docker compose -f docker-compose.prod.yml up -d

# Выполнение миграций
docker compose -f docker-compose.prod.yml exec server npx prisma migrate deploy
```

## Управление приложением

### Полезные команды Docker Compose:

```bash
# Просмотр статуса контейнеров
docker compose ps

# Просмотр логов
docker compose logs -f [service-name]

# Перезапуск сервиса
docker compose restart [service-name]

# Обновление образов
docker compose pull
docker compose up -d

# Выполнение команд в контейнере
docker compose exec server npm run migrate
docker compose exec postgres psql -U postgres -d portfolio

# Резервное копирование базы данных
docker compose exec postgres pg_dump -U postgres portfolio > backup.sql

# Восстановление базы данных
docker compose exec -T postgres psql -U postgres portfolio < backup.sql
```

### Мониторинг:

```bash
# Использование ресурсов
docker stats

# Проверка здоровья контейнеров
docker compose ps

# Очистка неиспользуемых образов
docker image prune -f

# Очистка всех неиспользуемых ресурсов
docker system prune -f
```

## Настройка Nginx (опционально)

Для production рекомендуется использовать Nginx как reverse proxy:

```bash
# Создайте конфигурацию Nginx
sudo mkdir -p /var/www/portfolio/nginx
cat > /var/www/portfolio/nginx/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream client {
        server client:3000;
    }
    
    upstream server {
        server server:5000;
    }
    
    server {
        listen 80;
        server_name yourdomain.com;
        
        location / {
            proxy_pass http://client;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
        
        location /api {
            proxy_pass http://server;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
    }
}
EOF
```

Затем запустите с Nginx:
```bash
docker compose --profile production up -d
```

## Troubleshooting

### Проблемы с GitHub Actions:
```bash
# Если GitHub Actions не может найти Dockerfile:
# 1. Проверьте, что файлы не игнорируются .gitignore
# 2. Убедитесь, что Dockerfile находится в правильной директории
# 3. Проверьте, что файлы добавлены в git:
git add server/Dockerfile server/.dockerignore client/Dockerfile client/.dockerignore
git commit -m "Добавить Docker файлы"
git push origin main
```

### Проблемы с подключением к базе данных:
```bash
# Проверьте статус PostgreSQL
docker compose logs postgres

# Подключитесь к базе данных
docker compose exec postgres psql -U postgres -d portfolio
```

### Проблемы с сборкой образов:
```bash
# Очистите кэш Docker
docker builder prune -f

# Пересоберите образы
docker compose build --no-cache
```

### Проблемы с портами:
```bash
# Проверьте занятые порты
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Остановите конфликтующие процессы
sudo lsof -ti:3000 | xargs sudo kill -9
```

## Безопасность

1. **Измените пароли по умолчанию** в .env файле
2. **Используйте сильные JWT секреты** (минимум 32 символа)
3. **Настройте firewall** на сервере
4. **Регулярно обновляйте** Docker образы
5. **Используйте HTTPS** в production
6. **Ограничьте доступ** к PostgreSQL только для приложения

## Мониторинг и логи

```bash
# Просмотр логов в реальном времени
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f server
docker compose logs -f client
docker compose logs -f postgres

# Экспорт логов
docker compose logs > app.log
```

Эта инструкция покрывает полный цикл разработки и деплоя вашего Portfolio приложения с использованием Docker и автоматического деплоя через GitHub Actions.