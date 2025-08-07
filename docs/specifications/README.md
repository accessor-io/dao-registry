# DAO Registry Specifications

This directory contains all TypeScript type definitions and specifications for the DAO Registry system. Each specification is organized into its own file for clarity and maintainability.

## Directory Structure

```
specifications/
├── core/                    # Core entity types
│   ├── dao.types.ts        # DAO entity and related types
│   ├── proposal.types.ts   # Proposal entity and related types
│   └── member.types.ts     # Member entity and related types
├── ens/                    # ENS integration types
│   └── ens-integration.types.ts
├── analytics/              # Analytics and metrics types
│   └── analytics.types.ts
├── api/                    # API specification types
│   └── api.types.ts
├── blockchain/             # Smart contract types
│   └── smart-contracts.types.ts
├── validation/             # Validation and sanitization types
│   └── validation.types.ts
├── classification/         # Data classification types
│   └── classifiers.types.ts
├── index.ts               # Main export file
└── README.md              # This file
```

## Core Types

### DAO Types (`core/dao.types.ts`)
Core DAO entity and related types including:
- `DAO` - Main DAO interface
- `ENSSubdomains` - ENS subdomain structure
- `ENSMetadata` - ENS metadata structure
- `SocialLinks` - Social media links
- `GovernanceType` - Governance type enumeration
- `DAOStatus` - DAO status enumeration
- Request/Response types for DAO operations

### Proposal Types (`core/proposal.types.ts`)
Proposal entity and related types including:
- `Proposal` - Main proposal interface
- `ProposalAction` - Proposal action structure
- `ProposalMetadata` - Proposal metadata
- `Vote` - Vote entity
- `ProposalStatus` - Proposal status enumeration
- `VoteType` - Vote type enumeration
- Request/Response types for proposal operations

### Member Types (`core/member.types.ts`)
Member entity and related types including:
- `Member` - Main member interface
- `MemberActivity` - Member activity tracking
- `MemberRole` - Member role enumeration
- `Permission` - Permission enumeration
- `ActivityType` - Activity type enumeration
- Request/Response types for member operations

## ENS Integration Types (`ens/ens-integration.types.ts`)

ENS (Ethereum Name Service) integration types including:
- `ENSRegistration` - ENS registration structure
- `ENSSubdomain` - ENS subdomain structure
- `ENSMetadata` - ENS metadata structure
- `ENSResolution` - ENS resolution result
- `ENSDomainType` - Domain type enumeration
- `ENSSubdomainType` - Subdomain type enumeration
- Request/Response types for ENS operations

## Analytics Types (`analytics/analytics.types.ts`)

Analytics and metrics types including:
- `DAOAnalytics` - DAO analytics data
- `ProposalAnalytics` - Proposal analytics data
- `MemberAnalytics` - Member analytics data
- `TreasuryAnalytics` - Treasury analytics data
- `RiskMetrics` - Risk assessment metrics
- `ComparativeAnalytics` - Comparative analysis data
- Request/Response types for analytics operations

## API Types (`api/api.types.ts`)

API specification types including:
- `RESTEndpoints` - REST API endpoint definitions
- `GraphQLSchema` - GraphQL schema definitions
- `WebSocketAPI` - WebSocket API definitions
- Request/Response types for all API operations
- Input/Output types for GraphQL operations
- Message and event types for WebSocket operations

## Blockchain Types (`blockchain/smart-contracts.types.ts`)

Smart contract interface types including:
- `IDAORegistry` - DAO Registry contract interface
- `ITreasury` - Treasury contract interface
- `IENSIntegration` - ENS Integration contract interface
- `IGovernance` - Governance contract interface
- `IToken` - Token contract interface
- `ICrossChainBridge` - Cross-chain bridge interface
- `IAnalytics` - Analytics contract interface
- `ISecurity` - Security contract interface

## Validation Types (`validation/validation.types.ts`)

Validation and sanitization types including:
- `BaseValidator` - Base validator interface
- `ValidationResult` - Validation result structure
- `ValidationError` - Validation error structure
- `ValidationWarning` - Validation warning structure
- Specialized validators for:
  - ENS domains
  - Ethereum addresses
  - DAO names
  - Text records
  - Content hashes
  - Numeric values
  - Security validation
- Composite validation interfaces

## Classification Types (`classification/classifiers.types.ts`)

Data classification types including:
- `BaseClassifier` - Base classifier interface
- `ClassificationResult` - Classification result structure
- `ClassificationRules` - Classification rules structure
- Specialized classifiers for:
  - ENS domains
  - Ethereum addresses
  - DAO names
  - Text records
  - Content hashes
  - Numeric values
- Composite classification interfaces
- Additional classification types for:
  - DAO types and categories
  - Governance mechanisms
  - Proposal types and categories
  - Member types and roles
  - Metadata quality and completeness

## Usage

### Importing Types

```typescript
// Import all specifications
import * as DAORegistrySpecs from './specifications';

// Import specific types
import { DAO, Proposal, Member } from './specifications/core/dao.types';
import { ENSRegistration } from './specifications/ens/ens-integration.types';
import { DAOAnalytics } from './specifications/analytics/analytics.types';

// Import validation types
import { BaseValidator, ValidationResult } from './specifications/validation/validation.types';

// Import classification types
import { BaseClassifier, ClassificationResult } from './specifications/classification/classifiers.types';
```

### Using Core Types

```typescript
// Create a DAO instance
const dao: DAO = {
  id: "dao-123",
  name: "Uniswap DAO",
  symbol: "UNI",
  description: "Decentralized exchange governance",
  ensDomain: "uniswap.eth",
  chainId: 1,
  contractAddress: "0x1234567890abcdef",
  tokenAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  treasuryAddress: "0x1234567890abcdef",
  governanceType: GovernanceType.TOKEN,
  votingPeriod: 86400,
  quorum: 50,
  proposalThreshold: 1000000,
  logo: "https://example.com/logo.png",
  website: "https://uniswap.org",
  socialLinks: {
    twitter: "https://twitter.com/uniswap",
    discord: "https://discord.gg/uniswap"
  },
  tags: ["defi", "dex", "governance"],
  createdAt: new Date(),
  updatedAt: new Date(),
  status: DAOStatus.ACTIVE,
  verified: true
};
```

### Using Validation Types

```typescript
// Create a validator
class ENSDomainValidator implements BaseValidator<string> {
  validate(input: string): ValidationResult {
    // Implementation
    return {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedValue: input.toLowerCase()
    };
  }
  
  sanitize(input: string): string {
    return input.toLowerCase().trim();
  }
  
  getValidationRules(): ValidationRules {
    return {
      required: true,
      minLength: 3,
      maxLength: 253,
      pattern: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/
    };
  }
}
```

### Using Classification Types

```typescript
// Create a classifier
class DAONameClassifier implements BaseClassifier<string, DAONameClassification> {
  classify(input: string): DAONameClassification {
    // Implementation
    return {
      type: DAONameType.VALID,
      name: input,
      normalizedName: input.toLowerCase(),
      confidence: 1.0
    };
  }
  
  validate(input: string): boolean {
    return input.length >= 1 && input.length <= 100;
  }
  
  sanitize(input: string): string {
    return input.trim();
  }
  
  getClassificationRules(): ClassificationRules {
    return {
      required: true,
      minLength: 1,
      maxLength: 100,
      allowedValues: undefined
    };
  }
}
```

## RFC Compliance

These specifications comply with the following RFCs:

- **RFC-001**: DAO Registry Specification - Core system specification
- **RFC-002**: Data Point Classifiers - Data classification system
- **RFC-003**: Nomenclature and Classification System - Naming conventions and validation
- **RFC-004**: ISO Metadata Standards - Metadata standards compliance

## Contributing

When adding new types:

1. Create a new file in the appropriate directory
2. Follow the existing naming conventions
3. Add comprehensive JSDoc comments
4. Include request/response types where applicable
5. Add the export to the main `index.ts` file
6. Update this README if necessary

## Type Safety

All types are designed to provide maximum type safety:

- Strict typing for all interfaces
- Comprehensive enums for constants
- Optional properties where appropriate
- Generic types for reusable components
- Union types for flexible inputs
- Intersection types for complex combinations

## Performance Considerations

- Types are designed to be lightweight
- No runtime overhead from type definitions
- Efficient type checking during development
- Tree-shakable exports for production builds 