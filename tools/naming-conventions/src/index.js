/**
 * DAO Registry Naming Convention Toolkit
 * Main entry point for the naming convention and metadata accessor system
 */

const MetadataAccessor = require('./metadata/metadata-accessor');
const ENSDomainValidator = require('./ens/domain-validator');
const ENSMetadataIntegration = require('./ens/ens-metadata-integration');
const ContractNamingConventions = require('./contracts/naming-conventions');

class DAORegistryNamingToolkit {
  constructor(options = {}) {
    this.accessor = new MetadataAccessor(options.accessor);
    this.ensValidator = new ENSDomainValidator();
    this.ensMetadataIntegration = new ENSMetadataIntegration(options.ensMetadata);
    this.contractNaming = new ContractNamingConventions();
    
    this.options = {
      validationEnabled: options.validationEnabled !== false,
      cacheEnabled: options.cacheEnabled !== false,
      ...options
    };
  }

  /**
   * Get metadata accessor instance
   * @returns {MetadataAccessor} Accessor instance
   */
  getAccessor() {
    return this.accessor;
  }

  /**
   * Get ENS domain validator instance
   * @returns {ENSDomainValidator} Validator instance
   */
  getENSValidator() {
    return this.ensValidator;
  }

  /**
   * Get ENS metadata integration instance
   * @returns {ENSMetadataIntegration} Integration instance
   */
  getENSMetadataIntegration() {
    return this.ensMetadataIntegration;
  }

  /**
   * Get contract naming conventions instance
   * @returns {ContractNamingConventions} Naming conventions instance
   */
  getContractNaming() {
    return this.contractNaming;
  }

  /**
   * Validate complete DAO metadata
   * @param {Object} dao - DAO object
   * @returns {Object} Comprehensive validation result
   */
  validateDAO(dao) {
    const results = {
      dao: this.accessor.validateDAO(dao),
      ens: null,
      contracts: null,
      overall: {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
      }
    };

    // Validate ENS if present
    if (dao.ensDomain) {
      results.ens = this.ensValidator.validateDomain(dao.ensDomain, 'primary');
      
      if (dao.ensSubdomains) {
        const subdomainResults = [];
        for (const [type, subdomain] of Object.entries(dao.ensSubdomains)) {
          subdomainResults.push(this.ensValidator.validateDomain(subdomain, 'subdomain'));
        }
        results.ensSubdomains = subdomainResults;
      }
    }

    // Validate contract names if present
    if (dao.contractAddress || dao.governanceAddress || dao.treasuryAddress) {
      results.contracts = {
        governance: dao.governanceAddress ? 
          this.contractNaming.validateContractName(dao.name + 'Governance') : null,
        treasury: dao.treasuryAddress ? 
          this.contractNaming.validateContractName(dao.name + 'Treasury') : null,
        token: dao.tokenAddress ? 
          this.contractNaming.validateContractName(dao.name + 'Token') : null
      };
    }

    // Compile overall results
    this.compileOverallResults(results);

    return results;
  }

  /**
   * Generate complete DAO structure with naming conventions
   * @param {string} daoName - DAO name
   * @param {Object} options - Generation options
   * @returns {Object} Generated DAO structure
   */
  generateDAOStructure(daoName, options = {}) {
    const normalizedName = this.contractNaming.normalizeDAOName(daoName);
    const ensDomain = this.ensValidator.normalizeDomain(`${normalizedName.toLowerCase()}.eth`);
    
    const structure = {
      basic: {
        name: normalizedName,
        symbol: options.symbol || normalizedName.substring(0, 3).toUpperCase(),
        description: options.description || `${normalizedName} DAO`,
        ensDomain: ensDomain
      },
      contracts: this.contractNaming.generateDAOContractNames(normalizedName, {
        includeInterfaces: options.includeInterfaces !== false,
        includeImplementations: options.includeImplementations !== false,
        includeVersions: options.includeVersions || false
      }),
      ens: {
        primary: ensDomain,
        subdomains: this.ensValidator.generateStandardSubdomains(ensDomain)
      },
      metadata: {
        tags: options.tags || ['DAO', 'Governance'],
        socialLinks: options.socialLinks || {},
        metadata: {
          recordType: 'DAO',
          systemId: 'dao-registry',
          externalId: `${normalizedName.toLowerCase()}-dao`
        }
      }
    };

    return structure;
  }

  /**
   * Migrate existing DAO to new naming conventions
   * @param {Object} existingDAO - Existing DAO object
   * @param {Object} options - Migration options
   * @returns {Object} Migration result
   */
  migrateDAO(existingDAO, options = {}) {
    const result = {
      original: existingDAO,
      migrated: { ...existingDAO },
      changes: [],
      warnings: [],
      errors: []
    };

    try {
      // Migrate ENS domain
      if (existingDAO.ensDomain) {
        const validation = this.ensValidator.validateDomain(existingDAO.ensDomain, 'primary');
        if (!validation.isValid) {
          result.warnings.push(`ENS domain validation failed: ${validation.errors.join(', ')}`);
          if (validation.normalizedDomain) {
            result.migrated.ensDomain = validation.normalizedDomain;
            result.changes.push(`ENS domain normalized: ${existingDAO.ensDomain} → ${validation.normalizedDomain}`);
          }
        }
      }

      // Migrate contract names
      const contractChanges = this.migrateContractNames(existingDAO);
      result.changes.push(...contractChanges.changes);
      result.warnings.push(...contractChanges.warnings);

      // Migrate metadata structure
      if (existingDAO.metadata) {
        const metadataChanges = this.migrateMetadata(existingDAO.metadata);
        result.migrated.metadata = metadataChanges.migrated;
        result.changes.push(...metadataChanges.changes);
      }

      // Validate migrated DAO
      const validation = this.validateDAO(result.migrated);
      if (!validation.overall.isValid) {
        result.errors.push(...validation.overall.errors);
      }
      result.warnings.push(...validation.overall.warnings);

    } catch (error) {
      result.errors.push(`Migration failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Migrate contract names
   * @param {Object} dao - DAO object
   * @returns {Object} Migration result
   */
  migrateContractNames(dao) {
    const result = {
      changes: [],
      warnings: []
    };

    // This would contain logic to migrate contract names
    // For now, just return empty result
    return result;
  }

  /**
   * Migrate metadata structure
   * @param {Object} metadata - Existing metadata
   * @returns {Object} Migration result
   */
  migrateMetadata(metadata) {
    const result = {
      migrated: { ...metadata },
      changes: []
    };

    // Ensure required fields
    if (!result.migrated.recordType) {
      result.migrated.recordType = 'DAO';
      result.changes.push('Added recordType field');
    }

    if (!result.migrated.systemId) {
      result.migrated.systemId = 'dao-registry';
      result.changes.push('Added systemId field');
    }

    return result;
  }

  /**
   * Compile overall validation results
   * @param {Object} results - Individual validation results
   */
  compileOverallResults(results) {
    const overall = results.overall;

    // Check DAO validation
    if (!results.dao.isValid) {
      overall.isValid = false;
      overall.errors.push(...results.dao.errors);
    }
    overall.warnings.push(...results.dao.warnings);
    overall.suggestions.push(...results.dao.suggestions);

    // Check ENS validation
    if (results.ens && !results.ens.isValid) {
      overall.isValid = false;
      overall.errors.push(`ENS validation failed: ${results.ens.errors.join(', ')}`);
    }
    if (results.ens && results.ens.warnings) {
      overall.warnings.push(...results.ens.warnings);
    }

    // Check contract validation
    if (results.contracts) {
      Object.entries(results.contracts).forEach(([type, validation]) => {
        if (validation && !validation.isValid) {
          overall.warnings.push(`${type} contract naming validation failed`);
        }
      });
    }
  }

  /**
   * Get toolkit statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      accessor: this.accessor.getCacheStats(),
      ensValidator: {
        reservedSubdomains: this.ensValidator.reservedSubdomains.size
      },
      contractNaming: {
        contractTypes: Object.keys(this.contractNaming.contractTypes).length,
        namingPatterns: Object.keys(this.contractNaming.namingPatterns).length
      }
    };
  }

  /**
   * Clear all caches
   */
  clearCaches() {
    this.accessor.clearCache();
  }

  /**
   * Export toolkit configuration
   * @returns {Object} Configuration
   */
  exportConfig() {
    return {
      options: this.options,
      schemas: Object.keys(this.accessor.schemas),
      contractTypes: Object.values(this.contractNaming.contractTypes),
      reservedSubdomains: Array.from(this.ensValidator.reservedSubdomains)
    };
  }
}

// Export individual classes and main toolkit
module.exports = {
  DAORegistryNamingToolkit,
  MetadataAccessor,
  ENSDomainValidator,
  ENSMetadataIntegration,
  ContractNamingConventions
};
