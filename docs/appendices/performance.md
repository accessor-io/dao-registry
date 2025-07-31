# Performance Optimization

## Overview

This document outlines performance optimization strategies for the DAO Registry platform, covering frontend, backend, database, and smart contract optimization techniques.

## Frontend Performance

### Code Splitting

#### React Lazy Loading

```javascript
// Lazy load components
import React, { lazy, Suspense } from 'react';

const DAODetail = lazy(() => import('./components/DAODetail'));
const RegistryStats = lazy(() => import('./components/RegistryStats'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Route path="/dao/:id" component={DAODetail} />
      <Route path="/stats" component={RegistryStats} />
    </Suspense>
  );
}
```

#### Dynamic Imports

```javascript
// Dynamic imports for heavy libraries
const loadHeavyLibrary = async () => {
  const { default: HeavyLibrary } = await import('./heavy-library');
  return HeavyLibrary;
};

// Use in components
const [HeavyComponent, setHeavyComponent] = useState(null);

useEffect(() => {
  loadHeavyLibrary().then(setHeavyComponent);
}, []);
```

### Image Optimization

#### WebP Format

```javascript
// Responsive images with WebP support
const OptimizedImage = ({ src, alt, ...props }) => {
  return (
    <picture>
      <source srcSet={`${src}.webp`} type="image/webp" />
      <source srcSet={src} type="image/jpeg" />
      <img src={src} alt={alt} {...props} />
    </picture>
  );
};
```

#### Lazy Loading Images

```javascript
// Intersection Observer for lazy loading
const LazyImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isInView ? src : ''}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      className={`lazy-image ${isLoaded ? 'loaded' : ''}`}
      {...props}
    />
  );
};
```

### Caching Strategies

#### Service Worker

```javascript
// service-worker.js
const CACHE_NAME = 'dao-registry-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/api/daos'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
```

#### React Query Caching

```javascript
import { useQuery, useMutation, useQueryClient } from 'react-query';

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});

// Use in components
const useDAOs = (filters) => {
  return useQuery(
    ['daos', filters],
    () => fetchDAOs(filters),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      keepPreviousData: true
    }
  );
};
```

## Backend Performance

### Database Optimization

#### Indexing Strategy

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_daos_chain_id ON daos(chain_id);
CREATE INDEX idx_daos_status ON daos(status);
CREATE INDEX idx_daos_created_at ON daos(created_at);
CREATE INDEX idx_daos_contract_address ON daos(contract_address);

-- Composite indexes for complex queries
CREATE INDEX idx_daos_chain_status ON daos(chain_id, status);
CREATE INDEX idx_daos_status_created ON daos(status, created_at);

-- Partial indexes for filtered data
CREATE INDEX idx_active_daos ON daos(chain_id, status) 
WHERE status = 'Active';

-- Text search indexes
CREATE INDEX idx_daos_name_search ON daos USING gin(to_tsvector('english', name));
CREATE INDEX idx_daos_description_search ON daos USING gin(to_tsvector('english', description));
```

#### Query Optimization

```javascript
// Optimize database queries
const getDAOsWithOptimization = async (filters) => {
  const query = `
    SELECT 
      d.id,
      d.name,
      d.symbol,
      d.status,
      d.chain_id,
      d.contract_address,
      d.created_at,
      COUNT(p.id) as proposal_count,
      AVG(p.participation_rate) as avg_participation
    FROM daos d
    LEFT JOIN proposals p ON d.id = p.dao_id
    WHERE d.status = $1
    GROUP BY d.id
    ORDER BY d.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  
  const result = await pool.query(query, [
    filters.status,
    filters.limit,
    filters.offset
  ]);
  
  return result.rows;
};
```

#### Connection Pooling

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Monitor pool performance
pool.on('connect', (client) => {
  console.log('New client connected to database');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});
```

### Caching Strategies

#### Redis Caching

```javascript
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache DAO data
const getCachedDAO = async (id) => {
  const cacheKey = `dao:${id}`;
  
  // Try to get from cache
  const cached = await client.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const dao = await getDAOFromDatabase(id);
  
  // Cache for 5 minutes
  await client.setex(cacheKey, 300, JSON.stringify(dao));
  
  return dao;
};

// Cache with invalidation
const updateDAO = async (id, data) => {
  // Update database
  await updateDAOInDatabase(id, data);
  
  // Invalidate cache
  await client.del(`dao:${id}`);
  
  // Update cache with new data
  await client.setex(`dao:${id}`, 300, JSON.stringify(data));
};
```

#### Memory Caching

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ 
  stdTTL: 600, // 10 minutes
  checkperiod: 120 // Check for expired keys every 2 minutes
});

// Cache frequently accessed data
const getCachedStats = () => {
  const cacheKey = 'registry_stats';
  let stats = cache.get(cacheKey);
  
  if (!stats) {
    stats = calculateRegistryStats();
    cache.set(cacheKey, stats, 300); // Cache for 5 minutes
  }
  
  return stats;
};
```

### API Optimization

#### Response Compression

```javascript
const compression = require('compression');

// Enable compression for all responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Compression level (0-9)
  threshold: 1024 // Only compress responses larger than 1KB
}));
```

#### Pagination Optimization

```javascript
// Efficient pagination with cursor-based approach
const getDAOsWithCursor = async (cursor, limit = 20) => {
  const query = `
    SELECT id, name, symbol, status, created_at
    FROM daos
    WHERE created_at < $1
    ORDER BY created_at DESC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [cursor, limit + 1]);
  const hasMore = result.rows.length > limit;
  const daos = result.rows.slice(0, limit);
  
  return {
    daos,
    nextCursor: hasMore ? daos[daos.length - 1].created_at : null,
    hasMore
  };
};
```

#### Batch Operations

```javascript
// Batch database operations
const batchUpdateDAOs = async (updates) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const update of updates) {
      await client.query(
        'UPDATE daos SET status = $1, updated_at = NOW() WHERE id = $2',
        [update.status, update.id]
      );
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
```

## Smart Contract Performance

### Gas Optimization

#### Storage Optimization

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GasOptimizedDAO {
    // Pack related data into structs
    struct DAOInfo {
        string name;
        string symbol;
        address contractAddress;
        uint8 status; // 0: Inactive, 1: Active, 2: Suspended
        uint32 chainId;
        uint64 createdAt;
    }
    
    // Use mappings instead of arrays for lookups
    mapping(address => DAOInfo) public daos;
    mapping(address => bool) public isRegistered;
    
    // Events for off-chain data
    event DAORegistered(address indexed daoAddress, string name, uint32 chainId);
    event DAOUpdated(address indexed daoAddress, string name);
    
    function registerDAO(
        string memory name,
        string memory symbol,
        address contractAddress,
        uint32 chainId
    ) external {
        require(!isRegistered[contractAddress], "DAO already registered");
        
        daos[contractAddress] = DAOInfo({
            name: name,
            symbol: symbol,
            contractAddress: contractAddress,
            status: 1, // Active
            chainId: chainId,
            createdAt: uint64(block.timestamp)
        });
        
        isRegistered[contractAddress] = true;
        
        emit DAORegistered(contractAddress, name, chainId);
    }
}
```

#### Function Optimization

```solidity
// Optimize function calls
contract OptimizedFunctions {
    // Use external for functions called from outside
    function externalFunction() external pure returns (uint256) {
        return 42;
    }
    
    // Use internal for internal calls
    function internalFunction() internal pure returns (uint256) {
        return 42;
    }
    
    // Batch operations
    function batchRegisterDAOs(
        string[] memory names,
        address[] memory addresses,
        uint32[] memory chainIds
    ) external {
        require(
            names.length == addresses.length && 
            addresses.length == chainIds.length,
            "Arrays must have same length"
        );
        
        for (uint256 i = 0; i < names.length; i++) {
            registerDAO(names[i], addresses[i], chainIds[i]);
        }
    }
    
    // Use events instead of returning data
    event DAORegistered(address indexed dao, string name);
    
    function registerDAO(
        string memory name,
        address daoAddress,
        uint32 chainId
    ) internal {
        // Implementation
        emit DAORegistered(daoAddress, name);
    }
}
```

### Memory Optimization

#### Efficient Data Structures

```solidity
// Use bytes32 for fixed-size data
contract MemoryOptimized {
    // Use bytes32 for hashes and addresses
    mapping(bytes32 => bool) public processedHashes;
    
    // Pack boolean flags
    struct Flags {
        bool isActive;
        bool isVerified;
        bool isPaused;
    }
    
    // Use uint8 for small numbers
    struct Status {
        uint8 status; // 0-255 is sufficient
        uint32 timestamp;
    }
}
```

#### Batch Processing

```solidity
// Process multiple items in a single transaction
contract BatchProcessor {
    function processBatch(bytes32[] memory hashes) external {
        uint256 gasLimit = gasleft();
        uint256 gasPerItem = 5000; // Estimate gas per item
        uint256 maxItems = gasLimit / gasPerItem;
        
        for (uint256 i = 0; i < hashes.length && i < maxItems; i++) {
            processItem(hashes[i]);
        }
    }
    
    function processItem(bytes32 hash) internal {
        // Process individual item
    }
}
```

## Monitoring and Metrics

### Performance Monitoring

#### Application Metrics

```javascript
const prometheus = require('prom-client');

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
});
```

#### Database Metrics

```javascript
// Monitor database performance
const dbQueryDuration = new prometheus.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type']
});

const dbConnections = new prometheus.Gauge({
  name: 'db_connections',
  help: 'Number of database connections'
});

// Wrap database queries
const timedQuery = async (query, params, queryType) => {
  const start = Date.now();
  
  try {
    const result = await pool.query(query, params);
    const duration = (Date.now() - start) / 1000;
    dbQueryDuration.labels(queryType).observe(duration);
    return result;
  } catch (error) {
    const duration = (Date.now() - start) / 1000;
    dbQueryDuration.labels(queryType).observe(duration);
    throw error;
  }
};
```

### Performance Testing

#### Load Testing

```javascript
const autocannon = require('autocannon');

// Load test configuration
const loadTest = async () => {
  const result = await autocannon({
    url: 'http://localhost:3000/api/daos',
    connections: 10,
    duration: 10,
    pipelining: 1,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Load test results:', result);
};

// Run load test
loadTest();
```

#### Benchmark Testing

```javascript
const { performance } = require('perf_hooks');

// Benchmark function performance
const benchmark = async (fn, iterations = 1000) => {
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  console.log(`Average: ${avg.toFixed(2)}ms`);
  console.log(`Min: ${min.toFixed(2)}ms`);
  console.log(`Max: ${max.toFixed(2)}ms`);
};
```

## Optimization Checklist

### Frontend Optimization

- [ ] **Code splitting** implemented
- [ ] **Lazy loading** for components
- [ ] **Image optimization** with WebP
- [ ] **Service worker** caching
- [ ] **Bundle size** optimized
- [ ] **Critical CSS** inlined
- [ ] **Font loading** optimized

### Backend Optimization

- [ ] **Database indexes** created
- [ ] **Query optimization** implemented
- [ ] **Connection pooling** configured
- [ ] **Redis caching** enabled
- [ ] **Response compression** enabled
- [ ] **Rate limiting** configured
- [ ] **Batch operations** implemented

### Smart Contract Optimization

- [ ] **Gas optimization** implemented
- [ ] **Storage packing** optimized
- [ ] **Batch operations** available
- [ ] **Events** used for off-chain data
- [ ] **External functions** for external calls
- [ ] **Memory usage** optimized

### Monitoring and Testing

- [ ] **Performance metrics** collected
- [ ] **Load testing** performed
- [ ] **Benchmark testing** completed
- [ ] **Monitoring alerts** configured
- [ ] **Performance budgets** set
- [ ] **Optimization goals** defined

---

*Last updated: July 2024*