/**
 * URL Encoding Service for Subdomain Management
 *
 * Provides   URL encoding/decoding functionality with regex patterns
 * for subdomain validation, sanitization, and proper handling of special characters.
 */
/**
 * URL encoding regex patterns for subdomain validation
 */
export declare const URL_ENCODING_PATTERNS: {
    VALID_SUBDOMAIN_CHARS: RegExp;
    URL_SAFE_CHARS: RegExp;
    DNS_SAFE_CHARS: RegExp;
    ENS_SAFE_CHARS: RegExp;
    PUNYCODE_PATTERN: RegExp;
    URL_ENCODED_CHARS: RegExp;
    SPECIAL_CHARS: RegExp;
    URL_ENCODE_CHARS: RegExp;
    DNS_ENCODE_CHARS: RegExp;
    ENS_ENCODE_CHARS: RegExp;
    UNICODE_CHARS: RegExp;
    CONTROL_CHARS: RegExp;
    WHITESPACE_CHARS: RegExp;
    MULTIPLE_HYPHENS: RegExp;
    LEADING_TRAILING_HYPHENS: RegExp;
    INVALID_DOMAIN_PATTERNS: RegExp[];
    VALID_TLD_PATTERN: RegExp;
    SUBDOMAIN_LENGTH: {
        MIN: number;
        MAX: number;
    };
    DOMAIN_LENGTH: {
        MIN: number;
        MAX: number;
    };
};
/**
 * URL encoding utilities
 */
export declare class URLEncodingService {
    /**
     * Encode string for URL usage
     */
    static encodeURL(str: string): string;
    /**
     * Decode URL-encoded string
     */
    static decodeURL(str: string): string;
    /**
     * Encode string for DNS usage (subdomain-safe)
     */
    static encodeDNS(str: string): string;
    /**
     * Encode string for ENS usage
     */
    static encodeENS(str: string): string;
    /**
     * Sanitize subdomain for safe usage
     */
    static sanitizeSubdomain(subdomain: string): string;
    /**
     * Validate subdomain format
     */
    static validateSubdomainFormat(subdomain: string): {
        isValid: boolean;
        errors: string[];
        sanitized?: string;
    };
    /**
     * Validate full domain format
     */
    static validateDomainFormat(domain: string): {
        isValid: boolean;
        errors: string[];
        sanitized?: string;
    };
    /**
     * Convert string to punycode (for internationalized domain names)
     */
    static toPunycode(str: string): string;
    /**
     * Convert punycode to Unicode
     */
    static fromPunycode(str: string): string;
    /**
     * Check if string contains Unicode characters
     */
    static hasUnicode(str: string): boolean;
    /**
     * Check if string is punycode encoded
     */
    static isPunycode(str: string): boolean;
    /**
     * Normalize domain name (handle Unicode, punycode, etc.)
     */
    static normalizeDomain(domain: string): string;
    /**
     * Generate safe subdomain from input
     */
    static generateSafeSubdomain(input: string): string;
    /**
     * Check if subdomain is safe for DNS
     */
    static isDNSSafe(subdomain: string): boolean;
    /**
     * Check if subdomain is safe for ENS
     */
    static isENSSafe(subdomain: string): boolean;
    /**
     * Escape special characters for regex usage
     */
    static escapeRegex(str: string): string;
    /**
     * Create regex pattern for subdomain matching
     */
    static createSubdomainPattern(subdomain: string): RegExp;
    /**
     * Create regex pattern for domain matching
     */
    static createDomainPattern(domain: string): RegExp;
    /**
     * Extract subdomain from full domain
     */
    static extractSubdomain(domain: string): string | null;
    /**
     * Extract TLD from full domain
     */
    static extractTLD(domain: string): string | null;
    /**
     * Build full domain from subdomain and TLD
     */
    static buildDomain(subdomain: string, tld: string): string;
    /**
     * Validate TLD format
     */
    static validateTLD(tld: string): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Get encoding statistics
     */
    static getEncodingStats(input: string): {
        originalLength: number;
        encodedLength: number;
        hasUnicode: boolean;
        isPunycode: boolean;
        encodingRatio: number;
    };
}
/**
 * URL encoding validation interface
 */
export interface URLEncodingValidation {
    isValid: boolean;
    errors: string[];
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
 * Subdomain encoding utilities
 */
export declare class SubdomainEncodingService {
    /**
     * Validate and encode subdomain for DNS usage
     */
    static encodeForDNS(subdomain: string): URLEncodingValidation;
    /**
     * Validate and encode subdomain for ENS usage
     */
    static encodeForENS(subdomain: string): URLEncodingValidation;
    /**
     * Generate multiple safe variations of a subdomain
     */
    static generateVariations(input: string): string[];
    /**
     * Check if subdomain is available (not in reserved list)
     */
    static isAvailable(subdomain: string, reservedList: string[]): boolean;
    /**
     * Find available subdomain from input
     */
    static findAvailableSubdomain(input: string, reservedList: string[]): string | null;
}
//# sourceMappingURL=url-encoding-service.d.ts.map