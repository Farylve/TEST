# Test deployment script for PowerShell
Write-Host "Testing deployment process..."

# Check Docker installation
Write-Host "Checking Docker installation..."
try {
    docker --version
    docker compose version
} catch {
    Write-Host "Docker not found!" -ForegroundColor Red
    exit 1
}

# Test directory setup
$PROJECT_DIR = "./test-deploy"
Write-Host "Setting up test directory: $PROJECT_DIR"
New-Item -ItemType Directory -Path $PROJECT_DIR -Force | Out-Null
Set-Location $PROJECT_DIR

# Clone repository
Write-Host "Cloning repository..."
git clone https://github.com/Farylve/TEST.git .

# Test docker-compose
Write-Host "Testing docker-compose.prod.yml..."
if (Test-Path "docker-compose.prod.yml") {
    Write-Host "docker-compose.prod.yml found"
    
    Write-Host "Stopping existing containers..."
    docker compose -f docker-compose.prod.yml down
    
    Write-Host "Building images..."
    docker compose -f docker-compose.prod.yml build --no-cache
    
    Write-Host "Starting containers..."
    docker compose -f docker-compose.prod.yml up -d
    
    Write-Host "Waiting for containers to initialize..."
    Start-Sleep -Seconds 30
    
    Write-Host "Checking container status..."
    docker compose -f docker-compose.prod.yml ps
    
    Write-Host "Testing health endpoint..."
    Start-Sleep -Seconds 10
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
        Write-Host "Health check passed!" -ForegroundColor Green
    } catch {
        Write-Host "Health check failed: $_" -ForegroundColor Yellow
    }
    
    Write-Host "Stopping test containers..."
    docker compose -f docker-compose.prod.yml down
} else {
    Write-Host "docker-compose.prod.yml not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Test deployment completed!" -ForegroundColor Green