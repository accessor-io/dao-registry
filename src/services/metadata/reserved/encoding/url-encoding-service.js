const punycode = require('punycode');

class URLEncodingService {
  constructor() {
    // URL encoding regex patterns
    this.patterns = {
      // Subdomain validation patterns
      subdomain: {
        valid: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
        invalid: /[^a-z0-9-]/,
        consecutiveHyphens: /--/,
        startsWithHyphen: /^-/,
        endsWithHyphen: /-$/,
        length: /^.{1,63}$/
      },
      
      // Domain validation patterns
      domain: {
        valid: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/,
        tld: /^[a-z]{2,}$/,
        length: /^.{1,253}$/
      },
      
      // URL validation patterns
      url: {
        protocol: /^https?:\/\//,
        valid: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
        domain: /^https?:\/\/([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}/,
        path: /^https?:\/\/[^\s/$.?#].[^\s]*(\/[^\s]*)?$/
      },
      
      // Unicode and punycode patterns
      unicode: {
        valid: /^[\u0000-\u007F\u0080-\uFFFF]+$/,
        ascii: /^[\u0000-\u007F]+$/,
        nonAscii: /[\u0080-\uFFFF]/
      }
    };
  }

  /**
   * Normalize a subdomain
   * @param {string} subdomain - Subdomain to normalize
   * @returns {string} Normalized subdomain
   */
  normalizeSubdomain(subdomain) {
    if (!subdomain) return '';
    
    // Convert to lowercase
    let normalized = subdomain.toLowerCase();
    
    // Remove leading/trailing whitespace
    normalized = normalized.trim();
    
    // Remove leading/trailing dots
    normalized = normalized.replace(/^\.+|\.+$/g, '');
    
    // Convert Unicode to punycode if needed
    if (this.patterns.unicode.nonAscii.test(normalized)) {
      try {
        normalized = 'xn--' + punycode.encode(normalized);
      } catch (error) {
        console.warn('Failed to encode Unicode subdomain:', error);
      }
    }
    
    return normalized;
  }

  /**
   * Validate a subdomain
   * @param {string} subdomain - Subdomain to validate
   * @returns {Object} Validation result
   */
  validateSubdomain(subdomain) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      normalized: null
    };

    if (!subdomain || subdomain.trim().length === 0) {
      result.isValid = false;
      result.errors.push('Subdomain cannot be empty');
      return result;
    }

    // Normalize the subdomain
    const normalized = this.normalizeSubdomain(subdomain);
    result.normalized = normalized;

    // Length validation
    if (normalized.length > 63) {
      result.isValid = false;
      result.errors.push('Subdomain cannot exceed 63 characters');
    }

    if (normalized.length === 0) {
      result.isValid = false;
      result.errors.push('Subdomain cannot be empty after normalization');
    }

    // Character validation
    if (this.patterns.subdomain.invalid.test(normalized)) {
      result.isValid = false;
      result.errors.push('Subdomain can only contain lowercase letters, numbers, and hyphens');
    }

    // Hyphen rules
    if (this.patterns.subdomain.startsWithHyphen.test(normalized)) {
      result.isValid = false;
      result.errors.push('Subdomain cannot start with a hyphen');
    }

    if (this.patterns.subdomain.endsWithHyphen.test(normalized)) {
      result.isValid = false;
      result.errors.push('Subdomain cannot end with a hyphen');
    }

    if (this.patterns.subdomain.consecutiveHyphens.test(normalized)) {
      result.isValid = false;
      result.errors.push('Subdomain cannot contain consecutive hyphens');
    }

    // Check for reserved terms
    const reservedTerms = ['www', 'api', 'admin', 'mail', 'ftp', 'ssh'];
    if (reservedTerms.includes(normalized)) {
      result.warnings.push(`Subdomain "${normalized}" is commonly reserved`);
    }

    return result;
  }

  /**
   * Encode a URL
   * @param {string} url - URL to encode
   * @returns {string} Encoded URL
   */
  encodeURL(url) {
    if (!url) return '';
    
    try {
      // Encode the URL
      return encodeURI(url);
    } catch (error) {
      console.error('Error encoding URL:', error);
      return url;
    }
  }

  /**
   * Decode a URL
   * @param {string} url - URL to decode
   * @returns {string} Decoded URL
   */
  decodeURL(url) {
    if (!url) return '';
    
    try {
      // Decode the URL
      return decodeURI(url);
    } catch (error) {
      console.error('Error decoding URL:', error);
      return url;
    }
  }

  /**
   * Encode Unicode to punycode
   * @param {string} text - Text to encode
   * @returns {string} Punycode encoded text
   */
  encodeUnicode(text) {
    if (!text) return '';
    
    try {
      return punycode.encode(text);
    } catch (error) {
      console.error('Error encoding Unicode:', error);
      return text;
    }
  }

  /**
   * Decode punycode to Unicode
   * @param {string} text - Text to decode
   * @returns {string} Unicode decoded text
   */
  decodeUnicode(text) {
    if (!text) return '';
    
    try {
      return punycode.decode(text);
    } catch (error) {
      console.error('Error decoding Unicode:', error);
      return text;
    }
  }

  /**
   * Sanitize a URL
   * @param {string} url - URL to sanitize
   * @returns {string} Sanitized URL
   */
  sanitizeURL(url) {
    if (!url) return '';
    
    let sanitized = url.trim();
    
    // Remove any whitespace
    sanitized = sanitized.replace(/\s+/g, '');
    
    // Ensure protocol
    if (!this.patterns.url.protocol.test(sanitized)) {
      sanitized = 'https://' + sanitized;
    }
    
    // Remove trailing slash if present
    sanitized = sanitized.replace(/\/$/, '');
    
    return sanitized;
  }

  /**
   * Validate a URL
   * @param {string} url - URL to validate
   * @returns {Object} Validation result
   */
  validateURL(url) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitized: null
    };

    if (!url || url.trim().length === 0) {
      result.isValid = false;
      result.errors.push('URL cannot be empty');
      return result;
    }

    // Sanitize the URL
    const sanitized = this.sanitizeURL(url);
    result.sanitized = sanitized;

    // Basic URL validation
    if (!this.patterns.url.valid.test(sanitized)) {
      result.isValid = false;
      result.errors.push('Invalid URL format');
    }

    // Check for valid domain
    const domainMatch = sanitized.match(this.patterns.url.domain);
    if (!domainMatch) {
      result.isValid = false;
      result.errors.push('Invalid domain in URL');
    }

    // Check URL length
    if (sanitized.length > 2048) {
      result.isValid = false;
      result.errors.push('URL cannot exceed 2048 characters');
    }

    return result;
  }

  /**
   * Extract domain from URL
   * @param {string} url - URL to extract domain from
   * @returns {string|null} Extracted domain or null
   */
  extractDomain(url) {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      console.error('Error extracting domain:', error);
      return null;
    }
  }

  /**
   * Extract subdomain from domain
   * @param {string} domain - Domain to extract subdomain from
   * @returns {string|null} Extracted subdomain or null
   */
  extractSubdomain(domain) {
    if (!domain) return null;
    
    const parts = domain.split('.');
    if (parts.length > 2) {
      return parts[0];
    }
    
    return null;
  }

  /**
   * Check if text contains Unicode characters
   * @param {string} text - Text to check
   * @returns {boolean} True if contains Unicode
   */
  containsUnicode(text) {
    if (!text) return false;
    return this.patterns.unicode.nonAscii.test(text);
  }

  /**
   * Check if text is ASCII only
   * @param {string} text - Text to check
   * @returns {boolean} True if ASCII only
   */
  isASCIIOnly(text) {
    if (!text) return true;
    return this.patterns.unicode.ascii.test(text);
  }

  /**
   * Generate a safe subdomain from text
   * @param {string} text - Text to convert to subdomain
   * @returns {string} Safe subdomain
   */
  generateSafeSubdomain(text) {
    if (!text) return '';
    
    // Convert to lowercase
    let safe = text.toLowerCase();
    
    // Replace spaces and special characters with hyphens
    safe = safe.replace(/[^a-z0-9]+/g, '-');
    
    // Remove leading/trailing hyphens
    safe = safe.replace(/^-+|-+$/g, '');
    
    // Limit length
    if (safe.length > 63) {
      safe = safe.substring(0, 63);
      // Remove trailing hyphen if present
      safe = safe.replace(/-$/, '');
    }
    
    return safe;
  }
}

module.exports = {
  URLEncodingService
}; 