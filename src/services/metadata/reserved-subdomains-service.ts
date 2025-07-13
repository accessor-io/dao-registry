import { ENSResolverService } from './ens-resolver-service';

/**
 * Reserved subdomain priority levels
 */
export enum ReservedSubdomainPriority {
  CRITICAL = 1,    // Never available
  HIGH = 2,        // Requires special permission
  MEDIUM = 3,      // Available with registration
  LOW = 4          // Available with approval
}

/**
 * Validation result for subdomain checks
 */
export interface SubdomainValidationResult {
  isValid: boolean;
  errors: string[];
  domain?: string;
  priority?: ReservedSubdomainPriority;
  isReserved?: boolean;
}

/**
 * ENS validation result
 */
export interface ENSValidationResult {
  isValid: boolean;
  errors: string[];
  domain: string;
  exists?: boolean;
  owner?: string;
}

/**
 * Reserved subdomain information
 */
export interface ReservedSubdomainInfo {
  subdomain: string;
  priority: ReservedSubdomainPriority;
  category: string;
  description: string;
  allowedFor: string[];
  restrictions: string[];
}

/**
 * Reserved Subdomains Service
 * 
 * Manages reserved subdomains for the DAO Registry system,
 * providing validation, priority management, and ENS integration.
 */
export class ReservedSubdomainsService {
  private reservedWords: Map<string, ReservedSubdomainInfo>;
  private reservedPrefixes: Set<string>;
  private reservedSuffixes: Set<string>;
  private ensResolver: ENSResolverService;

  constructor(ensResolver: ENSResolverService) {
    this.reservedWords = new Map();
    this.reservedPrefixes = new Set();
    this.reservedSuffixes = new Set();
    this.ensResolver = ensResolver;
    this.initializeReservedWords();
    this.initializeReservedPrefixes();
    this.initializeReservedSuffixes();
  }

  /**
   * Initialize critical reserved subdomains (Priority 1)
   */
  private initializeCriticalReserved(): void {
    const critical: ReservedSubdomainInfo[] = [
      {
        subdomain: 'governance',
        priority: ReservedSubdomainPriority.CRITICAL,
        category: 'Core DAO Components',
        description: 'Main governance contract',
        allowedFor: ['DAO owners', 'System administrators'],
        restrictions: ['Never available for public registration']
      },
      {
        subdomain: 'treasury',
        priority: ReservedSubdomainPriority.CRITICAL,
        category: 'Core DAO Components',
        description: 'Treasury contract',
        allowedFor: ['DAO owners', 'System administrators'],
        restrictions: ['Never available for public registration']
      },
      {
        subdomain: 'token',
        priority: ReservedSubdomainPriority.CRITICAL,
        category: 'Core DAO Components',
        description: 'Governance token',
        allowedFor: ['DAO owners', 'System administrators'],
        restrictions: ['Never available for public registration']
      },
      {
        subdomain: 'docs',
        priority: ReservedSubdomainPriority.CRITICAL,
        category: 'Documentation',
        description: 'Documentation',
        allowedFor: ['DAO owners', 'System administrators'],
        restrictions: ['Never available for public registration']
      },
      {
        subdomain: 'forum',
        priority: ReservedSubdomainPriority.CRITICAL,
        category: 'Community',
        description: 'Community forum',
        allowedFor: ['DAO owners', 'System administrators'],
        restrictions: ['Never available for public registration']
      },
      {
        subdomain: 'analytics',
        priority: ReservedSubdomainPriority.CRITICAL,
        category: 'Analytics',
        description: 'Analytics dashboard',
        allowedFor: ['DAO owners', 'System administrators'],
        restrictions: ['Never available for public registration']
      },
      {
        subdomain: 'admin',
        priority: ReservedSubdomainPriority.CRITICAL,
        category: 'Administrative',
        description: 'Admin portal',
        allowedFor: ['System administrators only'],
        restrictions: ['Never available for public registration']
      },
      {
        subdomain: 'system',
        priority: ReservedSubdomainPriority.CRITICAL,
        category: 'System',
        description: 'System information',
        allowedFor: ['System administrators only'],
        restrictions: ['Never available for public registration']
      },
      {
        subdomain: 'root',
        priority: ReservedSubdomainPriority.CRITICAL,
        category: 'System',
        description: 'Root domain',
        allowedFor: ['System administrators only'],
        restrictions: ['Never available for public registration']
      },
      {
        subdomain: 'www',
        priority: ReservedSubdomainPriority.CRITICAL,
        category: 'System',
        description: 'World Wide Web',
        allowedFor: ['System administrators only'],
        restrictions: ['Never available for public registration']
      },
      {
        subdomain: 'api',
        priority: ReservedSubdomainPriority.CRITICAL,
        category: 'Technical',
        description: 'API endpoint',
        allowedFor: ['System administrators only'],
        restrictions: ['Never available for public registration']
      }
    ];

    critical.forEach(info => {
      this.reservedWords.set(info.subdomain, info);
    });
  }

  /**
   * Initialize high priority reserved subdomains (Priority 2)
   */
  private initializeHighPriorityReserved(): void {
    const highPriority: ReservedSubdomainInfo[] = [
      // Governance
      {
        subdomain: 'voting',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Core DAO Components',
        description: 'Voting mechanism',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'proposals',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Core DAO Components',
        description: 'Proposal management',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'executive',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Core DAO Components',
        description: 'Executive functions',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'council',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Core DAO Components',
        description: 'Council/committee',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      // Financial
      {
        subdomain: 'vault',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Core DAO Components',
        description: 'Asset vault',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'rewards',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Core DAO Components',
        description: 'Reward distribution',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'staking',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Core DAO Components',
        description: 'Staking contract',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'liquidity',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Core DAO Components',
        description: 'Liquidity management',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      // Token
      {
        subdomain: 'erc20',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Core DAO Components',
        description: 'ERC-20 token',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'nft',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Core DAO Components',
        description: 'NFT collection',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'vesting',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Core DAO Components',
        description: 'Token vesting',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'airdrop',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Core DAO Components',
        description: 'Airdrop distribution',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      // Documentation
      {
        subdomain: 'wiki',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Documentation',
        description: 'Wiki pages',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'guide',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Documentation',
        description: 'User guides',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'spec',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Documentation',
        description: 'Technical specifications',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      // Community
      {
        subdomain: 'chat',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Community',
        description: 'Chat platform',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'discord',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Community',
        description: 'Discord server',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'telegram',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Community',
        description: 'Telegram group',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'reddit',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Community',
        description: 'Reddit community',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      // Analytics
      {
        subdomain: 'stats',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Analytics',
        description: 'Statistics',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'metrics',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Analytics',
        description: 'Performance metrics',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'dashboard',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Analytics',
        description: 'Main dashboard',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'reports',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Analytics',
        description: 'Reports',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      // Development
      {
        subdomain: 'dev',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Development',
        description: 'Development portal',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'github',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Development',
        description: 'GitHub integration',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'code',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Development',
        description: 'Code repository',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'test',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Development',
        description: 'Test environment',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'staging',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Development',
        description: 'Staging environment',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      // Governance
      {
        subdomain: 'gov',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Governance',
        description: 'Governance portal',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'constitution',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Governance',
        description: 'DAO constitution',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'bylaws',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Governance',
        description: 'Bylaws',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'policies',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Governance',
        description: 'Policies',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      // Marketing
      {
        subdomain: 'marketing',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Marketing',
        description: 'Marketing portal',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'brand',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Marketing',
        description: 'Brand information',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'media',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Marketing',
        description: 'Media resources',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      },
      {
        subdomain: 'press',
        priority: ReservedSubdomainPriority.HIGH,
        category: 'Marketing',
        description: 'Press releases',
        allowedFor: ['DAO owners'],
        restrictions: ['Requires special permission']
      }
    ];

    highPriority.forEach(info => {
      this.reservedWords.set(info.subdomain, info);
    });
  }

  /**
   * Initialize medium priority reserved subdomains (Priority 3)
   */
  private initializeMediumPriorityReserved(): void {
    const mediumPriority: ReservedSubdomainInfo[] = [
      // Information
      {
        subdomain: 'faq',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Information',
        description: 'Frequently asked questions',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'help',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Information',
        description: 'Help center',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'support',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Information',
        description: 'Support portal',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      // Communication
      {
        subdomain: 'news',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Communication',
        description: 'News updates',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'announcements',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Communication',
        description: 'Official announcements',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      // Monitoring
      {
        subdomain: 'monitor',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Monitoring',
        description: 'System monitoring',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'status',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Monitoring',
        description: 'System status',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'health',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Monitoring',
        description: 'Health checks',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'alerts',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Monitoring',
        description: 'Alert system',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      // Technical
      {
        subdomain: 'tech',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Technical',
        description: 'Technical information',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'protocol',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Technical',
        description: 'Protocol details',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'contracts',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Technical',
        description: 'Smart contracts',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'audit',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Technical',
        description: 'Audit reports',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      // Legal
      {
        subdomain: 'legal',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Legal',
        description: 'Legal information',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'compliance',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Legal',
        description: 'Compliance information',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'regulatory',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Legal',
        description: 'Regulatory updates',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'kyc',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Legal',
        description: 'KYC portal',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      // Events
      {
        subdomain: 'events',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Events',
        description: 'Events',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'social',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Social',
        description: 'Social media hub',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'twitter',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Social',
        description: 'Twitter integration',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'linkedin',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Social',
        description: 'LinkedIn integration',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      // Administrative
      {
        subdomain: 'manage',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Administrative',
        description: 'Management interface',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'settings',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Administrative',
        description: 'Settings',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'config',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'Administrative',
        description: 'Configuration',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      },
      {
        subdomain: 'service',
        priority: ReservedSubdomainPriority.MEDIUM,
        category: 'System',
        description: 'Service status',
        allowedFor: ['DAO owners', 'Verified users'],
        restrictions: ['Available with registration']
      }
    ];

    mediumPriority.forEach(info => {
      this.reservedWords.set(info.subdomain, info);
    });
  }

  /**
   * Initialize reserved prefixes
   */
  private initializeReservedPrefixes(): void {
    const prefixes = [
      'admin-', 'system-', 'api-', 'test-', 'dev-',
      'staging-', 'prod-', 'internal-', 'private-',
      'reserved-', 'protected-', 'secure-', 'confidential-'
    ];

    prefixes.forEach(prefix => {
      this.reservedPrefixes.add(prefix);
    });
  }

  /**
   * Initialize reserved suffixes
   */
  private initializeReservedSuffixes(): void {
    const suffixes = [
      '-admin', '-system', '-api', '-test', '-dev',
      '-staging', '-prod', '-internal', '-private',
      '-reserved', '-protected', '-secure', '-confidential'
    ];

    suffixes.forEach(suffix => {
      this.reservedSuffixes.add(suffix);
    });
  }

  /**
   * Initialize all reserved words
   */
  private initializeReservedWords(): void {
    this.initializeCriticalReserved();
    this.initializeHighPriorityReserved();
    this.initializeMediumPriorityReserved();
  }

  /**
   * Check if a subdomain is reserved
   */
  isReserved(subdomain: string): boolean {
    return this.reservedWords.has(subdomain.toLowerCase());
  }

  /**
   * Get priority level for a subdomain
   */
  getPriority(subdomain: string): ReservedSubdomainPriority {
    const info = this.reservedWords.get(subdomain.toLowerCase());
    return info ? info.priority : ReservedSubdomainPriority.LOW;
  }

  /**
   * Get reserved subdomain information
   */
  getReservedSubdomainInfo(subdomain: string): ReservedSubdomainInfo | null {
    return this.reservedWords.get(subdomain.toLowerCase()) || null;
  }

  /**
   * Validate subdomain format and reserved word status
   */
  validateSubdomain(subdomain: string): SubdomainValidationResult {
    const errors: string[] = [];
    const normalizedSubdomain = subdomain.toLowerCase();

    // Length validation
    if (normalizedSubdomain.length < 2) {
      errors.push('Subdomain must be at least 2 characters long');
    }

    if (normalizedSubdomain.length > 63) {
      errors.push('Subdomain cannot exceed 63 characters');
    }

    // Character validation
    if (!/^[a-z0-9-]+$/.test(normalizedSubdomain)) {
      errors.push('Subdomain can only contain lowercase letters, numbers, and hyphens');
    }

    // Hyphen validation
    if (normalizedSubdomain.startsWith('-') || normalizedSubdomain.endsWith('-')) {
      errors.push('Subdomain cannot start or end with a hyphen');
    }

    if (normalizedSubdomain.includes('--')) {
      errors.push('Subdomain cannot contain consecutive hyphens');
    }

    // Reserved word validation
    if (this.isReserved(normalizedSubdomain)) {
      const info = this.getReservedSubdomainInfo(normalizedSubdomain);
      errors.push(`Subdomain "${subdomain}" is reserved (${info?.category})`);
    }

    // Reserved prefix validation
    for (const prefix of this.reservedPrefixes) {
      if (normalizedSubdomain.startsWith(prefix)) {
        errors.push(`Subdomain cannot start with reserved prefix "${prefix}"`);
        break;
      }
    }

    // Reserved suffix validation
    for (const suffix of this.reservedSuffixes) {
      if (normalizedSubdomain.endsWith(suffix)) {
        errors.push(`Subdomain cannot end with reserved suffix "${suffix}"`);
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      isReserved: this.isReserved(normalizedSubdomain),
      priority: this.getPriority(normalizedSubdomain)
    };
  }

  /**
   * Validate ENS subdomain with full domain context
   */
  async validateENSSubdomain(parentDomain: string, subdomain: string): Promise<ENSValidationResult> {
    const fullDomain = `${subdomain}.${parentDomain}`;
    const errors: string[] = [];

    // Basic subdomain validation
    const subdomainValidation = this.validateSubdomain(subdomain);
    if (!subdomainValidation.isValid) {
      errors.push(...subdomainValidation.errors);
    }

    // Check if domain already exists
    try {
      const existingAddress = await this.ensResolver.resolveAddress(fullDomain);
      if (existingAddress) {
        errors.push(`Domain "${fullDomain}" already exists`);
      }
    } catch (error) {
      // Domain doesn't exist, which is good
    }

    return {
      isValid: errors.length === 0,
      errors,
      domain: fullDomain,
      exists: errors.some(error => error.includes('already exists'))
    };
  }

  /**
   * Get all reserved words by priority
   */
  getReservedWordsByPriority(priority: ReservedSubdomainPriority): string[] {
    const words: string[] = [];
    for (const [word, info] of this.reservedWords) {
      if (info.priority === priority) {
        words.push(word);
      }
    }
    return words;
  }

  /**
   * Get all reserved words by category
   */
  getReservedWordsByCategory(category: string): ReservedSubdomainInfo[] {
    const words: ReservedSubdomainInfo[] = [];
    for (const [word, info] of this.reservedWords) {
      if (info.category === category) {
        words.push(info);
      }
    }
    return words;
  }

  /**
   * Get all reserved words
   */
  getAllReservedWords(): Map<string, ReservedSubdomainInfo> {
    return new Map(this.reservedWords);
  }

  /**
   * Get reserved words summary
   */
  getReservedWordsSummary(): {
    total: number;
    byPriority: Record<ReservedSubdomainPriority, number>;
    byCategory: Record<string, number>;
  } {
    const byPriority: Record<ReservedSubdomainPriority, number> = {
      [ReservedSubdomainPriority.CRITICAL]: 0,
      [ReservedSubdomainPriority.HIGH]: 0,
      [ReservedSubdomainPriority.MEDIUM]: 0,
      [ReservedSubdomainPriority.LOW]: 0
    };

    const byCategory: Record<string, number> = {};

    for (const [word, info] of this.reservedWords) {
      byPriority[info.priority]++;
      byCategory[info.category] = (byCategory[info.category] || 0) + 1;
    }

    return {
      total: this.reservedWords.size,
      byPriority,
      byCategory
    };
  }

  /**
   * Check if user can register a reserved subdomain
   */
  canRegisterReservedSubdomain(subdomain: string, userRole: string): boolean {
    const info = this.getReservedSubdomainInfo(subdomain);
    if (!info) return true; // Not reserved

    return info.allowedFor.includes(userRole);
  }

  /**
   * Get available subdomains for a user role
   */
  getAvailableSubdomainsForRole(userRole: string): ReservedSubdomainInfo[] {
    const available: ReservedSubdomainInfo[] = [];
    
    for (const [word, info] of this.reservedWords) {
      if (info.allowedFor.includes(userRole)) {
        available.push(info);
      }
    }

    return available;
  }
} 