const { URLEncodingService } = require('./url-encoding-service');

class ReservedSubdomainsService {
  constructor(ensResolver) {
    this.ensResolver = ensResolver;
    this.urlEncodingService = new URLEncodingService();
    
    // Reserved subdomains with priority levels
    this.reservedWords = new Map([
      // Priority 1: Critical system subdomains
      ['www', { priority: 1, category: 'system', description: 'World Wide Web', allowedFor: ['system'], restrictions: ['blocked'] }],
      ['api', { priority: 1, category: 'system', description: 'Application Programming Interface', allowedFor: ['system'], restrictions: ['blocked'] }],
      ['admin', { priority: 1, category: 'system', description: 'Administrative interface', allowedFor: ['system'], restrictions: ['blocked'] }],
      ['mail', { priority: 1, category: 'system', description: 'Email services', allowedFor: ['system'], restrictions: ['blocked'] }],
      ['ftp', { priority: 1, category: 'system', description: 'File Transfer Protocol', allowedFor: ['system'], restrictions: ['blocked'] }],
      ['ssh', { priority: 1, category: 'system', description: 'Secure Shell', allowedFor: ['system'], restrictions: ['blocked'] }],
      ['dns', { priority: 1, category: 'system', description: 'Domain Name System', allowedFor: ['system'], restrictions: ['blocked'] }],
      ['ns', { priority: 1, category: 'system', description: 'Name Server', allowedFor: ['system'], restrictions: ['blocked'] }],
      ['mx', { priority: 1, category: 'system', description: 'Mail Exchange', allowedFor: ['system'], restrictions: ['blocked'] }],
      ['smtp', { priority: 1, category: 'system', description: 'Simple Mail Transfer Protocol', allowedFor: ['system'], restrictions: ['blocked'] }],
      
      // Priority 2: Common web services
      ['blog', { priority: 2, category: 'web', description: 'Blogging platform', allowedFor: ['verified'], restrictions: ['approval_required'] }],
      ['shop', { priority: 2, category: 'web', description: 'E-commerce platform', allowedFor: ['verified'], restrictions: ['approval_required'] }],
      ['store', { priority: 2, category: 'web', description: 'Online store', allowedFor: ['verified'], restrictions: ['approval_required'] }],
      ['app', { priority: 2, category: 'web', description: 'Web application', allowedFor: ['verified'], restrictions: ['approval_required'] }],
      ['docs', { priority: 2, category: 'web', description: 'Documentation', allowedFor: ['verified'], restrictions: ['approval_required'] }],
      ['help', { priority: 2, category: 'web', description: 'Help and support', allowedFor: ['verified'], restrictions: ['approval_required'] }],
      ['support', { priority: 2, category: 'web', description: 'Customer support', allowedFor: ['verified'], restrictions: ['approval_required'] }],
      ['status', { priority: 2, category: 'web', description: 'Service status', allowedFor: ['verified'], restrictions: ['approval_required'] }],
      ['cdn', { priority: 2, category: 'web', description: 'Content Delivery Network', allowedFor: ['verified'], restrictions: ['approval_required'] }],
      ['assets', { priority: 2, category: 'web', description: 'Static assets', allowedFor: ['verified'], restrictions: ['approval_required'] }],
      
      // Priority 3: Brand and trademark terms
      ['google', { priority: 3, category: 'brand', description: 'Google brand', allowedFor: ['google'], restrictions: ['trademark'] }],
      ['facebook', { priority: 3, category: 'brand', description: 'Facebook brand', allowedFor: ['facebook'], restrictions: ['trademark'] }],
      ['twitter', { priority: 3, category: 'brand', description: 'Twitter brand', allowedFor: ['twitter'], restrictions: ['trademark'] }],
      ['amazon', { priority: 3, category: 'brand', description: 'Amazon brand', allowedFor: ['amazon'], restrictions: ['trademark'] }],
      ['apple', { priority: 3, category: 'brand', description: 'Apple brand', allowedFor: ['apple'], restrictions: ['trademark'] }],
      ['microsoft', { priority: 3, category: 'brand', description: 'Microsoft brand', allowedFor: ['microsoft'], restrictions: ['trademark'] }],
      ['netflix', { priority: 3, category: 'brand', description: 'Netflix brand', allowedFor: ['netflix'], restrictions: ['trademark'] }],
      ['spotify', { priority: 3, category: 'brand', description: 'Spotify brand', allowedFor: ['spotify'], restrictions: ['trademark'] }],
      ['uber', { priority: 3, category: 'brand', description: 'Uber brand', allowedFor: ['uber'], restrictions: ['trademark'] }],
      ['airbnb', { priority: 3, category: 'brand', description: 'Airbnb brand', allowedFor: ['airbnb'], restrictions: ['trademark'] }],
      
      // Priority 4: Generic terms and common words
      ['test', { priority: 4, category: 'generic', description: 'Testing environment', allowedFor: ['all'], restrictions: ['monitoring'] }],
      ['demo', { priority: 4, category: 'generic', description: 'Demonstration', allowedFor: ['all'], restrictions: ['monitoring'] }],
      ['dev', { priority: 4, category: 'generic', description: 'Development environment', allowedFor: ['all'], restrictions: ['monitoring'] }],
      ['staging', { priority: 4, category: 'generic', description: 'Staging environment', allowedFor: ['all'], restrictions: ['monitoring'] }],
      ['beta', { priority: 4, category: 'generic', description: 'Beta version', allowedFor: ['all'], restrictions: ['monitoring'] }],
      ['alpha', { priority: 4, category: 'generic', description: 'Alpha version', allowedFor: ['all'], restrictions: ['monitoring'] }],
      ['new', { priority: 4, category: 'generic', description: 'New features', allowedFor: ['all'], restrictions: ['monitoring'] }],
      ['old', { priority: 4, category: 'generic', description: 'Legacy content', allowedFor: ['all'], restrictions: ['monitoring'] }],
      ['mobile', { priority: 4, category: 'generic', description: 'Mobile version', allowedFor: ['all'], restrictions: ['monitoring'] }],
      ['desktop', { priority: 4, category: 'generic', description: 'Desktop version', allowedFor: ['all'], restrictions: ['monitoring'] }]
    ]);
  }

  /**
   * Check if a subdomain is reserved
   * @param {string} subdomain - Subdomain to check
   * @returns {boolean} True if reserved
   */
  isReserved(subdomain) {
    if (!subdomain) return false;
    
    const normalized = this.urlEncodingService.normalizeSubdomain(subdomain);
    return this.reservedWords.has(normalized);
  }

  /**
   * Get priority level of a reserved subdomain
   * @param {string} subdomain - Subdomain to check
   * @returns {number} Priority level (1-4) or 0 if not reserved
   */
  getPriority(subdomain) {
    if (!this.isReserved(subdomain)) return 0;
    
    const normalized = this.urlEncodingService.normalizeSubdomain(subdomain);
    const info = this.reservedWords.get(normalized);
    return info ? info.priority : 0;
  }

  /**
   * Get reserved subdomain information
   * @param {string} subdomain - Subdomain to check
   * @returns {Object|null} Subdomain information or null if not reserved
   */
  getReservedSubdomainInfo(subdomain) {
    if (!this.isReserved(subdomain)) return null;
    
    const normalized = this.urlEncodingService.normalizeSubdomain(subdomain);
    return this.reservedWords.get(normalized) || null;
  }

  /**
   * Get all reserved words
   * @returns {Map} Map of all reserved words
   */
  getAllReservedWords() {
    return this.reservedWords;
  }

  /**
   * Get reserved words by priority level
   * @param {number} priority - Priority level (1-4)
   * @returns {Array} Array of subdomains with the specified priority
   */
  getReservedWordsByPriority(priority) {
    const words = [];
    for (const [subdomain, info] of this.reservedWords) {
      if (info.priority === priority) {
        words.push(subdomain);
      }
    }
    return words;
  }

  /**
   * Get reserved words by category
   * @param {string} category - Category to filter by
   * @returns {Array} Array of subdomain info objects
   */
  getReservedWordsByCategory(category) {
    const words = [];
    for (const [subdomain, info] of this.reservedWords) {
      if (info.category === category) {
        words.push({
          subdomain,
          ...info
        });
      }
    }
    return words;
  }

  /**
   * Get summary of reserved words
   * @returns {Object} Summary statistics
   */
  getReservedWordsSummary() {
    const summary = {
      total: this.reservedWords.size,
      byPriority: { 1: 0, 2: 0, 3: 0, 4: 0 },
      byCategory: {}
    };

    for (const [subdomain, info] of this.reservedWords) {
      summary.byPriority[info.priority]++;
      summary.byCategory[info.category] = (summary.byCategory[info.category] || 0) + 1;
    }

    return summary;
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
      suggestions: []
    };

    // Basic validation
    if (!subdomain || subdomain.trim().length === 0) {
      result.isValid = false;
      result.errors.push('Subdomain cannot be empty');
      return result;
    }

    // Length validation
    if (subdomain.length > 63) {
      result.isValid = false;
      result.errors.push('Subdomain cannot exceed 63 characters');
    }

    // Character validation
    const validChars = /^[a-z0-9-]+$/;
    if (!validChars.test(subdomain)) {
      result.isValid = false;
      result.errors.push('Subdomain can only contain lowercase letters, numbers, and hyphens');
    }

    // Hyphen rules
    if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
      result.isValid = false;
      result.errors.push('Subdomain cannot start or end with a hyphen');
    }

    if (subdomain.includes('--')) {
      result.isValid = false;
      result.errors.push('Subdomain cannot contain consecutive hyphens');
    }

    // Check if reserved
    if (this.isReserved(subdomain)) {
      const info = this.getReservedSubdomainInfo(subdomain);
      result.warnings.push(`Subdomain "${subdomain}" is reserved (Priority ${info.priority}: ${info.description})`);
      
      if (info.restrictions.includes('blocked')) {
        result.isValid = false;
        result.errors.push(`Subdomain "${subdomain}" is blocked`);
      }
    }

    // Suggestions for similar available subdomains
    if (this.isReserved(subdomain)) {
      const suggestions = this.getSimilarAvailableSubdomains(subdomain);
      if (suggestions.length > 0) {
        result.suggestions = suggestions;
      }
    }

    return result;
  }

  /**
   * Validate ENS subdomain
   * @param {string} parentDomain - Parent domain
   * @param {string} subdomain - Subdomain to validate
   * @returns {Object} ENS validation result
   */
  async validateENSSubdomain(parentDomain, subdomain) {
    try {
      if (!this.ensResolver) {
        return {
          isValid: false,
          error: 'ENS resolver not available'
        };
      }

      const fullDomain = `${subdomain}.${parentDomain}`;
      const isAvailable = await this.ensResolver.isDomainAvailable(fullDomain);
      const isRegistered = await this.ensResolver.isDomainRegistered(fullDomain);

      return {
        isValid: isAvailable,
        isAvailable,
        isRegistered,
        fullDomain,
        parentDomain,
        subdomain
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Get similar available subdomains
   * @param {string} subdomain - Original subdomain
   * @returns {Array} Array of suggested subdomains
   */
  getSimilarAvailableSubdomains(subdomain) {
    const suggestions = [];
    const base = subdomain.replace(/[^a-z0-9]/g, '');
    
    // Add common prefixes/suffixes
    const prefixes = ['my', 'our', 'the', 'get', 'use'];
    const suffixes = ['app', 'site', 'web', 'online', 'digital'];
    
    for (const prefix of prefixes) {
      const suggestion = `${prefix}${base}`;
      if (!this.isReserved(suggestion)) {
        suggestions.push(suggestion);
      }
    }
    
    for (const suffix of suffixes) {
      const suggestion = `${base}${suffix}`;
      if (!this.isReserved(suggestion)) {
        suggestions.push(suggestion);
      }
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }
}

module.exports = {
  ReservedSubdomainsService
}; 