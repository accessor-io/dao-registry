interface ENSResolverService {
    resolveAddress(domain: string): Promise<string | null>;
}
/**
 * Reserved subdomain priority levels
 */
export declare enum ReservedSubdomainPriority {
    CRITICAL = 1,// Never available
    HIGH = 2,// Requires special permission
    MEDIUM = 3,// Available with registration
    LOW = 4
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
    sanitized?: string;
    encodingStats?: {
        originalLength: number;
        encodedLength: number;
        hasUnicode: boolean;
        isPunycode: boolean;
        encodingRatio: number;
    };
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
    sanitized?: string | undefined;
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
export declare class ReservedSubdomainsService {
    private reservedWords;
    private reservedPrefixes;
    private reservedSuffixes;
    private ensResolver;
    constructor(ensResolver: ENSResolverService);
    /**
     * Initialize critical reserved subdomains (Priority 1)
     */
    private initializeCriticalReserved;
    /**
     * Initialize high priority reserved subdomains (Priority 2)
     */
    private initializeHighPriorityReserved;
    /**
     * Initialize medium priority reserved subdomains (Priority 3)
     */
    private initializeMediumPriorityReserved;
    /**
     * Initialize reserved prefixes
     */
    private initializeReservedPrefixes;
    /**
     * Initialize reserved suffixes
     */
    private initializeReservedSuffixes;
    /**
     * Initialize all reserved words
     */
    private initializeReservedWords;
    /**
     * Check if a subdomain is reserved
     */
    isReserved(subdomain: string): boolean;
    /**
     * Get priority level for a subdomain
     */
    getPriority(subdomain: string): ReservedSubdomainPriority;
    /**
     * Get reserved subdomain information
     */
    getReservedSubdomainInfo(subdomain: string): ReservedSubdomainInfo | null;
    /**
     * Validate subdomain format and reserved word status with URL encoding
     */
    validateSubdomain(subdomain: string): SubdomainValidationResult;
    /**
     * Validate ENS subdomain with full domain context and URL encoding
     */
    validateENSSubdomain(parentDomain: string, subdomain: string): Promise<ENSValidationResult>;
    /**
     * Get all reserved words by priority
     */
    getReservedWordsByPriority(priority: ReservedSubdomainPriority): string[];
    /**
     * Get all reserved words by category
     */
    getReservedWordsByCategory(category: string): ReservedSubdomainInfo[];
    /**
     * Get all reserved words
     */
    getAllReservedWords(): Map<string, ReservedSubdomainInfo>;
    /**
     * Get reserved words summary
     */
    getReservedWordsSummary(): {
        total: number;
        byPriority: Record<ReservedSubdomainPriority, number>;
        byCategory: Record<string, number>;
    };
    /**
     * Check if user can register a reserved subdomain
     */
    canRegisterReservedSubdomain(subdomain: string, userRole: string): boolean;
    /**
     * Get available subdomains for a user role
     */
    getAvailableSubdomainsForRole(userRole: string): ReservedSubdomainInfo[];
    /**
     * Generate safe subdomain variations
     */
    generateSafeVariations(input: string): string[];
    /**
     * Find available subdomain from input
     */
    findAvailableSubdomain(input: string): string | null;
    /**
     * Check if subdomain is DNS safe
     */
    isDNSSafe(subdomain: string): boolean;
    /**
     * Check if subdomain is ENS safe
     */
    isENSSafe(subdomain: string): boolean;
    /**
     * Normalize subdomain for consistent handling
     */
    normalizeSubdomain(subdomain: string): string;
}
export {};
//# sourceMappingURL=reserved-subdomains-service.d.ts.map