# DAO Registry

## Schema Management & Cross-Chain Data Platform

**DAO Registry** is a next-generation system for standardized, secure, and interoperable DAO metadata management. It features:

- **Advanced Schema Management:** Create, update, and remove versioned schemas with field-level validation, priority, and category classification.
- **Multi-Tier Access Control:** Hierarchical permissions for owners, administrators, moderators, and data providers.
- **Cross-Chain Interoperability:** Native support for CCIP-compatible data, enabling seamless DAO metadata sharing across blockchains.
- **Event-Driven Architecture:** Emits comprehensive events for schema lifecycle, supporting real-time monitoring and audit trails.
- **Statistical Tracking:** Maintains counters for total schemas, priority levels, and categories for analytics and planning.
- **API & Documentation Integration:** Each schema includes API endpoints and documentation URLs for easy integration.
- **Gas-Efficient & Modular:** Optimized storage and modular design for scalability and future-proofing.

**Visual Overview:**
- [Schema Management Process Flow Diagram (HTML)](./docs/images/schema-management-flow.html)
- [Mermaid Source & Detailed Description](./docs/architecture/schema-management-flow.md)

---

A comprehensive blockchain governance and metadata management system with URL encoding, reserved subdomains, ENS integration, and ISO metadata standards.

## Features

### Core Components

- **Schema Management & Cross-Chain Interoperability**: Standardized, versioned schemas, CCIP-compatible data, multi-tier access control, and event-driven audit trails
- **URL Encoding Service**: Comprehensive regex patterns for DNS, ENS, and URL validation
- **Reserved Subdomains**: 71 protected subdomains across 8 categories with priority levels
- **ENS Integration**: Ethereum Name Service domain resolution and management
- **ISO Metadata Standards**: ISO 19115 compliant metadata validation and storage
- **Smart Contracts**: On-chain reserved subdomain management with access control

### Key Capabilities

- **DNS & ENS Safe**: RFC 1123 and ENS compliant subdomain handling
- **Unicode Support**: Internationalized domain name (IDN) support with punycode
- **Reserved Word Protection**: 71 critical subdomains protected across 4 priority levels
- **ISO Standards**: Metadata validation against ISO 19115 standards
- **Comprehensive Validation**: URL encoding, format validation, and availability checking
- **RESTful API**: Complete API for all system operations
- **Smart Contract Integration**: On-chain reserved subdomain management

## System Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    DAO Registry System                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Express   │  │   CORS      │  │   Helmet    │          │
│  │   Server    │  │   Security  │  │   Security  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   URL       │  │  Reserved   │  │     ENS     │          │
│  │ Encoding    │  │ Subdomains  │  │ Integration │          │
│  │ Service     │  │  Service    │  │             │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   ISO       │  │  Metadata   │  │   Smart     │          │
│  │ Metadata    │  │  Registry   │  │  Contracts  │          │
│  │ Service     │  │             │  │             │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/dao-registry.git
cd dao-registry

# Install dependencies
npm install

# Install additional dependencies for development
npm install --save-dev
```

## Mock Data & RFC Compliance

- The service uses comprehensive mock data in [`src/services/mock-data.js`](src/services/mock-data.js), covering all fields required by [RFC-001](./docs/rfc/rfc-001-dao-registry-specification.md), [RFC-004](./docs/rfc/rfc-004-iso-metadata-standards.md), and related specifications.
- The `/api/v1/daos` endpoint returns a list of DAOs, each with all RFC/ISO-compliant fields populated for robust integration and analytics.
- Reserved subdomains and URL encoding logic are fully aligned with [reserved-subdomains.md](./docs/specification/reserved-subdomains.md) and [url-encoding-patterns.md](./docs/specification/url-encoding-patterns.md).

## Git Commit Workflow

- **Best Practice:** Commit after every successful change.
- Example:
  ```bash
  git add <file>
  git commit -m "Describe your change"
  ```
- This ensures traceability and clean project history.

## Quick Start (Updated)

```bash
# Start the server on port 3001 (default for local dev)
PORT=3001 node src/index.js
```

## API Example (Updated)

```bash
# List all DAOs (RFC-compliant)
curl http://localhost:3001/api/v1/daos

# Get a specific DAO
curl http://localhost:3001/api/v1/daos/1

# Reserved subdomains
curl http://localhost:3001/api/v1/reserved-subdomains
```

## Error Handling

- Non-existent DAOs (e.g., `/api/v1/daos/999`) return a 500 error with `DAO not found`.
- Invalid endpoints return a 404 error.
- Reserved subdomain validation returns detailed error messages for invalid or reserved names.

## Data Model & RFC Reference

- See [RFC-001: DAO Registry Specification](./docs/rfc/rfc-001-dao-registry-specification.md) for the full DAO object model.
- See [RFC-004: ISO Metadata Standards](./docs/rfc/rfc-004-iso-metadata-standards.md) for metadata fields.
- See [Reserved Subdomains Implementation](./docs/specification/reserved-subdomains-implementation.md) and [URL Encoding Patterns](./docs/specification/url-encoding-patterns.md) for subdomain logic.

## API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | System health check |
| `/api/system/info` | GET | System information and capabilities |
| `/api/subdomain/validate` | POST | Validate subdomain with URL encoding |
| `/api/reserved-subdomains` | GET | Get reserved subdomains by priority/category |
| `/api/encode` | POST | URL encoding operations |
| `/api/domain/manipulate` | POST | Domain manipulation utilities |
| `/api/metadata/iso` | POST | ISO metadata validation |
| `/api/metadata/register` | POST | Register metadata in registry |
| `/api/metadata/:daoId` | GET | Retrieve metadata by DAO ID |
| `/api/subdomain/check-availability` | POST | Check subdomain availability |

### Example Usage

#### Validate Subdomain

```bash
curl -X POST http://localhost:3000/api/subdomain/validate \
  -H "Content-Type: application/json" \
  -d '{
    "subdomain": "my-dao",
    "parentDomain": "dao.eth"
  }'
```

Response:
```json
{
  "subdomain": "my-dao",
  "parentDomain": "dao.eth",
  "validation": {
    "format": {
      "isValid": true,
      "errors": [],
      "sanitized": "my-dao",
      "encodingStats": {
        "originalLength": 6,
        "encodedLength": 6,
        "hasUnicode": false,
        "isPunycode": false,
        "encodingRatio": 1
      }
    },
    "ens": {
      "isValid": true,
      "errors": [],
      "domain": "my-dao.dao.eth",
      "exists": false
    }
  },
  "encoding": {
    "dnsSafe": true,
    "ensSafe": true,
    "sanitized": "my-dao",
    "stats": { ... }
  },
  "suggestions": ["my-dao-1", "my-dao-app", "my-dao-web"]
}
```

#### URL Encoding

```bash
curl -X POST http://localhost:3000/api/encode \
  -H "Content-Type: application/json" \
  -d '{
    "input": "My Complex Subdomain!",
    "type": "dns"
  }'
```

Response:
```json
{
  "encoded": "my-complex-subdomain",
  "sanitized": "my-complex-subdomain",
  "stats": {
    "originalLength": 22,
    "encodedLength": 20,
    "hasUnicode": false,
    "isPunycode": false,
    "encodingRatio": 0.9090909090909091
  },
  "validation": {
    "isValid": true,
    "errors": [],
    "sanitized": "my-complex-subdomain"
  }
}
```

## Reserved Subdomains

The system protects 71 critical subdomains across 4 priority levels:

### Priority Levels

- **CRITICAL (1)**: Never available for public registration
- **HIGH (2)**: Requires special permission
- **MEDIUM (3)**: Available with registration
- **LOW (4)**: Available with approval

### Categories

- **Core DAO Components**: governance, treasury, token, voting, proposals
- **Documentation**: docs, wiki, guide, spec
- **Community**: forum, chat, discord, telegram
- **Analytics**: analytics, stats, metrics, dashboard
- **Development**: dev, github, code, test, staging
- **Governance**: gov, constitution, bylaws, policies
- **Marketing**: marketing, brand, media, press
- **Information**: faq, help, support, news

## URL Encoding Patterns

### Core Regex Patterns

```typescript
// DNS-safe characters (RFC 1123)
DNS_SAFE_CHARS: /^[a-z0-9-]+$/

// ENS-safe characters (Ethereum Name Service)
ENS_SAFE_CHARS: /^[a-z0-9-]+$/

// Unicode characters
UNICODE_CHARS: /[\u0080-\uFFFF]/g

// Punycode pattern for internationalized domains
PUNYCODE_PATTERN: /^xn--[a-z0-9]+$/
```

### Validation Features

- **Character Filtering**: Remove invalid characters
- **Case Normalization**: Convert to lowercase
- **Whitespace Handling**: Replace with hyphens
- **Hyphen Normalization**: Remove leading/trailing hyphens
- **Length Validation**: Ensure within DNS limits (1-63 characters)
- **Unicode Support**: Handle internationalized domain names
- **Punycode Support**: Encode/decode IDNs

## ISO Metadata Standards

### Supported Standards

- **ISO 19115**: Geographic information metadata
- **Custom Standards**: Extensible validation framework

### Validation Features

- **Schema Validation**: Zod-based schema validation
- **Required Fields**: Ensure mandatory fields are present
- **Data Types**: Validate field types and formats
- **Custom Rules**: Extensible validation rules
- **Error Reporting**: Detailed error messages and warnings

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- **URL Encoding Service**: Comprehensive regex pattern testing
- **Reserved Subdomains**: Priority and category validation
- **ENS Integration**: Domain resolution and availability
- **ISO Metadata**: Schema validation and error handling
- **Integration Tests**: Complete workflow testing

## Deployment

### Smart Contracts

```bash
# Deploy to mainnet
npm run deploy

# Deploy to testnet
npm run deploy:testnet

# Deploy reserved subdomains contract
npm run deploy:reserved

# Deploy reserved subdomains to testnet
npm run deploy:reserved:testnet
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Configure environment variables
# - DATABASE_URL: Database connection string
# - ENS_PROVIDER: Ethereum provider URL
# - PRIVATE_KEY: Deployment private key
# - NETWORK_ID: Target network ID
```

## Documentation

### Core Documentation

- [Schema Management Process Flow](./docs/architecture/schema-management-flow.md)
- [System Architecture](./docs/architecture/system-architecture.md)
- [URL Encoding Patterns](./docs/specification/url-encoding-patterns.md)
- [Reserved Subdomains](./docs/specification/reserved-subdomains.md)
- [ISO Metadata Standards](./docs/specification/iso-metadata-standards.md)
- [Complete System Integration](./docs/integration/complete-system-integration.md)

### API Documentation

- [API Reference](./docs/api/README.md)
- [Endpoint Examples](./docs/api/examples.md)
- [Error Handling](./docs/api/errors.md)

### Development

- [Development Setup](./docs/development/setup.md)
- [Testing Guide](./docs/development/testing.md)
- [Deployment Guide](./docs/development/deployment.md)

## Development

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Git

### Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Build TypeScript
npm run build

# Run demo
npm run demo
```

### Project Structure

```
dao-registry/
├── src/
│   ├── index.ts                 # Main application entry point
│   ├── services/
│   │   └── metadata/
│   │       ├── url-encoding-service.ts
│   │       ├── reserved-subdomains-service.ts
│   │       ├── iso-metadata-service.ts
│   │       ├── metadata-registry.ts
│   │       └── __tests__/
│   └── routes/
├── contracts/
│   ├── ReservedSubdomains.sol
│   └── ...
├── scripts/
│   ├── deploy.js
│   ├── deploy-reserved-subdomains.js
│   └── start-demo.js
├── docs/
│   ├── specification/
│   ├── integration/
│   └── ...
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Add proper error handling
- Validate all inputs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ethereum Name Service (ENS)](https://ens.domains/) for domain resolution
- [OpenZeppelin](https://openzeppelin.com/) for smart contract security
- [ISO](https://www.iso.org/) for metadata standards
- [RFC 1123](https://tools.ietf.org/html/rfc1123) for DNS naming standards

## Support

- **Issues**: [GitHub Issues](https://github.com/your-org/dao-registry/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/dao-registry/discussions)
- **Documentation**: [Project Wiki](https://github.com/your-org/dao-registry/wiki)

---

**DAO Registry** - Comprehensive blockchain governance and metadata management system 
