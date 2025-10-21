/**
 * ENS Domain Service
 * Handles ENS domain naming conventions and validation
 */

class ENSDomainService {
  constructor() {
    this.domainPatterns = {
      // Primary domain patterns
      dao: '{dao-name}.eth',
      contract: '{org}.{subcategory}.{category}.cns.eth',
      
      // Subdomain patterns
      governance: 'governance.{dao-name}.eth',
      treasury: 'treasury.{dao-name}.eth',
      token: 'token.{dao-name}.eth',
      voting: 'voting.{dao-name}.eth',
      execution: 'execution.{dao-name}.eth',
      api: 'api.{dao-name}.eth',
      docs: 'docs.{dao-name}.eth',
      forum: 'forum.{dao-name}.eth',
      analytics: 'analytics.{dao-name}.eth'
    };

    this.reservedSubdomains = [
      'www', 'mail', 'ftp', 'admin', 'root', 'api', 'docs', 'governance',
      'treasury', 'token', 'voting', 'execution', 'forum', 'analytics',
      'app', 'dev', 'staging', 'test', 'beta', 'alpha'
    ];

    this.domainValidationRules = {
      name: {
        minLength: 3,
        maxLength: 63,
        pattern: /^[a-z0-9-]+$/,
        forbiddenWords: ['admin', 'root', 'www', 'mail', 'ftp']
      },
      subdomain: {
        minLength: 1,
        maxLength: 63,
        pattern: /^[a-z0-9-]+$/,
        reserved: this.reservedSubdomains
      }
    };

    this.ensip19Patterns = {
      // ENSIP-19 compliant domain patterns
      cnsRoot: 'cns.eth',
      project: '{project}.cns.eth',
      category: '{category}.{project}.cns.eth',
      subcategory: '{subcategory}.{category}.{project}.cns.eth',
      contract: '{contract}.{subcategory}.{category}.{project}.cns.eth'
    };
  }

  /**
   * Validate ENS domain name
   * @param {string} domain - Domain to validate
   * @param {string} type - Type of domain (primary, subdomain)
   * @returns {Object} Validation result
   */
  validateDomain(domain, type = 'primary') {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    if (!domain) {
      errors.push('Domain is required');
      return { isValid: false, errors, warnings, suggestions };
    }

    const normalizedDomain = domain.toLowerCase().trim();

    // Basic format validation
    if (!normalizedDomain.endsWith('.eth')) {
      errors.push('Domain must end with .eth');
    }

    const namePart = normalizedDomain.replace('.eth', '');
    const parts = namePart.split('.');

    if (type === 'primary') {
      // Primary domain validation
      if (parts.length !== 1) {
        errors.push('Primary domain must have only one part before .eth');
      } else {
        const name = parts[0];
        const validation = this.validateDomainName(name);
        if (!validation.isValid) {
          errors.push(...validation.errors);
        }
        warnings.push(...validation.warnings);
        suggestions.push(...validation.suggestions);
      }
    } else if (type === 'subdomain') {
      // Subdomain validation
      if (parts.length < 2) {
        errors.push('Subdomain must have at least two parts');
      } else {
        const subdomain = parts[0];
        const parentDomain = parts.slice(1).join('.');
        
        const subdomainValidation = this.validateSubdomain(subdomain);
        if (!subdomainValidation.isValid) {
          errors.push(...subdomainValidation.errors);
        }
        warnings.push(...subdomainValidation.warnings);
        suggestions.push(...subdomainValidation.suggestions);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      normalizedDomain
    };
  }

  /**
   * Validate domain name part
   * @param {string} name - Name to validate
   * @returns {Object} Validation result
   */
  validateDomainName(name) {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    // Length validation
    if (name.length < this.domainValidationRules.name.minLength) {
      errors.push(`Domain name must be at least ${this.domainValidationRules.name.minLength} characters long`);
    }
    if (name.length > this.domainValidationRules.name.maxLength) {
      errors.push(`Domain name must be no more than ${this.domainValidationRules.name.maxLength} characters long`);
    }

    // Pattern validation
    if (!this.domainValidationRules.name.pattern.test(name)) {
      errors.push('Domain name must contain only lowercase letters, numbers, and hyphens');
    }

    // Forbidden words check
    for (const word of this.domainValidationRules.name.forbiddenWords) {
      if (name.includes(word)) {
        errors.push(`Domain name cannot contain reserved word: ${word}`);
      }
    }

    // Hyphen rules
    if (name.startsWith('-') || name.endsWith('-')) {
      errors.push('Domain name cannot start or end with a hyphen');
    }
    if (name.includes('--')) {
      errors.push('Domain name cannot contain consecutive hyphens');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate subdomain
   * @param {string} subdomain - Subdomain to validate
   * @returns {Object} Validation result
   */
  validateSubdomain(subdomain) {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    // Length validation
    if (subdomain.length < this.domainValidationRules.subdomain.minLength) {
      errors.push(`Subdomain must be at least ${this.domainValidationRules.subdomain.minLength} character long`);
    }
    if (subdomain.length > this.domainValidationRules.subdomain.maxLength) {
      errors.push(`Subdomain must be no more than ${this.domainValidationRules.subdomain.maxLength} characters long`);
    }

    // Pattern validation
    if (!this.domainValidationRules.subdomain.pattern.test(subdomain)) {
      errors.push('Subdomain must contain only lowercase letters, numbers, and hyphens');
    }

    // Reserved subdomain check
    if (this.domainValidationRules.subdomain.reserved.includes(subdomain)) {
      warnings.push(`Subdomain '${subdomain}' is reserved and may cause conflicts`);
    }

    // Hyphen rules
    if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
      errors.push('Subdomain cannot start or end with a hyphen');
    }
    if (subdomain.includes('--')) {
      errors.push('Subdomain cannot contain consecutive hyphens');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Generate ENS domain for DAO
   * @param {string} daoName - DAO name
   * @returns {string} Generated ENS domain
   */
  generateDAODomain(daoName) {
    const normalizedName = daoName.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    return `${normalizedName}.eth`;
  }

  /**
   * Generate standard subdomains for DAO
   * @param {string} daoName - DAO name
   * @returns {Object} Generated subdomains
   */
  generateStandardSubdomains(daoName) {
    const normalizedName = daoName.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    const subdomains = {};

    for (const [type, pattern] of Object.entries(this.domainPatterns)) {
      if (type === 'dao' || type === 'contract') continue; // Skip primary patterns
      subdomains[type] = pattern.replace('{dao-name}', normalizedName);
    }

    return subdomains;
  }

  /**
   * Generate ENSIP-19 compliant contract domain
   * @param {Object} params - Parameters for domain generation
   * @returns {string} Generated contract domain
   */
  generateContractDomain(params) {
    const { org, subcategory, category, project = 'cns' } = params;

    if (!org || !subcategory || !category) {
      throw new Error('org, subcategory, and category are required for contract domain generation');
    }

    return this.ensip19Patterns.contract
      .replace('{contract}', org.toLowerCase())
      .replace('{subcategory}', subcategory.toLowerCase())
      .replace('{category}', category.toLowerCase())
      .replace('{project}', project.toLowerCase());
  }

  /**
   * Generate hierarchical domain structure
   * @param {Object} params - Parameters for domain generation
   * @returns {Object} Hierarchical domain structure
   */
  generateHierarchicalDomainStructure(params) {
    const { org, subcategory, category, project = 'cns' } = params;

    return {
      level0: this.ensip19Patterns.cnsRoot,
      level1: this.ensip19Patterns.project.replace('{project}', project.toLowerCase()),
      level2: this.ensip19Patterns.category
        .replace('{category}', category.toLowerCase())
        .replace('{project}', project.toLowerCase()),
      level3: this.ensip19Patterns.subcategory
        .replace('{subcategory}', subcategory.toLowerCase())
        .replace('{category}', category.toLowerCase())
        .replace('{project}', project.toLowerCase()),
      level4: this.ensip19Patterns.contract
        .replace('{contract}', org.toLowerCase())
        .replace('{subcategory}', subcategory.toLowerCase())
        .replace('{category}', category.toLowerCase())
        .replace('{project}', project.toLowerCase())
    };
  }

  /**
   * Check if subdomain is reserved
   * @param {string} subdomain - Subdomain to check
   * @returns {boolean} True if reserved
   */
  isReservedSubdomain(subdomain) {
    return this.reservedSubdomains.includes(subdomain.toLowerCase());
  }

  /**
   * Normalize domain name
   * @param {string} domain - Domain to normalize
   * @returns {string} Normalized domain
   */
  normalizeDomain(domain) {
    return domain.toLowerCase().trim();
  }

  /**
   * Extract domain components
   * @param {string} domain - Domain to analyze
   * @returns {Object} Domain components
   */
  extractDomainComponents(domain) {
    const normalizedDomain = this.normalizeDomain(domain);
    
    if (!normalizedDomain.endsWith('.eth')) {
      throw new Error('Domain must end with .eth');
    }

    const namePart = normalizedDomain.replace('.eth', '');
    const parts = namePart.split('.');

    if (parts.length === 1) {
      // Primary domain
      return {
        type: 'primary',
        name: parts[0],
        subdomain: null,
        parentDomain: null,
        level: 0
      };
    } else if (parts.length === 2) {
      // Subdomain
      return {
        type: 'subdomain',
        name: parts[1],
        subdomain: parts[0],
        parentDomain: `${parts[1]}.eth`,
        level: 1
      };
    } else if (parts.length >= 3) {
      // Hierarchical domain (ENSIP-19)
      return {
        type: 'hierarchical',
        name: parts[parts.length - 1],
        subdomain: parts[0],
        parentDomain: parts.slice(1).join('.') + '.eth',
        level: parts.length - 1,
        components: {
          contract: parts[0],
          subcategory: parts[1],
          category: parts[2],
          project: parts[3] || 'cns'
        }
      };
    }

    throw new Error('Invalid domain format');
  }

  /**
   * Generate domain suggestions
   * @param {string} input - Input to generate suggestions for
   * @param {string} type - Type of suggestions (dao, subdomain)
   * @returns {Array} Array of suggestions
   */
  generateDomainSuggestions(input, type = 'dao') {
    const suggestions = [];
    const normalizedInput = input.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');

    if (type === 'dao') {
      // DAO domain suggestions
      suggestions.push(`${normalizedInput}.eth`);
      
      // Add variations
      if (normalizedInput.endsWith('dao')) {
        suggestions.push(`${normalizedInput.replace('dao', '')}.eth`);
      } else {
        suggestions.push(`${normalizedInput}dao.eth`);
      }
    } else if (type === 'subdomain') {
      // Subdomain suggestions
      const standardSubdomains = ['governance', 'treasury', 'token', 'voting', 'execution'];
      for (const subdomain of standardSubdomains) {
        suggestions.push(`${subdomain}.${normalizedInput}.eth`);
      }
    }

    return suggestions.filter(suggestion => suggestion !== input);
  }

  /**
   * Validate complete ENS structure
   * @param {Object} ensStructure - ENS structure to validate
   * @returns {Object} Validation result
   */
  validateENSStructure(ensStructure) {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    // Validate primary domain
    if (ensStructure.primary) {
      const primaryValidation = this.validateDomain(ensStructure.primary, 'primary');
      if (!primaryValidation.isValid) {
        errors.push(...primaryValidation.errors.map(error => `Primary domain: ${error}`));
      }
      warnings.push(...primaryValidation.warnings.map(warning => `Primary domain: ${warning}`));
    }

    // Validate subdomains
    if (ensStructure.subdomains) {
      for (const [type, subdomain] of Object.entries(ensStructure.subdomains)) {
        const subdomainValidation = this.validateDomain(subdomain, 'subdomain');
        if (!subdomainValidation.isValid) {
          errors.push(...subdomainValidation.errors.map(error => `${type}: ${error}`));
        }
        warnings.push(...subdomainValidation.warnings.map(warning => `${type}: ${warning}`));
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
}

module.exports = { ENSDomainService };
