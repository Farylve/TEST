# Deployment Guide

This guide covers deploying the Portfolio API server to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Platform-Specific Deployments](#platform-specific-deployments)
  - [Heroku](#heroku)
  - [Railway](#railway)
  - [DigitalOcean App Platform](#digitalocean-app-platform)
  - [AWS ECS](#aws-ecs)
  - [Google Cloud Run](#google-cloud-run)
- [Database Setup](#database-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup Strategy](#backup-strategy)

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

## Environment Variables

Create a `.env` file with the following variables:

```bash
# Required Environment Variables
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
CLIENT_URL=https://yourdomain.com

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

## Docker Deployment

### 1. Build and Run with Docker Compose

```bash
# Clone the repository
git clone <your-repo-url>
cd portfolio/server

# Copy environment file
cp .env.example .env
# Edit .env with your production values

# Build and start services
docker-compose up -d

# Run database migrations
docker-compose exec server npx prisma migrate deploy

# Seed the database (optional)
docker-compose exec server npx prisma db seed
```

### 2. Production Docker Compose

```bash
# Use production profile
docker-compose --profile production up -d
```

## Platform-Specific Deployments

### Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Add PostgreSQL Add-on**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set JWT_REFRESH_SECRET=your-refresh-secret
   # Add other environment variables
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Run Migrations**
   ```bash
   heroku run npx prisma migrate deploy
   heroku run npx prisma db seed
   ```

### Railway

1. **Connect GitHub Repository**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository

2. **Add PostgreSQL Service**
   - Add a new service
   - Select PostgreSQL

3. **Configure Environment Variables**
   - Add all required environment variables
   - Use the PostgreSQL connection string from Railway

4. **Deploy**
   - Railway will automatically deploy on git push

### DigitalOcean App Platform

1. **Create App**
   ```bash
   # Create app.yaml
   name: portfolio-api
   services:
   - name: api
     source_dir: /server
     github:
       repo: your-username/portfolio
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     env:
     - key: NODE_ENV
       value: production
     # Add other environment variables
   databases:
   - name: portfolio-db
     engine: PG
     version: "13"
   ```

2. **Deploy**
   ```bash
   doctl apps create --spec app.yaml
   ```

### AWS ECS

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name portfolio-api
   ```

2. **Build and Push Docker Image**
   ```bash
   # Get login token
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   # Build image
   docker build -t portfolio-api .
   
   # Tag image
   docker tag portfolio-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/portfolio-api:latest
   
   # Push image
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/portfolio-api:latest
   ```

3. **Create ECS Task Definition**
   ```json
   {
     "family": "portfolio-api",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "portfolio-api",
         "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/portfolio-api:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/portfolio-api",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

### Google Cloud Run

1. **Build and Deploy**
   ```bash
   # Build image
   gcloud builds submit --tag gcr.io/PROJECT-ID/portfolio-api
   
   # Deploy to Cloud Run
   gcloud run deploy --image gcr.io/PROJECT-ID/portfolio-api --platform managed
   ```

2. **Set Environment Variables**
   ```bash
   gcloud run services update portfolio-api \
     --set-env-vars NODE_ENV=production,JWT_SECRET=your-secret
   ```

## Database Setup

### PostgreSQL Configuration

1. **Create Database**
   ```sql
   CREATE DATABASE portfolio;
   CREATE USER portfolio_user WITH ENCRYPTED PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE portfolio TO portfolio_user;
   ```

2. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed Database**
   ```bash
   npx prisma db seed
   ```

### Database Backup

```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql
```

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain Certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name yourdomain.com www.yourdomain.com;
   
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Monitoring and Logging

### Health Checks

- **Endpoint**: `GET /api/health`
- **Expected Response**: `200 OK`

### Log Aggregation

1. **Using Winston with External Service**
   ```javascript
   // Configure Winston to send logs to external service
   const winston = require('winston');
   const { LoggingWinston } = require('@google-cloud/logging-winston');
   
   const logger = winston.createLogger({
     transports: [
       new LoggingWinston(),
       new winston.transports.Console()
     ]
   });
   ```

### Monitoring Tools

- **Application Performance**: New Relic, DataDog
- **Uptime Monitoring**: Pingdom, UptimeRobot
- **Error Tracking**: Sentry, Bugsnag

## Backup Strategy

### Automated Database Backups

```bash
#!/bin/bash
# backup.sh
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups"
DATABASE_URL="your-database-url"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://your-backup-bucket/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

### Cron Job Setup

```bash
# Add to crontab
crontab -e

# Run backup daily at 2 AM
0 2 * * * /path/to/backup.sh
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure environment variables
- [ ] Enable rate limiting
- [ ] Use strong JWT secrets
- [ ] Implement proper CORS configuration
- [ ] Keep dependencies updated
- [ ] Use security headers (Helmet.js)
- [ ] Implement proper error handling
- [ ] Set up monitoring and alerting
- [ ] Regular security audits

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database connectivity
   npx prisma db pull
   ```

2. **Migration Issues**
   ```bash
   # Reset database (development only)
   npx prisma migrate reset
   
   # Deploy migrations
   npx prisma migrate deploy
   ```

3. **Environment Variable Issues**
   ```bash
   # Check environment variables
   printenv | grep -E '(DATABASE_URL|JWT_SECRET)'
   ```

### Logs Analysis

```bash
# View application logs
docker-compose logs -f server

# View specific service logs
heroku logs --tail --app your-app-name
```

## Support

For deployment issues:

1. Check the application logs
2. Verify environment variables
3. Test database connectivity
4. Check health endpoint
5. Review security settings

For additional help, please refer to the main [README.md](./README.md) or create an issue in the repository.