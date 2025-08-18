# Portfolio Project

This is a full-stack portfolio application with a Node.js backend and Next.js frontend.

## Project Structure

```
├── back/                    # Backend (Node.js + Express)
├── front/                   # Frontend (Next.js)
├── .github/workflows/       # GitHub Actions workflows
├── docker-compose.yml       # Development Docker configuration
├── docker-compose.prod.yml  # Production Docker configuration
├── check-deployment.sh      # Deployment diagnostic script
└── README.md               # This file
```

## Development

### Prerequisites
- Node.js 18+
- Docker and Docker Compose

### Local Development

1. Clone the repository
2. Run with Docker Compose:
   ```bash
   docker compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Manual Development

1. Backend:
   ```bash
   cd back
   npm install
   npm run dev
   ```

2. Frontend:
   ```bash
   cd front
   npm install
   npm run dev
   ```

## Production Deployment

The application is automatically deployed using GitHub Actions when code is pushed to the main branch.

### Server Requirements
- Docker and Docker Compose
- Git
- SSH access
- Ports 3000 and 5000 available

### GitHub Secrets
Configure the following secrets in your GitHub repository:
- `HOST`: Server IP address
- `USERNAME`: SSH username
- `SSH_PRIVATE_KEY`: SSH private key
- `SSH_PASSPHRASE`: SSH key passphrase (if any)
- `PORT`: SSH port (default: 22)
- `SERVER_PATH`: Path to project on server (default: /opt/portfolio)

### Manual Deployment on Server

1. Clone the repository:
   ```bash
   git clone <your-repo-url> /opt/portfolio
   cd /opt/portfolio
   ```

2. Deploy with production configuration:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

3. Check deployment status:
   ```bash
   chmod +x check-deployment.sh
   ./check-deployment.sh
   ```

## Troubleshooting

### Common Issues

1. **"Failed to connect to localhost port 5000"**
   - Check if backend container is running: `docker compose -f docker-compose.prod.yml ps`
   - Check backend logs: `docker compose -f docker-compose.prod.yml logs backend`
   - Verify port is not blocked by firewall

2. **Containers not starting**
   - Check Docker installation: `docker --version`
   - Check available disk space: `df -h`
   - Check container logs for errors

3. **GitHub Actions deployment fails**
   - Verify all secrets are configured correctly
   - Check server has Docker and Docker Compose installed
   - Ensure SSH key has proper permissions
   - Check server logs during deployment

### Diagnostic Commands

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend

# Test API manually
curl http://localhost:5000/api/health

# Check port usage
netstat -tlnp | grep :5000
netstat -tlnp | grep :3000

# Restart services
docker compose -f docker-compose.prod.yml restart

# Full rebuild
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/test` - Test endpoint

## Technologies Used

- **Backend**: Node.js, Express
- **Frontend**: Next.js, React
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: SSH-based deployment

## Health Checks

The application includes comprehensive health checks:
- Backend container health check every 15 seconds
- GitHub Actions deployment verification
- Automatic retry logic for failed deployments
- Detailed logging for troubleshooting