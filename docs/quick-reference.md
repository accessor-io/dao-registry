# DAO Registry Quick Reference

A quick reference guide for common tasks, commands, and troubleshooting steps.

## 🚀 Quick Start Commands

### Development Setup
```bash
# Clone and setup
git clone https://github.com/your-org/dao-registry.git
cd dao-registry
npm install
cd frontend && npm install && cd ..

# Start development servers
npm run dev          # Backend (port 3000)
cd frontend && npm start  # Frontend (port 3001)
```

### Database Setup
```bash
# PostgreSQL
createdb dao_registry_dev
createdb dao_registry_test

# Redis
redis-server

# MongoDB
mongod
```

### Smart Contracts
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia
```

## 🔧 Common Development Tasks

### Frontend Development
```bash
# Start development server
cd frontend && npm start

# Build for production
cd frontend && npm run build

# Run tests
cd frontend && npm test

# Lint code
cd frontend && npm run lint
```

### Backend Development
```bash
# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Run migrations
npm run migrate
```

### Database Operations
```bash
# Reset database
npm run db:reset

# Run migrations
npm run migrate

# Seed data
npm run db:seed
```

## 📡 API Quick Reference

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
```bash
# API Key
curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:3000/api/v1/daos

# JWT Token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/api/v1/daos
```

### Common Endpoints

#### Get All DAOs
```bash
GET /daos?search=example&chainId=1&status=Active&page=1&limit=20
```

#### Get DAO by ID
```bash
GET /daos/{id}
```

#### Get Registry Statistics
```bash
GET /stats?timeRange=7d
```

#### Search DAOs
```bash
GET /daos?search={term}&chainId={id}&status={status}&verified={boolean}
```

### Response Formats

#### DAO Object
```json
{
  "id": "dao-123",
  "name": "Example DAO",
  "symbol": "EXDAO",
  "description": "A decentralized autonomous organization",
  "chainId": 1,
  "status": "Active",
  "verified": true,
  "contractAddress": "0x...",
  "memberCount": 1000,
  "governanceType": "Token-based",
  "analytics": {
    "totalProposals": 50,
    "activeProposals": 3,
    "participationRate": 75.5
  }
}
```

#### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "chainId",
        "message": "Chain ID must be a number"
      }
    ]
  }
}
```

## 🐛 Troubleshooting Quick Fixes

### Port Conflicts
```bash
# Check what's using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Use different port
PORT=3001 npm start
```

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U user -d dao_registry

# Reset database
npm run db:reset
```

### Frontend Build Issues
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run build -- --reset-cache
```

### Contract Compilation Issues
```bash
# Clear artifacts
npx hardhat clean

# Recompile
npx hardhat compile

# Check Solidity version
npx hardhat --version
```

### API Connection Issues
```bash
# Test API health
curl http://localhost:3000/api/v1/health

# Check server logs
tail -f logs/app.log

# Test specific endpoint
curl http://localhost:3000/api/v1/daos
```

## 🔍 Debugging Commands

### Frontend Debugging
```javascript
// Add to component
console.log('Debug:', data);

// React DevTools
// Install browser extension for React debugging
```

### Backend Debugging
```javascript
// Add to route
logger.debug('Debug message', { data });

// Node.js debugger
node --inspect src/index.js
```

### Contract Debugging
```javascript
// Add to contract
event DebugEvent(string message, uint256 value);

// Hardhat console
console.log('Debug:', value);
```

## 📊 Monitoring Commands

### System Health
```bash
# Check all services
npm run health:check

# Monitor logs
tail -f logs/*.log

# Check database connections
npm run db:status
```

### Performance Monitoring
```bash
# API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/v1/daos

# Memory usage
node --inspect src/index.js

# Database queries
npm run db:profile
```

## 🚀 Deployment Commands

### Production Build
```bash
# Build frontend
cd frontend && npm run build

# Build backend
npm run build

# Deploy to production
npm run deploy:prod
```

### Contract Deployment
```bash
# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Verify contracts
npx hardhat verify --network mainnet CONTRACT_ADDRESS

# Update deployment addresses
npm run update:deployments
```

## 📝 Common Git Commands

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
gh pr create --title "Add new feature" --body "Description"
```

### Code Quality
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Check code coverage
npm run test:coverage
```

## 🔐 Security Commands

### Environment Variables
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate API key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check for exposed secrets
npm run security:scan
```

### SSL/TLS Setup
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Test HTTPS
curl -k https://localhost:3000/api/v1/health
```

## 📈 Performance Optimization

### Frontend Optimization
```bash
# Analyze bundle size
cd frontend && npm run analyze

# Optimize images
npm run optimize:images

# Check performance
npm run lighthouse
```

### Backend Optimization
```bash
# Database indexing
npm run db:index

# Cache warming
npm run cache:warm

# Performance profiling
npm run profile
```

## 🔄 Maintenance Commands

### Database Maintenance
```bash
# Backup database
npm run db:backup

# Restore database
npm run db:restore

# Vacuum database
npm run db:vacuum
```

### Log Management
```bash
# Rotate logs
npm run logs:rotate

# Archive old logs
npm run logs:archive

# Clean old logs
npm run logs:clean
```

## 📞 Support Commands

### Health Checks
```bash
# Full system health
npm run health:full

# API health
curl http://localhost:3000/api/v1/health

# Database health
npm run db:health
```

### Diagnostic Tools
```bash
# System diagnostics
npm run diagnose

# Performance report
npm run performance:report

# Security audit
npm audit
```

## 🎯 Quick Tips

### Development
- Use `npm run dev` for backend development
- Use `cd frontend && npm start` for frontend development
- Check logs with `tail -f logs/app.log`
- Use React DevTools for frontend debugging

### Testing
- Run `npm test` for all tests
- Use `npm run test:watch` for development
- Use `npm run test:coverage` for coverage report

### Deployment
- Always test on staging first
- Use environment-specific configs
- Monitor logs after deployment
- Verify contracts after deployment

### Troubleshooting
- Check logs first
- Verify environment variables
- Test API endpoints directly
- Check database connections
- Verify network connectivity

---

*Last updated: July 2024*
*Version: 1.0.0* 