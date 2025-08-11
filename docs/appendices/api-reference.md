# API Reference

## Base URL

```
https://api.dao-registry.com/v1
```

## Authentication

### API Key Authentication

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.dao-registry.com/v1/daos
```

### JWT Authentication

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://api.dao-registry.com/v1/daos
```

## Endpoints

### DAOs

#### Get All DAOs

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

#### Get DAO by ID

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

#### Create DAO

```http
POST /daos
```

**Request Body:**
```json
{
  "name": "New DAO",
  "symbol": "NEWDAO",
  "description": "A new decentralized autonomous organization",
  "chainId": 1,
  "contractAddress": "0x...",
  "tokenAddress": "0x...",
  "treasuryAddress": "0x...",
  "governanceAddress": "0x...",
  "website": "https://example.com",
  "socialLinks": {
    "twitter": "https://twitter.com/example",
    "discord": "https://discord.gg/example"
  },
  "tags": ["DeFi", "Governance"]
}
```

#### Update DAO

```http
PUT /daos/{id}
```

**Request Body:**
```json
{
  "name": "Updated DAO Name",
  "description": "Updated description",
  "website": "https://updated-example.com",
  "socialLinks": {
    "twitter": "https://twitter.com/updated",
    "discord": "https://discord.gg/updated"
  }
}
```

#### Delete DAO

```http
DELETE /daos/{id}
```

### Statistics

#### Get Registry Statistics

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

### Proposals

#### Get DAO Proposals

```http
GET /daos/{id}/proposals
```

**Query Parameters:**
- `status` (string): Proposal status
- `page` (number): Page number
- `limit` (number): Results per page

**Response:**
```json
{
  "proposals": [
    {
      "id": "proposal-123",
      "title": "Update governance parameters",
      "description": "Proposal to update quorum and voting period",
      "status": "Active",
      "createdAt": "2024-07-28T18:00:00Z",
      "votingStart": "2024-07-29T00:00:00Z",
      "votingEnd": "2024-08-05T00:00:00Z",
      "executionTime": "2024-08-07T00:00:00Z",
      "votes": {
        "for": 1000000,
        "against": 500000,
        "abstain": 100000
      },
      "quorum": 1500000,
      "executionDelay": 172800
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### Create Proposal

```http
POST /daos/{id}/proposals
```

**Request Body:**
```json
{
  "title": "New Proposal",
  "description": "Proposal description",
  "actions": [
    {
      "target": "0x...",
      "value": "0",
      "data": "0x..."
    }
  ],
  "votingPeriod": 604800,
  "executionDelay": 172800
}
```

### Voting

#### Submit Vote

```http
POST /daos/{id}/proposals/{proposalId}/vote
```

**Request Body:**
```json
{
  "support": 1,
  "reason": "I support this proposal because...",
  "signature": "0x..."
}
```

#### Get Vote

```http
GET /daos/{id}/proposals/{proposalId}/votes/{voter}
```

**Response:**
```json
{
  "voter": "0x...",
  "support": 1,
  "reason": "I support this proposal because...",
  "votingPower": "1000000",
  "timestamp": "2024-07-28T19:00:00Z"
}
```

### ENS Integration

#### Get ENS Resolution

```http
GET /ens/resolve/{name}
```

**Response:**
```json
{
  "name": "example.dao",
  "address": "0x...",
  "resolver": "0x...",
  "contentHash": "0x...",
  "textRecords": {
    "description": "Example DAO",
    "url": "https://example.com"
  }
}
```

#### Set ENS Record

```http
POST /ens/records
```

**Request Body:**
```json
{
  "name": "example.dao",
  "address": "0x...",
  "contentHash": "0x...",
  "textRecords": {
    "description": "Example DAO",
    "url": "https://example.com"
  }
}
```

## Error Handling

### Error Response Format

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

### Common Error Codes

- `VALIDATION_ERROR`: Invalid request parameters
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

### Rate Limiting

- **Default**: 100 requests per minute
- **Authenticated**: 1000 requests per minute
- **Premium**: 10000 requests per minute

## SDK Usage

### TypeScript SDK

```typescript
import { DAORegistryClient } from '@dao-registry/sdk';

const client = new DAORegistryClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.dao-registry.com/v1'
});

// Get all DAOs
const daos = await client.getDAOs({
  search: 'example',
  chainId: 1,
  page: 1,
  limit: 20
});

// Get specific DAO
const dao = await client.getDAO('dao-123');

// Create proposal
const proposal = await client.createProposal('dao-123', {
  title: 'New Proposal',
  description: 'Proposal description',
  actions: []
});
```

### JavaScript SDK

```javascript
const { DAORegistryClient } = require('@dao-registry/sdk');

const client = new DAORegistryClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.dao-registry.com/v1'
});

// Get statistics
const stats = await client.getStats({
  timeRange: '7d'
});
```

## Webhooks

### Webhook Events

- `dao.created`: DAO registration
- `dao.updated`: DAO information update
- `proposal.created`: New proposal
- `proposal.executed`: Proposal execution
- `vote.submitted`: Vote submission

### Webhook Configuration

```json
{
  "url": "https://your-endpoint.com/webhook",
  "events": ["dao.created", "proposal.created"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload

```json
{
  "event": "dao.created",
  "timestamp": "2024-07-28T19:00:00Z",
  "data": {
    "id": "dao-123",
    "name": "Example DAO",
    "contractAddress": "0x..."
  }
}
```

---

*Last updated: July 2024*