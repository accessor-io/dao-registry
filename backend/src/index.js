const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { requestLogger } = require('./middleware/request-logger');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import existing routes
const daoRoutes = require('./routes/dao');
const reservedSubdomainsRoutes = require('./routes/reserved-subdomains');

// Import services
const daoService = require('./services/dao');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
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

app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Robust HTTP request logging (structured) + standard combined log
app.use(requestLogger());
app.use(morgan('combined'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the React build (repo-level frontend/build)
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const FRONTEND_BUILD = path.join(REPO_ROOT, 'frontend', 'build');
app.use(express.static(FRONTEND_BUILD));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Routes (frontend expects /api/ not /api/v1/)
app.use('/api/daos', daoRoutes);
app.use('/api/reserved-subdomains', reservedSubdomainsRoutes);

// Add metadata API endpoints that actually connect to the working services
app.use('/api/metadata', require('./routes/metadata'));

// Add ENS API endpoints  
app.use('/api/ens', require('./routes/ens'));

// Add comprehensive data points API
app.use('/api/data-points', require('./routes/data-points'));

// Add NIEM-inspired system routes
app.use('/api/niem', require('./routes/niem/niem-core-routes'));

// Expose generated JSON Schemas for consumption
app.get('/api/schemas/:name', (req, res) => {
  const { name } = req.params;
  const repoRoot = path.resolve(__dirname, '..', '..');
  const filePath = path.join(repoRoot, 'shared', 'schemas', `${name}.schema.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Schema not found' });
  }
  res.setHeader('Content-Type', 'application/json');
  fs.createReadStream(filePath).pipe(res);
});

// JSON-LD context endpoint
app.get('/api/contexts/dao.jsonld', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const contextPath = path.join(__dirname, '../../shared/schemas/json-ld-context.json');
    const contextData = fs.readFileSync(contextPath, 'utf8');
    const context = JSON.parse(contextData);
    
    res.setHeader('Content-Type', 'application/ld+json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.json(context);
  } catch (error) {
    console.error('Error serving JSON-LD context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load JSON-LD context'
    });
  }
});

// Add basic documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    name: "DAO Registry API",
    version: "1.0.0",
    description: "Professional DAO registry with ISO-compliant metadata management",
    endpoints: [
      "/api/daos - DAO management",
      "/api/metadata - Metadata operations", 
      "/api/ens - ENS integration",
      "/api/reserved-subdomains - Subdomain management",
      "/api/data-points - Data point management",
      "/api/niem - NIEM-inspired system (validation, integration, governance)",
      "/api/schemas/:name - JSON Schema by name (e.g., CreateDAORequest)"
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(FRONTEND_BUILD, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(500).json({ error: 'UI build not found', expectedPath: indexPath });
  }
  res.sendFile(indexPath);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Available API URLs:');
  console.log(`- Health check:           http://localhost:${PORT}/health`);
  console.log(`- DAOs API:               http://localhost:${PORT}/api/daos`);
  console.log(`- Metadata API:           http://localhost:${PORT}/api/metadata`);
  console.log(`- ENS API:                http://localhost:${PORT}/api/ens`);
  console.log(`- Data Points API:        http://localhost:${PORT}/api/data-points`);
  console.log(`- Reserved Subdomains API: http://localhost:${PORT}/api/reserved-subdomains`);
  console.log(`- NIEM System API:        http://localhost:${PORT}/api/niem/system`);
  console.log(`- Schemas:                http://localhost:${PORT}/api/schemas/CreateDAORequest`);
  console.log(`- Documentation API:      http://localhost:${PORT}/api/docs`);
  console.log('User Interface:');
  console.log(`- UI:                     http://localhost:${PORT}/`);
});

module.exports = { app }; 