# JSON-LD Integration Specification

## Overview

This document describes the JSON-LD (JSON for Linked Data) integration for the DAO Registry project, conforming to the [W3C JSON-LD 1.1 specification](https://www.w3.org/TR/json-ld/).

## Table of Contents

1. [Introduction](#introduction)
2. [JSON-LD Context](#json-ld-context)
3. [Data Model](#data-model)
4. [API Integration](#api-integration)
5. [Content Negotiation](#content-negotiation)
6. [Frontend Integration](#frontend-integration)
7. [Validation](#validation)
8. [Examples](#examples)
9. [Implementation Guide](#implementation-guide)

## Introduction

JSON-LD is a method of encoding Linked Data using JSON. It provides a way to create machine-readable, semantically rich data that can be easily processed by applications and understood by search engines.

### Benefits

- **Semantic Interoperability**: Data is self-describing and can be understood across different systems
- **SEO Optimization**: Search engines can better understand and index DAO data
- **API Flexibility**: Clients can request data in different formats (JSON or JSON-LD)
- **Future-Proofing**: Enables integration with the broader Semantic Web ecosystem

## JSON-LD Context

### Context Definition

The JSON-LD context is defined in `shared/schemas/json-ld-context.json`:

```json
{
  "@context": {
    "@vocab": "https://dao-registry.org/vocab/",
    "@base": "https://dao-registry.org/api/",
    "dao": "https://dao-registry.org/vocab/DAO",
    "organization": "https://schema.org/Organization",
    "blockchain": "https://dao-registry.org/vocab/Blockchain",
    "governance": "https://dao-registry.org/vocab/Governance",
    "token": "https://dao-registry.org/vocab/Token",
    "treasury": "https://dao-registry.org/vocab/Treasury",
    "proposal": "https://dao-registry.org/vocab/Proposal",
    "member": "https://dao-registry.org/vocab/Member",
    "vote": "https://dao-registry.org/vocab/Vote",
    "ens": "https://dao-registry.org/vocab/ENS",
    "metadata": "https://dao-registry.org/vocab/Metadata"
  }
}
```

### Vocabulary Terms

| Term | URI | Description |
|------|-----|-------------|
| `dao` | `https://dao-registry.org/vocab/DAO` | A Decentralized Autonomous Organization |
| `organization` | `https://schema.org/Organization` | Schema.org organization type |
| `blockchain` | `https://dao-registry.org/vocab/Blockchain` | Blockchain-related properties |
| `governance` | `https://dao-registry.org/vocab/Governance` | Governance mechanism properties |
| `token` | `https://dao-registry.org/vocab/Token` | Token-related properties |
| `treasury` | `https://dao-registry.org/vocab/Treasury` | Treasury-related properties |
| `proposal` | `https://dao-registry.org/vocab/Proposal` | Governance proposal properties |
| `member` | `https://dao-registry.org/vocab/Member` | DAO member properties |
| `vote` | `https://dao-registry.org/vocab/Vote` | Voting properties |
| `ens` | `https://dao-registry.org/vocab/ENS` | Ethereum Name Service properties |
| `metadata` | `https://dao-registry.org/vocab/Metadata` | Metadata properties |

## Data Model

### DAO Entity

A DAO entity in JSON-LD format includes:

```json
{
  "@context": "https://dao-registry.org/contexts/dao.jsonld",
  "@type": "DAO",
  "@id": "https://dao-registry.org/api/daos/123",
  "id": "123",
  "name": "Example DAO",
  "symbol": "EXDAO",
  "description": "An example decentralized autonomous organization",
  "contractAddress": {
    "@type": "EthereumAddress",
    "@value": "0x1234567890123456789012345678901234567890"
  },
  "tokenAddress": {
    "@type": "EthereumAddress",
    "@value": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
  },
  "treasuryAddress": {
    "@type": "EthereumAddress",
    "@value": "0x9876543210987654321098765432109876543210"
  },
  "governanceAddress": {
    "@type": "EthereumAddress",
    "@value": "0xfedcba9876543210fedcba9876543210fedcba98"
  },
  "chainId": {
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
    "@value": 1
  },
  "governanceType": "token",
  "votingPeriod": {
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
    "@value": 172800
  },
  "quorum": {
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
    "@value": 1000
  },
  "proposalThreshold": {
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
    "@value": 100
  },
  "status": "Active",
  "verified": {
    "@type": "http://www.w3.org/2001/XMLSchema#boolean",
    "@value": true
  },
  "createdAt": {
    "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
    "@value": "2024-01-01T00:00:00Z"
  },
  "updatedAt": {
    "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
    "@value": "2024-01-01T00:00:00Z"
  }
}
```

### Collection Response

A collection of DAOs in JSON-LD format:

```json
{
  "@context": "https://dao-registry.org/contexts/dao.jsonld",
  "@type": "Collection",
  "@id": "https://dao-registry.org/api/daos",
  "member": [
    {
      "@type": "DAO",
      "@id": "https://dao-registry.org/api/daos/123",
      "id": "123",
      "name": "Example DAO 1"
    },
    {
      "@type": "DAO",
      "@id": "https://dao-registry.org/api/daos/456",
      "id": "456",
      "name": "Example DAO 2"
    }
  ],
  "pagination": {
    "@type": "Pagination",
    "page": {
      "@type": "http://www.w3.org/2001/XMLSchema#integer",
      "@value": 1
    },
    "limit": {
      "@type": "http://www.w3.org/2001/XMLSchema#integer",
      "@value": 20
    },
    "total": {
      "@type": "http://www.w3.org/2001/XMLSchema#integer",
      "@value": 100
    },
    "totalPages": {
      "@type": "http://www.w3.org/2001/XMLSchema#integer",
      "@value": 5
    },
    "hasNext": {
      "@type": "http://www.w3.org/2001/XMLSchema#boolean",
      "@value": true
    },
    "hasPrev": {
      "@type": "http://www.w3.org/2001/XMLSchema#boolean",
      "@value": false
    }
  }
}
```

## API Integration

### Content Negotiation

The API supports content negotiation through:

1. **Accept Header**: `Accept: application/ld+json`
2. **Query Parameter**: `?format=jsonld`
3. **Content-Type Header**: `Content-Type: application/ld+json`

### Endpoints

#### Context Endpoint

```
GET /api/contexts/dao.jsonld
Content-Type: application/ld+json
```

Returns the JSON-LD context for DAO entities.

#### DAO Endpoints

All DAO endpoints support JSON-LD:

- `GET /api/daos` - List DAOs (returns Collection)
- `GET /api/daos/:id` - Get single DAO
- `POST /api/daos` - Create DAO
- `PUT /api/daos/:id` - Update DAO
- `DELETE /api/daos/:id` - Delete DAO
- `PATCH /api/daos/:id/verify` - Verify DAO
- `PATCH /api/daos/:id/status` - Change DAO status

### Request Examples

#### Create DAO with JSON-LD

```bash
curl -X POST /api/daos \
  -H "Content-Type: application/ld+json" \
  -H "Accept: application/ld+json" \
  -d '{
    "@context": "https://dao-registry.org/contexts/dao.jsonld",
    "@type": "DAO",
    "name": "New DAO",
    "symbol": "NEWDAO",
    "description": "A new DAO",
    "contractAddress": "0x1234567890123456789012345678901234567890",
    "tokenAddress": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "treasuryAddress": "0x9876543210987654321098765432109876543210",
    "governanceAddress": "0xfedcba9876543210fedcba9876543210fedcba98",
    "chainId": 1,
    "governanceType": "token",
    "votingPeriod": 172800,
    "quorum": 1000,
    "proposalThreshold": 100
  }'
```

#### Get DAOs with JSON-LD

```bash
curl -H "Accept: application/ld+json" /api/daos
```

## Content Negotiation

### Accept Headers

| Accept Header | Response Format |
|---------------|-----------------|
| `application/ld+json` | JSON-LD |
| `application/json` | JSON-LD (fallback) |
| `application/json, application/ld+json` | JSON-LD |
| `*/*` | Regular JSON |

### Query Parameters

| Parameter | Value | Effect |
|-----------|-------|--------|
| `format` | `jsonld` | Force JSON-LD response |
| `format` | `json` | Force regular JSON response |

## Frontend Integration

### JSON-LD Client

The frontend includes a `JSONLDClient` class for handling JSON-LD requests:

```javascript
import JSONLDClient from './services/json-ld-client';

const client = new JSONLDClient();

// Get context
const context = await client.getContext();

// Get DAOs in JSON-LD format
const daos = await client.getAllDAOs();

// Create DAO with JSON-LD
const newDAO = await client.createDAO(daoData);
```

### React Components

Components can use JSON-LD data:

```javascript
import React, { useState, useEffect } from 'react';
import JSONLDClient from '../services/json-ld-client';

function DAOList() {
  const [daos, setDaos] = useState([]);
  const [context, setContext] = useState(null);
  const client = new JSONLDClient();

  useEffect(() => {
    const loadData = async () => {
      const [contextData, daosData] = await Promise.all([
        client.getContext(),
        client.getAllDAOs()
      ]);
      
      setContext(contextData);
      setDaos(daosData.member || daosData.data || []);
    };
    
    loadData();
  }, []);

  return (
    <div>
      {daos.map(dao => (
        <div key={dao.id}>
          <h3>{dao.name}</h3>
          <p>{dao.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## Validation

### JSON-LD Validation

The system validates JSON-LD structure:

```javascript
const validation = jsonldService.validateJSONLD(jsonldData);
if (!validation.isValid) {
  console.error('JSON-LD validation errors:', validation.errors);
}
```

### Schema Validation

JSON-LD data is validated against the JSON-LD schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://dao-registry.org/schemas/DAO.json-ld.schema.json",
  "title": "DAO JSON-LD Schema",
  "type": "object",
  "allOf": [
    {
      "$ref": "DAO.schema.json"
    },
    {
      "properties": {
        "@context": {
          "type": "string",
          "const": "https://dao-registry.org/contexts/dao.jsonld"
        },
        "@type": {
          "type": "string",
          "const": "DAO"
        },
        "@id": {
          "type": "string",
          "format": "uri"
        }
      },
      "required": ["@context", "@type", "@id"]
    }
  ]
}
```

## Examples

### Complete DAO Example

```json
{
  "@context": "https://dao-registry.org/contexts/dao.jsonld",
  "@type": "DAO",
  "@id": "https://dao-registry.org/api/daos/example-dao",
  "id": "example-dao",
  "name": "Example DAO",
  "symbol": "EXDAO",
  "description": "An example decentralized autonomous organization for demonstration purposes",
  "contractAddress": {
    "@type": "EthereumAddress",
    "@value": "0x1234567890123456789012345678901234567890"
  },
  "tokenAddress": {
    "@type": "EthereumAddress",
    "@value": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
  },
  "treasuryAddress": {
    "@type": "EthereumAddress",
    "@value": "0x9876543210987654321098765432109876543210"
  },
  "governanceAddress": {
    "@type": "EthereumAddress",
    "@value": "0xfedcba9876543210fedcba9876543210fedcba98"
  },
  "chainId": {
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
    "@value": 1
  },
  "governanceType": "token",
  "votingPeriod": {
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
    "@value": 172800
  },
  "quorum": {
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
    "@value": 1000
  },
  "proposalThreshold": {
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
    "@value": 100
  },
  "logo": "https://example.com/logo.png",
  "website": "https://example.com",
  "ensDomain": "example.eth",
  "ensSubdomains": {
    "governance": "gov.example.eth",
    "treasury": "treasury.example.eth",
    "token": "token.example.eth",
    "docs": "docs.example.eth",
    "forum": "forum.example.eth",
    "analytics": "analytics.example.eth"
  },
  "ensMetadata": {
    "textRecords": {
      "description": "Example DAO",
      "url": "https://example.com",
      "email": "contact@example.com"
    },
    "contentHash": "ipfs://QmExample",
    "reverseRecord": "example.eth"
  },
  "socialLinks": {
    "twitter": "https://twitter.com/example",
    "discord": "https://discord.gg/example",
    "telegram": "https://t.me/example",
    "github": "https://github.com/example",
    "medium": "https://medium.com/@example",
    "reddit": "https://reddit.com/r/example"
  },
  "tags": ["governance", "defi", "dao"],
  "status": "Active",
  "verified": {
    "@type": "http://www.w3.org/2001/XMLSchema#boolean",
    "@value": true
  },
  "createdAt": {
    "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
    "@value": "2024-01-01T00:00:00Z"
  },
  "updatedAt": {
    "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
    "@value": "2024-01-01T00:00:00Z"
  },
  "totalMembers": {
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
    "@value": 1000
  },
  "totalProposals": {
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
    "@value": 50
  },
  "totalVotes": {
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
    "@value": 5000
  }
}
```

### Error Response Example

```json
{
  "@context": "https://dao-registry.org/contexts/dao.jsonld",
  "@type": "Error",
  "success": {
    "@type": "http://www.w3.org/2001/XMLSchema#boolean",
    "@value": false
  },
  "error": "DAO not found",
  "statusCode": {
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
    "@value": 404
  },
  "details": "The requested DAO with ID 'nonexistent' was not found"
}
```

## Implementation Guide

### Backend Implementation

1. **Install Dependencies**: No additional dependencies required
2. **Add JSON-LD Service**: Use `backend/src/services/json-ld-service.js`
3. **Add JSON-LD Middleware**: Use `backend/src/middleware/json-ld.js`
4. **Update Routes**: Apply middleware to routes
5. **Add Context Endpoint**: Serve JSON-LD context

### Frontend Implementation

1. **Add JSON-LD Client**: Use `frontend/src/services/json-ld-client.js`
2. **Update Components**: Use JSON-LD client for API calls
3. **Handle Content Negotiation**: Set appropriate headers
4. **Parse JSON-LD Responses**: Convert to regular JSON if needed

### Testing

1. **Test Content Negotiation**: Verify Accept headers work
2. **Test JSON-LD Validation**: Ensure invalid JSON-LD is rejected
3. **Test Context Endpoint**: Verify context is served correctly
4. **Test Frontend Integration**: Ensure components work with JSON-LD

### Deployment

1. **Update API Documentation**: Include JSON-LD examples
2. **Add CORS Headers**: Allow JSON-LD content type
3. **Monitor Performance**: JSON-LD adds minimal overhead
4. **SEO Optimization**: Ensure search engines can access JSON-LD data

## Conclusion

The JSON-LD integration provides semantic interoperability while maintaining backward compatibility with existing JSON APIs. The implementation follows W3C standards and enables the DAO Registry to participate in the broader Semantic Web ecosystem.
