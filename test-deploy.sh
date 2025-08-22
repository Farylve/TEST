#!/bin/bash

# Test deployment script
echo "Testing deployment process..."

# Check Docker installation
echo "Checking Docker installation..."
docker --version || { echo "Docker not found!"; exit 1; }
docker compose version || { echo "Docker Compose not found!"; exit 1; }

# Test directory setup
PROJECT_DIR="./test-deploy"
echo "Setting up test directory: $PROJECT_DIR"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Clone repository
echo "Cloning repository..."
git clone https://github.com/Farylve/TEST.git .

# Test docker-compose
echo "Testing docker-compose.prod.yml..."
if [ -f "docker-compose.prod.yml" ]; then
    echo "docker-compose.prod.yml found"
    
    echo "Stopping existing containers..."
    docker compose -f docker-compose.prod.yml down || true
    
    echo "Building images..."
    docker compose -f docker-compose.prod.yml build --no-cache
    
    echo "Starting containers..."
    docker compose -f docker-compose.prod.yml up -d
    
    echo "Waiting for containers to initialize..."
    sleep 30
    
    echo "Checking container status..."
    docker compose -f docker-compose.prod.yml ps
    
    echo "Testing health endpoint..."
    sleep 10
    curl -f http://localhost:5000/api/health || echo "Health check failed"
    
    echo "Stopping test containers..."
    docker compose -f docker-compose.prod.yml down
else
    echo "docker-compose.prod.yml not found!"
    exit 1
fi

echo "Test deployment completed!"