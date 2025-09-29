# YouTube Script Generator - Production Deployment Guide

## Overview

The YouTube Script Generator is a full-stack web application that converts YouTube videos into timestamped scripts with media download capabilities. This guide provides comprehensive instructions for deploying the application to a production environment.

## Architecture

- **Frontend**: React.js with Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Task Queue**: Celery with Redis
- **Cache**: Redis
- **Container**: Docker with Docker Compose

## Pre-Production Checklist

### 1. Security Configurations

#### Backend Security Issues to Address:

1. **CORS Configuration** - Currently allows all origins (`"*"`)
2. **Debug Mode** - Set to `True` in config
3. **Database Credentials** - Using default/weak passwords
4. **No Rate Limiting** - API endpoints are unprotected
5. **No Authentication** - All endpoints are publicly accessible
6. **File Upload Security** - No validation on uploaded content
7. **Environment Variables** - Some hardcoded values

#### Frontend Security Issues:

1. **API URL Configuration** - Hardcoded localhost URLs
2. **No Content Security Policy (CSP)**
3. **No HTTPS enforcement**

### 2. Performance Optimizations

1. **Database Indexing** - Add indexes for frequently queried columns
2. **Caching Strategy** - Implement Redis caching for API responses
3. **File Storage** - Move to cloud storage (AWS S3, etc.)
4. **CDN Setup** - For static assets
5. **Load Balancing** - For high availability

### 3. Monitoring & Logging

1. **Application Logging** - Structured logging
2. **Error Tracking** - Sentry or similar
3. **Performance Monitoring** - APM tools
4. **Health Checks** - Comprehensive health endpoints

## Production Setup Guide

### Step 1: Server Requirements

**Minimum Server Specifications:**
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+

**Required Software:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx (reverse proxy)
sudo apt install nginx -y

# Install Certbot (SSL certificates)
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Application Deployment

#### 2.1 Clone and Prepare Application

```bash
# Clone repository
git clone https://github.com/yourusername/YT-ScriptGen.git
cd YT-ScriptGen

# Create production directories
sudo mkdir -p /opt/yt-scriptgen
sudo cp -r . /opt/yt-scriptgen/
cd /opt/yt-scriptgen
```

#### 2.2 Environment Configuration

**Create Production Environment Files:**

**Backend Environment** (`/opt/yt-scriptgen/backend/.env.prod`):
```bash
# Application
DEBUG=false
APP_NAME=YouTube Script Generator
APP_VERSION=1.0.0

# Database - Use strong passwords
DATABASE_URL=postgresql://scriptgen_user:STRONG_PASSWORD_HERE@db:5432/scriptgen

# Redis
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# Security
SECRET_KEY=your-super-secret-key-here-min-32-chars
CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]

# File Paths
TEMP_AUDIO_PATH=/app/temp_audio
GENERATED_SCRIPTS_PATH=/app/generated_scripts

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@yourdomain.com

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# File Limits
MAX_VIDEO_DURATION=3600
MAX_FILE_SIZE=524288000  # 500MB
```

**Frontend Environment** (`/opt/yt-scriptgen/frontend/.env.prod`):
```bash
REACT_APP_API_URL=https://yourdomain.com/api/v1
GENERATE_SOURCEMAP=false
```

#### 2.3 Production Docker Configuration

**Create Production Docker Compose** (`docker-compose.prod.yml`):

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: scriptgen
      POSTGRES_USER: scriptgen_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - app-network

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=postgresql://scriptgen_user:${POSTGRES_PASSWORD}@db:5432/scriptgen
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
      - CELERY_BROKER_URL=redis://:${REDIS_PASSWORD}@redis:6379/1
      - CELERY_RESULT_BACKEND=redis://:${REDIS_PASSWORD}@redis:6379/2
    volumes:
      - ./backend/temp_audio:/app/temp_audio
      - ./backend/generated_scripts:/app/generated_scripts
    depends_on:
      - db
      - redis
    restart: unless-stopped
    networks:
      - app-network

  celery:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    command: celery -A app.workers.celery_app worker --loglevel=info --concurrency=4
    environment:
      - DATABASE_URL=postgresql://scriptgen_user:${POSTGRES_PASSWORD}@db:5432/scriptgen
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
      - CELERY_BROKER_URL=redis://:${REDIS_PASSWORD}@redis:6379/1
      - CELERY_RESULT_BACKEND=redis://:${REDIS_PASSWORD}@redis:6379/2
    volumes:
      - ./backend/temp_audio:/app/temp_audio
      - ./backend/generated_scripts:/app/generated_scripts
    depends_on:
      - db
      - redis
    restart: unless-stopped
    networks:
      - app-network

  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.prod
    volumes:
      - frontend_build:/app/build
    depends_on:
      - backend
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - frontend_build:/usr/share/nginx/html
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:
  frontend_build:

networks:
  app-network:
    driver: bridge
```

#### 2.4 Create Production Dockerfiles

**Backend Production Dockerfile** (`/backend/Dockerfile.prod`):
```dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Create necessary directories
RUN mkdir -p temp_audio generated_scripts

EXPOSE 8000

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

**Frontend Production Dockerfile** (`/frontend/Dockerfile.prod`):
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2.5 Nginx Configuration

**Create Nginx Configuration** (`/nginx/nginx.conf`):
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;
    
    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 500M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=download:10m rate=2r/s;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }
    
    # Main server block
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;
        
        # SSL certificates
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # Frontend
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }
        
        # API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Download endpoints (more restrictive)
        location /api/v1/download/ {
            limit_req zone=download burst=5 nodelay;
            proxy_pass http://backend:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 300s;
        }
    }
}
```

### Step 3: Database Setup

**Create Database Initialization Script** (`/scripts/init_prod_db.sh`):
```bash
#!/bin/bash

# Wait for database to be ready
sleep 10

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Create database backup script
cat > /opt/yt-scriptgen/scripts/backup_db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/yt-scriptgen/backup"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.prod.yml exec db pg_dump -U scriptgen_user scriptgen > "$BACKUP_DIR/backup_$DATE.sql"
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x /opt/yt-scriptgen/scripts/backup_db.sh

# Setup daily backup cron job
echo "0 2 * * * /opt/yt-scriptgen/scripts/backup_db.sh" | crontab -
```

### Step 4: SSL Certificate Setup

```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Obtain SSL certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to nginx directory
sudo mkdir -p /opt/yt-scriptgen/nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/yt-scriptgen/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/yt-scriptgen/nginx/ssl/key.pem

# Setup auto-renewal
echo "0 3 * * * certbot renew --quiet && systemctl reload nginx" | sudo crontab -
```

### Step 5: Deployment

**Create Deployment Script** (`/opt/yt-scriptgen/deploy.sh`):
```bash
#!/bin/bash

set -e

echo "Starting deployment..."

# Create environment file with secrets
cat > .env << EOF
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
EOF

# Build and start services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
sleep 30

# Run database migrations
docker-compose -f docker-compose.prod.yml exec -T backend alembic upgrade head

# Check service health
docker-compose -f docker-compose.prod.yml exec -T backend python -c "from app.database import engine; engine.connect()"

echo "Deployment completed successfully!"
```

### Step 6: Monitoring Setup

**Create Health Check Script** (`/scripts/health_check.sh`):
```bash
#!/bin/bash

# Check backend health
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ $BACKEND_STATUS -ne 200 ]; then
    echo "Backend health check failed: $BACKEND_STATUS"
    # Send alert or restart service
fi

# Check database connection
DB_STATUS=$(docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U scriptgen_user)
if [[ $DB_STATUS != *"accepting connections"* ]]; then
    echo "Database health check failed"
fi

# Check Redis
REDIS_STATUS=$(docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping)
if [ "$REDIS_STATUS" != "PONG" ]; then
    echo "Redis health check failed"
fi
```

### Step 7: Security Hardening

**System Security:**
```bash
# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Setup fail2ban
sudo apt install fail2ban -y
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

## Production Maintenance

### Daily Tasks
1. **Monitor logs**: `docker-compose -f docker-compose.prod.yml logs --tail=100`
2. **Check disk space**: `df -h`
3. **Verify backups**: Check backup directory for recent files

### Weekly Tasks
1. **Update dependencies**: Review security updates
2. **Clean temporary files**: Clear temp_audio directory
3. **Monitor performance**: Check resource usage

### Monthly Tasks
1. **Security audit**: Review access logs
2. **Certificate renewal**: Verify SSL certificates
3. **Database optimization**: Run VACUUM and ANALYZE

## Troubleshooting

### Common Issues

1. **Out of disk space**:
   ```bash
   # Clean Docker images
   docker system prune -a
   
   # Clean temp files
   find /opt/yt-scriptgen/backend/temp_audio -type f -mtime +1 -delete
   ```

2. **High memory usage**:
   ```bash
   # Restart Celery workers
   docker-compose -f docker-compose.prod.yml restart celery
   ```

3. **Database connection issues**:
   ```bash
   # Check database logs
   docker-compose -f docker-compose.prod.yml logs db
   
   # Restart database
   docker-compose -f docker-compose.prod.yml restart db
   ```

## Performance Optimization

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_scripts_status ON scripts(status);
CREATE INDEX idx_scripts_created_at ON scripts(created_at);
CREATE INDEX idx_scripts_video_url ON scripts(video_url);
```

### Redis Configuration
Add to redis.conf:
```
maxmemory 2gb
maxmemory-policy allkeys-lru
```

### Nginx Optimization
```nginx
# Add to nginx.conf
worker_rlimit_nofile 65535;
worker_connections 4096;
```

## Scaling Considerations

### Horizontal Scaling
1. **Load Balancer**: Use HAProxy or AWS ALB
2. **Multiple Backend Instances**: Scale backend and Celery workers
3. **Database Clustering**: PostgreSQL read replicas
4. **Redis Clustering**: Redis Cluster mode

### Cloud Deployment Options
1. **AWS**: ECS, RDS, ElastiCache, ALB
2. **Google Cloud**: GKE, Cloud SQL, Memorystore
3. **Azure**: AKS, Azure Database, Redis Cache

## Cost Optimization

### Storage
- Use S3 or similar for file storage
- Implement file cleanup policies
- Compress old transcripts

### Compute
- Use auto-scaling groups
- Implement queue-based processing
- Optimize Celery worker count

This comprehensive guide provides everything needed to deploy the YouTube Script Generator to production successfully. Adjust configurations based on your specific requirements and scale accordingly.