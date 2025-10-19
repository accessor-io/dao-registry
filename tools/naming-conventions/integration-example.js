/**
 * DAO Registry Integration Example
 * Demonstrates how to integrate the naming convention toolkit with the main DAO Registry
 */

const { DAORegistryNamingToolkit } = require('./src/index');

// Initialize the toolkit
const toolkit = new DAORegistryNamingToolkit();

// Example: Integrate with existing DAO Registry backend
class DAORegistryIntegration {
  constructor() {
    this.toolkit = toolkit;
    this.accessor = toolkit.getAccessor();
    this.ensValidator = toolkit.getENSValidator();
    this.contractNaming = toolkit.getContractNaming();
  }

  /**
   * Enhanced DAO registration with naming conventions
   * @param {Object} daoData - Raw DAO data
   * @returns {Object} Processed DAO with standardized naming
   */
  async registerDAO(daoData) {
    console.log('🔧 Processing DAO registration with naming conventions...');

    // Step 1: Generate standardized structure
    const structure = this.toolkit.generateDAOStructure(daoData.name, {
      symbol: daoData.symbol,
      description: daoData.description,
      tags: daoData.tags
    });

    // Step 2: Validate ENS domain if provided
    if (daoData.ensDomain) {
      const ensValidation = this.ensValidator.validateDomain(daoData.ensDomain, 'primary');
      if (!ensValidation.isValid) {
        console.warn('⚠️  ENS domain validation failed:', ensValidation.errors);
        // Use generated domain as fallback
        daoData.ensDomain = structure.basic.ensDomain;
      }
    } else {
      daoData.ensDomain = structure.basic.ensDomain;
    }

    // Step 3: Validate contract names
    const contractValidation = this.validateContractNames(daoData);
    if (contractValidation.hasErrors) {
      console.warn('⚠️  Contract naming issues found:', contractValidation.errors);
    }

    // Step 4: Create standardized DAO object
    const standardizedDAO = {
      ...daoData,
      ...structure.basic,
      contracts: structure.contracts,
      ens: structure.ens,
      metadata: {
        ...daoData.metadata,
        ...structure.metadata.metadata
      },
      tags: structure.metadata.tags,
      socialLinks: structure.metadata.socialLinks
    };

    // Step 5: Validate complete DAO
    const validation = this.toolkit.validateDAO(standardizedDAO);
    if (!validation.overall.isValid) {
      throw new Error(`DAO validation failed: ${validation.overall.errors.join(', ')}`);
    }

    console.log('✅ DAO registration processed successfully');
    return {
      dao: standardizedDAO,
      validation,
      structure
    };
  }

  /**
   * Validate contract names against conventions
   * @param {Object} daoData - DAO data
   * @returns {Object} Validation result
   */
  validateContractNames(daoData) {
    const result = {
      hasErrors: false,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Check governance contract
    if (daoData.governanceAddress) {
      const governanceValidation = this.contractNaming.validateContractName(
        daoData.name + 'Governance'
      );
      if (!governanceValidation.isValid) {
        result.hasErrors = true;
        result.errors.push(`Governance contract naming: ${governanceValidation.errors.join(', ')}`);
      }
    }

    // Check treasury contract
    if (daoData.treasuryAddress) {
      const treasuryValidation = this.contractNaming.validateContractName(
        daoData.name + 'Treasury'
      );
      if (!treasuryValidation.isValid) {
        result.hasErrors = true;
        result.errors.push(`Treasury contract naming: ${treasuryValidation.errors.join(', ')}`);
      }
    }

    // Check token contract
    if (daoData.tokenAddress) {
      const tokenValidation = this.contractNaming.validateContractName(
        daoData.name + 'Token'
      );
      if (!tokenValidation.isValid) {
        result.hasErrors = true;
        result.errors.push(`Token contract naming: ${tokenValidation.errors.join(', ')}`);
      }
    }

    return result;
  }

  /**
   * Access DAO metadata using accessor patterns
   * @param {Object} dao - DAO object
   * @param {string} path - Property path
   * @param {string} pattern - Accessor pattern
   * @returns {*} Retrieved value
   */
  accessDAOMetadata(dao, path, pattern = 'direct') {
    return this.accessor.get(dao, path, pattern);
  }

  /**
   * Migrate existing DAO to new standards
   * @param {Object} existingDAO - Existing DAO
   * @returns {Object} Migration result
   */
  migrateDAO(existingDAO) {
    console.log('🔄 Migrating DAO to new naming conventions...');
    
    const migration = this.toolkit.migrateDAO(existingDAO);
    
    if (migration.errors.length > 0) {
      console.error('❌ Migration failed:', migration.errors);
    } else {
      console.log('✅ Migration completed successfully');
      if (migration.changes.length > 0) {
        console.log('📝 Changes made:', migration.changes);
      }
    }

    return migration;
  }

  /**
   * Get toolkit statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return this.toolkit.getStats();
  }

  /**
   * Clear all caches
   */
  clearCaches() {
    this.toolkit.clearCaches();
    console.log('🧹 Caches cleared');
  }
}

// Example usage
async function demonstrateIntegration() {
  console.log('🚀 DAO Registry Naming Convention Toolkit Integration Demo\n');

  const integration = new DAORegistryIntegration();

  // Example 1: Register a new DAO
  console.log('📝 Example 1: Registering a new DAO');
  const newDAOData = {
    name: 'CompoundDAO',
    symbol: 'COMP',
    description: 'Algorithmic interest rate protocol governance',
    chainId: 1,
    contractAddress: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    tokenAddress: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    treasuryAddress: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
    governanceAddress: '0x6d903f6003ba625cd163582c4e4a27f2b91bd6f8',
    governanceType: 'TokenWeighted',
    votingPeriod: 3,
    quorum: 400000,
    proposalThreshold: 100000,
    status: 'Active',
    verified: true,
    active: true,
    tags: ['DeFi', 'Lending', 'Governance'],
    createdAt: '2020-06-15T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z'
  };

  try {
    const registration = await integration.registerDAO(newDAOData);
    console.log('✅ Registration successful\n');
  } catch (error) {
    console.error('❌ Registration failed:', error.message, '\n');
  }

  // Example 2: Access metadata using different patterns
  console.log('🔍 Example 2: Accessing metadata with different patterns');
  const sampleDAO = {
    name: 'Uniswap',
    ensDomain: 'uniswap.eth',
    ensSubdomains: {
      governance: 'gov.uniswap.eth',
      treasury: 'treasury.uniswap.eth'
    },
    quorum: 40000000,
    tokenSupply: 1000000000
  };

  // Direct access
  const directAccess = integration.accessDAOMetadata(sampleDAO, 'name');
  console.log('Direct access (name):', directAccess);

  // Computed access
  const computedAccess = integration.accessDAOMetadata(sampleDAO, 'ens.fullDomain', 'computed');
  console.log('Computed access (ens.fullDomain):', computedAccess);

  // Cached access
  const cachedAccess = integration.accessDAOMetadata(sampleDAO, 'quorum', 'cached', 'dao-1');
  console.log('Cached access (quorum):', cachedAccess);

  console.log('');

  // Example 3: Migrate existing DAO
  console.log('🔄 Example 3: Migrating existing DAO');
  const existingDAO = {
    name: 'Aave DAO',
    symbol: 'AAVE',
    ensDomain: 'aave.eth', // This will be normalized
    governanceType: 'TokenWeighted',
    // Missing some required fields
    chainId: 1,
    contractAddress: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    tokenAddress: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    treasuryAddress: '0x25F2226B597E8F9514B3F68F00f510cEfD2D811c',
    governanceAddress: '0xEC568fffba86c094cf06b22134B23074DFE2252c',
    votingPeriod: 5,
    quorum: 800000,
    proposalThreshold: 80000,
    status: 'Active',
    verified: true,
    active: true,
    createdAt: '2020-12-01T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z'
  };

  const migration = integration.migrateDAO(existingDAO);
  console.log('');

  // Example 4: Get statistics
  console.log('📊 Example 4: Toolkit statistics');
  const stats = integration.getStats();
  console.log('Cache size:', stats.accessor.size);
  console.log('Reserved subdomains:', stats.ensValidator.reservedSubdomains);
  console.log('Contract types:', stats.contractNaming.contractTypes);
  console.log('');

  console.log('🎉 Integration demo completed!');
}

// Run the demonstration
if (require.main === module) {
  demonstrateIntegration().catch(console.error);
}

module.exports = DAORegistryIntegration;
