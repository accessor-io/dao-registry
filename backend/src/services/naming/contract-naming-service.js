/**
 * Contract Naming Service
 * Handles smart contract naming conventions and standards
 */

class ContractNamingService {
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
      EXECUTOR: 'executor',
      FACTORY: 'factory',
      PROXY: 'proxy',
      IMPLEMENTATION: 'implementation'
    };

    this.namingPatterns = {
      // Standard contract patterns
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
      FACTORY: '{DAO}Factory',
      
      // Versioned patterns
      GOVERNANCE_V2: '{DAO}GovernanceV2',
      TREASURY_V2: '{DAO}TreasuryV2',
      TOKEN_V2: '{DAO}TokenV2',
      
      // Interface patterns
      I_GOVERNANCE: 'I{DAO}Governance',
      I_TREASURY: 'I{DAO}Treasury',
      I_TOKEN: 'I{DAO}Token',
      I_REGISTRY: 'I{DAO}Registry',
      I_PROPOSAL: 'I{DAO}Proposal',
      I_VOTING: 'I{DAO}Voting',
      I_MEMBER: 'I{DAO}Member',
      I_MULTISIG: 'I{DAO}Multisig',
      I_TIMELOCK: 'I{DAO}Timelock',
      I_EXECUTOR: 'I{DAO}Executor',
      I_FACTORY: 'I{DAO}Factory',
      
      // Implementation patterns
      GOVERNANCE_IMPL: '{DAO}GovernanceImpl',
      TREASURY_IMPL: '{DAO}TreasuryImpl',
      TOKEN_IMPL: '{DAO}TokenImpl',
      REGISTRY_IMPL: '{DAO}RegistryImpl',
      PROPOSAL_IMPL: '{DAO}ProposalImpl',
      VOTING_IMPL: '{DAO}VotingImpl',
      MEMBER_IMPL: '{DAO}MemberImpl',
      MULTISIG_IMPL: '{DAO}MultisigImpl',
      TIMELOCK_IMPL: '{DAO}TimelockImpl',
      EXECUTOR_IMPL: '{DAO}ExecutorImpl',
      FACTORY_IMPL: '{DAO}FactoryImpl',
      
      // Proxy patterns
      GOVERNANCE_PROXY: '{DAO}GovernanceProxy',
      TREASURY_PROXY: '{DAO}TreasuryProxy',
      TOKEN_PROXY: '{DAO}TokenProxy',
      REGISTRY_PROXY: '{DAO}RegistryProxy',
      PROPOSAL_PROXY: '{DAO}ProposalProxy',
      VOTING_PROXY: '{DAO}VotingProxy',
      MEMBER_PROXY: '{DAO}MemberProxy',
      MULTISIG_PROXY: '{DAO}MultisigProxy',
      TIMELOCK_PROXY: '{DAO}TimelockProxy',
      EXECUTOR_PROXY: '{DAO}ExecutorProxy',
      FACTORY_PROXY: '{DAO}FactoryProxy'
    };

    this.contractValidationRules = {
      name: {
        minLength: 3,
        maxLength: 50,
        pattern: /^[A-Z][a-zA-Z0-9]*$/,
        forbiddenWords: ['Contract', 'Impl', 'Implementation']
      },
      interface: {
        pattern: /^I[A-Z][a-zA-Z0-9]*$/,
        description: 'Interfaces must start with I followed by PascalCase'
      },
      implementation: {
        pattern: /^[A-Z][a-zA-Z0-9]*(Impl|Implementation)$/,
        description: 'Implementations must end with Impl or Implementation'
      },
      proxy: {
        pattern: /^[A-Z][a-zA-Z0-9]*Proxy$/,
        description: 'Proxies must end with Proxy'
      }
    };

    this.ensip19Patterns = {
      // ENSIP-19 compliant naming patterns
      canonicalId: '{org}:{protocol}:{category}:{role}:{version}:{chainId}:{variant}',
      domain: '{org}.{subcategory}.{category}.cns.eth',
      metadataHash: '0x{sha256}'
    };
  }

  /**
   * Generate contract name following conventions
   * @param {Object} params - Parameters for name generation
   * @returns {string} Generated contract name
   */
  generateContractName(params) {
    const { daoName, contractType, version, isInterface, isImplementation, isProxy } = params;

    if (!daoName || !contractType) {
      throw new Error('DAO name and contract type are required');
    }

    const normalizedDAOName = this.normalizeDAOName(daoName);
    let pattern;

    if (isInterface) {
      pattern = this.namingPatterns[`I_${contractType.toUpperCase()}`];
    } else if (isImplementation) {
      pattern = this.namingPatterns[`${contractType.toUpperCase()}_IMPL`];
    } else if (isProxy) {
      pattern = this.namingPatterns[`${contractType.toUpperCase()}_PROXY`];
    } else if (version) {
      pattern = this.namingPatterns[`${contractType.toUpperCase()}_V${version}`];
    } else {
      pattern = this.namingPatterns[contractType.toUpperCase()];
    }

    if (!pattern) {
      throw new Error(`No naming pattern found for contract type: ${contractType}`);
    }

    return pattern.replace('{DAO}', normalizedDAOName);
  }

  /**
   * Normalize DAO name for contract naming
   * @param {string} daoName - DAO name to normalize
   * @returns {string} Normalized DAO name
   */
  normalizeDAOName(daoName) {
    return daoName
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
      .replace(/^[a-z]/, (match) => match.toUpperCase()) // Capitalize first letter
      .replace(/[a-z]+/g, (match) => match.charAt(0).toUpperCase() + match.slice(1)); // PascalCase
  }

  /**
   * Validate contract name according to standards
   * @param {string} contractName - Contract name to validate
   * @param {string} contractType - Type of contract
   * @returns {Object} Validation result
   */
  validateContractName(contractName, contractType) {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    if (!contractName) {
      errors.push('Contract name is required');
      return { isValid: false, errors, warnings, suggestions };
    }

    // Basic pattern validation
    if (!this.contractValidationRules.name.pattern.test(contractName)) {
      errors.push('Contract name must be PascalCase (e.g., UniswapGovernance)');
    }

    // Length validation
    if (contractName.length < this.contractValidationRules.name.minLength) {
      errors.push(`Contract name must be at least ${this.contractValidationRules.name.minLength} characters long`);
    }
    if (contractName.length > this.contractValidationRules.name.maxLength) {
      errors.push(`Contract name must be no more than ${this.contractValidationRules.name.maxLength} characters long`);
    }

    // Forbidden words check
    for (const word of this.contractValidationRules.name.forbiddenWords) {
      if (contractName.includes(word)) {
        warnings.push(`Contract name contains discouraged word: ${word}`);
      }
    }

    // Type-specific validation
    if (contractName.startsWith('I') && contractName.length > 1) {
      if (!this.contractValidationRules.interface.pattern.test(contractName)) {
        errors.push('Interface names must follow I{Name} pattern');
      }
    }

    if (contractName.endsWith('Impl') || contractName.endsWith('Implementation')) {
      if (!this.contractValidationRules.implementation.pattern.test(contractName)) {
        errors.push('Implementation names must follow {Name}Impl pattern');
      }
    }

    if (contractName.endsWith('Proxy')) {
      if (!this.contractValidationRules.proxy.pattern.test(contractName)) {
        errors.push('Proxy names must follow {Name}Proxy pattern');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
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
      includeProxies = false,
      includeVersions = false,
      customTypes = []
    } = options;

    const contracts = {};

    // Standard contracts
    const standardTypes = Object.values(this.contractTypes);
    const allTypes = [...standardTypes, ...customTypes];

    for (const type of allTypes) {
      // Skip proxy and implementation as they are not base contract types
      if (type === 'proxy' || type === 'implementation') continue;
      
      // Main contract
      contracts[type] = this.generateContractName({
        daoName,
        contractType: type
      });

      // Interface
      if (includeInterfaces) {
        contracts[`I${type.charAt(0).toUpperCase() + type.slice(1)}`] = this.generateContractName({
          daoName,
          contractType: type,
          isInterface: true
        });
      }

      // Implementation
      if (includeImplementations) {
        contracts[`${type}Impl`] = this.generateContractName({
          daoName,
          contractType: type,
          isImplementation: true
        });
      }

      // Proxy
      if (includeProxies) {
        contracts[`${type}Proxy`] = this.generateContractName({
          daoName,
          contractType: type,
          isProxy: true
        });
      }

      // Versioned
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
   * Generate ENSIP-19 compliant canonical ID
   * @param {Object} params - Parameters for canonical ID generation
   * @returns {string} Generated canonical ID
   */
  generateCanonicalId(params) {
    const {
      org,
      protocol,
      category,
      role,
      version = 'v1-0-0',
      chainId = 1,
      variant = 'mainnet'
    } = params;

    if (!org || !protocol || !category || !role) {
      throw new Error('org, protocol, category, and role are required for canonical ID generation');
    }

    return this.ensip19Patterns.canonicalId
      .replace('{org}', org.toLowerCase())
      .replace('{protocol}', protocol.toLowerCase())
      .replace('{category}', category.toLowerCase())
      .replace('{role}', role.toLowerCase())
      .replace('{version}', version)
      .replace('{chainId}', chainId.toString())
      .replace('{variant}', variant);
  }

  /**
   * Parse canonical ID into components
   * @param {string} canonicalId - Canonical ID to parse
   * @returns {Object} Parsed components
   */
  parseCanonicalId(canonicalId) {
    const parts = canonicalId.split(':');
    if (parts.length !== 7) {
      throw new Error('Invalid canonical ID format. Expected: org:protocol:category:role:version:chainId:variant');
    }

    return {
      org: parts[0],
      protocol: parts[1],
      category: parts[2],
      role: parts[3],
      version: parts[4],
      chainId: parseInt(parts[5]),
      variant: parts[6]
    };
  }

  /**
   * Generate ENS domain for contract
   * @param {Object} params - Parameters for domain generation
   * @returns {string} Generated ENS domain
   */
  generateContractDomain(params) {
    const { org, subcategory, category } = params;

    if (!org || !subcategory || !category) {
      throw new Error('org, subcategory, and category are required for domain generation');
    }

    return this.ensip19Patterns.domain
      .replace('{org}', org.toLowerCase())
      .replace('{subcategory}', subcategory.toLowerCase())
      .replace('{category}', category.toLowerCase());
  }

  /**
   * Generate contract metadata structure
   * @param {Object} params - Parameters for metadata generation
   * @returns {Object} Contract metadata structure
   */
  generateContractMetadata(params) {
    const {
      daoName,
      contractType,
      contractAddress,
      chainId = 1,
      version = 'v1-0-0',
      org,
      protocol,
      category,
      role
    } = params;

    const normalizedDAOName = this.normalizeDAOName(daoName);
    const contractName = this.generateContractName({
      daoName,
      contractType
    });

    const canonicalId = this.generateCanonicalId({
      org: org || normalizedDAOName.toLowerCase(),
      protocol: protocol || normalizedDAOName.toLowerCase(),
      category: category || 'dao',
      role: role || contractType,
      version,
      chainId
    });

    return {
      id: canonicalId,
      org: org || normalizedDAOName.toLowerCase(),
      protocol: protocol || normalizedDAOName.toLowerCase(),
      category: category || 'dao',
      subcategory: contractType,
      role: role || contractType,
      variant: 'mainnet',
      version,
      chainId,
      metadataHash: '0x' + require('crypto').createHash('sha256').update(JSON.stringify(params)).digest('hex'),
      addresses: [{
        chainId,
        address: contractAddress,
        deployedBlock: 0,
        bytecodeHash: '0x',
        implementation: null,
        implementationSlot: '0x'
      }],
      ensRoot: this.generateContractDomain({
        org: org || normalizedDAOName.toLowerCase(),
        subcategory: contractType,
        category: category || 'dao'
      }),
      standards: {
        ercs: this.getContractStandards(contractType),
        interfaces: this.getContractInterfaces(contractType)
      },
      artifacts: {
        abiHash: '0x',
        sourceUri: '',
        license: 'MIT'
      },
      security: {
        audits: [],
        owners: [],
        upgradeability: 'none',
        permissions: [],
        attestation: {
          reference: '0x',
          schema: 'https://ens.domains/ensip/19',
          attester: '0x0000000000000000000000000000000000000000',
          timestamp: new Date().toISOString(),
          revocable: false,
          revocationStatus: 'active'
        }
      },
      proxy: {
        proxyType: 'none',
        implementationAddress: null,
        implementationSlot: '0x',
        proxyAdmin: null,
        proxyVersion: null
      },
      tags: [category || 'dao', contractType],
      subdomains: []
    };
  }

  /**
   * Get contract standards based on type
   * @param {string} contractType - Type of contract
   * @returns {Array} Array of standards
   */
  getContractStandards(contractType) {
    const standards = {
      governance: ['ERC165', 'ERC721'],
      treasury: ['ERC20', 'ERC165'],
      token: ['ERC20', 'ERC165'],
      registry: ['ERC165'],
      proposal: ['ERC165'],
      voting: ['ERC165'],
      member: ['ERC165'],
      multisig: ['ERC165'],
      timelock: ['ERC165'],
      executor: ['ERC165'],
      factory: ['ERC165'],
      proxy: ['ERC1967'],
      implementation: ['ERC165']
    };

    return standards[contractType] || ['ERC165'];
  }

  /**
   * Get contract interfaces based on type
   * @param {string} contractType - Type of contract
   * @returns {Array} Array of interfaces
   */
  getContractInterfaces(contractType) {
    const interfaces = {
      governance: ['IERC165', 'IERC721'],
      treasury: ['IERC20', 'IERC165'],
      token: ['IERC20', 'IERC165'],
      registry: ['IERC165'],
      proposal: ['IERC165'],
      voting: ['IERC165'],
      member: ['IERC165'],
      multisig: ['IERC165'],
      timelock: ['IERC165'],
      executor: ['IERC165'],
      factory: ['IERC165'],
      proxy: ['IERC1967'],
      implementation: ['IERC165']
    };

    return interfaces[contractType] || ['IERC165'];
  }

  /**
   * Validate complete DAO contract structure
   * @param {Object} daoContracts - DAO contracts object
   * @returns {Object} Validation result
   */
  validateDAOContractStructure(daoContracts) {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    const requiredContracts = ['governance', 'treasury', 'token'];
    const missingContracts = [];

    for (const contractType of requiredContracts) {
      if (!daoContracts[contractType]) {
        missingContracts.push(contractType);
      }
    }

    if (missingContracts.length > 0) {
      errors.push(`Missing required contracts: ${missingContracts.join(', ')}`);
    }

    // Validate each contract name
    for (const [type, name] of Object.entries(daoContracts)) {
      const validation = this.validateContractName(name, type);
      if (!validation.isValid) {
        errors.push(...validation.errors.map(error => `${type}: ${error}`));
      }
      warnings.push(...validation.warnings.map(warning => `${type}: ${warning}`));
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
}

module.exports = { ContractNamingService };
