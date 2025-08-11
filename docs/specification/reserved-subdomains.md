# Reserved Subdomains Specification

## Table of Contents

1. [Overview](#overview)
2. [Priority Levels](#priority-levels)
3. [Reserved Subdomain Categories](#reserved-subdomain-categories)
4. [Complete Reserved Words List](#complete-reserved-words-list)
5. [Validation Rules](#validation-rules)
6. [Implementation](#implementation)
7. [API Reference](#api-reference)
8. [Deployment](#deployment)
9. [Security](#security)
10. [Future Enhancements](#future-enhancements)

## Overview

This specification defines the reserved subdomains for the DAO Registry system, ensuring consistent naming conventions, preventing conflicts, and maintaining system integrity across ENS domains.

### Purpose

- **Conflict Prevention**: Prevent naming conflicts between DAO components
- **Security**: Protect critical system subdomains from unauthorized use
- **Consistency**: Ensure standardized naming across all DAO registrations
- **Scalability**: Support future expansion of reserved word categories

### Key Principles

1. **Hierarchical Priority System**: Three-tier priority system for reserved words
2. **ENS Integration**: Seamless integration with Ethereum Name Service
3. **Validation at Multiple Layers**: Client-side, server-side, and blockchain validation
4. **Extensible Design**: Support for future reserved word additions

## Priority Levels

### Priority 1: Critical (Never Available)
These subdomains are permanently reserved and cannot be registered by any DAO.

```typescript
const CRITICAL_RESERVED = [
  'governance', 'treasury', 'token', 'docs', 'forum', 'analytics',
  'admin', 'system', 'root', 'www', 'api', 'api-v1', 'api-v2'
];
```

### Priority 2: High (Requires Special Permission)
These subdomains require administrative approval for registration.

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

### Priority 3: Medium (Available with Registration)
These subdomains can be registered with proper documentation and approval.

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

## Reserved Subdomain Categories

### 1. Core DAO Components

#### Governance Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `governance` | Main governance contract | Critical | `governance.dao-name.eth` |
| `voting` | Voting mechanism | High | `voting.dao-name.eth` |
| `proposals` | Proposal management | High | `proposals.dao-name.eth` |
| `executive` | Executive functions | High | `executive.dao-name.eth` |
| `council` | Council/committee | High | `council.dao-name.eth` |

#### Financial Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `treasury` | Treasury contract | Critical | `treasury.dao-name.eth` |
| `vault` | Asset vault | High | `vault.dao-name.eth` |
| `rewards` | Reward distribution | High | `rewards.dao-name.eth` |
| `staking` | Staking contract | High | `staking.dao-name.eth` |
| `liquidity` | Liquidity management | High | `liquidity.dao-name.eth` |

#### Token Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `token` | Governance token | Critical | `token.dao-name.eth` |
| `erc20` | ERC-20 token | High | `erc20.dao-name.eth` |
| `nft` | NFT collection | High | `nft.dao-name.eth` |
| `vesting` | Token vesting | High | `vesting.dao-name.eth` |
| `airdrop` | Airdrop distribution | High | `airdrop.dao-name.eth` |

### 2. Documentation & Information

#### Documentation Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `docs` | Documentation | Critical | `docs.dao-name.eth` |
| `wiki` | Wiki pages | High | `wiki.dao-name.eth` |
| `guide` | User guides | High | `guide.dao-name.eth` |
| `api` | API documentation | Critical | `api.dao-name.eth` |
| `spec` | Technical specifications | High | `spec.dao-name.eth` |

#### Information Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `info` | General information | High | `info.dao-name.eth` |
| `about` | About page | High | `about.dao-name.eth` |
| `faq` | Frequently asked questions | Medium | `faq.dao-name.eth` |
| `help` | Help center | Medium | `help.dao-name.eth` |
| `support` | Support portal | Medium | `support.dao-name.eth` |

### 3. Community & Communication

#### Community Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `forum` | Community forum | Critical | `forum.dao-name.eth` |
| `chat` | Chat platform | High | `chat.dao-name.eth` |
| `discord` | Discord server | High | `discord.dao-name.eth` |
| `telegram` | Telegram group | High | `telegram.dao-name.eth` |
| `reddit` | Reddit community | High | `reddit.dao-name.eth` |

#### Communication Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `blog` | Blog/news | High | `blog.dao-name.eth` |
| `news` | News updates | Medium | `news.dao-name.eth` |
| `announcements` | Official announcements | Medium | `announcements.dao-name.eth` |
| `updates` | System updates | Medium | `updates.dao-name.eth` |

### 4. Analytics & Monitoring

#### Analytics Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `analytics` | Analytics dashboard | Critical | `analytics.dao-name.eth` |
| `stats` | Statistics | High | `stats.dao-name.eth` |
| `metrics` | Performance metrics | High | `metrics.dao-name.eth` |
| `dashboard` | Main dashboard | High | `dashboard.dao-name.eth` |
| `reports` | Reports | High | `reports.dao-name.eth` |

#### Monitoring Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `monitor` | System monitoring | Medium | `monitor.dao-name.eth` |
| `status` | System status | Medium | `status.dao-name.eth` |
| `health` | Health checks | Medium | `health.dao-name.eth` |
| `alerts` | Alert system | Medium | `alerts.dao-name.eth` |

### 5. Development & Technical

#### Development Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `dev` | Development portal | High | `dev.dao-name.eth` |
| `github` | GitHub integration | High | `github.dao-name.eth` |
| `code` | Code repository | High | `code.dao-name.eth` |
| `test` | Test environment | High | `test.dao-name.eth` |
| `staging` | Staging environment | High | `staging.dao-name.eth` |

#### Technical Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `tech` | Technical information | Medium | `tech.dao-name.eth` |
| `protocol` | Protocol details | Medium | `protocol.dao-name.eth` |
| `contracts` | Smart contracts | Medium | `contracts.dao-name.eth` |
| `audit` | Audit reports | Medium | `audit.dao-name.eth` |
| `security` | Security information | High | `security.dao-name.eth` |

### 6. Governance & Legal

#### Governance Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `gov` | Governance portal | High | `gov.dao-name.eth` |
| `constitution` | DAO constitution | High | `constitution.dao-name.eth` |
| `bylaws` | Bylaws | High | `bylaws.dao-name.eth` |
| `policies` | Policies | High | `policies.dao-name.eth` |
| `legal` | Legal information | Medium | `legal.dao-name.eth` |

#### Compliance Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `compliance` | Compliance information | Medium | `compliance.dao-name.eth` |
| `regulatory` | Regulatory updates | Medium | `regulatory.dao-name.eth` |
| `kyc` | KYC portal | Medium | `kyc.dao-name.eth` |
| `aml` | AML information | Medium | `aml.dao-name.eth` |

### 7. Marketing & Brand

#### Marketing Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `marketing` | Marketing portal | High | `marketing.dao-name.eth` |
| `brand` | Brand information | High | `brand.dao-name.eth` |
| `media` | Media resources | High | `media.dao-name.eth` |
| `press` | Press releases | High | `press.dao-name.eth` |
| `events` | Events | Medium | `events.dao-name.eth` |

#### Social Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `social` | Social media hub | Medium | `social.dao-name.eth` |
| `twitter` | Twitter integration | Medium | `twitter.dao-name.eth` |
| `linkedin` | LinkedIn integration | Medium | `linkedin.dao-name.eth` |
| `youtube` | YouTube channel | Medium | `youtube.dao-name.eth` |

### 8. Administrative

#### Administrative Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `admin` | Admin portal | Critical | `admin.dao-name.eth` |
| `manage` | Management interface | Medium | `manage.dao-name.eth` |
| `settings` | Settings | Medium | `settings.dao-name.eth` |
| `config` | Configuration | Medium | `config.dao-name.eth` |

#### System Subdomains
| Subdomain | Purpose | Priority | Example |
|-----------|---------|----------|---------|
| `system` | System information | Critical | `system.dao-name.eth` |
| `service` | Service status | Medium | `service.dao-name.eth` |
| `maintenance` | Maintenance updates | Medium | `maintenance.dao-name.eth` |
| `backup` | Backup information | Medium | `backup.dao-name.eth` |

## Complete Reserved Words List

### Organized by Category and Priority

```typescript
const RESERVED_SUBDOMAINS = {
  // Core DAO Components
  CORE: {
    CRITICAL: ['governance', 'treasury', 'token'],
    HIGH: ['voting', 'proposals', 'executive', 'council', 'vault', 'rewards', 'staking', 'liquidity', 'erc20', 'nft', 'vesting', 'airdrop']
  },
  
  // Documentation & Information
  DOCUMENTATION: {
    CRITICAL: ['docs', 'api'],
    HIGH: ['wiki', 'guide', 'spec', 'info', 'about'],
    MEDIUM: ['faq', 'help', 'support']
  },
  
  // Community & Communication
  COMMUNITY: {
    CRITICAL: ['forum'],
    HIGH: ['chat', 'discord', 'telegram', 'reddit', 'blog'],
    MEDIUM: ['news', 'announcements', 'updates']
  },
  
  // Analytics & Monitoring
  ANALYTICS: {
    CRITICAL: ['analytics'],
    HIGH: ['stats', 'metrics', 'dashboard', 'reports'],
    MEDIUM: ['monitor', 'status', 'health', 'alerts']
  },
  
  // Development & Technical
  DEVELOPMENT: {
    HIGH: ['dev', 'github', 'code', 'test', 'staging', 'security'],
    MEDIUM: ['tech', 'protocol', 'contracts', 'audit']
  },
  
  // Governance & Legal
  GOVERNANCE: {
    HIGH: ['gov', 'constitution', 'bylaws', 'policies'],
    MEDIUM: ['legal', 'compliance', 'regulatory', 'kyc', 'aml']
  },
  
  // Marketing & Brand
  MARKETING: {
    HIGH: ['marketing', 'brand', 'media', 'press'],
    MEDIUM: ['events', 'social', 'twitter', 'linkedin', 'youtube']
  },
  
  // Administrative
  ADMINISTRATIVE: {
    CRITICAL: ['admin', 'system'],
    MEDIUM: ['manage', 'settings', 'config', 'service', 'maintenance', 'backup']
  }
};
```

### Quick Reference by Priority

#### Critical (Priority 1)
```typescript
const CRITICAL_RESERVED = [
  'governance', 'treasury', 'token', 'docs', 'forum', 'analytics',
  'admin', 'system', 'root', 'www', 'api', 'api-v1', 'api-v2'
];
```

#### High Priority (Priority 2)
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
  'marketing', 'brand', 'media', 'press', 'security'
];
```

#### Medium Priority (Priority 3)
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
      'marketing', 'brand', 'media', 'press', 'security'
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

## Implementation

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
      'marketing', 'brand', 'media', 'press', 'security'
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

## API Reference

### Endpoints

#### Get Reserved Subdomains
```http
GET /api/v1/reserved-subdomains?priority={priority}
```

**Parameters:**
- `priority` (optional): Filter by priority level (1, 2, or 3)

**Response:**
```json
{
  "priority": 1,
  "words": ["governance", "treasury", "token", "docs", "forum", "analytics"]
}
```

#### Validate Subdomain
```http
POST /api/v1/reserved-subdomains/validate
```

**Request Body:**
```json
{
  "parentDomain": "dao-name.eth",
  "subdomain": "proposed-subdomain"
}
```

**Response:**
```json
{
  "isValid": false,
  "errors": ["Subdomain \"proposed-subdomain\" is reserved"],
  "domain": "proposed-subdomain.dao-name.eth"
}
```

#### Check Subdomain Status
```http
GET /api/v1/reserved-subdomains/check/{subdomain}
```

**Response:**
```json
{
  "subdomain": "governance",
  "isReserved": true,
  "priority": 1
}
```

### Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid subdomain format |
| 409 | Subdomain already exists |
| 422 | Reserved subdomain violation |

## Deployment

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

## Security

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