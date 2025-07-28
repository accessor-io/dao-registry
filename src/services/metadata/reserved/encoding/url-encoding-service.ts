/**
 * URL Encoding Service for Subdomain Management
 * 
 * Provides   URL encoding/decoding functionality with regex patterns
 * for subdomain validation, sanitization, and proper handling of special characters.
 */

/**
 * URL encoding regex patterns for subdomain validation
 */
export const URL_ENCODING_PATTERNS = {
  // Basic subdomain character validation
  VALID_SUBDOMAIN_CHARS: /^[a-z0-9-]+$/,
  
  // URL-safe characters (RFC 3986)
  URL_SAFE_CHARS: /^[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/,
  
  // DNS-safe characters (RFC 1123)
  DNS_SAFE_CHARS: /^[a-z0-9-]+$/,
  
  // ENS-safe characters (Ethereum Name Service)
  ENS_SAFE_CHARS: /^[a-z0-9-]+$/,
  
  // Punycode pattern for internationalized domain names
  PUNYCODE_PATTERN: /^xn--[a-z0-9]+$/,
  
  // URL encoding patterns
  URL_ENCODED_CHARS: /%[0-9A-Fa-f]{2}/g,
  
  // Special characters that need encoding
  SPECIAL_CHARS: /[^A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=]/g,
  
  // Characters that need encoding in URLs
  URL_ENCODE_CHARS: /[^A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=]/g,
  
  // Characters that need encoding in DNS
  DNS_ENCODE_CHARS: /[^a-z0-9-]/g,
  
  // Characters that need encoding in ENS
  ENS_ENCODE_CHARS: /[^a-z0-9-]/g,
  
  // Unicode characters
  UNICODE_CHARS: /[\u0080-\uFFFF]/g,
  
  // Control characters
  CONTROL_CHARS: /[\u0000-\u001F\u007F-\u009F]/g,
  
  // Whitespace characters
  WHITESPACE_CHARS: /\s+/g,
  
  // Multiple hyphens
  MULTIPLE_HYPHENS: /-+/g,
  
  // Leading/trailing hyphens
  LEADING_TRAILING_HYPHENS: /^-+|-+$/g,
  
  // Invalid domain patterns
  INVALID_DOMAIN_PATTERNS: [
    /^-/,           // Starts with hyphen
    /-$/,           // Ends with hyphen
    /--/,           // Consecutive hyphens
    /^[0-9]/,       // Starts with number
    /[^a-z0-9-]/,   // Contains invalid characters
    /^$/,           // Empty string
    /^\./,          // Starts with dot
    /\.$/,          // Ends with dot
    /\.\./,         // Consecutive dots
  ],
  
  // Valid TLD patterns
  VALID_TLD_PATTERN: /^[a-z]{2,}$/,
  
  // Subdomain length validation
  SUBDOMAIN_LENGTH: {
    MIN: 1,
    MAX: 63
  },
  
  // Full domain length validation
  DOMAIN_LENGTH: {
    MIN: 1,
    MAX: 253
  }
};

/**
 * URL encoding utilities
 */
export class URLEncodingService {
  
  /**
   * Encode string for URL usage
   */
  static encodeURL(str: string): string {
    return encodeURIComponent(str);
  }
  
  /**
   * Decode URL-encoded string
   */
  static decodeURL(str: string): string {
    return decodeURIComponent(str);
  }
  
  /**
   * Encode string for DNS usage (subdomain-safe)
   */
  static encodeDNS(str: string): string {
    return str
      .toLowerCase()
      .replace(URL_ENCODING_PATTERNS.DNS_ENCODE_CHARS, '')
      .replace(URL_ENCODING_PATTERNS.MULTIPLE_HYPHENS, '-')
      .replace(URL_ENCODING_PATTERNS.LEADING_TRAILING_HYPHENS, '');
  }
  
  /**
   * Encode string for ENS usage
   */
  static encodeENS(str: string): string {
    return str
      .toLowerCase()
      .replace(URL_ENCODING_PATTERNS.ENS_ENCODE_CHARS, '')
      .replace(URL_ENCODING_PATTERNS.MULTIPLE_HYPHENS, '-')
      .replace(URL_ENCODING_PATTERNS.LEADING_TRAILING_HYPHENS, '');
  }
  
  /**
   * Sanitize subdomain for safe usage
   */
  static sanitizeSubdomain(subdomain: string): string {
    return subdomain
      .toLowerCase()
      .trim()
      .replace(URL_ENCODING_PATTERNS.WHITESPACE_CHARS, '-')
      .replace(URL_ENCODING_PATTERNS.CONTROL_CHARS, '')
      .replace(URL_ENCODING_PATTERNS.UNICODE_CHARS, '')
      .replace(URL_ENCODING_PATTERNS.DNS_ENCODE_CHARS, '')
      .replace(URL_ENCODING_PATTERNS.MULTIPLE_HYPHENS, '-')
      .replace(URL_ENCODING_PATTERNS.LEADING_TRAILING_HYPHENS, '');
  }
  
  /**
   * Validate subdomain format
   */
  static validateSubdomainFormat(subdomain: string): {
    isValid: boolean;
    errors: string[];
    sanitized?: string;
  } {
    const errors: string[] = [];
    const sanitized = this.sanitizeSubdomain(subdomain);
    
    // Check length
    if (sanitized.length < URL_ENCODING_PATTERNS.SUBDOMAIN_LENGTH.MIN) {
      errors.push(`Subdomain must be at least ${URL_ENCODING_PATTERNS.SUBDOMAIN_LENGTH.MIN} character long`);
    }
    
    if (sanitized.length > URL_ENCODING_PATTERNS.SUBDOMAIN_LENGTH.MAX) {
      errors.push(`Subdomain cannot exceed ${URL_ENCODING_PATTERNS.SUBDOMAIN_LENGTH.MAX} characters`);
    }
    
    // Check for invalid patterns
    for (const pattern of URL_ENCODING_PATTERNS.INVALID_DOMAIN_PATTERNS) {
      if (pattern.test(sanitized)) {
        errors.push(`Subdomain contains invalid pattern: ${pattern.source}`);
      }
    }
    
    // Check character set
    if (!URL_ENCODING_PATTERNS.DNS_SAFE_CHARS.test(sanitized)) {
      errors.push('Subdomain can only contain lowercase letters, numbers, and hyphens');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined
    };
  }
  
  /**
   * Validate full domain format
   */
  static validateDomainFormat(domain: string): {
    isValid: boolean;
    errors: string[];
    sanitized?: string;
  } {
    const errors: string[] = [];
    const sanitized = domain.toLowerCase().trim();
    
    // Check length
    if (sanitized.length < URL_ENCODING_PATTERNS.DOMAIN_LENGTH.MIN) {
      errors.push(`Domain must be at least ${URL_ENCODING_PATTERNS.DOMAIN_LENGTH.MIN} character long`);
    }
    
    if (sanitized.length > URL_ENCODING_PATTERNS.DOMAIN_LENGTH.MAX) {
      errors.push(`Domain cannot exceed ${URL_ENCODING_PATTERNS.DOMAIN_LENGTH.MAX} characters`);
    }
    
    // Check for dots
    if (!sanitized.includes('.')) {
      errors.push('Domain must contain at least one dot (.)');
    }
    
    // Check for consecutive dots
    if (sanitized.includes('..')) {
      errors.push('Domain cannot contain consecutive dots');
    }
    
    // Check for leading/trailing dots
    if (sanitized.startsWith('.') || sanitized.endsWith('.')) {
      errors.push('Domain cannot start or end with a dot');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined
    };
  }
  
  /**
   * Convert string to punycode (for internationalized domain names)
   */
  static toPunycode(str: string): string {
    try {
      return require('punycode').encode(str);
    } catch (error) {
      // Fallback to basic encoding
      return this.encodeDNS(str);
    }
  }
  
  /**
   * Convert punycode to Unicode
   */
  static fromPunycode(str: string): string {
    try {
      return require('punycode').decode(str);
    } catch (error) {
      // Fallback to basic decoding
      return str;
    }
  }
  
  /**
   * Check if string contains Unicode characters
   */
  static hasUnicode(str: string): boolean {
    return URL_ENCODING_PATTERNS.UNICODE_CHARS.test(str);
  }
  
  /**
   * Check if string is punycode encoded
   */
  static isPunycode(str: string): boolean {
    return URL_ENCODING_PATTERNS.PUNYCODE_PATTERN.test(str);
  }
  
  /**
   * Normalize domain name (handle Unicode, punycode, etc.)
   */
  static normalizeDomain(domain: string): string {
    let normalized = domain.toLowerCase().trim();
    
    // Handle punycode
    if (this.isPunycode(normalized)) {
      normalized = this.fromPunycode(normalized);
    }
    
    // Handle Unicode
    if (this.hasUnicode(normalized)) {
      normalized = this.toPunycode(normalized);
    }
    
    // Sanitize
    normalized = this.sanitizeSubdomain(normalized);
    
    return normalized;
  }
  
  /**
   * Generate safe subdomain from input
   */
  static generateSafeSubdomain(input: string): string {
    return this.sanitizeSubdomain(input);
  }
  
  /**
   * Check if subdomain is safe for DNS
   */
  static isDNSSafe(subdomain: string): boolean {
    const validation = this.validateSubdomainFormat(subdomain);
    return validation.isValid;
  }
  
  /**
   * Check if subdomain is safe for ENS
   */
  static isENSSafe(subdomain: string): boolean {
    const validation = this.validateSubdomainFormat(subdomain);
    return validation.isValid;
  }
  
  /**
   * Escape special characters for regex usage
   */
  static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  /**
   * Create regex pattern for subdomain matching
   */
  static createSubdomainPattern(subdomain: string): RegExp {
    const escaped = this.escapeRegex(subdomain);
    return new RegExp(`^${escaped}$`, 'i');
  }
  
  /**
   * Create regex pattern for domain matching
   */
  static createDomainPattern(domain: string): RegExp {
    const escaped = this.escapeRegex(domain);
    return new RegExp(`^${escaped}$`, 'i');
  }
  
  /**
   * Extract subdomain from full domain
   */
  static extractSubdomain(domain: string): string | null {
    const parts = domain.split('.');
    if (parts.length < 2) return null;
    
    // Remove TLD and return subdomain
    return parts.slice(0, -1).join('.');
  }
  
  /**
   * Extract TLD from full domain
   */
  static extractTLD(domain: string): string | null {
    const parts = domain.split('.');
    if (parts.length < 2) return null;
    
    return parts[parts.length - 1];
  }
  
  /**
   * Build full domain from subdomain and TLD
   */
  static buildDomain(subdomain: string, tld: string): string {
    const sanitizedSubdomain = this.sanitizeSubdomain(subdomain);
    const sanitizedTLD = tld.toLowerCase().trim();
    
    return `${sanitizedSubdomain}.${sanitizedTLD}`;
  }
  
  /**
   * Validate TLD format
   */
  static validateTLD(tld: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const sanitized = tld.toLowerCase().trim();
    
    if (!URL_ENCODING_PATTERNS.VALID_TLD_PATTERN.test(sanitized)) {
      errors.push('TLD must contain only lowercase letters and be at least 2 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Get encoding statistics
   */
  static getEncodingStats(input: string): {
    originalLength: number;
    encodedLength: number;
    hasUnicode: boolean;
    isPunycode: boolean;
    encodingRatio: number;
  } {
    const encoded = this.encodeDNS(input);
    const hasUnicode = this.hasUnicode(input);
    const isPunycode = this.isPunycode(input);
    
    return {
      originalLength: input.length,
      encodedLength: encoded.length,
      hasUnicode,
      isPunycode,
      encodingRatio: encoded.length / input.length
    };
  }
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
export class SubdomainEncodingService {
  
  /**
   * Validate and encode subdomain for DNS usage
   */
  static encodeForDNS(subdomain: string): URLEncodingValidation {
    const validation = URLEncodingService.validateSubdomainFormat(subdomain);
    
    if (!validation.isValid) {
      return {
        isValid: false,
        errors: validation.errors
      };
    }
    
    const encoded = URLEncodingService.encodeDNS(subdomain);
    const stats = URLEncodingService.getEncodingStats(subdomain);
    
    return {
      isValid: true,
      sanitized: encoded,
      encodingStats: stats
    };
  }
  
  /**
   * Validate and encode subdomain for ENS usage
   */
  static encodeForENS(subdomain: string): URLEncodingValidation {
    const validation = URLEncodingService.validateSubdomainFormat(subdomain);
    
    if (!validation.isValid) {
      return {
        isValid: false,
        errors: validation.errors
      };
    }
    
    const encoded = URLEncodingService.encodeENS(subdomain);
    const stats = URLEncodingService.getEncodingStats(subdomain);
    
    return {
      isValid: true,
      sanitized: encoded,
      encodingStats: stats
    };
  }
  
  /**
   * Generate multiple safe variations of a subdomain
   */
  static generateVariations(input: string): string[] {
    const base = URLEncodingService.sanitizeSubdomain(input);
    const variations: string[] = [base];
    
    // Add number suffix variations
    for (let i = 1; i <= 5; i++) {
      variations.push(`${base}-${i}`);
    }
    
    // Add common suffixes
    const suffixes = ['app', 'web', 'site', 'online', 'digital'];
    for (const suffix of suffixes) {
      variations.push(`${base}-${suffix}`);
    }
    
    return variations.filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates
  }
  
  /**
   * Check if subdomain is available (not in reserved list)
   */
  static isAvailable(subdomain: string, reservedList: string[]): boolean {
    const sanitized = URLEncodingService.sanitizeSubdomain(subdomain);
    return !reservedList.includes(sanitized);
  }
  
  /**
   * Find available subdomain from input
   */
  static findAvailableSubdomain(input: string, reservedList: string[]): string | null {
    const variations = this.generateVariations(input);
    
    for (const variation of variations) {
      if (this.isAvailable(variation, reservedList)) {
        return variation;
      }
    }
    
    return null;
  }
} 