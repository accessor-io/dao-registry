/**
 * NIEM-Inspired DAO Registry Naming Standards
 * Frontend implementation of standardized naming conventions
 */

// Contract Types
export const CONTRACT_TYPES = {
  GOVERNANCE: 'governance',
  TREASURY: 'treasury',
  TOKEN: 'token',
  REGISTRY: 'registry',
  PROPOSAL: 'proposal',
  VOTING: 'voting',
  MEMBER: 'member',
  MULTISIG: 'multisig',
  TIMELOCK: 'timelock',
  EXECUTOR: 'executor'
};

// Naming Patterns
export const NAMING_PATTERNS = {
  // Standard patterns
  GOVERNANCE: '{DAO}Governance',
  TREASURY: '{DAO}Treasury', 
  TOKEN: '{DAO}Token',
  REGISTRY: '{DAO}Registry',
  PROPOSAL: '{DAO}Proposal',
  VOTING: '{DAO}Voting',
  MEMBER: '{DAO}Member',
  MULTISIG: '{DAO}Multisig',
  TIMELOCK: '{DAO}Timelock',
  EXECUTOR: '{DAO}Executor',
  
  // Versioned patterns
  GOVERNANCE_V2: '{DAO}GovernanceV2',
  TREASURY_V2: '{DAO}TreasuryV2',
  TOKEN_V2: '{DAO}TokenV2',
  
  // Interface patterns
  I_GOVERNANCE: 'I{DAO}Governance',
  I_TREASURY: 'I{DAO}Treasury',
  I_TOKEN: 'I{DAO}Token',
  
  // Implementation patterns
  GOVERNANCE_IMPL: '{DAO}GovernanceImpl',
  TREASURY_IMPL: '{DAO}TreasuryImpl',
  TOKEN_IMPL: '{DAO}TokenImpl'
};

// Reserved subdomains
export const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'docs', 'governance', 'treasury', 'token',
  'forum', 'analytics', 'admin', 'app', 'blog', 'help',
  'support', 'status', 'mail', 'email', 'ftp', 'smtp'
]);

// Standard subdomain types
export const STANDARD_SUBDOMAIN_TYPES = [
  'governance', 'treasury', 'token', 'docs', 'forum', 
  'analytics', 'api', 'app', 'www', 'blog'
];

/**
 * Contract Naming Utilities
 */
export class ContractNamingUtils {
  /**
   * Generate contract name following conventions
   * @param {Object} params - Parameters for name generation
   * @returns {string} Generated contract name
   */
  static generateContractName(params) {
    const { daoName, contractType, version, isInterface, isImplementation } = params;

    // Validate input
    if (!daoName || !contractType) {
      throw new Error('DAO name and contract type are required');
    }

    // Normalize DAO name
    const normalizedDAOName = this.normalizeDAOName(daoName);

    // Determine base pattern
    let pattern = NAMING_PATTERNS[contractType.toUpperCase()];
    
    if (isInterface) {
      pattern = NAMING_PATTERNS[`I_${contractType.toUpperCase()}`];
    } else if (isImplementation) {
      pattern = NAMING_PATTERNS[`${contractType.toUpperCase()}_IMPL`];
    }

    // Apply version if specified
    if (version && !isInterface) {
      pattern = NAMING_PATTERNS[`${contractType.toUpperCase()}_V${version}`];
    }

    // Fallback to default pattern if not found
    if (!pattern) {
      pattern = `{DAO}${contractType.charAt(0).toUpperCase() + contractType.slice(1)}`;
    }

    // Generate name
    const contractName = pattern.replace('{DAO}', normalizedDAOName);

    return contractName;
  }

  /**
   * Validate contract name against conventions
   * @param {string} contractName - Contract name to validate
   * @param {Object} expectedParams - Expected parameters
   * @returns {Object} Validation result
   */
  static validateContractName(contractName, expectedParams = {}) {
    const result = {
      isValid: false,
      errors: [],
      warnings: [],
      suggestions: [],
      detectedType: null,
      detectedDAO: null,
      detectedVersion: null
    };

    try {
      // Basic validation
      if (!contractName || typeof contractName !== 'string') {
        result.errors.push('Contract name must be a non-empty string');
        return result;
      }

      // Check naming pattern compliance
      const analysis = this.analyzeContractName(contractName);
      
      if (!analysis.isValid) {
        result.errors.push(...analysis.errors);
        result.suggestions.push(...analysis.suggestions);
        return result;
      }

      result.detectedType = analysis.contractType;
      result.detectedDAO = analysis.daoName;
      result.detectedVersion = analysis.version;

      // Validate against expected parameters
      if (expectedParams.daoName && analysis.daoName !== this.normalizeDAOName(expectedParams.daoName)) {
        result.warnings.push(`DAO name mismatch: expected "${expectedParams.daoName}", detected "${analysis.daoName}"`);
      }

      if (expectedParams.contractType && analysis.contractType !== expectedParams.contractType) {
        result.warnings.push(`Contract type mismatch: expected "${expectedParams.contractType}", detected "${analysis.contractType}"`);
      }

      if (expectedParams.version && analysis.version !== expectedParams.version) {
        result.warnings.push(`Version mismatch: expected "${expectedParams.version}", detected "${analysis.version}"`);
      }

      // Check for common issues
      this.checkCommonIssues(contractName, result);

      result.isValid = true;

    } catch (error) {
      result.errors.push(`Validation error: ${error.message}`);
    }

    return result;
  }

  /**
   * Analyze contract name to extract components
   * @param {string} contractName - Contract name to analyze
   * @returns {Object} Analysis result
   */
  static analyzeContractName(contractName) {
    const result = {
      isValid: false,
      errors: [],
      suggestions: [],
      contractType: null,
      daoName: null,
      version: null,
      isInterface: false,
      isImplementation: false
    };

    // Check if it's an interface
    if (contractName.startsWith('I') && contractName[1] === contractName[1].toUpperCase()) {
      result.isInterface = true;
    }

    // Check if it's an implementation
    if (contractName.endsWith('Impl')) {
      result.isImplementation = true;
    }

    // Extract version
    const versionMatch = contractName.match(/V(\d+)$/);
    if (versionMatch) {
      result.version = versionMatch[1];
    }

    // Try to match against known patterns
    for (const [type, pattern] of Object.entries(NAMING_PATTERNS)) {
      const regex = this.patternToRegex(pattern);
      const match = contractName.match(regex);
      
      if (match) {
        result.contractType = CONTRACT_TYPES[type.replace(/_V\d+$/, '').replace(/^I_/, '').replace(/_IMPL$/, '')];
        result.daoName = match[1];
        result.isValid = true;
        break;
      }
    }

    if (!result.isValid) {
      result.errors.push('Contract name does not follow standard naming conventions');
      result.suggestions.push('Use format: {DAO}{Type} (e.g., UniswapGovernance, MakerTreasury)');
    }

    return result;
  }

  /**
   * Convert naming pattern to regex
   * @param {string} pattern - Naming pattern
   * @returns {RegExp} Regular expression
   */
  static patternToRegex(pattern) {
    const regexPattern = pattern
      .replace('{DAO}', '([A-Z][a-zA-Z0-9]*)')
      .replace(/[{}]/g, '');
    
    return new RegExp(`^${regexPattern}$`);
  }

  /**
   * Normalize DAO name for contract naming
   * @param {string} daoName - DAO name to normalize
   * @returns {string} Normalized name
   */
  static normalizeDAOName(daoName) {
    if (!daoName) return '';

    return daoName
      .replace(/[^a-zA-Z0-9]/g, '')  // Remove non-alphanumeric characters
      .replace(/^[a-z]/, match => match.toUpperCase())  // Capitalize first letter
      .replace(/([a-z])([A-Z])/g, '$1$2');  // Ensure proper camelCase
  }

  /**
   * Check for common naming issues
   * @param {string} contractName - Contract name to check
   * @param {Object} result - Result object to update
   */
  static checkCommonIssues(contractName, result) {
    // Check for lowercase start
    if (/^[a-z]/.test(contractName)) {
      result.warnings.push('Contract name should start with uppercase letter');
    }

    // Check for numbers at start
    if (/^[0-9]/.test(contractName)) {
      result.errors.push('Contract name cannot start with a number');
    }

    // Check for special characters
    if (/[^a-zA-Z0-9]/.test(contractName)) {
      result.warnings.push('Contract name should only contain alphanumeric characters');
    }

    // Check for very long names
    if (contractName.length > 50) {
      result.warnings.push('Contract name is very long, consider shortening');
    }

    // Check for very short names
    if (contractName.length < 5) {
      result.warnings.push('Contract name is very short, consider being more descriptive');
    }

    // Check for common typos
    const commonTypos = {
      'Governence': 'Governance',
      'Treasurery': 'Treasury',
      'Proposel': 'Proposal',
      'Votting': 'Voting'
    };

    for (const [typo, correct] of Object.entries(commonTypos)) {
      if (contractName.includes(typo)) {
        result.suggestions.push(`Consider correcting "${typo}" to "${correct}"`);
      }
    }
  }

  /**
   * Generate contract names for a complete DAO
   * @param {string} daoName - DAO name
   * @param {Object} options - Generation options
   * @returns {Object} Generated contract names
   */
  static generateDAOContractNames(daoName, options = {}) {
    const {
      includeInterfaces = false,
      includeImplementations = false,
      includeVersions = false,
      customTypes = []
    } = options;

    const contracts = {};

    // Standard contracts
    const standardTypes = Object.values(CONTRACT_TYPES);
    const allTypes = [...standardTypes, ...customTypes];

    for (const type of allTypes) {
      contracts[type] = this.generateContractName({
        daoName,
        contractType: type
      });

      if (includeInterfaces) {
        contracts[`I${type.charAt(0).toUpperCase() + type.slice(1)}`] = this.generateContractName({
          daoName,
          contractType: type,
          isInterface: true
        });
      }

      if (includeImplementations) {
        contracts[`${type}Impl`] = this.generateContractName({
          daoName,
          contractType: type,
          isImplementation: true
        });
      }

      if (includeVersions) {
        contracts[`${type}V2`] = this.generateContractName({
          daoName,
          contractType: type,
          version: '2'
        });
      }
    }

    return contracts;
  }
}

/**
 * ENS Domain Utilities
 */
export class ENSDomainUtils {
  /**
   * Validate ENS domain format and compliance
   * @param {string} domain - Domain to validate
   * @param {string} type - Type of domain (primary or subdomain)
   * @returns {Object} Validation result
   */
  static validateDomain(domain, type = 'primary') {
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
  static validatePrimaryDomain(domain, result) {
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
  static validateSubdomain(domain, result) {
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
      result.suggestions.push(`Consider using standard subdomain types: ${STANDARD_SUBDOMAIN_TYPES.join(', ')}`);
    }
  }

  /**
   * Check if domain follows valid ENS format
   * @param {string} domain - Domain to check
   * @returns {boolean}
   */
  static isValidENSFormat(domain) {
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
  static isValidDAOName(name) {
    // DAO names should be lowercase, alphanumeric with optional hyphens
    const daoNamePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    return daoNamePattern.test(name) && name.length >= 3 && name.length <= 63;
  }

  /**
   * Check if subdomain label is valid
   * @param {string} label - Label to check
   * @returns {boolean}
   */
  static isValidSubdomainLabel(label) {
    const subdomainPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    return subdomainPattern.test(label) && label.length >= 1 && label.length <= 63;
  }

  /**
   * Check if subdomain type is standard
   * @param {string} type - Subdomain type to check
   * @returns {boolean}
   */
  static isStandardSubdomainType(type) {
    return STANDARD_SUBDOMAIN_TYPES.includes(type);
  }

  /**
   * Check for reserved names
   * @param {string} domain - Domain to check
   * @param {Object} result - Result object to update
   */
  static checkReservedNames(domain, result) {
    const parts = domain.split('.');
    const label = parts[0];

    if (RESERVED_SUBDOMAINS.has(label)) {
      result.warnings.push(`"${label}" is a reserved subdomain name`);
    }
  }

  /**
   * Check length constraints
   * @param {string} domain - Domain to check
   * @param {Object} result - Result object to update
   */
  static checkLengthConstraints(domain, result) {
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
  static checkCharacterConstraints(domain, result) {
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
  static normalizeDomain(domain) {
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
  static suggestDAOName(input) {
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
  static generateStandardSubdomains(primaryDomain) {
    return STANDARD_SUBDOMAIN_TYPES.map(type => `${type}.${primaryDomain}`);
  }

  /**
   * Validate multiple domains
   * @param {Array} domains - Array of domains to validate
   * @returns {Object} Validation results
   */
  static validateMultipleDomains(domains) {
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

/**
 * DAO Structure Generation Utilities
 */
export class DAOStructureUtils {
  /**
   * Generate complete DAO structure
   * @param {string} daoName - DAO name
   * @param {Object} options - Generation options
   * @returns {Object} Complete DAO structure
   */
  static generateDAOStructure(daoName, options = {}) {
    const {
      symbol = daoName.substring(0, 3).toUpperCase(),
      description = `${daoName} DAO`,
      tags = ['DAO', 'Governance'],
      includeInterfaces = false,
      includeImplementations = false,
      includeVersions = false
    } = options;

    // Normalize DAO name
    const normalizedName = ContractNamingUtils.normalizeDAOName(daoName);
    const domainName = daoName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Generate basic structure
    const structure = {
      basic: {
        name: normalizedName,
        symbol,
        description,
        tags,
        ensDomain: `${domainName}.eth`
      },
      ens: {
        primary: `${domainName}.eth`,
        subdomains: ENSDomainUtils.generateStandardSubdomains(`${domainName}.eth`)
      },
      contracts: ContractNamingUtils.generateDAOContractNames(daoName, {
        includeInterfaces,
        includeImplementations,
        includeVersions
      }),
      metadata: {
        schema: `niem-dao-core-v1.0.0.schema.json`,
        namespace: `https://dao-registry.org/niem/dao/core`,
        version: '1.0.0'
      }
    };

    return structure;
  }

  /**
   * Validate DAO metadata against standards
   * @param {Object} daoData - DAO data to validate
   * @returns {Object} Validation result
   */
  static validateDAOMetadata(daoData) {
    const result = {
      isValid: false,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      // Required fields validation
      const requiredFields = ['name', 'symbol', 'description', 'ensDomain'];
      for (const field of requiredFields) {
        if (!daoData[field]) {
          result.errors.push(`Missing required field: ${field}`);
        }
      }

      // Name validation
      if (daoData.name) {
        const nameValidation = ContractNamingUtils.validateContractName(daoData.name);
        if (!nameValidation.isValid) {
          result.errors.push(...nameValidation.errors);
        }
        if (nameValidation.warnings.length > 0) {
          result.warnings.push(...nameValidation.warnings);
        }
      }

      // ENS domain validation
      if (daoData.ensDomain) {
        const domainValidation = ENSDomainUtils.validateDomain(daoData.ensDomain, 'primary');
        if (!domainValidation.isValid) {
          result.errors.push(...domainValidation.errors);
        }
        if (domainValidation.warnings.length > 0) {
          result.warnings.push(...domainValidation.warnings);
        }
      }

      // Symbol validation
      if (daoData.symbol) {
        if (daoData.symbol.length < 2 || daoData.symbol.length > 10) {
          result.warnings.push('Symbol should be between 2-10 characters');
        }
        if (!/^[A-Z0-9]+$/.test(daoData.symbol)) {
          result.warnings.push('Symbol should contain only uppercase letters and numbers');
        }
      }

      result.isValid = result.errors.length === 0;

    } catch (error) {
      result.errors.push(`Validation error: ${error.message}`);
    }

    return result;
  }
}

/**
 * Schema Naming Utilities
 */
export class SchemaNamingUtils {
  /**
   * Generate schema file name
   * @param {string} domain - Domain name
   * @param {string} component - Component name
   * @param {string} version - Version (default: 1.0.0)
   * @returns {string} Schema file name
   */
  static generateSchemaFileName(domain, component, version = '1.0.0') {
    return `niem-${domain}-${component}-v${version}.schema.json`;
  }

  /**
   * Generate schema ID
   * @param {string} domain - Domain name
   * @param {string} component - Component name
   * @returns {string} Schema ID
   */
  static generateSchemaId(domain, component) {
    return `https://dao-registry.org/niem/${domain}/${component}`;
  }

  /**
   * Generate schema internal name
   * @param {string} domain - Domain name
   * @param {string} component - Component name
   * @returns {string} Schema internal name
   */
  static generateSchemaInternalName(domain, component) {
    const domainCapitalized = domain.charAt(0).toUpperCase() + domain.slice(1);
    const componentCapitalized = component.charAt(0).toUpperCase() + component.slice(1);
    return `${domainCapitalized}${componentCapitalized}`;
  }
}

/**
 * Service Naming Utilities
 */
export class ServiceNamingUtils {
  /**
   * Generate service file name
   * @param {string} domain - Domain name
   * @returns {string} Service file name
   */
  static generateServiceFileName(domain) {
    return `niem-${domain}-service.js`;
  }

  /**
   * Generate service class name
   * @param {string} domain - Domain name
   * @returns {string} Service class name
   */
  static generateServiceClassName(domain) {
    const domainCapitalized = domain.charAt(0).toUpperCase() + domain.slice(1);
    return `NIEM${domainCapitalized}Service`;
  }
}

/**
 * Route Naming Utilities
 */
export class RouteNamingUtils {
  /**
   * Generate route file name
   * @param {string} domain - Domain name
   * @returns {string} Route file name
   */
  static generateRouteFileName(domain) {
    return `niem-${domain}-routes.js`;
  }

  /**
   * Generate API endpoint path
   * @param {string} domain - Domain name
   * @param {string} component - Component name
   * @param {string} action - Action name
   * @param {string} version - API version (default: v1)
   * @returns {string} API endpoint path
   */
  static generateAPIEndpoint(domain, component, action, version = 'v1') {
    return `/api/${version}/niem/${domain}/${component}/${action}`;
  }
}

/**
 * Configuration Naming Utilities
 */
export class ConfigNamingUtils {
  /**
   * Generate environment variable name
   * @param {string} domain - Domain name
   * @param {string} component - Component name
   * @param {string} setting - Setting name
   * @returns {string} Environment variable name
   */
  static generateEnvVarName(domain, component, setting) {
    return `NIEM_${domain.toUpperCase()}_${component.toUpperCase()}_${setting.toUpperCase()}`;
  }

  /**
   * Generate configuration file name
   * @param {string} domain - Domain name
   * @returns {string} Configuration file name
   */
  static generateConfigFileName(domain) {
    return `niem-${domain}-config.json`;
  }
}

/**
 * Database Naming Utilities
 */
export class DatabaseNamingUtils {
  /**
   * Generate table name
   * @param {string} domain - Domain name
   * @param {string} component - Component name
   * @returns {string} Table name
   */
  static generateTableName(domain, component) {
    return `niem_${domain}_${component}`;
  }

  /**
   * Generate column name
   * @param {string} component - Component name
   * @param {string} attribute - Attribute name
   * @returns {string} Column name
   */
  static generateColumnName(component, attribute) {
    return `${component}_${attribute}`;
  }
}

/**
 * Documentation Naming Utilities
 */
export class DocumentationNamingUtils {
  /**
   * Generate documentation file name
   * @param {string} domain - Domain name
   * @param {string} type - Documentation type
   * @returns {string} Documentation file name
   */
  static generateDocFileName(domain, type) {
    return `niem-${domain}-${type}.md`;
  }

  /**
   * Generate code documentation tag
   * @param {string} domain - Domain name
   * @param {string} component - Component name
   * @returns {string} Documentation tag
   */
  static generateDocTag(domain, component) {
    return `@niem-${domain}-${component}`;
  }
}

// Export all utilities as a single object for convenience
export const NamingStandards = {
  ContractNamingUtils,
  ENSDomainUtils,
  DAOStructureUtils,
  SchemaNamingUtils,
  ServiceNamingUtils,
  RouteNamingUtils,
  ConfigNamingUtils,
  DatabaseNamingUtils,
  DocumentationNamingUtils,
  
  // Constants
  CONTRACT_TYPES,
  NAMING_PATTERNS,
  RESERVED_SUBDOMAINS,
  STANDARD_SUBDOMAIN_TYPES
};

export default NamingStandards;
