# Reserved Subdomains Implementation Guide

## Overview

The Reserved Subdomains system provides comprehensive management of reserved subdomains for the DAO Registry, ensuring consistent naming conventions, preventing conflicts, and maintaining system integrity across ENS domains.

## System Architecture

### Components

1. **Smart Contract**: `ReservedSubdomains.sol` - On-chain management of reserved subdomains
2. **TypeScript Service**: `ReservedSubdomainsService` - Backend service for validation and management
3. **API Routes**: REST endpoints for integration and validation
4. **Deployment Script**: Automated deployment and verification

### Priority Levels

```typescript
enum ReservedSubdomainPriority {
  CRITICAL = 1,    // Never available for public registration
  HIGH = 2,        // Requires special permission
  MEDIUM = 3,      // Available with registration
  LOW = 4          // Available with approval
}
```

## Smart Contract Features

### Core Functions

#### 1. Subdomain Reservation
```solidity
function reserveSubdomain(
    string memory subdomain,
    Priority priority,
    string memory category,
    string memory description,
    string[] memory allowedRoles,
    string[] memory restrictions
) external onlyAdministrator
```

#### 2. Subdomain Release
```solidity
function releaseSubdomain(string memory subdomain) 
    external onlyAdministrator
```

#### 3. Priority Management
```solidity
function updateSubdomainPriority(string memory subdomain, Priority newPriority) 
    external onlyModerator
```

#### 4. Access Control
```solidity
function addAdministrator(address admin) external onlyOwner
function removeAdministrator(address admin) external onlyOwner
function addModerator(address moderator) external onlyAdministrator
function removeModerator(address moderator) external onlyAdministrator
```

### Events

```solidity
event SubdomainReserved(
    string indexed subdomain,
    Priority priority,
    string category,
    address indexed reservedBy
);

event SubdomainReleased(
    string indexed subdomain,
    address indexed releasedBy
);

event SubdomainUpdated(
    string indexed subdomain,
    Priority oldPriority,
    Priority newPriority,
    address indexed updatedBy
);
```

## TypeScript Service Usage

### Basic Validation

```typescript
import { ReservedSubdomainsService } from './reserved-subdomains-service';

// Initialize service
const ensResolver = new ENSResolverService(provider);
const reservedService = new ReservedSubdomainsService(ensResolver);

// Check if subdomain is reserved
const isReserved = reservedService.isReserved('governance');
console.log('Is reserved:', isReserved); // true

// Get priority level
const priority = reservedService.getPriority('governance');
console.log('Priority:', priority); // ReservedSubdomainPriority.CRITICAL

// Get detailed information
const info = reservedService.getReservedSubdomainInfo('governance');
console.log('Info:', info);
```

### Validation Examples

#### 1. Basic Subdomain Validation
```typescript
const validation = reservedService.validateSubdomain('my-subdomain');

if (validation.isValid) {
  console.log('Subdomain is valid');
} else {
  console.log('Validation errors:', validation.errors);
}
```

#### 2. ENS Subdomain Validation
```typescript
const ensValidation = await reservedService.validateENSSubdomain(
  'dao-name.eth',
  'governance'
);

if (ensValidation.isValid) {
  console.log('ENS subdomain is valid');
} else {
  console.log('ENS validation errors:', ensValidation.errors);
}
```

#### 3. Role-Based Access Check
```typescript
const canRegister = reservedService.canRegisterReservedSubdomain(
  'voting',
  'DAO owners'
);

console.log('Can register:', canRegister); // true for DAO owners
```

### Advanced Usage

#### 1. Get Reserved Words by Priority
```typescript
const criticalWords = reservedService.getReservedWordsByPriority(
  ReservedSubdomainPriority.CRITICAL
);

console.log('Critical reserved words:', criticalWords);
// ['governance', 'treasury', 'token', 'docs', 'forum', 'analytics', ...]
```

#### 2. Get Reserved Words by Category
```typescript
const coreComponents = reservedService.getReservedWordsByCategory(
  'Core DAO Components'
);

console.log('Core components:', coreComponents);
```

#### 3. Get Available Subdomains for Role
```typescript
const availableForDAO = reservedService.getAvailableSubdomainsForRole(
  'DAO owners'
);

console.log('Available for DAO owners:', availableForDAO);
```

#### 4. Get Statistics
```typescript
const summary = reservedService.getReservedWordsSummary();

console.log('Summary:', summary);
// {
//   total: 71,
//   byPriority: { 1: 11, 2: 35, 3: 25, 4: 0 },
//   byCategory: { 'Core DAO Components': 15, 'Documentation': 5, ... }
// }
```

## API Endpoints

### 1. Get All Reserved Subdomains

```http
GET /api/v1/reserved-subdomains
```

**Query Parameters:**
- `priority` (optional): Filter by priority level (1-4)
- `category` (optional): Filter by category
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 71,
      "byPriority": { "1": 11, "2": 35, "3": 25, "4": 0 },
      "byCategory": { "Core DAO Components": 15, "Documentation": 5 }
    },
    "subdomains": [
      {
        "subdomain": "governance",
        "priority": 1,
        "category": "Core DAO Components",
        "description": "Main governance contract",
        "allowedFor": ["DAO owners", "System administrators"],
        "restrictions": ["Never available for public registration"]
      }
    ]
  }
}
```

### 2. Check Specific Subdomain

```http
GET /api/v1/reserved-subdomains/check/governance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subdomain": "governance",
    "isReserved": true,
    "priority": 1,
    "info": {
      "category": "Core DAO Components",
      "description": "Main governance contract",
      "allowedFor": ["DAO owners", "System administrators"],
      "restrictions": ["Never available for public registration"]
    }
  }
}
```

### 3. Validate Subdomain

```http
POST /api/v1/reserved-subdomains/validate
Content-Type: application/json

{
  "subdomain": "my-subdomain",
  "parentDomain": "dao-name.eth"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subdomain": "my-subdomain",
    "parentDomain": "dao-name.eth",
    "validation": {
      "isValid": true,
      "errors": [],
      "isReserved": false,
      "priority": 0
    },
    "ensValidation": {
      "isValid": true,
      "errors": [],
      "domain": "my-subdomain.dao-name.eth",
      "exists": false
    }
  }
}
```

### 4. Get by Priority Level

```http
GET /api/v1/reserved-subdomains/priority/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "priority": 1,
    "count": 11,
    "subdomains": [
      {
        "subdomain": "governance",
        "priority": 1,
        "category": "Core DAO Components",
        "description": "Main governance contract",
        "allowedFor": ["DAO owners", "System administrators"],
        "restrictions": ["Never available for public registration"]
      }
    ]
  }
}
```

### 5. Get by Category

```http
GET /api/v1/reserved-subdomains/category/Core%20DAO%20Components
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category": "Core DAO Components",
    "count": 15,
    "subdomains": [
      {
        "subdomain": "governance",
        "priority": 1,
        "description": "Main governance contract",
        "allowedFor": ["DAO owners", "System administrators"],
        "restrictions": ["Never available for public registration"]
      }
    ]
  }
}
```

### 6. Check Registration Permission

```http
POST /api/v1/reserved-subdomains/can-register
Content-Type: application/json

{
  "subdomain": "voting",
  "userRole": "DAO owners"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subdomain": "voting",
    "userRole": "DAO owners",
    "isReserved": true,
    "canRegister": true,
    "info": {
      "priority": 2,
      "category": "Core DAO Components",
      "description": "Voting mechanism",
      "allowedFor": ["DAO owners"],
      "restrictions": ["Requires special permission"]
    }
  }
}
```

### 7. Batch Validation

```http
POST /api/v1/reserved-subdomains/batch-validate
Content-Type: application/json

{
  "subdomains": ["governance", "treasury", "my-subdomain"],
  "parentDomain": "dao-name.eth"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "valid": 1,
    "invalid": 2,
    "results": [
      {
        "subdomain": "governance",
        "validation": {
          "isValid": false,
          "errors": ["Subdomain \"governance\" is reserved (Core DAO Components)"],
          "isReserved": true,
          "priority": 1
        },
        "ensValidation": {
          "isValid": false,
          "errors": ["Domain \"governance.dao-name.eth\" already exists"],
          "domain": "governance.dao-name.eth",
          "exists": true
        }
      }
    ]
  }
}
```

## Integration Examples

### 1. DAO Registration Integration

```typescript
class DAORegistrationService {
  private reservedService: ReservedSubdomainsService;

  async registerDAO(daoInfo: DAOInfo): Promise<DAO> {
    // Validate subdomain
    const subdomainValidation = this.reservedService.validateSubdomain(
      daoInfo.ensSubdomain
    );

    if (!subdomainValidation.isValid) {
      throw new Error(`Invalid subdomain: ${subdomainValidation.errors.join(', ')}`);
    }

    // Check if user can register reserved subdomain
    if (subdomainValidation.isReserved) {
      const canRegister = this.reservedService.canRegisterReservedSubdomain(
        daoInfo.ensSubdomain,
        daoInfo.userRole
      );

      if (!canRegister) {
        throw new Error(`Cannot register reserved subdomain: ${daoInfo.ensSubdomain}`);
      }
    }

    // Proceed with registration
    return this.processDAORegistration(daoInfo);
  }
}
```

### 2. ENS Integration

```typescript
class ENSIntegrationService {
  private reservedService: ReservedSubdomainsService;

  async registerENSSubdomain(parentDomain: string, subdomain: string): Promise<void> {
    // Validate ENS subdomain
    const ensValidation = await this.reservedService.validateENSSubdomain(
      parentDomain,
      subdomain
    );

    if (!ensValidation.isValid) {
      throw new Error(`Invalid ENS subdomain: ${ensValidation.errors.join(', ')}`);
    }

    // Check if domain already exists
    if (ensValidation.exists) {
      throw new Error(`Domain already exists: ${ensValidation.domain}`);
    }

    // Proceed with ENS registration
    await this.registerENSRecord(ensValidation.domain);
  }
}
```

### 3. Frontend Integration

```typescript
// React component for subdomain validation
const SubdomainValidator: React.FC<{ subdomain: string }> = ({ subdomain }) => {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateSubdomain = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/reserved-subdomains/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain })
      });
      
      const result = await response.json();
      setValidation(result.data);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={validateSubdomain} disabled={loading}>
        {loading ? 'Validating...' : 'Validate Subdomain'}
      </button>
      
      {validation && (
        <div className={validation.validation.isValid ? 'valid' : 'invalid'}>
          <h3>Validation Results</h3>
          <p>Is Valid: {validation.validation.isValid ? 'Yes' : 'No'}</p>
          {validation.validation.errors.length > 0 && (
            <ul>
              {validation.validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
```

## Deployment Guide

### 1. Deploy Smart Contract

```bash
# Deploy to local network
npx hardhat run scripts/deploy-reserved-subdomains.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy-reserved-subdomains.js --network goerli

# Deploy to mainnet
npx hardhat run scripts/deploy-reserved-subdomains.js --network mainnet
```

### 2. Verify Contract

```bash
# Verify on Etherscan
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS
```

### 3. Initialize Services

```typescript
// Initialize in your application
import { ReservedSubdomainsService } from './services/metadata/reserved-subdomains-service';
import { ENSResolverService } from './services/metadata/ens-resolver-service';

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const ensResolver = new ENSResolverService(provider);
const reservedService = new ReservedSubdomainsService(ensResolver);
```

### 4. Add API Routes

```typescript
// In your Express app
import reservedSubdomainsRoutes from './routes/reserved-subdomains';

app.use('/api/v1/reserved-subdomains', reservedSubdomainsRoutes);
```

## Security Considerations

### 1. Access Control
- Only administrators can add/remove reserved subdomains
- Moderators can update priorities and categories
- Role-based access for different subdomain types

### 2. Validation
- Input sanitization for all subdomain inputs
- Length and character validation
- Reserved word checking at multiple layers

### 3. Monitoring
- Track reserved word usage patterns
- Monitor for attempts to bypass restrictions
- Alert on suspicious subdomain registration attempts

## Testing

### 1. Unit Tests

```typescript
describe('ReservedSubdomainsService', () => {
  let service: ReservedSubdomainsService;

  beforeEach(() => {
    service = new ReservedSubdomainsService(mockENSResolver);
  });

  test('should identify reserved subdomains', () => {
    expect(service.isReserved('governance')).toBe(true);
    expect(service.isReserved('my-subdomain')).toBe(false);
  });

  test('should validate subdomain format', () => {
    const validation = service.validateSubdomain('valid-subdomain');
    expect(validation.isValid).toBe(true);
  });

  test('should reject invalid subdomains', () => {
    const validation = service.validateSubdomain('invalid--subdomain');
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Subdomain cannot contain consecutive hyphens');
  });
});
```

### 2. Integration Tests

```typescript
describe('Reserved Subdomains API', () => {
  test('should return reserved subdomains', async () => {
    const response = await request(app)
      .get('/api/v1/reserved-subdomains')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.subdomains).toBeDefined();
  });

  test('should validate subdomains', async () => {
    const response = await request(app)
      .post('/api/v1/reserved-subdomains/validate')
      .send({ subdomain: 'governance' })
      .expect(200);

    expect(response.body.data.validation.isReserved).toBe(true);
  });
});
```

## Future Enhancements

### 1. Dynamic Reserved Words
- Community governance of reserved words
- Voting mechanisms for new reserved words
- Categories for different types of reserved words

### 2. Advanced Validation
- Machine learning-based reserved word detection
- Context-aware validation rules
- Automated conflict resolution

### 3. Integration Features
- ENS registrar integration
- Cross-chain reserved word synchronization
- Automated reserved word enforcement

## Support and Maintenance

### 1. Monitoring
- Track usage patterns
- Monitor for conflicts
- Alert on suspicious activity

### 2. Updates
- Regular review of reserved words
- Community feedback integration
- Automated testing and validation

### 3. Documentation
- Keep documentation updated
- Provide examples and tutorials
- Maintain API documentation 