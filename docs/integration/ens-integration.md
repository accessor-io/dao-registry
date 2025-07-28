# ENS Integration

## Overview

The DAO Registry system integrates deeply with the Ethereum Name Service (ENS) to provide human-readable domain names for DAOs, their governance contracts, treasuries, and metadata. This integration enables seamless discovery, verification, and management of DAO-related information through ENS domains.

## ENS Domain Structure

### Primary DAO Domains

```
dao-name.eth
├── governance.dao-name.eth    # Governance contract
├── treasury.dao-name.eth      # Treasury contract
├── token.dao-name.eth         # Governance token
├── docs.dao-name.eth          # Documentation
├── forum.dao-name.eth         # Community forum
└── analytics.dao-name.eth     # Analytics dashboard
```

### Example ENS Structure

```
uniswap.eth
├── governance.uniswap.eth     # Uniswap governance
├── treasury.uniswap.eth       # Uniswap treasury
├── token.uniswap.eth          # UNI token
├── docs.uniswap.eth           # Documentation
└── forum.uniswap.eth          # Community forum

aave.eth
├── governance.aave.eth        # Aave governance
├── treasury.aave.eth          # Aave treasury
├── token.aave.eth             # AAVE token
└── docs.aave.eth              # Documentation
```

## ENS Resolution System

### 1. Address Resolution

```typescript
interface ENSAddressResolution {
  domain: string;              // e.g., "governance.uniswap.eth"
  resolvedAddress: string;     // Contract address
  chainId: number;            // Blockchain network
  recordType: "address";      // Record type
  ttl: number;               // Time to live
  lastUpdated: Date;         // Last update timestamp
}

// Example resolution
const resolution = await ensResolver.resolveAddress("governance.uniswap.eth");
// Returns: 0x5e4be8Bc9637f0EAA1A755019e06A68ce081E58E
```

### 2. Text Record Resolution

```typescript
interface ENSTextRecord {
  domain: string;             // e.g., "dao-name.eth"
  key: string;               // e.g., "description", "url", "avatar"
  value: string;             // Record value
  ttl: number;              // Time to live
  lastUpdated: Date;        // Last update timestamp
}

// Example text records
const textRecords = {
  "description": "Decentralized exchange protocol",
  "url": "https://uniswap.org",
  "avatar": "https://ipfs.io/ipfs/Qm...",
  "com.twitter": "@Uniswap",
  "com.github": "uniswap",
  "org.telegram": "t.me/uniswap"
};
```

### 3. Content Hash Resolution

```typescript
interface ENSContentHash {
  domain: string;            // e.g., "docs.dao-name.eth"
  protocol: string;          // "ipfs", "swarm", "http"
  hash: string;             // Content hash
  gateway: string;          // Gateway URL
  lastUpdated: Date;        // Last update timestamp
}

// Example content hash
const contentHash = await ensResolver.getContentHash("docs.uniswap.eth");
// Returns: ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
```

## ENS Integration Components

### 1. ENS Resolver Service

```typescript
class ENSResolverService {
  private ens: ENS;
  private provider: ethers.providers.Provider;
  
  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
    this.ens = new ENS(provider);
  }
  
  // Resolve ENS domain to address
  async resolveAddress(domain: string): Promise<string | null> {
    try {
      const resolver = await this.ens.getResolver(domain);
      if (!resolver) return null;
      
      const address = await resolver.getAddress();
      return address === ethers.constants.AddressZero ? null : address;
    } catch (error) {
      console.error(`Failed to resolve address for ${domain}:`, error);
      return null;
    }
  }
  
  // Resolve text record
  async resolveTextRecord(domain: string, key: string): Promise<string | null> {
    try {
      const resolver = await this.ens.getResolver(domain);
      if (!resolver) return null;
      
      return await resolver.getText(key);
    } catch (error) {
      console.error(`Failed to resolve text record for ${domain}.${key}:`, error);
      return null;
    }
  }
  
  // Resolve content hash
  async resolveContentHash(domain: string): Promise<string | null> {
    try {
      const resolver = await this.ens.getResolver(domain);
      if (!resolver) return null;
      
      return await resolver.getContentHash();
    } catch (error) {
      console.error(`Failed to resolve content hash for ${domain}:`, error);
      return null;
    }
  }
  
  // Reverse resolve address to ENS domain
  async reverseResolve(address: string): Promise<string | null> {
    try {
      const reverseName = `${address.slice(2)}.addr.reverse`;
      const resolver = await this.ens.getResolver(reverseName);
      if (!resolver) return null;
      
      return await resolver.getName();
    } catch (error) {
      console.error(`Failed to reverse resolve ${address}:`, error);
      return null;
    }
  }
}
```

### 2. ENS Domain Manager

```typescript
class ENSDomainManager {
  private ensResolver: ENSResolverService;
  private daoRegistry: DAORegistryService;
  
  constructor(ensResolver: ENSResolverService, daoRegistry: DAORegistryService) {
    this.ensResolver = ensResolver;
    this.daoRegistry = daoRegistry;
  }
  
  // Register DAO with ENS
  async registerDAOWithENS(daoInfo: DAOInfo): Promise<ENSRegistration> {
    const {
      name,
      contractAddress,
      tokenAddress,
      treasuryAddress,
      description,
      website,
      logo
    } = daoInfo;
    
    // Primary domain registration
    const primaryDomain = `${name.toLowerCase()}.eth`;
    
    // Set up text records
    const textRecords = {
      description: description,
      url: website,
      avatar: logo,
      "com.twitter": daoInfo.socialLinks?.twitter,
      "com.github": daoInfo.socialLinks?.github,
      "org.telegram": daoInfo.socialLinks?.telegram
    };
    
    // Register subdomains
    const subdomains = {
      governance: contractAddress,
      treasury: treasuryAddress,
      token: tokenAddress
    };
    
    return {
      primaryDomain,
      textRecords,
      subdomains,
      registrationDate: new Date()
    };
  }
  
  // Update DAO ENS records
  async updateDAOENSRecords(daoId: string, updates: DAOUpdates): Promise<void> {
    const dao = await this.daoRegistry.getDAO(daoId);
    const primaryDomain = `${dao.name.toLowerCase()}.eth`;
    
    // Update text records
    if (updates.description) {
      await this.updateTextRecord(primaryDomain, "description", updates.description);
    }
    
    if (updates.website) {
      await this.updateTextRecord(primaryDomain, "url", updates.website);
    }
    
    if (updates.logo) {
      await this.updateTextRecord(primaryDomain, "avatar", updates.logo);
    }
  }
  
  // Discover DAO by ENS domain
  async discoverDAOByENS(domain: string): Promise<DAOInfo | null> {
    // Resolve governance contract
    const governanceDomain = `governance.${domain}`;
    const governanceAddress = await this.ensResolver.resolveAddress(governanceDomain);
    
    if (!governanceAddress) return null;
    
    // Resolve treasury contract
    const treasuryDomain = `treasury.${domain}`;
    const treasuryAddress = await this.ensResolver.resolveAddress(treasuryDomain);
    
    // Resolve token contract
    const tokenDomain = `token.${domain}`;
    const tokenAddress = await this.ensResolver.resolveAddress(tokenDomain);
    
    // Get text records
    const description = await this.ensResolver.resolveTextRecord(domain, "description");
    const website = await this.ensResolver.resolveTextRecord(domain, "url");
    const logo = await this.ensResolver.resolveTextRecord(domain, "avatar");
    
    return {
      name: domain.replace('.eth', ''),
      contractAddress: governanceAddress,
      treasuryAddress: treasuryAddress || null,
      tokenAddress: tokenAddress || null,
      description: description || '',
      website: website || '',
      logo: logo || '',
      ensDomain: domain
    };
  }
}
```

### 3. ENS Metadata Service

```typescript
class ENSMetadataService {
  private ensResolver: ENSResolverService;
  private ipfsGateway: string;
  
  constructor(ensResolver: ENSResolverService, ipfsGateway: string = "https://ipfs.io") {
    this.ensResolver = ensResolver;
    this.ipfsGateway = ipfsGateway;
  }
  
  // Get   ENS metadata
  async getENSMetadata(domain: string): Promise<ENSMetadata> {
    const [
      address,
      contentHash,
      textRecords
    ] = await Promise.all([
      this.ensResolver.resolveAddress(domain),
      this.ensResolver.resolveContentHash(domain),
      this.getAllTextRecords(domain)
    ]);
    
    return {
      domain,
      address,
      contentHash,
      textRecords,
      lastUpdated: new Date()
    };
  }
  
  // Get all text records for a domain
  async getAllTextRecords(domain: string): Promise<Record<string, string>> {
    const commonKeys = [
      'description', 'url', 'avatar', 'email', 'notice',
      'com.twitter', 'com.github', 'org.telegram',
      'com.discord', 'com.reddit', 'com.youtube'
    ];
    
    const textRecords: Record<string, string> = {};
    
    for (const key of commonKeys) {
      const value = await this.ensResolver.resolveTextRecord(domain, key);
      if (value) {
        textRecords[key] = value;
      }
    }
    
    return textRecords;
  }
  
  // Validate ENS metadata
  validateENSMetadata(metadata: ENSMetadata): ValidationResult {
    const errors: string[] = [];
    
    // Validate domain format
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(metadata.domain)) {
      errors.push("Invalid domain format");
    }
    
    // Validate address format if present
    if (metadata.address && !/^0x[a-fA-F0-9]{40}$/.test(metadata.address)) {
      errors.push("Invalid address format");
    }
    
    // Validate content hash if present
    if (metadata.contentHash && !this.isValidContentHash(metadata.contentHash)) {
      errors.push("Invalid content hash format");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  private isValidContentHash(hash: string): boolean {
    return hash.startsWith('ipfs://') || 
           hash.startsWith('bzz://') || 
           hash.startsWith('http://') || 
           hash.startsWith('https://');
  }
}
```

## ENS Integration APIs

### 1. REST API Endpoints

```typescript
// Get ENS metadata for a domain
GET /api/v1/ens/{domain}
Response: ENSMetadata

// Resolve ENS domain to address
GET /api/v1/ens/{domain}/resolve
Response: { address: string, chainId: number }

// Get all text records for a domain
GET /api/v1/ens/{domain}/text-records
Response: Record<string, string>

// Get content hash for a domain
GET /api/v1/ens/{domain}/content-hash
Response: { protocol: string, hash: string }

// Reverse resolve address to ENS domain
GET /api/v1/ens/reverse/{address}
Response: { domain: string }

// Register DAO with ENS
POST /api/v1/ens/register-dao
Body: DAOInfo
Response: ENSRegistration

// Update ENS records
PUT /api/v1/ens/{domain}/records
Body: ENSRecordUpdates
Response: { success: boolean }
```

### 2. GraphQL API

```graphql
type Query {
  ensMetadata(domain: String!): ENSMetadata
  ensAddress(domain: String!): String
  ensTextRecords(domain: String!): [TextRecord!]!
  ensContentHash(domain: String!): ContentHash
  reverseENS(address: String!): String
}

type Mutation {
  registerDAOWithENS(input: DAOInfo!): ENSRegistration!
  updateENSRecords(domain: String!, updates: ENSRecordUpdates!): Boolean!
}

type ENSMetadata {
  domain: String!
  address: String
  contentHash: ContentHash
  textRecords: [TextRecord!]!
  lastUpdated: DateTime!
}

type TextRecord {
  key: String!
  value: String!
  ttl: Int
}

type ContentHash {
  protocol: String!
  hash: String!
  gateway: String
}
```

## ENS Integration Examples

### 1. DAO Registration with ENS

```typescript
// Register a new DAO with ENS integration
async function registerDAOWithENS(daoInfo: DAOInfo): Promise<DAO> {
  // 1. Validate DAO information
  const validatedInfo = await validateDAOInfo(daoInfo);
  
  // 2. Register with ENS
  const ensManager = new ENSDomainManager(ensResolver, daoRegistry);
  const ensRegistration = await ensManager.registerDAOWithENS(validatedInfo);
  
  // 3. Store DAO in registry
  const dao = await daoRegistry.registerDAO({
    ...validatedInfo,
    ensDomain: ensRegistration.primaryDomain,
    ensRecords: ensRegistration
  });
  
  // 4. Index ENS metadata
  const metadataService = new ENSMetadataService(ensResolver);
  await metadataService.indexMetadata(ensRegistration.primaryDomain);
  
  return dao;
}
```

### 2. ENS Discovery

```typescript
// Discover DAO by ENS domain
async function discoverDAOByENS(domain: string): Promise<DAO | null> {
  const ensManager = new ENSDomainManager(ensResolver, daoRegistry);
  const daoInfo = await ensManager.discoverDAOByENS(domain);
  
  if (!daoInfo) return null;
  
  // Check if DAO already exists in registry
  let dao = await daoRegistry.getDAOByAddress(daoInfo.contractAddress);
  
  if (!dao) {
    // Register newly discovered DAO
    dao = await daoRegistry.registerDAO({
      ...daoInfo,
      discoveredViaENS: true,
      discoveryDate: new Date()
    });
  }
  
  return dao;
}
```

### 3. ENS Metadata Updates

```typescript
// Update DAO metadata via ENS
async function updateDAOENSMetadata(daoId: string, updates: DAOUpdates): Promise<void> {
  const dao = await daoRegistry.getDAO(daoId);
  
  if (!dao.ensDomain) {
    throw new Error("DAO does not have an ENS domain");
  }
  
  // Update ENS records
  const ensManager = new ENSDomainManager(ensResolver, daoRegistry);
  await ensManager.updateDAOENSRecords(daoId, updates);
  
  // Update local registry
  await daoRegistry.updateDAO(daoId, updates);
  
  // Re-index metadata
  const metadataService = new ENSMetadataService(ensResolver);
  await metadataService.indexMetadata(dao.ensDomain);
}
```

## ENS Security Considerations

### 1. Domain Ownership Verification

```typescript
class ENSOwnershipVerifier {
  // Verify domain ownership
  async verifyDomainOwnership(domain: string, address: string): Promise<boolean> {
    try {
      const resolver = await this.ens.getResolver(domain);
      if (!resolver) return false;
      
      // Check if address can set records
      const canSetRecords = await resolver.canSetRecords(domain, address);
      return canSetRecords;
    } catch (error) {
      console.error(`Failed to verify ownership for ${domain}:`, error);
      return false;
    }
  }
  
  // Verify subdomain ownership
  async verifySubdomainOwnership(parentDomain: string, subdomain: string, address: string): Promise<boolean> {
    const fullDomain = `${subdomain}.${parentDomain}`;
    return this.verifyDomainOwnership(fullDomain, address);
  }
}
```

### 2. ENS Record Validation

```typescript
class ENSRecordValidator {
  // Validate text record updates
  validateTextRecordUpdate(domain: string, key: string, value: string): ValidationResult {
    const errors: string[] = [];
    
    // Check for XSS in value
    if (this.containsXSS(value)) {
      errors.push("Value contains potential XSS content");
    }
    
    // Check value length
    if (value.length > 1000) {
      errors.push("Value exceeds maximum length");
    }
    
    // Validate key format
    if (!this.isValidTextRecordKey(key)) {
      errors.push("Invalid text record key");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  private containsXSS(value: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];
    
    return xssPatterns.some(pattern => pattern.test(value));
  }
  
  private isValidTextRecordKey(key: string): boolean {
    const validKeys = [
      'description', 'url', 'avatar', 'email', 'notice',
      'com.twitter', 'com.github', 'org.telegram',
      'com.discord', 'com.reddit', 'com.youtube'
    ];
    
    return validKeys.includes(key) || key.startsWith('com.') || key.startsWith('org.');
  }
}
```

## ENS Monitoring and Analytics

### 1. ENS Domain Monitoring

```typescript
class ENSMonitor {
  // Monitor ENS domain changes
  async monitorDomainChanges(domain: string): Promise<void> {
    const provider = new ethers.providers.WebSocketProvider(process.env.ETHEREUM_WS_URL);
    
    provider.on('block', async (blockNumber) => {
      // Check for ENS record updates
      await this.checkENSUpdates(domain, blockNumber);
    });
  }
  
  // Check for ENS updates
  private async checkENSUpdates(domain: string, blockNumber: number): Promise<void> {
    const currentRecords = await this.getCurrentENSRecords(domain);
    const previousRecords = await this.getPreviousENSRecords(domain);
    
    if (this.hasRecordsChanged(currentRecords, previousRecords)) {
      await this.handleENSUpdate(domain, currentRecords, previousRecords);
    }
  }
  
  // Handle ENS updates
  private async handleENSUpdate(
    domain: string, 
    currentRecords: ENSRecords, 
    previousRecords: ENSRecords
  ): Promise<void> {
    // Update local cache
    await this.updateENSRecords(domain, currentRecords);
    
    // Notify subscribers
    await this.notifyENSUpdate(domain, currentRecords, previousRecords);
    
    // Update analytics
    await this.updateENSAnalytics(domain, currentRecords);
  }
}
```

### 2. ENS Analytics

```typescript
class ENSAnalytics {
  // Track ENS domain usage
  async trackDomainUsage(domain: string, action: string): Promise<void> {
    const analytics = {
      domain,
      action,
      timestamp: new Date(),
      userAgent: this.getUserAgent(),
      ipAddress: this.getIPAddress()
    };
    
    await this.storeAnalytics(analytics);
  }
  
  // Generate ENS analytics report
  async generateENSAnalyticsReport(timeframe: string): Promise<ENSAnalyticsReport> {
    const data = await this.getAnalyticsData(timeframe);
    
    return {
      totalDomains: data.totalDomains,
      activeDomains: data.activeDomains,
      totalResolutions: data.totalResolutions,
      averageResolutionTime: data.averageResolutionTime,
      topDomains: data.topDomains,
      resolutionSuccessRate: data.resolutionSuccessRate
    };
  }
}
```

## Future ENS Enhancements

### 1. Multi-chain ENS Support

- Support for ENS on other EVM-compatible chains
- Cross-chain ENS resolution
- Chain-specific ENS registries

### 2. Advanced ENS Features

- ENS NFT integration for DAO governance
- ENS subdomain delegation
- ENS record encryption
- ENS-based DAO discovery

### 3. ENS Performance Optimization

- ENS resolution caching
- Batch ENS operations
- ENS resolution CDN
- ENS record preloading 