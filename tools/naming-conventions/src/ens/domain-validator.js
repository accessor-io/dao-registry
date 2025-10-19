/**
 * ENS Domain Validator
 * Validates ENS domain names according to DAO Registry standards
 */

const { ethers } = require('ethers');
const Joi = require('joi');

class ENSDomainValidator {
  constructor() {
    this.reservedSubdomains = new Set([
      'www', 'api', 'docs', 'governance', 'treasury', 'token',
      'forum', 'analytics', 'admin', 'app', 'blog', 'help',
      'support', 'status', 'mail', 'email', 'ftp', 'smtp'
    ]);

    this.domainSchema = Joi.object({
      domain: Joi.string().required(),
      type: Joi.string().valid('primary', 'subdomain').required(),
      parentDomain: Joi.string().when('type', {
        is: 'subdomain',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    });
  }

  /**
   * Validate ENS domain format and compliance
   * @param {string} domain - Domain to validate
   * @param {string} type - Type of domain (primary or subdomain)
   * @returns {Object} Validation result
   */
  validateDomain(domain, type = 'primary') {
    const result = {
      isValid: false,
      errors: [],
      warnings: [],
      suggestions: [],
      normalizedDomain: null
    };

    try {
      // Basic format validation
      if (!domain || typeof domain !== 'string') {
        result.errors.push('Domain must be a non-empty string');
        return result;
      }

      // Normalize domain
      const normalized = this.normalizeDomain(domain);
      result.normalizedDomain = normalized;

      // Check if it's a valid ENS domain
      if (!this.isValidENSFormat(normalized)) {
        result.errors.push('Invalid ENS domain format');
        return result;
      }

      // Type-specific validation
      if (type === 'primary') {
        this.validatePrimaryDomain(normalized, result);
      } else if (type === 'subdomain') {
        this.validateSubdomain(normalized, result);
      }

      // Check for reserved names
      this.checkReservedNames(normalized, result);

      // Check length constraints
      this.checkLengthConstraints(normalized, result);

      // Check character constraints
      this.checkCharacterConstraints(normalized, result);

      result.isValid = result.errors.length === 0;

    } catch (error) {
      result.errors.push(`Validation error: ${error.message}`);
    }

    return result;
  }

  /**
   * Validate primary DAO domain
   * @param {string} domain - Domain to validate
   * @param {Object} result - Result object to update
   */
  validatePrimaryDomain(domain, result) {
    const parts = domain.split('.');
    
    if (parts.length !== 2) {
      result.errors.push('Primary domain must have exactly one label before .eth');
      return;
    }

    const [label, tld] = parts;
    
    if (tld !== 'eth') {
      result.errors.push('Primary domain must use .eth TLD');
      return;
    }

    // Check DAO naming conventions
    if (!this.isValidDAOName(label)) {
      result.errors.push('Domain label does not follow DAO naming conventions');
      result.suggestions.push(this.suggestDAOName(label));
    }

    // Check for common issues
    if (label.length < 3) {
      result.warnings.push('Domain label is very short, consider a more descriptive name');
    }

    if (label.includes('-') && !label.match(/^[a-z0-9]+(-[a-z0-9]+)*$/)) {
      result.warnings.push('Hyphens should only be used to separate words');
    }
  }

  /**
   * Validate subdomain
   * @param {string} domain - Domain to validate
   * @param {Object} result - Result object to update
   */
  validateSubdomain(domain, result) {
    const parts = domain.split('.');
    
    if (parts.length < 3) {
      result.errors.push('Subdomain must have at least one subdomain label');
      return;
    }

    const subdomainLabel = parts[0];
    const parentDomain = parts.slice(1).join('.');

    // Validate subdomain label
    if (!this.isValidSubdomainLabel(subdomainLabel)) {
      result.errors.push(`Invalid subdomain label: ${subdomainLabel}`);
    }

    // Check if parent domain is valid
    const parentValidation = this.validateDomain(parentDomain, 'primary');
    if (!parentValidation.isValid) {
      result.errors.push(`Invalid parent domain: ${parentValidation.errors.join(', ')}`);
    }

    // Suggest standard subdomain types
    if (!this.isStandardSubdomainType(subdomainLabel)) {
      result.suggestions.push(`Consider using standard subdomain types: governance, treasury, token, docs, forum, analytics`);
    }
  }

  /**
   * Check if domain follows valid ENS format
   * @param {string} domain - Domain to check
   * @returns {boolean}
   */
  isValidENSFormat(domain) {
    try {
      // Basic ENS format check
      return domain.includes('.') && 
             domain.endsWith('.eth') && 
             domain.length > 4 &&
             domain.length <= 255;
    } catch {
      return false;
    }
  }

  /**
   * Check if name follows DAO naming conventions
   * @param {string} name - Name to check
   * @returns {boolean}
   */
  isValidDAOName(name) {
    // DAO names should be lowercase, alphanumeric with optional hyphens
    const daoNamePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    return daoNamePattern.test(name) && name.length >= 3 && name.length <= 63;
  }

  /**
   * Check if subdomain label is valid
   * @param {string} label - Label to check
   * @returns {boolean}
   */
  isValidSubdomainLabel(label) {
    const subdomainPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    return subdomainPattern.test(label) && label.length >= 1 && label.length <= 63;
  }

  /**
   * Check if subdomain type is standard
   * @param {string} type - Subdomain type to check
   * @returns {boolean}
   */
  isStandardSubdomainType(type) {
    const standardTypes = [
      'governance', 'treasury', 'token', 'docs', 'forum', 
      'analytics', 'api', 'app', 'www', 'blog'
    ];
    return standardTypes.includes(type);
  }

  /**
   * Check for reserved names
   * @param {string} domain - Domain to check
   * @param {Object} result - Result object to update
   */
  checkReservedNames(domain, result) {
    const parts = domain.split('.');
    const label = parts[0];

    if (this.reservedSubdomains.has(label)) {
      result.warnings.push(`"${label}" is a reserved subdomain name`);
    }
  }

  /**
   * Check length constraints
   * @param {string} domain - Domain to check
   * @param {Object} result - Result object to update
   */
  checkLengthConstraints(domain, result) {
    if (domain.length > 255) {
      result.errors.push('Domain exceeds maximum length of 255 characters');
    }

    const parts = domain.split('.');
    for (const part of parts) {
      if (part.length > 63) {
        result.errors.push(`Domain part "${part}" exceeds maximum length of 63 characters`);
      }
    }
  }

  /**
   * Check character constraints
   * @param {string} domain - Domain to check
   * @param {Object} result - Result object to update
   */
  checkCharacterConstraints(domain, result) {
    // Check for invalid characters
    if (!/^[a-z0-9.-]+$/.test(domain)) {
      result.errors.push('Domain contains invalid characters. Only lowercase letters, numbers, hyphens, and dots are allowed');
    }

    // Check for consecutive dots or hyphens
    if (domain.includes('..') || domain.includes('--')) {
      result.errors.push('Domain cannot contain consecutive dots or hyphens');
    }

    // Check for leading/trailing hyphens
    const parts = domain.split('.');
    for (const part of parts) {
      if (part.startsWith('-') || part.endsWith('-')) {
        result.errors.push(`Domain part "${part}" cannot start or end with a hyphen`);
      }
    }
  }

  /**
   * Normalize domain name
   * @param {string} domain - Domain to normalize
   * @returns {string} Normalized domain
   */
  normalizeDomain(domain) {
    if (!domain) return '';
    
    return domain
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')  // Replace spaces with hyphens
      .replace(/[^a-z0-9.-]/g, '')  // Remove invalid characters
      .replace(/\.+/g, '.')  // Replace multiple dots with single dot
      .replace(/-+/g, '-');  // Replace multiple hyphens with single hyphen
  }

  /**
   * Suggest DAO name based on input
   * @param {string} input - Input name
   * @returns {string} Suggested name
   */
  suggestDAOName(input) {
    if (!input) return '';

    let suggestion = input
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Ensure it starts and ends with alphanumeric
    if (!/^[a-z0-9]/.test(suggestion)) {
      suggestion = 'dao-' + suggestion;
    }
    if (!/[a-z0-9]$/.test(suggestion)) {
      suggestion = suggestion + '-dao';
    }

    return suggestion;
  }

  /**
   * Generate standard subdomains for a DAO
   * @param {string} primaryDomain - Primary DAO domain
   * @returns {Array} Array of suggested subdomains
   */
  generateStandardSubdomains(primaryDomain) {
    const standardTypes = [
      'governance',
      'treasury', 
      'token',
      'docs',
      'forum',
      'analytics'
    ];

    return standardTypes.map(type => `${type}.${primaryDomain}`);
  }

  /**
   * Validate multiple domains
   * @param {Array} domains - Array of domains to validate
   * @returns {Object} Validation results
   */
  validateMultipleDomains(domains) {
    const results = {
      valid: [],
      invalid: [],
      warnings: [],
      summary: {
        total: domains.length,
        valid: 0,
        invalid: 0,
        withWarnings: 0
      }
    };

    for (const domain of domains) {
      const validation = this.validateDomain(domain);
      
      if (validation.isValid) {
        results.valid.push({
          domain,
          normalized: validation.normalizedDomain,
          warnings: validation.warnings,
          suggestions: validation.suggestions
        });
        results.summary.valid++;
        
        if (validation.warnings.length > 0) {
          results.summary.withWarnings++;
        }
      } else {
        results.invalid.push({
          domain,
          errors: validation.errors,
          suggestions: validation.suggestions
        });
        results.summary.invalid++;
      }
    }

    return results;
  }
}

module.exports = ENSDomainValidator;
