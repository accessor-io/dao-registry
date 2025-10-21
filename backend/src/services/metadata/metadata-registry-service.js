const { DAORegistryNamingToolkit } = require('../../../../tools/naming-conventions/src/index');
const ENSContractService = require('../../blockchain/ens-contract-service');

class MetadataRegistryService {
  constructor(options = {}) {
    this.toolkit = new DAORegistryNamingToolkit(options.toolkit);
    this.storage = options.storage || new Map(); // In-memory storage for demo
    this.schemas = this.initializeSchemas();
    this.ensContractService = new ENSContractService(options.ensContractService);
  }

  initializeSchemas() {
    return {
      dao: {
        type: 'object',
        required: ['name', 'ens'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          ens: { type: 'string', pattern: '^[a-z0-9-]+\\.eth$' },
          governance: { type: 'object' },
          treasury: { type: 'object' },
          contracts: { type: 'array' },
          metadata: { type: 'object' }
        }
      },
      contract: {
        type: 'object',
        required: ['name', 'type', 'address'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          type: { type: 'string', enum: ['governance', 'treasury', 'token', 'voting', 'execution'] },
          address: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
          abi: { type: 'array' },
          metadata: { type: 'object' }
        }
      },
      ens: {
        type: 'object',
        required: ['domain', 'owner'],
        properties: {
          id: { type: 'string' },
          domain: { type: 'string', pattern: '^[a-z0-9-]+\\.eth$' },
          owner: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
          resolver: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
          textRecords: { type: 'object' },
          metadata: { type: 'object' }
        }
      }
    };
  }

  async registerDAO(daoData) {
    try {
      // Validate schema
      const validation = this.validateSchema('dao', daoData);
      if (!validation.isValid) {
        throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate contract names
      const contractGeneration = await this.toolkit.generateContractNames(daoData.name, {
        includeInterfaces: true,
        includeImplementations: true
      });

      // Create DAO metadata
      const daoMetadata = {
        id: `dao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: daoData.name,
        description: daoData.description || '',
        ens: daoData.ens,
        governance: daoData.governance || {},
        treasury: daoData.treasury || {},
        contracts: contractGeneration.contracts || [],
        metadata: {
          ...daoData.metadata,
          registeredAt: new Date().toISOString(),
          version: '1.0.0',
          source: 'metadata-registry'
        }
      };

      // Store metadata
      this.storage.set(daoMetadata.id, daoMetadata);

      return {
        success: true,
        dao: daoMetadata,
        message: 'DAO metadata registered successfully'
      };
    } catch (error) {
      throw new Error(`Failed to register DAO metadata: ${error.message}`);
    }
  }

  async registerContract(contractData) {
    try {
      // Validate schema
      const validation = this.validateSchema('contract', contractData);
      if (!validation.isValid) {
        throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
      }

      // Create contract metadata
      const contractMetadata = {
        id: `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: contractData.name,
        type: contractData.type,
        address: contractData.address,
        abi: contractData.abi || [],
        metadata: {
          ...contractData.metadata,
          registeredAt: new Date().toISOString(),
          version: '1.0.0',
          source: 'metadata-registry'
        }
      };

      // Store metadata
      this.storage.set(contractMetadata.id, contractMetadata);

      return {
        success: true,
        contract: contractMetadata,
        message: 'Contract metadata registered successfully'
      };
    } catch (error) {
      throw new Error(`Failed to register contract metadata: ${error.message}`);
    }
  }

  async registerENS(ensData) {
    try {
      // Validate schema
      const validation = this.validateSchema('ens', ensData);
      if (!validation.isValid) {
        throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
      }

      // Validate domain using naming toolkit
      const domainValidation = await this.toolkit.validateENSDomain(ensData.domain);
      if (!domainValidation.isValid) {
        throw new Error(`Invalid ENS domain: ${domainValidation.errors.join(', ')}`);
      }

      // Create ENS metadata
      const ensMetadata = {
        id: `ens_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        domain: ensData.domain,
        owner: ensData.owner,
        resolver: ensData.resolver || '',
        textRecords: ensData.textRecords || {},
        metadata: {
          ...ensData.metadata,
          registeredAt: new Date().toISOString(),
          version: '1.0.0',
          source: 'metadata-registry',
          validation: domainValidation
        }
      };

      // Store metadata
      this.storage.set(ensMetadata.id, ensMetadata);

      return {
        success: true,
        ens: ensMetadata,
        message: 'ENS metadata registered successfully'
      };
    } catch (error) {
      throw new Error(`Failed to register ENS metadata: ${error.message}`);
    }
  }

  async getMetadata(id) {
    try {
      const metadata = this.storage.get(id);
      if (!metadata) {
        throw new Error(`Metadata with ID ${id} not found`);
      }

      return {
        success: true,
        metadata
      };
    } catch (error) {
      throw new Error(`Failed to retrieve metadata: ${error.message}`);
    }
  }

  // =======================================================================
  // ENS CONTRACT INTEGRATION METHODS
  // =======================================================================

  /**
   * Register contract with ENS
   * @param {Object} contractData - Contract data
   * @param {Object} ensData - ENS data
   * @returns {Promise<Object>} Registration result
   */
  async registerContractWithENS(contractData, ensData) {
    try {
      // Validate ENS data
      const validation = await this.validateENSTextRecords(ensData.textRecords || {});
      if (!validation.isValid) {
        throw new Error(`ENS validation failed: ${validation.errors.join(', ')}`);
      }

      // Register contract for ENS integration
      const registrationResult = await this.ensContractService.registerContractForENS(
        contractData.address,
        ensData.ensName
      );

      // Set text records
      if (ensData.textRecords && Object.keys(ensData.textRecords).length > 0) {
        const textRecords = Object.entries(ensData.textRecords).map(([key, value]) => ({
          key,
          value
        }));

        await this.ensContractService.batchSetContractTextRecords(
          contractData.address,
          textRecords
        );
      }

      // Set reverse record if provided
      if (ensData.reverseRecord) {
        await this.ensContractService.setReverseRecord(
          contractData.address,
          ensData.reverseRecord
        );
      }

      // Sync metadata to contract
      await this.ensContractService.syncMetadataToContract(
        contractData.address,
        contractData.metadata
      );

      return {
        success: true,
        contractAddress: contractData.address,
        ensName: ensData.ensName,
        registrationResult,
        message: 'Contract registered with ENS successfully'
      };
    } catch (error) {
      throw new Error(`Failed to register contract with ENS: ${error.message}`);
    }
  }

  /**
   * Update contract ENS metadata
   * @param {string} contractId - Contract ID
   * @param {Object} ensMetadata - ENS metadata updates
   * @returns {Promise<Object>} Update result
   */
  async updateContractENSMetadata(contractId, ensMetadata) {
    try {
      // Get existing contract data
      const existingData = this.storage.get(contractId);
      if (!existingData) {
        throw new Error(`Contract with ID ${contractId} not found`);
      }

      // Validate ENS text records
      if (ensMetadata.textRecords) {
        const validation = await this.validateENSTextRecords(ensMetadata.textRecords);
        if (!validation.isValid) {
          throw new Error(`ENS validation failed: ${validation.errors.join(', ')}`);
        }

        // Update text records
        const textRecords = Object.entries(ensMetadata.textRecords).map(([key, value]) => ({
          key,
          value
        }));

        await this.ensContractService.batchSetContractTextRecords(
          existingData.address,
          textRecords
        );
      }

      // Update reverse record if provided
      if (ensMetadata.reverseRecord) {
        await this.ensContractService.setReverseRecord(
          existingData.address,
          ensMetadata.reverseRecord
        );
      }

      // Update local storage
      const updatedData = {
        ...existingData,
        ensMetadata: {
          ...existingData.ensMetadata,
          ...ensMetadata,
          updatedAt: new Date().toISOString()
        }
      };

      this.storage.set(contractId, updatedData);

      return {
        success: true,
        contractId,
        ensMetadata: updatedData.ensMetadata,
        message: 'Contract ENS metadata updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update contract ENS metadata: ${error.message}`);
    }
  }

  /**
   * Validate ENS text records
   * @param {Object} textRecords - Text records to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateENSTextRecords(textRecords) {
    try {
      const records = Object.entries(textRecords).map(([key, value]) => ({
        key,
        value
      }));

      const validation = await this.ensContractService.validateTextRecords(records);

      return {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings
      };
    } catch (error) {
      throw new Error(`Failed to validate ENS text records: ${error.message}`);
    }
  }

  /**
   * Sync metadata to ENS contract
   * @param {string} contractId - Contract ID
   * @returns {Promise<Object>} Sync result
   */
  async syncToENSContract(contractId) {
    try {
      const contractData = this.storage.get(contractId);
      if (!contractData) {
        throw new Error(`Contract with ID ${contractId} not found`);
      }

      // Sync metadata to contract
      const syncResult = await this.ensContractService.syncMetadataToContract(
        contractData.address,
        contractData.metadata
      );

      return {
        success: true,
        contractId,
        contractAddress: contractData.address,
        syncResult,
        message: 'Metadata synced to ENS contract successfully'
      };
    } catch (error) {
      throw new Error(`Failed to sync to ENS contract: ${error.message}`);
    }
  }

  /**
   * Get ENS integration status for a contract
   * @param {string} contractId - Contract ID
   * @returns {Promise<Object>} Integration status
   */
  async getENSIntegrationStatus(contractId) {
    try {
      const contractData = this.storage.get(contractId);
      if (!contractData) {
        throw new Error(`Contract with ID ${contractId} not found`);
      }

      const status = await this.ensContractService.getENSIntegrationStatus(
        contractData.address
      );

      return {
        success: true,
        contractId,
        contractAddress: contractData.address,
        status
      };
    } catch (error) {
      throw new Error(`Failed to get ENS integration status: ${error.message}`);
    }
  }

  /**
   * Get complete ENS metadata for a contract
   * @param {string} contractId - Contract ID
   * @returns {Promise<Object>} Complete ENS metadata
   */
  async getCompleteENSMetadata(contractId) {
    try {
      const contractData = this.storage.get(contractId);
      if (!contractData) {
        throw new Error(`Contract with ID ${contractId} not found`);
      }

      const ensMetadata = await this.ensContractService.getCompleteENSMetadata(
        contractData.address
      );

      return {
        success: true,
        contractId,
        contractAddress: contractData.address,
        ensMetadata
      };
    } catch (error) {
      throw new Error(`Failed to get complete ENS metadata: ${error.message}`);
    }
  }

  /**
   * Set ENS contract addresses
   * @param {Object} addresses - Contract addresses
   */
  setENSContractAddresses(addresses) {
    this.ensContractService.setContractAddresses(addresses);
  }

  /**
   * Get ENS service statistics
   * @returns {Object} Service statistics
   */
  getENSStatistics() {
    return this.ensContractService.getStatistics();
  }

  async searchMetadata(query, options = {}) {
    try {
      const { type, limit = 10, offset = 0 } = options;
      const results = [];

      // Search through stored metadata
      for (const [id, metadata] of this.storage.entries()) {
        // Filter by type if specified
        if (type && !id.startsWith(`${type}_`)) {
          continue;
        }

        // Search in name, description, domain, etc.
        const searchableText = [
          metadata.name,
          metadata.description,
          metadata.domain,
          metadata.ens
        ].filter(Boolean).join(' ').toLowerCase();

        if (searchableText.includes(query.toLowerCase())) {
          results.push({
            id,
            type: id.split('_')[0],
            name: metadata.name,
            ens: metadata.ens || metadata.domain,
            address: metadata.address,
            score: this.calculateRelevanceScore(query, searchableText),
            metadata
          });
        }
      }

      // Sort by relevance score
      results.sort((a, b) => b.score - a.score);

      // Apply pagination
      const paginatedResults = results.slice(offset, offset + limit);

      return {
        success: true,
        query,
        results: paginatedResults,
        total: results.length,
        limit,
        offset
      };
    } catch (error) {
      throw new Error(`Failed to search metadata: ${error.message}`);
    }
  }

  async updateMetadata(id, updates) {
    try {
      const existingMetadata = this.storage.get(id);
      if (!existingMetadata) {
        throw new Error(`Metadata with ID ${id} not found`);
      }

      // Merge updates with existing metadata
      const updatedMetadata = {
        ...existingMetadata,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Store updated metadata
      this.storage.set(id, updatedMetadata);

      return {
        success: true,
        metadata: updatedMetadata,
        message: 'Metadata updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update metadata: ${error.message}`);
    }
  }

  async deleteMetadata(id) {
    try {
      const existingMetadata = this.storage.get(id);
      if (!existingMetadata) {
        throw new Error(`Metadata with ID ${id} not found`);
      }

      // Remove metadata
      this.storage.delete(id);

      return {
        success: true,
        message: `Metadata ${id} deleted successfully`
      };
    } catch (error) {
      throw new Error(`Failed to delete metadata: ${error.message}`);
    }
  }

  async getStatistics() {
    try {
      const stats = {
        total: this.storage.size,
        byType: {
          dao: 0,
          contract: 0,
          ens: 0
        },
        byStatus: {
          active: 0,
          inactive: 0
        },
        recentRegistrations: 0,
        lastUpdated: new Date().toISOString()
      };

      // Count by type
      for (const [id] of this.storage.entries()) {
        const type = id.split('_')[0];
        if (stats.byType[type] !== undefined) {
          stats.byType[type]++;
        }
      }

      // Count recent registrations (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      for (const [, metadata] of this.storage.entries()) {
        const registeredAt = new Date(metadata.metadata.registeredAt);
        if (registeredAt > oneDayAgo) {
          stats.recentRegistrations++;
        }
      }

      // All metadata is considered active for demo
      stats.byStatus.active = stats.total;

      return {
        success: true,
        statistics: stats
      };
    } catch (error) {
      throw new Error(`Failed to retrieve statistics: ${error.message}`);
    }
  }

  validateSchema(type, data) {
    const schema = this.schemas[type];
    if (!schema) {
      return {
        isValid: false,
        errors: [`Unknown schema type: ${type}`]
      };
    }

    const errors = [];

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!data[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Check field types and constraints
    if (schema.properties) {
      for (const [field, rules] of Object.entries(schema.properties)) {
        if (data[field] !== undefined) {
          // Type validation
          if (rules.type === 'string' && typeof data[field] !== 'string') {
            errors.push(`Field ${field} must be a string`);
          } else if (rules.type === 'object' && typeof data[field] !== 'object') {
            errors.push(`Field ${field} must be an object`);
          } else if (rules.type === 'array' && !Array.isArray(data[field])) {
            errors.push(`Field ${field} must be an array`);
          }

          // String length validation
          if (rules.type === 'string' && typeof data[field] === 'string') {
            if (rules.minLength && data[field].length < rules.minLength) {
              errors.push(`Field ${field} must be at least ${rules.minLength} characters`);
            }
            if (rules.maxLength && data[field].length > rules.maxLength) {
              errors.push(`Field ${field} must be at most ${rules.maxLength} characters`);
            }
          }

          // Pattern validation
          if (rules.pattern && typeof data[field] === 'string') {
            const regex = new RegExp(rules.pattern);
            if (!regex.test(data[field])) {
              errors.push(`Field ${field} does not match required pattern`);
            }
          }

          // Enum validation
          if (rules.enum && !rules.enum.includes(data[field])) {
            errors.push(`Field ${field} must be one of: ${rules.enum.join(', ')}`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  calculateRelevanceScore(query, text) {
    const queryWords = query.toLowerCase().split(' ');
    const textWords = text.split(' ');
    
    let score = 0;
    for (const queryWord of queryWords) {
      for (const textWord of textWords) {
        if (textWord.includes(queryWord)) {
          score += 1;
        }
        if (textWord === queryWord) {
          score += 2; // Exact match gets higher score
        }
      }
    }
    
    return Math.min(score / queryWords.length, 1); // Normalize to 0-1
  }

  // Export all metadata (for backup/migration)
  exportMetadata() {
    const metadata = {};
    for (const [id, data] of this.storage.entries()) {
      metadata[id] = data;
    }
    return metadata;
  }

  // Import metadata (for restore/migration)
  importMetadata(metadata) {
    for (const [id, data] of Object.entries(metadata)) {
      this.storage.set(id, data);
    }
  }
}

module.exports = MetadataRegistryService;
