/**
 * DAO Naming Service
 * Handles DAO-specific naming conventions and registration standards
 */

class DAONamingService {
  constructor() {
    this.daoNamingPatterns = {
      // DAO Registry naming patterns
      primary: '{dao-name}.eth',
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
      'treasury', 'token', 'voting', 'execution', 'forum', 'analytics'
    ];

    this.daoValidationRules = {
      name: {
        minLength: 3,
        maxLength: 63,
        pattern: /^[a-z0-9-]+$/,
        forbiddenWords: ['admin', 'root', 'www', 'mail', 'ftp', 'api', 'docs']
      },
      symbol: {
        minLength: 2,
        maxLength: 10,
        pattern: /^[A-Z0-9]+$/,
        reserved: ['ETH', 'BTC', 'USD', 'EUR', 'JPY', 'GBP']
      },
      description: {
        minLength: 10,
        maxLength: 500
      }
    };
  }

  /**
   * Validate DAO name according to standards
   * @param {string} daoName - DAO name to validate
   * @returns {Object} Validation result
   */
  validateDAOName(daoName) {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    if (!daoName) {
      errors.push('DAO name is required');
      return { isValid: false, errors, warnings, suggestions };
    }

    const normalizedName = daoName.toLowerCase().trim();

    // Length validation
    if (normalizedName.length < this.daoValidationRules.name.minLength) {
      errors.push(`DAO name must be at least ${this.daoValidationRules.name.minLength} characters long`);
    }
    if (normalizedName.length > this.daoValidationRules.name.maxLength) {
      errors.push(`DAO name must be no more than ${this.daoValidationRules.name.maxLength} characters long`);
    }

    // Pattern validation
    if (!this.daoValidationRules.name.pattern.test(normalizedName)) {
      errors.push('DAO name must contain only lowercase letters, numbers, and hyphens');
    }

    // Forbidden words check
    const forbiddenWords = this.daoValidationRules.name.forbiddenWords;
    for (const word of forbiddenWords) {
      if (normalizedName.includes(word)) {
        errors.push(`DAO name cannot contain reserved word: ${word}`);
      }
    }

    // Hyphen rules
    if (normalizedName.startsWith('-') || normalizedName.endsWith('-')) {
      errors.push('DAO name cannot start or end with a hyphen');
    }
    if (normalizedName.includes('--')) {
      errors.push('DAO name cannot contain consecutive hyphens');
    }

    // Suggestions for common issues
    if (daoName !== normalizedName) {
      suggestions.push(`Consider using lowercase: ${normalizedName}`);
    }

    if (errors.length === 0) {
      suggestions.push('DAO name is valid');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      normalizedName
    };
  }

  /**
   * Validate DAO symbol according to standards
   * @param {string} symbol - DAO symbol to validate
   * @returns {Object} Validation result
   */
  validateDAOSymbol(symbol) {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    if (!symbol) {
      errors.push('DAO symbol is required');
      return { isValid: false, errors, warnings, suggestions };
    }

    // Length validation
    if (symbol.length < this.daoValidationRules.symbol.minLength) {
      errors.push(`DAO symbol must be at least ${this.daoValidationRules.symbol.minLength} characters long`);
    }
    if (symbol.length > this.daoValidationRules.symbol.maxLength) {
      errors.push(`DAO symbol must be no more than ${this.daoValidationRules.symbol.maxLength} characters long`);
    }

    // Pattern validation
    if (!this.daoValidationRules.symbol.pattern.test(symbol)) {
      errors.push('DAO symbol must contain only uppercase letters and numbers');
    }

    // Reserved symbols check
    if (this.daoValidationRules.symbol.reserved.includes(symbol)) {
      warnings.push(`Symbol ${symbol} is reserved and may cause confusion`);
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
  generateENSDomain(daoName) {
    const normalizedName = daoName.toLowerCase().trim();
    return `${normalizedName}.eth`;
  }

  /**
   * Generate standard subdomains for DAO
   * @param {string} daoName - DAO name
   * @returns {Object} Generated subdomains
   */
  generateStandardSubdomains(daoName) {
    const normalizedName = daoName.toLowerCase().trim();
    const subdomains = {};

    for (const [type, pattern] of Object.entries(this.daoNamingPatterns)) {
      if (type === 'primary') continue; // Skip primary domain
      subdomains[type] = pattern.replace('{dao-name}', normalizedName);
    }

    return subdomains;
  }

  /**
   * Generate complete DAO naming structure
   * @param {string} daoName - DAO name
   * @param {Object} options - Generation options
   * @returns {Object} Complete naming structure
   */
  generateDAONamingStructure(daoName, options = {}) {
    const normalizedName = daoName.toLowerCase().trim();
    const symbol = options.symbol || normalizedName.substring(0, 3).toUpperCase();

    return {
      basic: {
        name: daoName,
        normalizedName,
        symbol,
        ensDomain: this.generateENSDomain(daoName)
      },
      ens: {
        primary: this.generateENSDomain(daoName),
        subdomains: this.generateStandardSubdomains(daoName)
      },
      validation: {
        name: this.validateDAOName(daoName),
        symbol: this.validateDAOSymbol(symbol)
      }
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
   * Generate DAO metadata structure
   * @param {string} daoName - DAO name
   * @param {Object} options - Generation options
   * @returns {Object} DAO metadata structure
   */
  generateDAOMetadata(daoName, options = {}) {
    const namingStructure = this.generateDAONamingStructure(daoName, options);
    
    return {
      name: namingStructure.basic.name,
      symbol: namingStructure.basic.symbol,
      description: options.description || `${daoName} DAO`,
      ensDomain: namingStructure.basic.ensDomain,
      ensSubdomains: namingStructure.ens.subdomains,
      tags: options.tags || ['DAO', 'Governance'],
      metadata: {
        recordType: 'DAO',
        systemId: 'dao-registry',
        externalId: `${namingStructure.basic.normalizedName}-dao`,
        securityClassification: 'public',
        accessRights: 'open',
        creator: {
          id: options.creatorId || 'system',
          type: 'user',
          name: options.creatorName || 'DAO Registry System'
        },
        creationDate: new Date().toISOString(),
        creationMethod: 'api',
        title: `${daoName} DAO`,
        subject: ['DAO', 'Governance'],
        abstract: options.description || `${daoName} DAO governance system`,
        keywords: [daoName.toLowerCase(), 'dao', 'governance'],
        language: 'en',
        format: 'application/json',
        encoding: 'utf-8'
      }
    };
  }

  /**
   * Migrate existing DAO to new naming standards
   * @param {Object} existingDAO - Existing DAO object
   * @param {Object} options - Migration options
   * @returns {Object} Migration result
   */
  migrateDAONaming(existingDAO, options = {}) {
    const migration = {
      original: existingDAO,
      changes: [],
      warnings: [],
      errors: []
    };

    // Validate and normalize name
    const nameValidation = this.validateDAOName(existingDAO.name);
    if (!nameValidation.isValid) {
      migration.errors.push(...nameValidation.errors);
    } else if (existingDAO.name !== nameValidation.normalizedName) {
      migration.changes.push({
        field: 'name',
        from: existingDAO.name,
        to: nameValidation.normalizedName,
        reason: 'Normalize to lowercase'
      });
    }

    // Validate and normalize symbol
    if (existingDAO.symbol) {
      const symbolValidation = this.validateDAOSymbol(existingDAO.symbol);
      if (!symbolValidation.isValid) {
        migration.errors.push(...symbolValidation.errors);
      }
    }

    // Generate new ENS structure
    const newNamingStructure = this.generateDAONamingStructure(existingDAO.name, {
      symbol: existingDAO.symbol
    });

    // Check ENS domain changes
    if (existingDAO.ensDomain && existingDAO.ensDomain !== newNamingStructure.basic.ensDomain) {
      migration.changes.push({
        field: 'ensDomain',
        from: existingDAO.ensDomain,
        to: newNamingStructure.basic.ensDomain,
        reason: 'Standardize ENS domain format'
      });
    }

    // Generate migrated DAO
    const migratedDAO = {
      ...existingDAO,
      ...newNamingStructure.basic,
      ensSubdomains: newNamingStructure.ens.subdomains,
      metadata: {
        ...existingDAO.metadata,
        ...this.generateDAOMetadata(existingDAO.name, {
          symbol: existingDAO.symbol,
          description: existingDAO.description
        }).metadata
      }
    };

    migration.migratedDAO = migratedDAO;
    migration.success = migration.errors.length === 0;

    return migration;
  }
}

module.exports = { DAONamingService };
