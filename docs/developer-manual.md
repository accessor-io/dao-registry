# DAO Registry Developer Manual

Welcome to the DAO Registry Developer Manual - your comprehensive guide to understanding, contributing to, and integrating with the DAO Registry platform.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [API Documentation](#api-documentation)
4. [Frontend Development](#frontend-development)
5. [Backend Development](#backend-development)
6. [Smart Contract Development](#smart-contract-development)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Contributing](#contributing)
10. [Troubleshooting](#troubleshooting)

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                          │
│  React + TypeScript + Tailwind CSS                        │
├─────────────────────────────────────────────────────────────┤
│                    API Gateway Layer                       │
│  Express.js + Rate Limiting + Authentication              │
├─────────────────────────────────────────────────────────────┤
│                  Business Logic Layer                      │
│  Service Layer + Validation + Error Handling              │
├─────────────────────────────────────────────────────────────┤
│                   Data Layer                              │
│  PostgreSQL + Redis + MongoDB                             │
├─────────────────────────────────────────────────────────────┤
│                Blockchain Integration Layer               │
│  ethers.js + ENS + Multi-chain Support                   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Axios**: HTTP client
- **React Router**: Navigation

#### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **TypeScript**: Type safety
- **Zod**: Schema validation
- **Jest**: Testing framework
- **Winston**: Logging

#### Blockchain
- **Solidity**: Smart contract language
- **Hardhat**: Development framework
- **ethers.js**: Ethereum library
- **ENS.js**: Name service integration

#### Database
- **PostgreSQL**: Primary database
- **Redis**: Caching layer
- **MongoDB**: Document storage

## Development Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **PostgreSQL** (v13 or higher)
- **Redis** (v6 or higher)
- **MongoDB** (v5 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/dao-registry.git
   cd dao-registry
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up databases**
   ```bash
   # PostgreSQL
   createdb dao_registry_dev
   createdb dao_registry_test
   
   # Redis
   redis-server
   
   # MongoDB
   mongod
   ```

5. **Run migrations**
   ```bash
   npm run migrate
   ```

6. **Start development servers**
   ```bash
   # Backend
   npm run dev
   
   # Frontend (in another terminal)
   cd frontend && npm start
   ```

### Environment Configuration

#### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dao_registry_dev
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://localhost:27017/dao_registry

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-rpc.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc

# API Keys
INFURA_PROJECT_ID=your_infura_project_id
ALCHEMY_API_KEY=your_alchemy_api_key

# Security
JWT_SECRET=your_jwt_secret
API_KEY_SECRET=your_api_key_secret

# ENS
ENS_REGISTRY_ADDRESS=0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
```

## API Documentation

### Base URL
```
https://api.dao-registry.com/v1
```

### Authentication

#### API Key Authentication
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.dao-registry.com/v1/daos
```

#### JWT Authentication
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://api.dao-registry.com/v1/daos
```

### Endpoints

#### DAOs

##### Get All DAOs
```http
GET /daos
```

**Query Parameters:**
- `search` (string): Search term
- `chainId` (number): Blockchain network ID
- `status` (string): DAO status filter
- `verified` (boolean): Verification status
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20)

**Response:**
```json
{
  "daos": [
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
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

##### Get DAO by ID
```http
GET /daos/{id}
```

**Response:**
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
  "tokenAddress": "0x...",
  "treasuryAddress": "0x...",
  "governanceAddress": "0x...",
  "memberCount": 1000,
  "governanceType": "Token-based",
  "votingPower": "Token-based",
  "quorum": "1000000",
  "executionDelay": "172800",
  "registrationDate": "2024-01-01T00:00:00Z",
  "lastUpdated": "2024-07-28T19:00:00Z",
  "website": "https://example.com",
  "socialLinks": {
    "twitter": "https://twitter.com/example",
    "discord": "https://discord.gg/example",
    "telegram": "https://t.me/example",
    "github": "https://github.com/example"
  },
  "tags": ["DeFi", "Governance", "Treasury"],
  "analytics": {
    "totalProposals": 50,
    "activeProposals": 3,
    "totalMembers": 1000,
    "activeMembers": 750,
    "treasuryValue": "1000000",
    "totalVotingPower": "50000000",
    "participationRate": 75.5
  },
  "recentActivity": [
    {
      "type": "proposal_created",
      "description": "New proposal created: Update governance parameters",
      "timestamp": "2024-07-28T18:00:00Z"
    }
  ]
}
```

#### Statistics

##### Get Registry Statistics
```http
GET /stats
```

**Query Parameters:**
- `timeRange` (string): Time range (24h, 7d, 30d, 90d)

**Response:**
```json
{
  "totalDAOs": 1000,
  "totalMembers": 50000,
  "totalProposals": 5000,
  "verifiedDAOs": 800,
  "newDAOsThisPeriod": 25,
  "newMembersThisPeriod": 1000,
  "newProposalsThisPeriod": 150,
  "chainDistribution": [
    {
      "chainId": 1,
      "name": "Ethereum",
      "count": 600,
      "percentage": 60
    }
  ],
  "statusDistribution": [
    {
      "status": "Active",
      "count": 800,
      "percentage": 80
    }
  ],
  "growthRate": {
    "daoGrowth": 2.5,
    "memberGrowth": 2.0,
    "proposalGrowth": 3.0
  },
  "topDAOs": [
    {
      "id": "dao-123",
      "name": "Example DAO",
      "chainId": 1,
      "activityScore": 95.5
    }
  ]
}
```

### Error Handling

#### Error Response Format
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

#### Common Error Codes
- `VALIDATION_ERROR`: Invalid request parameters
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Frontend Development

### Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── SearchPage.js
│   │   ├── DAODetail.js
│   │   ├── RegistryStats.js
│   │   └── DAOList.js
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── helpers.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── tailwind.config.js
```

### Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

### Component Development

#### Creating New Components

1. **Create component file**
   ```jsx
   // src/components/NewComponent.js
   import React from 'react';
   
   const NewComponent = ({ prop1, prop2 }) => {
     return (
       <div className="bg-white rounded-lg p-6">
         <h2 className="text-xl font-semibold">{prop1}</h2>
         <p className="text-gray-600">{prop2}</p>
       </div>
     );
   };
   
   export default NewComponent;
   ```

2. **Add to App.js**
   ```jsx
   import NewComponent from './components/NewComponent';
   
   // Use in your routes
   <Route path="/new" element={<NewComponent />} />
   ```

#### Styling Guidelines

- **Use Tailwind CSS** for styling
- **Follow responsive design** principles
- **Maintain consistency** with existing components
- **Use semantic HTML** for accessibility

### State Management

#### Local State
```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

#### API Calls
```jsx
const fetchData = async () => {
  try {
    setLoading(true);
    const response = await axios.get('/api/v1/daos');
    setData(response.data.daos);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## Backend Development

### Project Structure

```
src/
├── routes/
│   ├── dao.js
│   ├── stats.js
│   └── reserved-subdomains.js
├── services/
│   ├── blockchain/
│   │   └── dao-contract-service.js
│   ├── metadata/
│   │   ├── ens/
│   │   ├── iso/
│   │   └── registry/
│   └── dao.js
├── middleware/
│   └── validation.js
├── utils/
│   └── logger.js
└── index.js
```

### API Development

#### Creating New Endpoints

1. **Create route file**
   ```javascript
   // src/routes/new-feature.js
   const express = require('express');
   const router = express.Router();
   
   router.get('/', async (req, res) => {
     try {
       // Your logic here
       res.json({ success: true, data: [] });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   module.exports = router;
   ```

2. **Register in main app**
   ```javascript
   // src/index.js
   const newFeatureRouter = require('./routes/new-feature');
   app.use('/api/v1/new-feature', newFeatureRouter);
   ```

#### Validation

```javascript
const { z } = require('zod');

const querySchema = z.object({
  search: z.string().optional(),
  chainId: z.number().optional(),
  status: z.enum(['Active', 'Pending', 'Suspended', 'Inactive']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

// In your route
const validatedQuery = querySchema.parse(req.query);
```

#### Error Handling

```javascript
const errorHandler = (err, req, res, next) => {
  logger.error(err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.details
      }
    });
  }
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
};
```

### Database Operations

#### PostgreSQL with Prisma

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create
const dao = await prisma.dao.create({
  data: {
    name: 'Example DAO',
    symbol: 'EXDAO',
    chainId: 1,
    contractAddress: '0x...',
    status: 'Active'
  }
});

// Read
const daos = await prisma.dao.findMany({
  where: {
    chainId: 1,
    status: 'Active'
  },
  include: {
    analytics: true
  }
});

// Update
const updatedDao = await prisma.dao.update({
  where: { id: 'dao-123' },
  data: { status: 'Active' }
});

// Delete
await prisma.dao.delete({
  where: { id: 'dao-123' }
});
```

#### Redis Caching

```javascript
const redis = require('redis');
const client = redis.createClient();

// Set cache
await client.set('dao:123', JSON.stringify(daoData), 'EX', 3600);

// Get cache
const cachedData = await client.get('dao:123');
if (cachedData) {
  return JSON.parse(cachedData);
}
```

## Smart Contract Development

### Project Structure

```
contracts/
├── DAORegistry.sol
├── DataRegistry.sol
├── ReservedSubdomains.sol
├── MockERC20.sol
├── MockGovernance.sol
└── MockTreasury.sol
```

### Development Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

### Contract Development

#### Creating New Contracts

```solidity
// contracts/NewContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NewContract is Ownable, ReentrancyGuard {
    // Events
    event DataUpdated(address indexed user, uint256 timestamp);
    
    // State variables
    mapping(address => uint256) public userData;
    
    // Functions
    function updateData(uint256 _data) external nonReentrant {
        userData[msg.sender] = _data;
        emit DataUpdated(msg.sender, block.timestamp);
    }
    
    function getData(address _user) external view returns (uint256) {
        return userData[_user];
    }
}
```

#### Testing Contracts

```javascript
// test/NewContract.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NewContract", function () {
  let newContract;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const NewContract = await ethers.getContractFactory("NewContract");
    newContract = await NewContract.deploy();
    await newContract.deployed();
  });

  it("Should update data correctly", async function () {
    await newContract.connect(user1).updateData(100);
    expect(await newContract.getData(user1.address)).to.equal(100);
  });

  it("Should emit DataUpdated event", async function () {
    await expect(newContract.connect(user1).updateData(100))
      .to.emit(newContract, "DataUpdated")
      .withArgs(user1.address, await ethers.provider.getBlockNumber());
  });
});
```

## Testing

### Frontend Testing

```javascript
// src/components/__tests__/SearchPage.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import SearchPage from '../SearchPage';

describe('SearchPage', () => {
  it('renders search input', () => {
    render(<SearchPage />);
    expect(screen.getByPlaceholderText(/search for daos/i)).toBeInTheDocument();
  });

  it('filters results when search term is entered', async () => {
    render(<SearchPage />);
    const searchInput = screen.getByPlaceholderText(/search for daos/i);
    
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Wait for search results
    await screen.findByText(/found/i);
  });
});
```

### Backend Testing

```javascript
// test/api/dao.test.js
const request = require('supertest');
const app = require('../src/app');

describe('DAO API', () => {
  it('GET /api/v1/daos should return DAOs', async () => {
    const response = await request(app)
      .get('/api/v1/daos')
      .expect(200);
    
    expect(response.body).toHaveProperty('daos');
    expect(Array.isArray(response.body.daos)).toBe(true);
  });

  it('GET /api/v1/daos/:id should return specific DAO', async () => {
    const response = await request(app)
      .get('/api/v1/daos/dao-123')
      .expect(200);
    
    expect(response.body).toHaveProperty('id', 'dao-123');
  });
});
```

### Contract Testing

```javascript
// test/contracts/DAORegistry.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAORegistry", function () {
  let daoRegistry;
  let owner;
  let user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    
    const DAORegistry = await ethers.getContractFactory("DAORegistry");
    daoRegistry = await DAORegistry.deploy();
    await daoRegistry.deployed();
  });

  it("Should register a new DAO", async function () {
    await daoRegistry.connect(owner).registerDAO(
      "Test DAO",
      "TEST",
      "0x1234567890123456789012345678901234567890",
      1
    );
    
    const dao = await daoRegistry.getDAO(0);
    expect(dao.name).to.equal("Test DAO");
  });
});
```

## Deployment

### Environment Setup

#### Production Environment Variables

```env
# Production Database
DATABASE_URL=postgresql://user:password@prod-db:5432/dao_registry
REDIS_URL=redis://prod-redis:6379
MONGODB_URL=mongodb://prod-mongo:27017/dao_registry

# Production Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/PROD_PROJECT_ID
POLYGON_RPC_URL=https://polygon-rpc.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc

# Production Security
JWT_SECRET=production_jwt_secret
API_KEY_SECRET=production_api_key_secret

# Production Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info
```

### Deployment Commands

```bash
# Build frontend
cd frontend && npm run build

# Build backend
npm run build

# Deploy to production
npm run deploy:prod

# Deploy contracts
npx hardhat run scripts/deploy.js --network mainnet
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

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

  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: dao_registry
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

  redis:
    image: redis:6-alpine

  mongo:
    image: mongo:5
```

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write tests** for new functionality
5. **Update documentation** as needed
6. **Run tests and linting**
   ```bash
   npm test
   npm run lint
   ```
7. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature"
   ```
8. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
9. **Create a pull request**

### Code Style

#### JavaScript/TypeScript
- Use **ESLint** and **Prettier**
- Follow **Airbnb style guide**
- Use **TypeScript** for type safety
- Write **JSDoc comments** for functions

#### Solidity
- Use **Solidity Style Guide**
- Follow **OpenZeppelin patterns**
- Write **NatSpec comments**
- Use **Hardhat** for development

#### Git Commit Messages
- Use **Conventional Commits**
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Guidelines

1. **Clear description** of changes
2. **Link to issues** if applicable
3. **Include tests** for new features
4. **Update documentation** as needed
5. **Screenshots** for UI changes
6. **Self-review** before submitting

## Troubleshooting

### Common Issues

#### Frontend Issues

**Build Errors**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run build -- --reset-cache
```

**Runtime Errors**
- Check browser console for errors
- Verify API endpoints are accessible
- Check network connectivity

#### Backend Issues

**Database Connection**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U user -d dao_registry
```

**API Errors**
- Check server logs
- Verify environment variables
- Test endpoints with curl

#### Contract Issues

**Compilation Errors**
```bash
# Clear artifacts
npx hardhat clean

# Recompile
npx hardhat compile
```

**Deployment Errors**
- Check network configuration
- Verify account has sufficient funds
- Check gas limits

### Debugging

#### Frontend Debugging
```javascript
// Add debug logging
console.log('Debug:', data);

// Use React DevTools
// Install React Developer Tools browser extension
```

#### Backend Debugging
```javascript
// Add debug logging
logger.debug('Debug message', { data });

// Use Node.js debugger
node --inspect src/index.js
```

#### Contract Debugging
```javascript
// Add events for debugging
event DebugEvent(string message, uint256 value);

// Use Hardhat console
console.log('Debug:', value);
```

### Performance Optimization

#### Frontend
- **Code splitting** for large bundles
- **Lazy loading** for components
- **Image optimization** for assets
- **Caching strategies** for API calls

#### Backend
- **Database indexing** for queries
- **Redis caching** for frequent data
- **Connection pooling** for databases
- **Rate limiting** for API protection

#### Smart Contracts
- **Gas optimization** for functions
- **Batch operations** for efficiency
- **Event usage** for off-chain data
- **Upgradeable patterns** for flexibility

## Conclusion

This developer manual provides comprehensive guidance for working with the DAO Registry platform. Follow the established patterns and guidelines to ensure code quality and maintainability.

For additional support:
- **GitHub Issues**: Report bugs and request features
- **Discord Community**: Join developer discussions
- **Documentation**: Check additional technical docs
- **Code Reviews**: Submit pull requests for review

---

*Last updated: July 2024*
*Version: 1.0.0* 