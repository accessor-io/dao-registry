"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservedSubdomainsService = exports.ReservedSubdomainPriority = void 0;
const url_encoding_service_1 = require("./url-encoding-service");
/**
 * Reserved subdomain priority levels
 */
var ReservedSubdomainPriority;
(function (ReservedSubdomainPriority) {
    ReservedSubdomainPriority[ReservedSubdomainPriority["CRITICAL"] = 1] = "CRITICAL";
    ReservedSubdomainPriority[ReservedSubdomainPriority["HIGH"] = 2] = "HIGH";
    ReservedSubdomainPriority[ReservedSubdomainPriority["MEDIUM"] = 3] = "MEDIUM";
    ReservedSubdomainPriority[ReservedSubdomainPriority["LOW"] = 4] = "LOW"; // Available with approval
})(ReservedSubdomainPriority || (exports.ReservedSubdomainPriority = ReservedSubdomainPriority = {}));
/**
 * Reserved Subdomains Service
 *
 * Manages reserved subdomains for the DAO Registry system,
 * providing validation, priority management, and ENS integration.
 */
class ReservedSubdomainsService {
    constructor(ensResolver) {
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
    initializeCriticalReserved() {
        const critical = [
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
    initializeHighPriorityReserved() {
        const highPriority = [
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
    initializeMediumPriorityReserved() {
        const mediumPriority = [
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
    initializeReservedPrefixes() {
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
    initializeReservedSuffixes() {
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
    initializeReservedWords() {
        this.initializeCriticalReserved();
        this.initializeHighPriorityReserved();
        this.initializeMediumPriorityReserved();
    }
    /**
     * Check if a subdomain is reserved
     */
    isReserved(subdomain) {
        const sanitized = url_encoding_service_1.URLEncodingService.sanitizeSubdomain(subdomain);
        return this.reservedWords.has(sanitized);
    }
    /**
     * Get priority level for a subdomain
     */
    getPriority(subdomain) {
        const sanitized = url_encoding_service_1.URLEncodingService.sanitizeSubdomain(subdomain);
        const info = this.reservedWords.get(sanitized);
        return info ? info.priority : ReservedSubdomainPriority.LOW;
    }
    /**
     * Get reserved subdomain information
     */
    getReservedSubdomainInfo(subdomain) {
        const sanitized = url_encoding_service_1.URLEncodingService.sanitizeSubdomain(subdomain);
        return this.reservedWords.get(sanitized) || null;
    }
    /**
     * Validate subdomain format and reserved word status with URL encoding
     */
    validateSubdomain(subdomain) {
        // First, validate and sanitize using URL encoding service
        const urlValidation = url_encoding_service_1.URLEncodingService.validateSubdomainFormat(subdomain);
        const encodingStats = url_encoding_service_1.URLEncodingService.getEncodingStats(subdomain);
        const errors = [...urlValidation.errors];
        const sanitized = urlValidation.sanitized;
        if (!sanitized) {
            return {
                isValid: false,
                errors,
                encodingStats
            };
        }
        // Check if subdomain is reserved
        if (this.isReserved(sanitized)) {
            const info = this.getReservedSubdomainInfo(sanitized);
            errors.push(`Subdomain "${subdomain}" is reserved (${info?.category})`);
        }
        // Check if subdomain starts with reserved prefix
        for (const prefix of this.reservedPrefixes) {
            if (sanitized.startsWith(prefix)) {
                errors.push(`Subdomain cannot start with reserved prefix "${prefix}"`);
                break;
            }
        }
        // Check if subdomain ends with reserved suffix
        for (const suffix of this.reservedSuffixes) {
            if (sanitized.endsWith(suffix)) {
                errors.push(`Subdomain cannot end with reserved suffix "${suffix}"`);
                break;
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            isReserved: this.isReserved(sanitized),
            priority: this.getPriority(sanitized),
            sanitized,
            encodingStats
        };
    }
    /**
     * Validate ENS subdomain with full domain context and URL encoding
     */
    async validateENSSubdomain(parentDomain, subdomain) {
        // Validate parent domain format
        const parentDomainValidation = url_encoding_service_1.URLEncodingService.validateDomainFormat(parentDomain);
        if (!parentDomainValidation.isValid) {
            return {
                isValid: false,
                errors: parentDomainValidation.errors,
                domain: `${subdomain}.${parentDomain}`
            };
        }
        // Validate subdomain format
        const subdomainValidation = this.validateSubdomain(subdomain);
        const errors = [...subdomainValidation.errors];
        const fullDomain = subdomainValidation.sanitized
            ? `${subdomainValidation.sanitized}.${parentDomainValidation.sanitized}`
            : `${subdomain}.${parentDomain}`;
        // Check if domain already exists
        try {
            const existingAddress = await this.ensResolver.resolveAddress(fullDomain);
            if (existingAddress) {
                errors.push(`Domain "${fullDomain}" already exists`);
            }
        }
        catch (error) {
            // Domain doesn't exist, which is good
        }
        return {
            isValid: errors.length === 0,
            errors,
            domain: fullDomain,
            exists: errors.some(error => error.includes('already exists')),
            sanitized: subdomainValidation.sanitized || undefined
        };
    }
    /**
     * Get all reserved words by priority
     */
    getReservedWordsByPriority(priority) {
        const words = [];
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
    getReservedWordsByCategory(category) {
        const words = [];
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
    getAllReservedWords() {
        return new Map(this.reservedWords);
    }
    /**
     * Get reserved words summary
     */
    getReservedWordsSummary() {
        const byPriority = {
            [ReservedSubdomainPriority.CRITICAL]: 0,
            [ReservedSubdomainPriority.HIGH]: 0,
            [ReservedSubdomainPriority.MEDIUM]: 0,
            [ReservedSubdomainPriority.LOW]: 0
        };
        const byCategory = {};
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
    canRegisterReservedSubdomain(subdomain, userRole) {
        const sanitized = url_encoding_service_1.URLEncodingService.sanitizeSubdomain(subdomain);
        const info = this.getReservedSubdomainInfo(sanitized);
        if (!info)
            return true; // Not reserved
        return info.allowedFor.includes(userRole);
    }
    /**
     * Get available subdomains for a user role
     */
    getAvailableSubdomainsForRole(userRole) {
        const available = [];
        for (const [word, info] of this.reservedWords) {
            if (info.allowedFor.includes(userRole)) {
                available.push(info);
            }
        }
        return available;
    }
    /**
     * Generate safe subdomain variations
     */
    generateSafeVariations(input) {
        return url_encoding_service_1.SubdomainEncodingService.generateVariations(input);
    }
    /**
     * Find available subdomain from input
     */
    findAvailableSubdomain(input) {
        const reservedList = Array.from(this.reservedWords.keys());
        return url_encoding_service_1.SubdomainEncodingService.findAvailableSubdomain(input, reservedList);
    }
    /**
     * Check if subdomain is DNS safe
     */
    isDNSSafe(subdomain) {
        return url_encoding_service_1.URLEncodingService.isDNSSafe(subdomain);
    }
    /**
     * Check if subdomain is ENS safe
     */
    isENSSafe(subdomain) {
        return url_encoding_service_1.URLEncodingService.isENSSafe(subdomain);
    }
    /**
     * Normalize subdomain for consistent handling
     */
    normalizeSubdomain(subdomain) {
        return url_encoding_service_1.URLEncodingService.sanitizeSubdomain(subdomain);
    }
}
exports.ReservedSubdomainsService = ReservedSubdomainsService;
//# sourceMappingURL=reserved-subdomains-service.js.map