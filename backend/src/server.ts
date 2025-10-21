import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
const { requestLogger } = require('./middleware/request-logger');

dotenv.config();

// Routes
import daoRoutes from './routes/dao';
import reservedSubdomainsRoutes from './routes/reserved-subdomains';
import namingToolkitRoutes from './routes/naming-toolkit';
import metadataRegistryRoutes from './routes/metadata-registry';
import ensipXRoutes from './routes/ensip-x';
import marketplaceRoutes from './routes/marketplace';
import metadataRoutes from './routes/metadata';
import ensRoutes from './routes/ens';
import dataPointsRoutes from './routes/data-points';
import niemCoreRoutes from './routes/niem/niem-core-routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  }
}));

app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(requestLogger());
app.use(morgan('combined'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const FRONTEND_BUILD = path.join(REPO_ROOT, 'frontend', 'build');
app.use(express.static(FRONTEND_BUILD));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// APIs
app.use('/api/daos', daoRoutes);
app.use('/api/reserved-subdomains', reservedSubdomainsRoutes);
app.use('/api/naming-toolkit', namingToolkitRoutes);
app.use('/api/metadata-registry', metadataRegistryRoutes);
app.use('/api/ensip-x', ensipXRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/metadata', metadataRoutes);
app.use('/api/ens', ensRoutes);
app.use('/api/data-points', dataPointsRoutes);
app.use('/api/niem', niemCoreRoutes);

// Schemas endpoint: prefer new path, fallback to legacy
app.get('/api/schemas/:name', (req, res) => {
  const { name } = req.params as { name: string };
  const repoRoot = path.resolve(__dirname, '..', '..');
  const newPath = path.join(repoRoot, 'shared', 'src', 'schemas', `${name}.schema.json`);
  const legacyPath = path.join(repoRoot, 'shared', 'schemas', `${name}.schema.json`);
  const filePath = fs.existsSync(newPath) ? newPath : legacyPath;
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Schema not found' });
  }
  res.setHeader('Content-Type', 'application/json');
  fs.createReadStream(filePath).pipe(res);
});

// JSON-LD context endpoint
app.get('/api/contexts/dao.jsonld', (_req, res) => {
  try {
    const contextPath = path.join(REPO_ROOT, 'shared', 'schemas', 'json-ld-context.json');
    const contextData = fs.readFileSync(contextPath, 'utf8');
    const context = JSON.parse(contextData);
    res.setHeader('Content-Type', 'application/ld+json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.json(context);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error serving JSON-LD context:', error);
    res.status(500).json({ success: false, error: 'Failed to load JSON-LD context' });
  }
});

app.get('/api/docs', (_req, res) => {
  res.json({
    name: 'DAO Registry API',
    version: '1.0.0',
    description: 'Professional DAO registry with ISO-compliant metadata management',
    endpoints: [
      '/api/daos - DAO management',
      '/api/metadata - Metadata operations',
      '/api/ens - ENS integration',
      '/api/reserved-subdomains - Subdomain management',
      '/api/data-points - Data point management',
      '/api/niem - NIEM-inspired system (validation, integration, governance)',
      '/api/schemas/:name - JSON Schema by name (e.g., CreateDAORequest)'
    ]
  });
});

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
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
app.get('*', (_req, res) => {
  const indexPath = path.join(FRONTEND_BUILD, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(500).json({ error: 'UI build not found', expectedPath: indexPath });
  }
  res.sendFile(indexPath);
});

process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  // eslint-disable-next-line no-console
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app };


