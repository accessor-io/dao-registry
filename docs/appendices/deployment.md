# Deployment Guide

## Overview

This guide covers deploying the DAO Registry platform to various environments, from local development to production.

## Prerequisites

### System Requirements

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** (for containerized deployment)
- **PostgreSQL** (v13 or higher)
- **Redis** (v6 or higher)
- **MongoDB** (v5 or higher)

### Infrastructure Requirements

- **Cloud Provider**: AWS, GCP, Azure, or DigitalOcean
- **Domain Name**: For production deployment
- **SSL Certificate**: For HTTPS
- **Load Balancer**: For high availability
- **Monitoring**: Logging and metrics collection

## Environment Configuration

### Development Environment

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dao_registry_dev
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://localhost:27017/dao_registry

# Blockchain
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID
ARBITRUM_RPC_URL=https://sepolia.arbitrum.io/rpc

# API Keys
INFURA_PROJECT_ID=your_infura_project_id
ALCHEMY_API_KEY=your_alchemy_api_key

# Security
JWT_SECRET=dev_jwt_secret
API_KEY_SECRET=dev_api_key_secret

# ENS
ENS_REGISTRY_ADDRESS=0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
```

### Staging Environment

```env
# Database
DATABASE_URL=postgresql://user:password@staging-db:5432/dao_registry_staging
REDIS_URL=redis://staging-redis:6379
MONGODB_URL=mongodb://staging-mongo:27017/dao_registry

# Blockchain
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/STAGING_PROJECT_ID
POLYGON_RPC_URL=https://polygon-mumbai.infura.io/v3/STAGING_PROJECT_ID
ARBITRUM_RPC_URL=https://sepolia.arbitrum.io/rpc

# Security
JWT_SECRET=staging_jwt_secret
API_KEY_SECRET=staging_api_key_secret

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=debug
```

### Production Environment

```env
# Database
DATABASE_URL=postgresql://user:password@prod-db:5432/dao_registry
REDIS_URL=redis://prod-redis:6379
MONGODB_URL=mongodb://prod-mongo:27017/dao_registry

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/PROD_PROJECT_ID
POLYGON_RPC_URL=https://polygon-rpc.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc

# Security
JWT_SECRET=production_jwt_secret
API_KEY_SECRET=production_api_key_secret

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info
```

## Deployment Methods

### Docker Deployment

#### Dockerfile

```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
      - mongo
    restart: unless-stopped

  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: dao_registry
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  mongo:
    image: mongo:5
    environment:
      MONGO_INITDB_DATABASE: dao_registry
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  mongo_data:
```

#### Deployment Commands

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update services
docker-compose pull
docker-compose up -d
```

### Kubernetes Deployment

#### Deployment Configuration

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dao-registry
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dao-registry
  template:
    metadata:
      labels:
        app: dao-registry
    spec:
      containers:
      - name: dao-registry
        image: dao-registry:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: dao-registry-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

#### Service Configuration

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: dao-registry-service
spec:
  selector:
    app: dao-registry
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

#### Ingress Configuration

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dao-registry-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.dao-registry.com
    secretName: dao-registry-tls
  rules:
  - host: api.dao-registry.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: dao-registry-service
            port:
              number: 80
```

### Cloud Platform Deployment

#### AWS Deployment

```bash
# Deploy to AWS ECS
aws ecs create-cluster --cluster-name dao-registry

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster dao-registry \
  --service-name dao-registry-service \
  --task-definition dao-registry:1 \
  --desired-count 3
```

#### Google Cloud Deployment

```bash
# Deploy to Google Cloud Run
gcloud run deploy dao-registry \
  --image gcr.io/PROJECT_ID/dao-registry \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure Deployment

```bash
# Deploy to Azure Container Instances
az container create \
  --resource-group dao-registry \
  --name dao-registry \
  --image dao-registry:latest \
  --dns-name-label dao-registry \
  --ports 3000
```

## Database Setup

### PostgreSQL Setup

```sql
-- Create database
CREATE DATABASE dao_registry;

-- Create user
CREATE USER dao_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dao_registry TO dao_user;

-- Create tables (if not using migrations)
CREATE TABLE daos (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  description TEXT,
  chain_id INTEGER NOT NULL,
  contract_address VARCHAR(42) NOT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Redis Setup

```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### MongoDB Setup

```bash
# Install MongoDB
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database
mongo
use dao_registry
db.createUser({
  user: "dao_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

## Smart Contract Deployment

### Local Network

```bash
# Start local network
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment

```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to Mumbai
npx hardhat run scripts/deploy.js --network mumbai

# Deploy to Arbitrum Sepolia
npx hardhat run scripts/deploy.js --network arbitrum-sepolia
```

### Mainnet Deployment

```bash
# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Deploy to Polygon
npx hardhat run scripts/deploy.js --network polygon

# Deploy to Arbitrum
npx hardhat run scripts/deploy.js --network arbitrum
```

## Monitoring and Logging

### Application Monitoring

```javascript
// Monitoring setup
const winston = require('winston');
const Sentry = require('@sentry/node');

// Configure logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Configure Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### Health Checks

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

### Metrics Collection

```javascript
// Prometheus metrics
const prometheus = require('prom-client');

const collectDefaultMetrics = prometheus.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

// Custom metrics
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code']
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration / 1000);
  });
  next();
});
```

## Security Configuration

### SSL/TLS Setup

```bash
# Generate SSL certificate
sudo certbot --nginx -d api.dao-registry.com

# Configure Nginx
server {
    listen 443 ssl;
    server_name api.dao-registry.com;
    
    ssl_certificate /etc/letsencrypt/live/api.dao-registry.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.dao-registry.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Rate Limiting

```javascript
// Rate limiting configuration
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## Backup and Recovery

### Database Backup

```bash
# PostgreSQL backup
pg_dump dao_registry > backup_$(date +%Y%m%d_%H%M%S).sql

# MongoDB backup
mongodump --db dao_registry --out backup_$(date +%Y%m%d_%H%M%S)

# Redis backup
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb backup_$(date +%Y%m%d_%H%M%S).rdb
```

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/$DATE"

mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump $DATABASE_URL > $BACKUP_DIR/postgres.sql

# MongoDB backup
mongodump --uri=$MONGODB_URL --out=$BACKUP_DIR/mongo

# Redis backup
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis.rdb

# Compress backup
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR

# Upload to cloud storage
aws s3 cp $BACKUP_DIR.tar.gz s3://dao-registry-backups/
```

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U user -d dao_registry

# Check logs
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

#### Application Issues

```bash
# Check application logs
docker-compose logs app

# Check resource usage
docker stats

# Restart application
docker-compose restart app
```

#### Network Issues

```bash
# Check network connectivity
curl -I https://api.dao-registry.com

# Check DNS resolution
nslookup api.dao-registry.com

# Check SSL certificate
openssl s_client -connect api.dao-registry.com:443
```

### Performance Optimization

#### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_daos_chain_id ON daos(chain_id);
CREATE INDEX idx_daos_status ON daos(status);
CREATE INDEX idx_daos_created_at ON daos(created_at);

-- Analyze table statistics
ANALYZE daos;
```

#### Application Optimization

```javascript
// Enable compression
app.use(compression());

// Configure caching
app.use(express.static('public', {
  maxAge: '1d'
}));

// Optimize database queries
const daos = await prisma.dao.findMany({
  select: {
    id: true,
    name: true,
    symbol: true,
    status: true
  },
  where: {
    chainId: 1,
    status: 'Active'
  }
});
```

---

*Last updated: July 2024*