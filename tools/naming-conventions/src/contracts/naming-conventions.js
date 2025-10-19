/**
 * Contract Naming Conventions
 * Standardized naming patterns for smart contracts in DAO Registry
 */

const Joi = require('joi');

class ContractNamingConventions {
  constructor() {
    this.contractTypes = {
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

    this.namingPatterns = {
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

    this.validationSchema = Joi.object({
      contractType: Joi.string().valid(...Object.values(this.contractTypes)).required(),
      daoName: Joi.string().required(),
      version: Joi.string().optional(),
      isInterface: Joi.boolean().optional(),
      isImplementation: Joi.boolean().optional()
    });
  }

  /**
   * Generate contract name following conventions
   * @param {Object} params - Parameters for name generation
   * @returns {string} Generated contract name
   */
  generateContractName(params) {
    const { daoName, contractType, version, isInterface, isImplementation } = params;

    // Validate input
    const validation = this.validationSchema.validate(params);
    if (validation.error) {
      throw new Error(`Invalid parameters: ${validation.error.details[0].message}`);
    }

    // Normalize DAO name
    const normalizedDAOName = this.normalizeDAOName(daoName);

    // Determine base pattern
    let pattern = this.namingPatterns[contractType.toUpperCase()];
    
    if (isInterface) {
      pattern = this.namingPatterns[`I_${contractType.toUpperCase()}`];
    } else if (isImplementation) {
      pattern = this.namingPatterns[`${contractType.toUpperCase()}_IMPL`];
    }

    // Apply version if specified
    if (version && !isInterface) {
      pattern = this.namingPatterns[`${contractType.toUpperCase()}_V${version}`];
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
  validateContractName(contractName, expectedParams = {}) {
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
  analyzeContractName(contractName) {
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
    for (const [type, pattern] of Object.entries(this.namingPatterns)) {
      const regex = this.patternToRegex(pattern);
      const match = contractName.match(regex);
      
      if (match) {
        result.contractType = this.contractTypes[type.replace(/_V\d+$/, '').replace(/^I_/, '').replace(/_IMPL$/, '')];
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
  patternToRegex(pattern) {
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
  normalizeDAOName(daoName) {
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
  checkCommonIssues(contractName, result) {
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
  generateDAOContractNames(daoName, options = {}) {
    const {
      includeInterfaces = false,
      includeImplementations = false,
      includeVersions = false,
      customTypes = []
    } = options;

    const contracts = {};

    // Standard contracts
    const standardTypes = Object.values(this.contractTypes);
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

  /**
   * Get naming conventions documentation
   * @returns {Object} Documentation object
   */
  getNamingConventions() {
    return {
      overview: 'Standardized naming conventions for DAO Registry smart contracts',
      patterns: this.namingPatterns,
      types: this.contractTypes,
      rules: [
        'Contract names should use PascalCase',
        'Start with DAO name followed by contract type',
        'Use descriptive, clear names',
        'Avoid abbreviations unless widely understood',
        'Include version numbers for upgrades (V2, V3, etc.)',
        'Use "I" prefix for interfaces',
        'Use "Impl" suffix for implementations'
      ],
      examples: {
        governance: 'UniswapGovernance',
        treasury: 'MakerTreasury',
        token: 'CompoundToken',
        interface: 'IUniswapGovernance',
        implementation: 'UniswapGovernanceImpl',
        versioned: 'UniswapGovernanceV2'
      }
    };
  }
}

module.exports = ContractNamingConventions;
