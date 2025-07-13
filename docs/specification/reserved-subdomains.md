# Reserved Subdomains Specification

## Overview

This specification defines the reserved subdomains for the DAO Registry system, ensuring consistent naming conventions, preventing conflicts, and maintaining system integrity across ENS domains.

## Reserved Subdomain Categories

### 1. Core DAO Components

#### 1.1 Governance Subdomains
```
governance.dao-name.eth     # Main governance contract
voting.dao-name.eth         # Voting mechanism
proposals.dao-name.eth      # Proposal management
executive.dao-name.eth      # Executive functions
council.dao-name.eth        # Council/committee
```

#### 1.2 Financial Subdomains
```
treasury.dao-name.eth       # Treasury contract
vault.dao-name.eth          # Asset vault
rewards.dao-name.eth        # Reward distribution
staking.dao-name.eth        # Staking contract
liquidity.dao-name.eth      # Liquidity management
```

#### 1.3 Token Subdomains
```
token.dao-name.eth          # Governance token
erc20.dao-name.eth          # ERC-20 token
nft.dao-name.eth            # NFT collection
vesting.dao-name.eth        # Token vesting
airdrop.dao-name.eth        # Airdrop distribution
```

### 2. Documentation & Information

#### 2.1 Documentation Subdomains
```
docs.dao-name.eth           # Documentation
wiki.dao-name.eth           # Wiki pages
guide.dao-name.eth          # User guides
api.dao-name.eth            # API documentation
spec.dao-name.eth           # Technical specifications
```

#### 2.2 Information Subdomains
```
info.dao-name.eth           # General information
about.dao-name.eth          # About page
faq.dao-name.eth            # Frequently asked questions
help.dao-name.eth           # Help center
support.dao-name.eth        # Support portal
```

### 3. Community & Communication

#### 3.1 Community Subdomains
```
forum.dao-name.eth          # Community forum
chat.dao-name.eth           # Chat platform
discord.dao-name.eth        # Discord server
telegram.dao-name.eth       # Telegram group
reddit.dao-name.eth         # Reddit community
```

#### 3.2 Communication Subdomains
```
blog.dao-name.eth           # Blog/news
news.dao-name.eth           # News updates
announcements.dao-name.eth  # Official announcements
updates.dao-name.eth        # System updates
```

### 4. Analytics & Monitoring

#### 4.1 Analytics Subdomains
```
analytics.dao-name.eth      # Analytics dashboard
stats.dao-name.eth          # Statistics
metrics.dao-name.eth        # Performance metrics
dashboard.dao-name.eth      # Main dashboard
reports.dao-name.eth        # Reports
```

#### 4.2 Monitoring Subdomains
```
monitor.dao-name.eth        # System monitoring
status.dao-name.eth         # System status
health.dao-name.eth         # Health checks
alerts.dao-name.eth         # Alert system
```

### 5. Development & Technical

#### 5.1 Development Subdomains
```
dev.dao-name.eth            # Development portal
github.dao-name.eth         # GitHub integration
code.dao-name.eth           # Code repository
test.dao-name.eth           # Test environment
staging.dao-name.eth        # Staging environment
```

#### 5.2 Technical Subdomains
```
tech.dao-name.eth           # Technical information
protocol.dao-name.eth       # Protocol details
contracts.dao-name.eth      # Smart contracts
audit.dao-name.eth          # Audit reports
security.dao-name.eth       # Security information
```

### 6. Governance & Legal

#### 6.1 Governance Subdomains
```
gov.dao-name.eth            # Governance portal
constitution.dao-name.eth   # DAO constitution
bylaws.dao-name.eth         # Bylaws
policies.dao-name.eth       # Policies
legal.dao-name.eth          # Legal information
```

#### 6.2 Compliance Subdomains
```
compliance.dao-name.eth     # Compliance information
regulatory.dao-name.eth     # Regulatory updates
kyc.dao-name.eth            # KYC portal
aml.dao-name.eth            # AML information
```

### 7. Marketing & Brand

#### 7.1 Marketing Subdomains
```
marketing.dao-name.eth      # Marketing portal
brand.dao-name.eth          # Brand information
media.dao-name.eth          # Media resources
press.dao-name.eth          # Press releases
events.dao-name.eth         # Events
```

#### 7.2 Social Subdomains
```
social.dao-name.eth         # Social media hub
twitter.dao-name.eth        # Twitter integration
linkedin.dao-name.eth       # LinkedIn integration
youtube.dao-name.eth        # YouTube channel
```

### 8. Administrative

#### 8.1 Administrative Subdomains
```
admin.dao-name.eth          # Admin portal
manage.dao-name.eth         # Management interface
settings.dao-name.eth       # Settings
config.dao-name.eth         # Configuration
```

#### 8.2 System Subdomains
```
system.dao-name.eth         # System information
service.dao-name.eth        # Service status
maintenance.dao-name.eth    # Maintenance updates
backup.dao-name.eth         # Backup information
```

## Reserved Words List

### Complete Reserved Subdomain List

```typescript
const RESERVED_SUBDOMAINS = {
  // Core DAO Components
  CORE: [
    'governance', 'voting', 'proposals', 'executive', 'council',
    'treasury', 'vault', 'rewards', 'staking', 'liquidity',
    'token', 'erc20', 'nft', 'vesting', 'airdrop'
  ],
  
  // Documentation & Information
  DOCUMENTATION: [
    'docs', 'wiki', 'guide', 'api', 'spec',
    'info', 'about', 'faq', 'help', 'support'
  ],
  
  // Community & Communication
  COMMUNITY: [
    'forum', 'chat', 'discord', 'telegram', 'reddit',
    'blog', 'news', 'announcements', 'updates'
  ],
  
  // Analytics & Monitoring
  ANALYTICS: [
    'analytics', 'stats', 'metrics', 'dashboard', 'reports',
    'monitor', 'status', 'health', 'alerts'
  ],
  
  // Development & Technical
  DEVELOPMENT: [
    'dev', 'github', 'code', 'test', 'staging',
    'tech', 'protocol', 'contracts', 'audit', 'security'
  ],
  
  // Governance & Legal
  GOVERNANCE: [
    'gov', 'constitution', 'bylaws', 'policies', 'legal',
    'compliance', 'regulatory', 'kyc', 'aml'
  ],
  
  // Marketing & Brand
  MARKETING: [
    'marketing', 'brand', 'media', 'press', 'events',
    'social', 'twitter', 'linkedin', 'youtube'
  ],
  
  // Administrative
  ADMINISTRATIVE: [
    'admin', 'manage', 'settings', 'config',
    'system', 'service', 'maintenance', 'backup'
  ]
};
```

### Reserved Words by Priority

#### Priority 1 (Critical - Never Available)
```typescript
const CRITICAL_RESERVED = [
  'governance', 'treasury', 'token', 'docs', 'forum', 'analytics',
  'admin', 'system', 'root', 'www', 'api', 'api-v1', 'api-v2'
];
```

#### Priority 2 (High - Requires Special Permission)
```typescript
const HIGH_PRIORITY_RESERVED = [
  'voting', 'proposals', 'executive', 'council',
  'vault', 'rewards', 'staking', 'liquidity',
  'erc20', 'nft', 'vesting', 'airdrop',
  'wiki', 'guide', 'spec', 'info', 'about',
  'chat', 'discord', 'telegram', 'reddit',
  'stats', 'metrics', 'dashboard', 'reports',
  'dev', 'github', 'code', 'test', 'staging',
  'gov', 'constitution', 'bylaws', 'policies',
  'marketing', 'brand', 'media', 'press'
];
```

#### Priority 3 (Medium - Available with Registration)
```typescript
const MEDIUM_PRIORITY_RESERVED = [
  'faq', 'help', 'support', 'news', 'announcements',
  'monitor', 'status', 'health', 'alerts',
  'tech', 'protocol', 'contracts', 'audit',
  'legal', 'compliance', 'regulatory', 'kyc',
  'events', 'social', 'twitter', 'linkedin',
  'manage', 'settings', 'config', 'service'
];
```

## Validation Rules

### 1. Subdomain Format Validation

```typescript
interface SubdomainValidationRules {
  // Character restrictions
  allowedCharacters: /^[a-z0-9-]+$/;
  minLength: 2;
  maxLength: 63;
  
  // Format restrictions
  cannotStartWithHyphen: true;
  cannotEndWithHyphen: true;
  cannotHaveConsecutiveHyphens: true;
  
  // Reserved word restrictions
  cannotBeReservedWord: true;
  cannotStartWithReservedPrefix: true;
  cannotEndWithReservedSuffix: true;
}
```

### 2. Reserved Word Detection

```typescript
class ReservedWordValidator {
  private reservedWords: Set<string>;
  private reservedPrefixes: Set<string>;
  private reservedSuffixes: Set<string>;
  
  constructor() {
    this.reservedWords = new Set([
      // Critical reserved words
      'governance', 'treasury', 'token', 'docs', 'forum', 'analytics',
      'admin', 'system', 'root', 'www', 'api',
      
      // High priority reserved words
      'voting', 'proposals', 'executive', 'council',
      'vault', 'rewards', 'staking', 'liquidity',
      'erc20', 'nft', 'vesting', 'airdrop',
      'wiki', 'guide', 'spec', 'info', 'about',
      'chat', 'discord', 'telegram', 'reddit',
      'stats', 'metrics', 'dashboard', 'reports',
      'dev', 'github', 'code', 'test', 'staging',
      'gov', 'constitution', 'bylaws', 'policies',
      'marketing', 'brand', 'media', 'press'
    ]);
    
    this.reservedPrefixes = new Set([
      'admin-', 'system-', 'api-', 'test-', 'dev-',
      'staging-', 'prod-', 'internal-', 'private-'
    ]);
    
    this.reservedSuffixes = new Set([
      '-admin', '-system', '-api', '-test', '-dev',
      '-staging', '-prod', '-internal', '-private'
    ]);
  }
  
  validateSubdomain(subdomain: string): ValidationResult {
    const errors: string[] = [];
    
    // Check if subdomain is reserved
    if (this.reservedWords.has(subdomain.toLowerCase())) {
      errors.push(`Subdomain "${subdomain}" is reserved`);
    }
    
    // Check if subdomain starts with reserved prefix
    for (const prefix of this.reservedPrefixes) {
      if (subdomain.toLowerCase().startsWith(prefix)) {
        errors.push(`Subdomain cannot start with reserved prefix "${prefix}"`);
        break;
      }
    }
    
    // Check if subdomain ends with reserved suffix
    for (const suffix of this.reservedSuffixes) {
      if (subdomain.toLowerCase().endsWith(suffix)) {
        errors.push(`Subdomain cannot end with reserved suffix "${suffix}"`);
        break;
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

### 3. ENS Integration Validation

```typescript
class ENSSubdomainValidator {
  private ensResolver: ENSResolverService;
  private reservedValidator: ReservedWordValidator;
  
  constructor(ensResolver: ENSResolverService) {
    this.ensResolver = ensResolver;
    this.reservedValidator = new ReservedWordValidator();
  }
  
  async validateENSSubdomain(parentDomain: string, subdomain: string): Promise<ENSValidationResult> {
    const fullDomain = `${subdomain}.${parentDomain}`;
    
    // Basic format validation
    const formatValidation = this.validateFormat(subdomain);
    if (!formatValidation.isValid) {
      return {
        isValid: false,
        errors: formatValidation.errors,
        domain: fullDomain
      };
    }
    
    // Reserved word validation
    const reservedValidation = this.reservedValidator.validateSubdomain(subdomain);
    if (!reservedValidation.isValid) {
      return {
        isValid: false,
        errors: reservedValidation.errors,
        domain: fullDomain
      };
    }
    
    // Check if domain already exists
    const existingAddress = await this.ensResolver.resolveAddress(fullDomain);
    if (existingAddress) {
      return {
        isValid: false,
        errors: [`Domain "${fullDomain}" already exists`],
        domain: fullDomain
      };
    }
    
    return {
      isValid: true,
      errors: [],
      domain: fullDomain
    };
  }
  
  private validateFormat(subdomain: string): ValidationResult {
    const errors: string[] = [];
    
    // Length validation
    if (subdomain.length < 2) {
      errors.push("Subdomain must be at least 2 characters long");
    }
    
    if (subdomain.length > 63) {
      errors.push("Subdomain cannot exceed 63 characters");
    }
    
    // Character validation
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      errors.push("Subdomain can only contain lowercase letters, numbers, and hyphens");
    }
    
    // Hyphen validation
    if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
      errors.push("Subdomain cannot start or end with a hyphen");
    }
    
    if (subdomain.includes('--')) {
      errors.push("Subdomain cannot contain consecutive hyphens");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

## Implementation Guidelines

### 1. Smart Contract Implementation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ReservedSubdomains {
    mapping(string => bool) public reservedSubdomains;
    mapping(string => uint256) public subdomainPriority;
    
    event SubdomainReserved(string subdomain, uint256 priority);
    event SubdomainReleased(string subdomain);
    
    constructor() {
        // Initialize critical reserved subdomains
        _initializeCriticalReserved();
        _initializeHighPriorityReserved();
        _initializeMediumPriorityReserved();
    }
    
    function isReserved(string memory subdomain) public view returns (bool) {
        return reservedSubdomains[subdomain];
    }
    
    function getPriority(string memory subdomain) public view returns (uint256) {
        return subdomainPriority[subdomain];
    }
    
    function reserveSubdomain(string memory subdomain, uint256 priority) external onlyOwner {
        require(bytes(subdomain).length > 0, "Subdomain cannot be empty");
        require(!reservedSubdomains[subdomain], "Subdomain already reserved");
        
        reservedSubdomains[subdomain] = true;
        subdomainPriority[subdomain] = priority;
        
        emit SubdomainReserved(subdomain, priority);
    }
    
    function releaseSubdomain(string memory subdomain) external onlyOwner {
        require(reservedSubdomains[subdomain], "Subdomain not reserved");
        
        reservedSubdomains[subdomain] = false;
        subdomainPriority[subdomain] = 0;
        
        emit SubdomainReleased(subdomain);
    }
    
    function _initializeCriticalReserved() private {
        string[] memory critical = new string[](10);
        critical[0] = "governance";
        critical[1] = "treasury";
        critical[2] = "token";
        critical[3] = "docs";
        critical[4] = "forum";
        critical[5] = "analytics";
        critical[6] = "admin";
        critical[7] = "system";
        critical[8] = "root";
        critical[9] = "www";
        
        for (uint256 i = 0; i < critical.length; i++) {
            reservedSubdomains[critical[i]] = true;
            subdomainPriority[critical[i]] = 1;
        }
    }
    
    function _initializeHighPriorityReserved() private {
        string[] memory highPriority = new string[](30);
        highPriority[0] = "voting";
        highPriority[1] = "proposals";
        highPriority[2] = "executive";
        highPriority[3] = "council";
        highPriority[4] = "vault";
        highPriority[5] = "rewards";
        highPriority[6] = "staking";
        highPriority[7] = "liquidity";
        highPriority[8] = "erc20";
        highPriority[9] = "nft";
        highPriority[10] = "vesting";
        highPriority[11] = "airdrop";
        highPriority[12] = "wiki";
        highPriority[13] = "guide";
        highPriority[14] = "spec";
        highPriority[15] = "info";
        highPriority[16] = "about";
        highPriority[17] = "chat";
        highPriority[18] = "discord";
        highPriority[19] = "telegram";
        highPriority[20] = "reddit";
        highPriority[21] = "stats";
        highPriority[22] = "metrics";
        highPriority[23] = "dashboard";
        highPriority[24] = "reports";
        highPriority[25] = "dev";
        highPriority[26] = "github";
        highPriority[27] = "code";
        highPriority[28] = "test";
        highPriority[29] = "staging";
        
        for (uint256 i = 0; i < highPriority.length; i++) {
            reservedSubdomains[highPriority[i]] = true;
            subdomainPriority[highPriority[i]] = 2;
        }
    }
    
    function _initializeMediumPriorityReserved() private {
        string[] memory mediumPriority = new string[](20);
        mediumPriority[0] = "faq";
        mediumPriority[1] = "help";
        mediumPriority[2] = "support";
        mediumPriority[3] = "news";
        mediumPriority[4] = "announcements";
        mediumPriority[5] = "monitor";
        mediumPriority[6] = "status";
        mediumPriority[7] = "health";
        mediumPriority[8] = "alerts";
        mediumPriority[9] = "tech";
        mediumPriority[10] = "protocol";
        mediumPriority[11] = "contracts";
        mediumPriority[12] = "audit";
        mediumPriority[13] = "legal";
        mediumPriority[14] = "compliance";
        mediumPriority[15] = "regulatory";
        mediumPriority[16] = "kyc";
        mediumPriority[17] = "events";
        mediumPriority[18] = "social";
        mediumPriority[19] = "manage";
        
        for (uint256 i = 0; i < mediumPriority.length; i++) {
            reservedSubdomains[mediumPriority[i]] = true;
            subdomainPriority[mediumPriority[i]] = 3;
        }
    }
}
```

### 2. TypeScript Service Implementation

```typescript
class ReservedSubdomainsService {
  private reservedWords: Map<string, number>;
  private ensValidator: ENSSubdomainValidator;
  
  constructor(ensResolver: ENSResolverService) {
    this.reservedWords = new Map();
    this.ensValidator = new ENSSubdomainValidator(ensResolver);
    this.initializeReservedWords();
  }
  
  private initializeReservedWords(): void {
    // Critical reserved words (Priority 1)
    const critical = [
      'governance', 'treasury', 'token', 'docs', 'forum', 'analytics',
      'admin', 'system', 'root', 'www', 'api'
    ];
    
    // High priority reserved words (Priority 2)
    const highPriority = [
      'voting', 'proposals', 'executive', 'council',
      'vault', 'rewards', 'staking', 'liquidity',
      'erc20', 'nft', 'vesting', 'airdrop',
      'wiki', 'guide', 'spec', 'info', 'about',
      'chat', 'discord', 'telegram', 'reddit',
      'stats', 'metrics', 'dashboard', 'reports',
      'dev', 'github', 'code', 'test', 'staging',
      'gov', 'constitution', 'bylaws', 'policies',
      'marketing', 'brand', 'media', 'press'
    ];
    
    // Medium priority reserved words (Priority 3)
    const mediumPriority = [
      'faq', 'help', 'support', 'news', 'announcements',
      'monitor', 'status', 'health', 'alerts',
      'tech', 'protocol', 'contracts', 'audit',
      'legal', 'compliance', 'regulatory', 'kyc',
      'events', 'social', 'twitter', 'linkedin',
      'manage', 'settings', 'config', 'service'
    ];
    
    // Initialize critical reserved words
    critical.forEach(word => this.reservedWords.set(word, 1));
    
    // Initialize high priority reserved words
    highPriority.forEach(word => this.reservedWords.set(word, 2));
    
    // Initialize medium priority reserved words
    mediumPriority.forEach(word => this.reservedWords.set(word, 3));
  }
  
  isReserved(subdomain: string): boolean {
    return this.reservedWords.has(subdomain.toLowerCase());
  }
  
  getPriority(subdomain: string): number {
    return this.reservedWords.get(subdomain.toLowerCase()) || 0;
  }
  
  async validateSubdomain(parentDomain: string, subdomain: string): Promise<ENSValidationResult> {
    return this.ensValidator.validateENSSubdomain(parentDomain, subdomain);
  }
  
  getReservedWordsByPriority(priority: number): string[] {
    const words: string[] = [];
    for (const [word, wordPriority] of this.reservedWords) {
      if (wordPriority === priority) {
        words.push(word);
      }
    }
    return words;
  }
  
  getAllReservedWords(): Map<string, number> {
    return new Map(this.reservedWords);
  }
}
```

### 3. API Endpoints

```typescript
// Reserved subdomains API endpoints
app.get('/api/v1/reserved-subdomains', (req, res) => {
  const priority = req.query.priority ? parseInt(req.query.priority as string) : null;
  
  if (priority) {
    const words = reservedSubdomainsService.getReservedWordsByPriority(priority);
    res.json({ priority, words });
  } else {
    const allWords = reservedSubdomainsService.getAllReservedWords();
    res.json({ words: Object.fromEntries(allWords) });
  }
});

app.post('/api/v1/reserved-subdomains/validate', async (req, res) => {
  const { parentDomain, subdomain } = req.body;
  
  try {
    const validation = await reservedSubdomainsService.validateSubdomain(parentDomain, subdomain);
    res.json(validation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/v1/reserved-subdomains/check/:subdomain', (req, res) => {
  const { subdomain } = req.params;
  const isReserved = reservedSubdomainsService.isReserved(subdomain);
  const priority = reservedSubdomainsService.getPriority(subdomain);
  
  res.json({
    subdomain,
    isReserved,
    priority: isReserved ? priority : 0
  });
});
```

## Migration and Deployment

### 1. Deployment Strategy

1. **Phase 1**: Deploy reserved subdomains contract
2. **Phase 2**: Update ENS integration to use reserved words
3. **Phase 3**: Implement validation in all registration flows
4. **Phase 4**: Monitor and adjust based on usage patterns

### 2. Migration Script

```typescript
async function migrateReservedSubdomains() {
  const reservedSubdomainsContract = new ReservedSubdomains();
  
  // Deploy contract
  const deployedContract = await reservedSubdomainsContract.deploy();
  
  // Verify deployment
  console.log('Reserved subdomains contract deployed at:', deployedContract.address);
  
  // Test critical reserved words
  const criticalWords = ['governance', 'treasury', 'token', 'docs', 'forum', 'analytics'];
  
  for (const word of criticalWords) {
    const isReserved = await deployedContract.isReserved(word);
    const priority = await deployedContract.getPriority(word);
    
    console.log(`${word}: reserved=${isReserved}, priority=${priority}`);
  }
}
```

## Security Considerations

### 1. Access Control

- Only authorized administrators can modify reserved words
- Multi-signature requirements for critical changes
- Time-locked upgrades for major modifications

### 2. Validation

- Input sanitization for all subdomain inputs
- Length and character validation
- Reserved word checking at multiple layers

### 3. Monitoring

- Track reserved word usage patterns
- Monitor for attempts to bypass restrictions
- Alert on suspicious subdomain registration attempts

## Future Enhancements

### 1. Dynamic Reserved Words

- Allow community governance of reserved words
- Implement voting mechanisms for new reserved words
- Create categories for different types of reserved words

### 2. Advanced Validation

- Machine learning-based reserved word detection
- Context-aware validation rules
- Automated conflict resolution

### 3. Integration Features

- ENS registrar integration
- Cross-chain reserved word synchronization
- Automated reserved word enforcement 