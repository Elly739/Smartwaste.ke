# Docker Deployment Guide for SmartWaste.ke

This guide covers containerizing and deploying SmartWaste.ke using Docker.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Development Setup](#development-setup)
4. [Production Deployment](#production-deployment)
5. [Platform-Specific Guides](#platform-specific-guides)
6. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)
- Git

### Start Development Environment

```bash
# Clone the repository
git clone https://github.com/Elly739/Smartwaste.ke.git
cd Smartwaste.ke

# Copy environment variables
cp .env.docker .env

# Start services (database not included in dev mode)
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
```

### Stop Services

```bash
docker-compose down

# Include volumes cleanup
docker-compose down -v
```

## Architecture

### Containerization Strategy

**Multi-Stage Builds**: Each Dockerfile uses multi-stage builds to minimize image size:
- Build stage: Install dependencies, compile/build code
- Runtime stage: Only include necessary runtime dependencies
- Result: ~50% smaller images

**Image Details**:
- Server: Node.js 20 Alpine (~250MB)
- Client: Node.js 20 Alpine (~300MB)
- Database: PostgreSQL 16 Alpine (~100MB)

### Service Communication

```
Frontend (Port 3000)
    ↓
Express Backend (Port 4000)
    ↓
SQLite/PostgreSQL Database
```

## Development Setup

### Development Docker Compose

**File**: `docker-compose.yml`

Features:
- Hot-reload via volume mounts
- Source code mounted for real-time changes
- SQLite database for simple development
- Network isolation for service communication
- Health checks for each service

### Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server

# Run command in container
docker-compose exec server npm test

# Rebuild and start
docker-compose up --build

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Environment Variables

Create `.env` file in project root:

```env
# Server
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=secure-password-change-me
ADMIN_NAME=Your Name

# Client
VITE_API_BASE_URL=http://localhost:4000/api

# Database
DATABASE_PATH=./data/smartwaste.sqlite
```

### Volume Mounting for Development

The development compose mounts source directories for hot-reload:

```yaml
volumes:
  - ./server/src:/app/src          # Server source code
  - ./client/vite-project/src:/app/src  # Client source
  - ./server/data:/app/data        # Database persistence
```

## Production Deployment

### Production Docker Compose

**File**: `docker-compose.prod.yml`

Features:
- PostgreSQL database (not SQLite)
- No volume mounts (immutable containers)
- Environment-based configuration
- Production-ready health checks
- Automatic restart policies

### Build and Push Images

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Tag images
docker tag smartwaste-server:latest your-registry/smartwaste-server:latest
docker tag smartwaste-client:latest your-registry/smartwaste-client:latest

# Push to registry (Docker Hub, ECR, etc.)
docker push your-registry/smartwaste-server:latest
docker push your-registry/smartwaste-client:latest
```

### Production Environment Variables

Create `.env.prod` file:

```env
# Critical - change these!
ADMIN_EMAIL=admin@smartwaste.ke
ADMIN_PASSWORD=strong-password-minimum-16-chars
ADMIN_NAME=Admin User

# Database
DB_USER=smartwaste_user
DB_PASSWORD=strong-database-password-minimum-16-chars

# URLs
CORS_ORIGIN=https://smartwaste.ke
API_URL=https://api.smartwaste.ke

# Performance
LOG_LEVEL=info
NODE_ENV=production
PORT=4000
```

### Start Production Services

```bash
# Load environment variables from .env.prod
export $(cat .env.prod | xargs)

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## Platform-Specific Guides

### Railway.app Deployment

Railway is the easiest option - auto-detects Docker and deploys.

**Steps**:

1. **Connect GitHub Repository**
   - Sign in to railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Select Elly739/Smartwaste.ke
   - Authorize Railway

2. **Configure Services**
   ```bash
   # Create railway.json in project root:
   {
     "services": [
       {
         "name": "server",
         "buildCommand": "npm ci",
         "startCommand": "npm run dev",
         "port": 4000,
         "environments": ["production"]
       },
       {
         "name": "client",
         "buildCommand": "npm ci && npm run build",
         "startCommand": "npm run preview",
         "port": 3000
       }
     ]
   }
   ```

3. **Set Environment Variables**
   - Go to project settings
   - Add variables under "Variables"
   - Required: `ADMIN_PASSWORD`, `DB_PASSWORD`, `CORS_ORIGIN`, `API_URL`

4. **Deploy**
   - Push code to GitHub
   - Railway automatically deploys on push
   - View deployment logs in dashboard

**Pricing**: $5/month minimum, pay-as-you-go

### Render.com Deployment

**Steps**:

1. **Create Web Service**
   - Sign in to render.com
   - Click "New +" → "Web Service"
   - Connect GitHub repository

2. **Configure Service**
   - **Name**: smartwaste-server
   - **Runtime**: Docker
   - **Build Command**: `docker build -f server/Dockerfile -t server .`
   - **Start Command**: `docker run -p 4000:4000 server`

3. **Set Environment Variables**
   - Add all required environment variables in settings

4. **Deploy Database**
   - Create PostgreSQL database
   - Get connection string
   - Set `DATABASE_URL` in service variables

**Pricing**: Free tier available, paid plans from $7/month

### AWS Deployment (ECS)

**Steps**:

1. **Create ECR Repositories**
   ```bash
   aws ecr create-repository --repository-name smartwaste-server
   aws ecr create-repository --repository-name smartwaste-client
   ```

2. **Build and Push Images**
   ```bash
   # Get ECR login token
   aws ecr get-login-password --region us-east-1 | docker login \
     --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

   # Build and push
   docker build -t smartwaste-server ./server
   docker tag smartwaste-server:latest \
     YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/smartwaste-server:latest
   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/smartwaste-server:latest
   ```

3. **Create ECS Task Definitions**
   - Specify container images from ECR
   - Set environment variables
   - Configure port mappings

4. **Create ECS Service**
   - Link to ALB (Application Load Balancer)
   - Configure auto-scaling
   - Set desired task count

5. **Configure RDS**
   - Create PostgreSQL database
   - Update `DATABASE_URL` in task definition

### DigitalOcean App Platform

**Steps**:

1. **Push Docker Images to Docker Hub**
   ```bash
   docker login
   docker tag smartwaste-server:latest yourusername/smartwaste-server:latest
   docker push yourusername/smartwaste-server:latest
   ```

2. **Create App on DigitalOcean**
   - Sign in to DO console
   - Click "Create" → "Apps"
   - Connect GitHub

3. **Configure Services**
   ```yaml
   name: smartwaste
   services:
     - name: server
       image: yourusername/smartwaste-server:latest
       http_port: 4000
       envs:
         - key: NODE_ENV
           value: production
     - name: client
       image: yourusername/smartwaste-client:latest
       http_port: 3000
   databases:
     - name: db
       engine: POSTGRESQL
       version: "16"
   ```

4. **Deploy**
   - Configure domain
   - Review and deploy
   - View live URL

**Pricing**: $5/month minimum

### Self-Hosted (VPS/Bare Metal)

**Steps**:

1. **Install Docker**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo usermod -aG docker $USER
   ```

2. **Clone Repository**
   ```bash
   git clone https://github.com/Elly739/Smartwaste.ke.git
   cd Smartwaste.ke
   ```

3. **Configure Environment**
   ```bash
   cp .env.docker .env.prod
   # Edit .env.prod with your values
   nano .env.prod
   ```

4. **Start Services**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. **Setup Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name smartwaste.ke api.smartwaste.ke;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location /api {
           proxy_pass http://localhost:4000/api;
           proxy_set_header Host $host;
       }
   }
   ```

6. **Setup SSL (Let's Encrypt)**
   ```bash
   sudo apt install certbot nginx-certbot
   sudo certbot --nginx -d smartwaste.ke -d api.smartwaste.ke
   ```

## Health Checks

All containers include health checks:

```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# View health check logs
docker inspect --format='{{json .State.Health}}' smartwaste-server | jq
```

## Logging and Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server

# Last 100 lines
docker-compose logs --tail=100 server

# Since timestamp
docker-compose logs --since 2024-01-01T00:00:00Z server
```

### Monitor Resources

```bash
# Docker stats
docker stats

# Container resource usage
docker container stats smartwaste-server

# View container details
docker inspect smartwaste-server
```

## Scaling

### Horizontal Scaling (Multiple Container Instances)

Use Docker Swarm or Kubernetes:

```bash
# Docker Swarm
docker swarm init
docker service create --name smartwaste-server \
  --replicas 3 \
  -p 4000:4000 \
  smartwaste-server:latest

# Kubernetes (using Helm)
helm install smartwaste ./kubernetes/charts/smartwaste
```

### Vertical Scaling (Larger Container Resources)

Edit docker-compose.prod.yml:

```yaml
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Security Best Practices

1. **Never commit `.env` files**
   ```bash
   echo ".env.local" >> .gitignore
   echo ".env.prod" >> .gitignore
   ```

2. **Use strong passwords**
   - Minimum 16 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Use password generators

3. **Regular image updates**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

4. **Use image scanning**
   ```bash
   # Scan for vulnerabilities
   docker scan smartwaste-server:latest
   ```

5. **Network isolation**
   - Use Docker networks
   - Don't expose unnecessary ports
   - Use firewalls

6. **Data encryption**
   - Use HTTPS/TLS in production
   - Encrypt database credentials
   - Use secret management (HashiCorp Vault, AWS Secrets Manager)

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs server

# Common issues:
# - Port already in use: docker ps, kill process on port
# - Missing environment variables: docker-compose config
# - Build errors: docker-compose build --no-cache
```

### Database connection failed

```bash
# Check database service
docker-compose ps

# Test connection from server container
docker-compose exec server node -e \
  "const db = require('sqlite3').verbose(); \
   new db.Database('./data/smartwaste.sqlite', err => \
     console.log(err ? 'Failed: ' + err : 'Connected')"

# For PostgreSQL
docker-compose exec db psql -U smartwaste -d smartwaste
```

### API calls failing

```bash
# Check network connectivity
docker-compose exec client ping server

# Test API endpoint
docker-compose exec client curl http://server:4000/api/health

# Check CORS configuration
# Verify CORS_ORIGIN matches client URL
docker-compose config | grep CORS_ORIGIN
```

### High memory usage

```bash
# Check container memory
docker stats

# Limit memory in docker-compose.yml
services:
  server:
    deploy:
      resources:
        limits:
          memory: 512M
```

### Volumes not persisting

```bash
# Check volume status
docker volume ls
docker volume inspect smartwaste_smartwaste-data

# Ensure volume is mounted in compose
docker inspect smartwaste-server | grep -A 5 Mounts

# Fix: Recreate with proper volume
docker-compose down -v
docker-compose up -d
```

## Performance Optimization

### Image Optimization

```dockerfile
# Already implemented in Dockerfiles:
# - Multi-stage builds
# - Alpine base images
# - npm ci instead of npm install
# - .dockerignore for excluding files
```

### Runtime Optimization

```bash
# Use slim/minimal images
FROM node:20-slim

# Or use distroless
FROM gcr.io/distroless/nodejs20-debian11
```

### Caching

```bash
# Docker layer caching
# Copy package files first (less frequent changes)
# Copy source code later (more frequent changes)
COPY package*.json ./
RUN npm ci
COPY . .
```

## Maintenance

### Backup Database

```bash
# Backup SQLite
docker-compose exec server cp /app/data/smartwaste.sqlite /backup/smartwaste.sql

# Backup PostgreSQL
docker-compose -f docker-compose.prod.yml exec db \
  pg_dump -U smartwaste smartwaste > backup.sql
```

### Update Services

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build

# No downtime deployment
docker-compose up -d --no-deps --build server
```

### Clean Up

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything (careful!)
docker system prune -a --volumes
```

## References

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Railway Deployment Guide](https://railway.app/docs)
- [Render Deployment Guide](https://render.com/docs)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)

## Support

For issues or questions:
1. Check Troubleshooting section above
2. Review service logs: `docker-compose logs -f service-name`
3. Check Docker documentation
4. Open an issue on GitHub
