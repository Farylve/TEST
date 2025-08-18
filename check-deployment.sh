#!/bin/bash

# Скрипт для проверки состояния деплоя

echo "=== Проверка состояния деплоя ==="

# Проверка Docker
echo "1. Проверка Docker..."
docker --version || { echo "❌ Docker не установлен!"; exit 1; }
docker compose version || { echo "❌ Docker Compose не установлен!"; exit 1; }
echo "✅ Docker установлен"

# Проверка контейнеров
echo "\n2. Проверка контейнеров..."
docker compose -f docker-compose.prod.yml ps

# Проверка логов
echo "\n3. Логи backend контейнера:"
docker compose -f docker-compose.prod.yml logs --tail=20 backend

echo "\n4. Логи frontend контейнера:"
docker compose -f docker-compose.prod.yml logs --tail=20 frontend

# Проверка портов
echo "\n5. Проверка портов..."
echo "Порт 5000 (backend):"
netstat -tlnp | grep :5000 || echo "❌ Порт 5000 не прослушивается"

echo "Порт 3000 (frontend):"
netstat -tlnp | grep :3000 || echo "❌ Порт 3000 не прослушивается"

# Проверка API
echo "\n6. Проверка API..."
if curl -f http://localhost:5000/api/health 2>/dev/null; then
    echo "✅ Backend API работает"
else
    echo "❌ Backend API не отвечает"
fi

# Проверка frontend
echo "\n7. Проверка frontend..."
if curl -f http://localhost:3000 2>/dev/null; then
    echo "✅ Frontend работает"
else
    echo "❌ Frontend не отвечает"
fi

echo "\n=== Проверка завершена ==="