# Quick Start Guide

Get the DAO Registry up and running in under 5 minutes! This guide will walk you through the essential steps to get started.

## Prerequisites

Before you begin, ensure you have:

- Node.js 18.0.0+ installed
- npm 8.0.0+ installed
- Git installed
- A code editor (VS Code recommended)

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/dao-registry.git
cd dao-registry
```

## Step 2: Install Dependencies

```bash
npm install --legacy-peer-deps
```

## Step 3: Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/dao_registry

# Blockchain Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-rpc.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc

# API Configuration
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key

# External Services
INFURA_PROJECT_ID=your-infura-project-id
ALCHEMY_API_KEY=your-alchemy-api-key
```

## Step 4: Database Setup

### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL with Docker
docker run --name dao-registry-db \
  -e POSTGRES_DB=dao_registry \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Run database migrations
npm run migrate
```

### Option B: Local PostgreSQL

1. Install PostgreSQL on your system
2. Create a database named `dao_registry`
3. Run migrations:

```bash
npm run migrate
```

## Step 5: Start the Development Server

```bash
# Start the backend server
npm run dev

# In another terminal, start the frontend (if applicable)
npm run start:frontend
```

The API will be available at `http://localhost:3000`

## Step 6: Verify Installation

### Test the API

```bash
# Health check
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Test Smart Contracts

```bash
# Compile contracts
npm run contract:compile

# Run tests
npm run contract:test
```

## Step 7: Register Your First DAO

### Using the API

```bash
# Register a DAO
curl -X POST http://localhost:3000/api/daos \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First DAO",
    "symbol": "MFD",
    "description": "A test DAO for learning",
    "governanceToken": "0x1234567890123456789012345678901234567890",
    "treasuryAddress": "0x1234567890123456789012345678901234567890",
    "networkId": 1
  }'
```

### Using the Frontend

1. Open your browser to `http://localhost:3000`
2. Click "Register New DAO"
3. Fill in the required information
4. Submit the registration

## Step 8: Explore Features

### View Analytics Dashboard

Navigate to `http://localhost:3000/analytics` to see:

- Governance participation metrics
- Treasury flow analysis
- Member engagement statistics
- Proposal success rates

### Test ENS Integration

```bash
# Link ENS domain to DAO
curl -X POST http://localhost:3000/api/daos/{daoId}/ens \
  -H "Content-Type: application/json" \
  -d '{
    "domainName": "mydao.eth",
    "ownerAddress": "0x1234567890123456789012345678901234567890"
  }'
```

## Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
# Change port in .env file
PORT=3001
```

**Database connection failed:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart if needed
docker restart dao-registry-db
```

**Contract compilation failed:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install --legacy-peer-deps
npm run contract:compile
```

### Getting Help

- Check the [Troubleshooting](../troubleshooting/README.md) section
- Review [Common Issues](../troubleshooting/common-issues.md)
- Join our [Discord community](https://discord.gg/dao-registry)

## Next Steps

Now that you have the basic system running, explore:

1. **[Configuration Guide](configuration.md)** - Customize your setup
2. **[API Reference](../api/README.md)** - Learn about available endpoints
3. **[Smart Contracts](../contracts/README.md)** - Understand the blockchain components
4. **[Analytics](../analytics/README.md)** - Explore advanced analytics features

## Production Deployment

For production deployment, see the [Deployment Guide](../development/deployment.md).

---

**Congratulations!** You've successfully set up the DAO Registry. 🎉

Need more help? Check out our [FAQ](../faq/README.md) or [contact support](mailto:support@dao-registry.com). 