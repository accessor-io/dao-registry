# Main Application Entry Point

## Overview

The `src/index.js` file is the main entry point for the DAO Registry Express.js application. It sets up the server, middleware, routes, and error handling for the API.

## File Information

- **Type**: JavaScript (Node.js)
- **Framework**: Express.js
- **Environment**: Node.js
- **Port**: 3000 (default)

## Imports

### Core Dependencies
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
```

### Route Imports
```javascript
const daoRoutes = require('./routes/dao');
const reservedSubdomainsRoutes = require('./routes/reserved-subdomains');
```

### Service Imports
```javascript
const daoService = require('./services/dao');
```

## Application Setup

### Environment Configuration
```javascript
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
```

### Security Middleware

#### Helmet Configuration
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

**Security Features**:
- Content Security Policy (CSP)
- XSS Protection
- Frame Options
- Content Type Options
- Referrer Policy

#### CORS Configuration
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
```

**Configuration**:
- **Origin**: Configurable frontend URL
- **Credentials**: Enabled for authentication
- **Methods**: All HTTP methods allowed

### Performance Middleware

#### Compression
```javascript
app.use(compression());
```

**Benefits**:
- Reduces response size
- Improves load times
- Supports gzip compression

#### Logging
```javascript
app.use(morgan('combined'));
```

**Features**:
- HTTP request logging
- Combined format (timestamp, method, URL, status, response time)
- Development-friendly output

### Body Parsing
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

**Configuration**:
- **JSON Limit**: 10MB maximum
- **URL Encoded**: Extended mode enabled
- **Limit**: 10MB maximum

## API Routes

### Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});
```

**Response Format**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "version": "1.0.0"
}
```

### API Versioning
```javascript
app.use('/api/v1/daos', daoRoutes);
app.use('/api/v1/reserved-subdomains', reservedSubdomainsRoutes);
```

**Route Structure**:
- `/api/v1/daos` - DAO management endpoints
- `/api/v1/reserved-subdomains` - Reserved subdomains endpoints

## Error Handling

### Global Error Handler
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});
```

**Features**:
- Logs error stack trace
- Returns appropriate error message
- Environment-aware error details

### 404 Handler
```javascript
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});
```

**Response Format**:
```json
{
  "error": "Route not found",
  "path": "/api/v1/nonexistent",
  "method": "GET"
}
```

## Process Management

### Graceful Shutdown
```javascript
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
```

**Signal Handling**:
- **SIGTERM**: Termination signal
- **SIGINT**: Interrupt signal (Ctrl+C)
- Graceful shutdown with logging

## Server Startup

### Server Initialization
```javascript
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Documentation: http://localhost:${PORT}/api/v1/daos`);
});
```

**Startup Information**:
- Server port confirmation
- Environment display
- Health check URL
- API documentation URL

### Module Export
```javascript
module.exports = { app };
```

**Export**: App instance for testing

## Environment Variables

### Required Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend application URL

### Optional Variables
- Custom configuration for different environments
- Database connection strings
- API keys and secrets

## Security Considerations

### Content Security Policy
- Restricts resource loading
- Prevents XSS attacks
- Controls script execution

### CORS Configuration
- Restricts cross-origin requests
- Configurable origins
- Credential support

### Request Limits
- Prevents large payload attacks
- Configurable size limits
- Memory protection

## Performance Optimizations

### Compression
- Reduces bandwidth usage
- Improves response times
- Supports multiple algorithms

### Logging
- Request/response tracking
- Performance monitoring
- Error tracking

### Middleware Order
- Security first
- Performance second
- Application logic last

## Development Workflow

### Local Development
```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test
```

### Environment Setup
```bash
# Create .env file
cp .env.example .env

# Configure environment variables
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Health Check
```bash
# Check server health
curl http://localhost:3000/health
```

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Available Endpoints
- `GET /health` - Health check
- `GET /daos` - List DAOs
- `POST /daos` - Create DAO
- `GET /daos/:id` - Get DAO details
- `PUT /daos/:id` - Update DAO
- `DELETE /daos/:id` - Delete DAO
- `GET /reserved-subdomains` - List reserved subdomains
- `POST /reserved-subdomains` - Reserve subdomain

## Monitoring and Logging

### Application Metrics
- Server uptime
- Request/response times
- Error rates
- Memory usage

### Log Formats
- Combined format for HTTP requests
- Error stack traces
- Startup/shutdown messages

### Health Monitoring
- Endpoint availability
- Response times
- Error status codes

## Testing Strategy

### Unit Tests
- Route testing
- Middleware testing
- Error handling testing

### Integration Tests
- API endpoint testing
- Database integration
- External service integration

### Load Testing
- Performance testing
- Stress testing
- Scalability testing

## Deployment Considerations

### Production Environment
- Set `NODE_ENV=production`
- Configure proper logging
- Set up monitoring
- Enable security features

### Container Deployment
- Docker configuration
- Environment variables
- Health checks
- Resource limits

### Cloud Deployment
- Load balancer configuration
- Auto-scaling setup
- Monitoring and alerting
- Backup strategies

## Troubleshooting

### Common Issues
- Port conflicts
- Environment variable issues
- CORS problems
- Memory leaks

### Debugging
- Enable debug logging
- Check error logs
- Monitor system resources
- Test endpoints individually

### Performance Issues
- Monitor response times
- Check database queries
- Optimize middleware
- Review caching strategy 