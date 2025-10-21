/**
 * Metadata Accessor System
 * Provides standardized access to DAO Registry metadata with validation and transformation
 */

const Joi = require('joi');
const { ethers } = require('ethers');

class MetadataAccessor {
  constructor(options = {}) {
    this.provider = options.provider || null;
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
    this.validationEnabled = options.validationEnabled !== false;
    
    // Metadata schemas
    this.schemas = {
      dao: this.createDAOSchema(),
      ens: this.createENSSchema(),
      contract: this.createContractSchema(),
      governance: this.createGovernanceSchema()
    };

    // Accessor patterns
    this.accessorPatterns = {
      // Direct property access
      direct: (obj, path) => this.getNestedProperty(obj, path),
      
      // Computed property access
      computed: (obj, path, context) => this.getComputedProperty(obj, path, context),
      
      // Validated access
      validated: (obj, path, schema) => this.getValidatedProperty(obj, path, schema),
      
      // Cached access
      cached: (obj, path, key) => this.getCachedProperty(obj, path, key),
      
      // Async access (for blockchain data)
      async: (obj, path, resolver) => this.getAsyncProperty(obj, path, resolver)
    };
  }

  /**
   * Create DAO metadata schema
   * @returns {Object} Joi schema
   */
  createDAOSchema() {
    return Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      symbol: Joi.string().required(),
      description: Joi.string().required(),
      chainId: Joi.number().integer().positive().required(),
      contractAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
      tokenAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
      treasuryAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
      governanceType: Joi.string().valid('TokenWeighted', 'Multisig', 'NFT', 'Hybrid').required(),
      votingPeriod: Joi.number().integer().positive().required(),
      quorum: Joi.number().integer().min(0).required(),
      proposalThreshold: Joi.number().integer().min(0).required(),
      status: Joi.string().valid('Active', 'Inactive', 'Paused', 'Deprecated').required(),
      verified: Joi.boolean().required(),
      active: Joi.boolean().required(),
      ensDomain: Joi.string().optional(),
      ensSubdomains: Joi.object().optional(),
      ensMetadata: Joi.object().optional(),
      socialLinks: Joi.object().optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      metadata: Joi.object().optional(),
      createdAt: Joi.date().iso().required(),
      updatedAt: Joi.date().iso().required()
    });
  }

  /**
   * Create ENS metadata schema
   * @returns {Object} Joi schema
   */
  createENSSchema() {
    return Joi.object({
      domain: Joi.string().required(),
      address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional(),
      contentHash: Joi.string().optional(),
      textRecords: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
      resolver: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional(),
      owner: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional(),
      ttl: Joi.number().integer().min(0).optional(),
      timestamp: Joi.date().iso().required()
    });
  }

  /**
   * Create contract metadata schema
   * @returns {Object} Joi schema
   */
  createContractSchema() {
    return Joi.object({
      address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
      name: Joi.string().required(),
      type: Joi.string().valid('governance', 'treasury', 'token', 'registry', 'proposal', 'voting').required(),
      abi: Joi.array().optional(),
      bytecode: Joi.string().optional(),
      deployedAt: Joi.date().iso().optional(),
      deployedBy: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional(),
      chainId: Joi.number().integer().positive().required(),
      verified: Joi.boolean().optional(),
      sourceCode: Joi.string().optional()
    });
  }

  /**
   * Create governance metadata schema
   * @returns {Object} Joi schema
   */
  createGovernanceSchema() {
    return Joi.object({
      daoId: Joi.string().required(),
      governanceType: Joi.string().required(),
      votingPeriod: Joi.number().integer().positive().required(),
      quorum: Joi.number().integer().min(0).required(),
      proposalThreshold: Joi.number().integer().min(0).required(),
      timelockDelay: Joi.number().integer().min(0).optional(),
      executionDelay: Joi.number().integer().min(0).optional(),
      votingPower: Joi.object().optional(),
      proposals: Joi.array().items(Joi.object()).optional(),
      members: Joi.array().items(Joi.object()).optional()
    });
  }

  /**
   * Get metadata with accessor pattern
   * @param {Object} data - Data object
   * @param {string} path - Property path
   * @param {string} pattern - Accessor pattern
   * @param {Object} options - Additional options
   * @returns {*} Retrieved value
   */
  get(data, path, pattern = 'direct', options = {}) {
    if (!this.accessorPatterns[pattern]) {
      throw new Error(`Unknown accessor pattern: ${pattern}`);
    }

    return this.accessorPatterns[pattern](data, path, options);
  }

  /**
   * Set metadata with validation
   * @param {Object} data - Data object
   * @param {string} path - Property path
   * @param {*} value - Value to set
   * @param {Object} schema - Validation schema
   * @returns {boolean} Success status
   */
  set(data, path, value, schema = null) {
    try {
      // Validate if schema provided
      if (schema && this.validationEnabled) {
        const validation = schema.validate(value);
        if (validation.error) {
          throw new Error(`Validation failed: ${validation.error.details[0].message}`);
        }
      }

      // Set nested property
      this.setNestedProperty(data, path, value);
      return true;
    } catch (error) {
      console.error(`Failed to set property ${path}:`, error.message);
      return false;
    }
  }

  /**
   * Get nested property from object
   * @param {Object} obj - Object to access
   * @param {string} path - Property path (e.g., 'ens.subdomains.governance')
   * @returns {*} Property value
   */
  getNestedProperty(obj, path) {
    if (!path || !obj) return undefined;
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Set nested property in object
   * @param {Object} obj - Object to modify
   * @param {string} path - Property path
   * @param {*} value - Value to set
   */
  setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }

  /**
   * Get computed property
   * @param {Object} obj - Object to access
   * @param {string} path - Property path
   * @param {Object} context - Computation context
   * @returns {*} Computed value
   */
  getComputedProperty(obj, path, context = {}) {
    const baseValue = this.getNestedProperty(obj, path);
    
    // Apply computations based on path
    switch (path) {
      case 'ens.fullDomain':
        return this.computeFullDomain(obj);
      case 'governance.effectiveQuorum':
        return this.computeEffectiveQuorum(obj);
      case 'metadata.checksum':
        return this.computeMetadataChecksum(obj);
      case 'contracts.deploymentStatus':
        return this.computeDeploymentStatus(obj);
      default:
        return baseValue;
    }
  }

  /**
   * Get validated property
   * @param {Object} obj - Object to access
   * @param {string} path - Property path
   * @param {Object} schema - Validation schema
   * @returns {*} Validated value
   */
  getValidatedProperty(obj, path, schema) {
    const value = this.getNestedProperty(obj, path);
    
    if (schema && this.validationEnabled) {
      const validation = schema.validate(value);
      if (validation.error) {
        throw new Error(`Validation failed for ${path}: ${validation.error.details[0].message}`);
      }
    }
    
    return value;
  }

  /**
   * Get cached property
   * @param {Object} obj - Object to access
   * @param {string} path - Property path
   * @param {string} key - Cache key
   * @returns {*} Cached or computed value
   */
  getCachedProperty(obj, path, key) {
    const cacheKey = `${key}:${path}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.value;
    }
    
    const value = this.getNestedProperty(obj, path);
    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now()
    });
    
    return value;
  }

  /**
   * Get async property (for blockchain data)
   * @param {Object} obj - Object to access
   * @param {string} path - Property path
   * @param {Function} resolver - Async resolver function
   * @returns {Promise} Resolved value
   */
  async getAsyncProperty(obj, path, resolver) {
    const cacheKey = `async:${path}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.value;
    }
    
    try {
      const value = await resolver(obj, path);
      this.cache.set(cacheKey, {
        value,
        timestamp: Date.now()
      });
      return value;
    } catch (error) {
      console.error(`Failed to resolve async property ${path}:`, error.message);
      return undefined;
    }
  }

  /**
   * Compute full ENS domain
   * @param {Object} dao - DAO object
   * @returns {string} Full domain
   */
  computeFullDomain(dao) {
    if (!dao.ensDomain) return null;
    
    const subdomains = dao.ensSubdomains || {};
    const primary = dao.ensDomain;
    
    return {
      primary,
      subdomains: Object.entries(subdomains).map(([type, subdomain]) => ({
        type,
        domain: subdomain,
        fullDomain: `${subdomain}.${primary}`
      }))
    };
  }

  /**
   * Compute effective quorum
   * @param {Object} dao - DAO object
   * @returns {number} Effective quorum
   */
  computeEffectiveQuorum(dao) {
    const baseQuorum = dao.quorum || 0;
    const totalSupply = dao.tokenSupply || 0;
    
    if (totalSupply === 0) return baseQuorum;
    
    return Math.min(baseQuorum, totalSupply);
  }

  /**
   * Compute metadata checksum
   * @param {Object} dao - DAO object
   * @returns {string} Checksum
   */
  computeMetadataChecksum(dao) {
    const crypto = require('crypto');
    const metadataString = JSON.stringify(dao.metadata || {});
    return crypto.createHash('sha256').update(metadataString).digest('hex');
  }

  /**
   * Compute deployment status
   * @param {Object} dao - DAO object
   * @returns {Object} Deployment status
   */
  computeDeploymentStatus(dao) {
    const contracts = [
      { name: 'governance', address: dao.governanceAddress },
      { name: 'treasury', address: dao.treasuryAddress },
      { name: 'token', address: dao.tokenAddress }
    ];
    
    const deployed = contracts.filter(c => c.address && c.address !== '0x0000000000000000000000000000000000000000');
    
    return {
      total: contracts.length,
      deployed: deployed.length,
      pending: contracts.length - deployed.length,
      contracts: contracts.map(c => ({
        ...c,
        deployed: c.address && c.address !== '0x0000000000000000000000000000000000000000'
      }))
    };
  }

  /**
   * Validate DAO metadata
   * @param {Object} dao - DAO object
   * @returns {Object} Validation result
   */
  validateDAO(dao) {
    const validation = this.schemas.dao.validate(dao);
    
    return {
      isValid: !validation.error,
      errors: validation.error ? validation.error.details.map(d => d.message) : [],
      warnings: this.generateWarnings(dao),
      suggestions: this.generateSuggestions(dao)
    };
  }

  /**
   * Validate ENS metadata
   * @param {Object} ens - ENS object
   * @returns {Object} Validation result
   */
  validateENS(ens) {
    const validation = this.schemas.ens.validate(ens);
    
    return {
      isValid: !validation.error,
      errors: validation.error ? validation.error.details.map(d => d.message) : [],
      warnings: this.generateENSWarnings(ens),
      suggestions: this.generateENSSuggestions(ens)
    };
  }

  /**
   * Generate warnings for DAO metadata
   * @param {Object} dao - DAO object
   * @returns {Array} Warnings
   */
  generateWarnings(dao) {
    const warnings = [];
    
    if (!dao.ensDomain) {
      warnings.push('No ENS domain specified');
    }
    
    if (!dao.socialLinks || Object.keys(dao.socialLinks).length === 0) {
      warnings.push('No social links provided');
    }
    
    if (!dao.tags || dao.tags.length === 0) {
      warnings.push('No tags specified for categorization');
    }
    
    if (dao.quorum > 1000000000) {
      warnings.push('Quorum value seems unusually high');
    }
    
    return warnings;
  }

  /**
   * Generate suggestions for DAO metadata
   * @param {Object} dao - DAO object
   * @returns {Array} Suggestions
   */
  generateSuggestions(dao) {
    const suggestions = [];
    
    if (!dao.ensDomain) {
      suggestions.push('Consider registering an ENS domain for better discoverability');
    }
    
    if (!dao.ensSubdomains) {
      suggestions.push('Set up ENS subdomains for governance, treasury, and other components');
    }
    
    if (!dao.metadata) {
      suggestions.push('Add structured metadata for better integration with external systems');
    }
    
    return suggestions;
  }

  /**
   * Generate ENS warnings
   * @param {Object} ens - ENS object
   * @returns {Array} Warnings
   */
  generateENSWarnings(ens) {
    const warnings = [];
    
    if (!ens.address) {
      warnings.push('No address record set');
    }
    
    if (!ens.textRecords || Object.keys(ens.textRecords).length === 0) {
      warnings.push('No text records configured');
    }
    
    if (ens.ttl && ens.ttl < 300) {
      warnings.push('TTL is very short, consider increasing for better performance');
    }
    
    return warnings;
  }

  /**
   * Generate ENS suggestions
   * @param {Object} ens - ENS object
   * @returns {Array} Suggestions
   */
  generateENSSuggestions(ens) {
    const suggestions = [];
    
    if (!ens.textRecords) {
      suggestions.push('Add text records for description, URL, and avatar');
    }
    
    if (!ens.contentHash) {
      suggestions.push('Consider setting content hash for decentralized website hosting');
    }
    
    return suggestions;
  }

  /**
   * Clear cache
   * @param {string} pattern - Cache key pattern (optional)
   */
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: process.memoryUsage()
    };
  }
}

module.exports = MetadataAccessor;




