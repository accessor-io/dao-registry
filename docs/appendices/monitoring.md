# Monitoring and Logging

## Overview

This document outlines monitoring and logging strategies for the DAO Registry platform, covering application monitoring, infrastructure monitoring, and log management.

## Application Monitoring

### Health Checks

#### Basic Health Check

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  });
});
```

#### Detailed Health Check

```javascript
// Comprehensive health check
app.get('/health/detailed', async (req, res) => {
  const checks = {
    database: await checkDatabaseConnection(),
    redis: await checkRedisConnection(),
    blockchain: await checkBlockchainConnection(),
    external_apis: await checkExternalAPIs()
  };
  
  const allHealthy = Object.values(checks).every(check => check.status === 'healthy');
  
  res.json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks
  });
});

const checkDatabaseConnection = async () => {
  try {
    await pool.query('SELECT 1');
    return { status: 'healthy', response_time: Date.now() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};

const checkRedisConnection = async () => {
  try {
    await redis.ping();
    return { status: 'healthy', response_time: Date.now() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};
```

### Performance Metrics

#### Prometheus Metrics

```javascript
const prometheus = require('prom-client');

// HTTP request metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Database metrics
const dbQueryDuration = new prometheus.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type']
});

const dbConnections = new prometheus.Gauge({
  name: 'db_connections',
  help: 'Number of database connections'
});

// Business metrics
const daoRegistrations = new prometheus.Counter({
  name: 'dao_registrations_total',
  help: 'Total number of DAO registrations'
});

const activeDAOs = new prometheus.Gauge({
  name: 'active_daos',
  help: 'Number of active DAOs'
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
});
```

#### Custom Business Metrics

```javascript
// Track DAO registrations
const trackDAORegistration = (daoData) => {
  daoRegistrations.inc();
  activeDAOs.inc();
  
  // Track by chain
  const chainCounter = new prometheus.Counter({
    name: 'dao_registrations_by_chain_total',
    help: 'DAO registrations by blockchain',
    labelNames: ['chain_id']
  });
  
  chainCounter.labels(daoData.chainId.toString()).inc();
};

// Track proposal activity
const trackProposalActivity = (proposalData) => {
  const proposalCounter = new prometheus.Counter({
    name: 'proposals_total',
    help: 'Total number of proposals',
    labelNames: ['status', 'dao_id']
  });
  
  proposalCounter.labels(proposalData.status, proposalData.daoId).inc();
};
```

### Error Tracking

#### Sentry Integration

```javascript
const Sentry = require('@sentry/node');

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app })
  ]
});

// Request handler
app.use(Sentry.Handlers.requestHandler());

// Error handler
app.use(Sentry.Handlers.errorHandler());

// Capture errors
app.use((err, req, res, next) => {
  Sentry.captureException(err);
  res.status(500).json({ error: 'Internal server error' });
});
```

#### Custom Error Tracking

```javascript
// Error tracking middleware
const errorTracker = (err, req, res, next) => {
  const errorInfo = {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  };
  
  // Log to file
  logger.error('Application error', errorInfo);
  
  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    sendToMonitoringService(errorInfo);
  }
  
  next(err);
};

app.use(errorTracker);
```

## Infrastructure Monitoring

### System Metrics

#### CPU and Memory Monitoring

```javascript
const os = require('os');

// System metrics
const systemMetrics = {
  cpu: {
    loadAverage: os.loadavg(),
    cores: os.cpus().length,
    usage: process.cpuUsage()
  },
  memory: {
    total: os.totalmem(),
    free: os.freemem(),
    used: os.totalmem() - os.freemem(),
    process: process.memoryUsage()
  },
  uptime: os.uptime(),
  platform: os.platform(),
  arch: os.arch()
};

// Export metrics for Prometheus
const systemMetricsGauge = new prometheus.Gauge({
  name: 'system_cpu_usage',
  help: 'CPU usage percentage'
});

const memoryMetricsGauge = new prometheus.Gauge({
  name: 'system_memory_usage',
  help: 'Memory usage in bytes'
});

// Update metrics periodically
setInterval(() => {
  const cpuUsage = process.cpuUsage();
  const memoryUsage = process.memoryUsage();
  
  systemMetricsGauge.set((cpuUsage.user + cpuUsage.system) / 1000000);
  memoryMetricsGauge.set(memoryUsage.heapUsed);
}, 30000); // Update every 30 seconds
```

#### Network Monitoring

```javascript
const networkInterfaces = os.networkInterfaces();

// Network metrics
const networkMetrics = {
  interfaces: Object.keys(networkInterfaces).map(interfaceName => ({
    name: interfaceName,
    addresses: networkInterfaces[interfaceName]
  })),
  connections: {
    active: 0, // Would need to track active connections
    total: 0
  }
};

// Track active connections
let activeConnections = 0;

app.use((req, res, next) => {
  activeConnections++;
  
  res.on('finish', () => {
    activeConnections--;
  });
  
  next();
});

const activeConnectionsGauge = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

setInterval(() => {
  activeConnectionsGauge.set(activeConnections);
}, 5000);
```

### Database Monitoring

#### PostgreSQL Monitoring

```javascript
// Database connection monitoring
const dbPoolMetrics = {
  totalCount: pool.totalCount,
  idleCount: pool.idleCount,
  waitingCount: pool.waitingCount
};

// Monitor pool events
pool.on('connect', (client) => {
  logger.info('New database connection established');
});

pool.on('error', (err, client) => {
  logger.error('Database connection error', err);
  Sentry.captureException(err);
});

pool.on('remove', (client) => {
  logger.info('Database connection removed');
});

// Query performance monitoring
const monitorQuery = async (query, params, queryType) => {
  const start = Date.now();
  
  try {
    const result = await pool.query(query, params);
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > 1000) {
      logger.warn('Slow query detected', {
        query: query.substring(0, 100),
        duration,
        queryType
      });
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Query error', {
      query: query.substring(0, 100),
      duration,
      error: error.message,
      queryType
    });
    throw error;
  }
};
```

#### Redis Monitoring

```javascript
// Redis monitoring
const redisClient = redis.createClient(process.env.REDIS_URL);

redisClient.on('connect', () => {
  logger.info('Redis connected');
});

redisClient.on('error', (err) => {
  logger.error('Redis error', err);
  Sentry.captureException(err);
});

redisClient.on('ready', () => {
  logger.info('Redis ready');
});

// Monitor Redis performance
const monitorRedisOperation = async (operation, key) => {
  const start = Date.now();
  
  try {
    const result = await operation;
    const duration = Date.now() - start;
    
    // Log slow Redis operations
    if (duration > 100) {
      logger.warn('Slow Redis operation', {
        operation: operation.name,
        key,
        duration
      });
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Redis operation error', {
      operation: operation.name,
      key,
      duration,
      error: error.message
    });
    throw error;
  }
};
```

## Logging

### Logging Configuration

#### Winston Logger Setup

```javascript
const winston = require('winston');
require('winston-daily-rotate-file');

// Configure log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Configure log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(logColors);

// Create logger
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'dao-registry' },
  transports: [
    // Error logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    
    // Combined logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}
```

#### Structured Logging

```javascript
// Structured logging functions
const logInfo = (message, meta = {}) => {
  logger.info(message, {
    timestamp: new Date().toISOString(),
    ...meta
  });
};

const logError = (message, error, meta = {}) => {
  logger.error(message, {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    ...meta
  });
};

const logWarning = (message, meta = {}) => {
  logger.warn(message, {
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Usage examples
logInfo('DAO registered successfully', {
  daoId: 'dao-123',
  chainId: 1,
  contractAddress: '0x...',
  userId: 'user-456'
});

logError('Failed to register DAO', error, {
  daoId: 'dao-123',
  chainId: 1,
  userId: 'user-456'
});
```

### Log Analysis

#### Log Aggregation

```javascript
// Log aggregation service
const logAggregation = {
  // Aggregate logs by time period
  aggregateByTime: (logs, timePeriod = 'hour') => {
    const aggregated = {};
    
    logs.forEach(log => {
      const timestamp = new Date(log.timestamp);
      const key = getTimeKey(timestamp, timePeriod);
      
      if (!aggregated[key]) {
        aggregated[key] = {
          count: 0,
          errors: 0,
          warnings: 0,
          avgResponseTime: 0
        };
      }
      
      aggregated[key].count++;
      
      if (log.level === 'error') {
        aggregated[key].errors++;
      } else if (log.level === 'warn') {
        aggregated[key].warnings++;
      }
      
      if (log.responseTime) {
        aggregated[key].avgResponseTime = 
          (aggregated[key].avgResponseTime + log.responseTime) / 2;
      }
    });
    
    return aggregated;
  },
  
  // Find patterns in logs
  findPatterns: (logs) => {
    const patterns = {
      errors: {},
      slowQueries: [],
      frequentOperations: {}
    };
    
    logs.forEach(log => {
      if (log.level === 'error') {
        const errorType = log.error?.name || 'Unknown';
        patterns.errors[errorType] = (patterns.errors[errorType] || 0) + 1;
      }
      
      if (log.responseTime && log.responseTime > 1000) {
        patterns.slowQueries.push({
          query: log.query,
          responseTime: log.responseTime,
          timestamp: log.timestamp
        });
      }
      
      if (log.operation) {
        patterns.frequentOperations[log.operation] = 
          (patterns.frequentOperations[log.operation] || 0) + 1;
      }
    });
    
    return patterns;
  }
};
```

## Alerting

### Alert Configuration

#### Alert Rules

```javascript
// Alert configuration
const alertRules = {
  highErrorRate: {
    condition: (metrics) => {
      const errorRate = metrics.errors / metrics.total * 100;
      return errorRate > 5; // Alert if error rate > 5%
    },
    message: 'High error rate detected',
    severity: 'critical'
  },
  
  slowResponseTime: {
    condition: (metrics) => {
      return metrics.avgResponseTime > 2000; // Alert if avg response time > 2s
    },
    message: 'Slow response time detected',
    severity: 'warning'
  },
  
  databaseConnectionIssues: {
    condition: (metrics) => {
      return metrics.dbConnections === 0; // Alert if no DB connections
    },
    message: 'Database connection issues',
    severity: 'critical'
  },
  
  highMemoryUsage: {
    condition: (metrics) => {
      const memoryUsage = metrics.memory.used / metrics.memory.total * 100;
      return memoryUsage > 90; // Alert if memory usage > 90%
    },
    message: 'High memory usage detected',
    severity: 'warning'
  }
};

// Check alerts
const checkAlerts = (metrics) => {
  const alerts = [];
  
  Object.entries(alertRules).forEach(([ruleName, rule]) => {
    if (rule.condition(metrics)) {
      alerts.push({
        rule: ruleName,
        message: rule.message,
        severity: rule.severity,
        timestamp: new Date().toISOString(),
        metrics
      });
    }
  });
  
  return alerts;
};
```

#### Alert Notifications

```javascript
// Alert notification service
const alertService = {
  // Send alert via email
  sendEmailAlert: async (alert) => {
    const emailContent = `
      Alert: ${alert.message}
      Severity: ${alert.severity}
      Time: ${alert.timestamp}
      Metrics: ${JSON.stringify(alert.metrics, null, 2)}
    `;
    
    // Send email using your email service
    await sendEmail({
      to: process.env.ALERT_EMAIL,
      subject: `[${alert.severity.toUpperCase()}] ${alert.message}`,
      body: emailContent
    });
  },
  
  // Send alert via Slack
  sendSlackAlert: async (alert) => {
    const slackMessage = {
      text: `🚨 *${alert.message}*`,
      attachments: [{
        color: alert.severity === 'critical' ? 'danger' : 'warning',
        fields: [
          { title: 'Severity', value: alert.severity, short: true },
          { title: 'Time', value: alert.timestamp, short: true },
          { title: 'Metrics', value: JSON.stringify(alert.metrics, null, 2) }
        ]
      }]
    };
    
    // Send to Slack webhook
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });
  },
  
  // Send alert via PagerDuty
  sendPagerDutyAlert: async (alert) => {
    const pagerDutyPayload = {
      routing_key: process.env.PAGERDUTY_ROUTING_KEY,
      event_action: 'trigger',
      payload: {
        summary: alert.message,
        severity: alert.severity,
        source: 'dao-registry',
        custom_details: alert.metrics
      }
    };
    
    await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pagerDutyPayload)
    });
  }
};

// Process alerts
const processAlerts = async (alerts) => {
  for (const alert of alerts) {
    try {
      if (alert.severity === 'critical') {
        await alertService.sendPagerDutyAlert(alert);
      }
      
      await alertService.sendSlackAlert(alert);
      await alertService.sendEmailAlert(alert);
      
      logger.info('Alert sent', { alert });
    } catch (error) {
      logger.error('Failed to send alert', { alert, error: error.message });
    }
  }
};
```

## Dashboard and Visualization

### Grafana Dashboard

#### Dashboard Configuration

```json
{
  "dashboard": {
    "title": "DAO Registry Monitoring",
    "panels": [
      {
        "title": "HTTP Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      },
      {
        "title": "Active DAOs",
        "type": "stat",
        "targets": [
          {
            "expr": "active_daos",
            "legendFormat": "Active DAOs"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "db_connections",
            "legendFormat": "Active connections"
          }
        ]
      }
    ]
  }
}
```

### Custom Dashboard

#### React Dashboard Component

```javascript
// Monitoring dashboard component
const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [alerts, setAlerts] = useState([]);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await fetch('/api/metrics');
      const data = await response.json();
      setMetrics(data);
    };
    
    const fetchAlerts = async () => {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      setAlerts(data);
    };
    
    fetchMetrics();
    fetchAlerts();
    
    const interval = setInterval(() => {
      fetchMetrics();
      fetchAlerts();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="monitoring-dashboard">
      <h1>DAO Registry Monitoring</h1>
      
      <div className="metrics-grid">
        <MetricCard
          title="Active DAOs"
          value={metrics.activeDAOs || 0}
          trend={metrics.daoGrowth || 0}
        />
        
        <MetricCard
          title="Request Rate"
          value={`${metrics.requestRate || 0}/min`}
          trend={metrics.requestRateChange || 0}
        />
        
        <MetricCard
          title="Error Rate"
          value={`${metrics.errorRate || 0}%`}
          trend={metrics.errorRateChange || 0}
          isError={metrics.errorRate > 5}
        />
        
        <MetricCard
          title="Response Time"
          value={`${metrics.avgResponseTime || 0}ms`}
          trend={metrics.responseTimeChange || 0}
        />
      </div>
      
      <div className="alerts-section">
        <h2>Active Alerts</h2>
        {alerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
};
```

---

*Last updated: July 2024*