const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

/**
 * @title ENS Contract Service
 * @dev Service layer for interacting with ENS contracts and managing text records
 * 
 * This service provides:
 * - Contract deployment and initialization
 * - Text record management via contract calls
 * - Reverse record claiming
 * - Metadata synchronization
 * - Event listening and processing
 */
class ENSContractService {
  constructor(options = {}) {
    this.provider = options.provider;
    this.signer = options.signer;
    this.network = options.network || 'localhost';
    this.contracts = {};
    this.eventListeners = new Map();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    // Contract addresses (will be set after deployment)
    this.contractAddresses = {
      ensRegistry: null,
      ensMetadataService: null,
      daoRegistryResolver: null,
      daoRegistry: null,
      reservedSubdomains: null,
      dataRegistry: null
    };
    
    // Initialize contract ABIs
    this._loadContractABIs();
  }

  /**
   * Load contract ABIs from artifacts
   */
  _loadContractABIs() {
    const artifactsPath = path.join(__dirname, '../../../artifacts/contracts');
    
    try {
      // Load ENS interface ABIs
      this.contracts.ensRegistry = JSON.parse(
        fs.readFileSync(path.join(artifactsPath, 'ENSRegistry.sol/ENSRegistry.json'), 'utf8')
      );
      
      this.contracts.ensMetadataService = JSON.parse(
        fs.readFileSync(path.join(artifactsPath, 'ENSMetadataService.sol/ENSMetadataService.json'), 'utf8')
      );
      
      this.contracts.daoRegistryResolver = JSON.parse(
        fs.readFileSync(path.join(artifactsPath, 'DAORegistryResolver.sol/DAORegistryResolver.json'), 'utf8')
      );
      
      this.contracts.daoRegistry = JSON.parse(
        fs.readFileSync(path.join(artifactsPath, 'DAORegistry.sol/DAORegistry.json'), 'utf8')
      );
      
      this.contracts.reservedSubdomains = JSON.parse(
        fs.readFileSync(path.join(artifactsPath, 'ReservedSubdomains.sol/ReservedSubdomains.json'), 'utf8')
      );
      
      this.contracts.dataRegistry = JSON.parse(
        fs.readFileSync(path.join(artifactsPath, 'DataRegistry.sol/DataRegistry.json'), 'utf8')
      );
    } catch (error) {
      console.warn('Could not load contract ABIs:', error.message);
      // Initialize with empty ABIs for development
      this.contracts = {
        ensRegistry: { abi: [] },
        ensMetadataService: { abi: [] },
        daoRegistryResolver: { abi: [] },
        daoRegistry: { abi: [] },
        reservedSubdomains: { abi: [] },
        dataRegistry: { abi: [] }
      };
    }
  }

  /**
   * Set contract addresses
   * @param {Object} addresses - Contract addresses
   */
  setContractAddresses(addresses) {
    this.contractAddresses = { ...this.contractAddresses, ...addresses };
  }

  /**
   * Get contract instance
   * @param {string} contractName - Name of the contract
   * @returns {ethers.Contract} Contract instance
   */
  getContract(contractName) {
    if (!this.contracts[contractName]) {
      throw new Error(`Contract ${contractName} not found`);
    }
    
    const address = this.contractAddresses[contractName];
    if (!address) {
      throw new Error(`Contract address for ${contractName} not set`);
    }
    
    return new ethers.Contract(address, this.contracts[contractName].abi, this.signer || this.provider);
  }

  /**
   * Set text record for a contract
   * @param {string} contractAddress - Contract address
   * @param {string} key - Text record key
   * @param {string} value - Text record value
   * @returns {Promise<Object>} Transaction result
   */
  async setContractTextRecord(contractAddress, key, value) {
    try {
      const contract = this.getContract('ensRegistry');
      
      const tx = await contract.setTextRecord(contractAddress, key, value);
      const receipt = await tx.wait();
      
      // Clear cache for this contract
      this._clearCache(contractAddress);
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to set text record: ${error.message}`);
    }
  }

  /**
   * Get text record for a contract
   * @param {string} contractAddress - Contract address
   * @param {string} key - Text record key
   * @returns {Promise<string>} Text record value
   */
  async getContractTextRecord(contractAddress, key) {
    const cacheKey = `textRecord:${contractAddress}:${key}`;
    
    // Check cache first
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).value;
    }
    
    try {
      const contract = this.getContract('ensRegistry');
      const value = await contract.getTextRecord(contractAddress, key);
      
      // Cache the result
      this._setCache(cacheKey, value);
      
      return value;
    } catch (error) {
      throw new Error(`Failed to get text record: ${error.message}`);
    }
  }

  /**
   * Set multiple text records for a contract
   * @param {string} contractAddress - Contract address
   * @param {Array} records - Array of {key, value} objects
   * @returns {Promise<Object>} Transaction result
   */
  async batchSetContractTextRecords(contractAddress, records) {
    try {
      const contract = this.getContract('ensRegistry');
      
      const keys = records.map(r => r.key);
      const values = records.map(r => r.value);
      
      const tx = await contract.batchSetTextRecords(contractAddress, keys, values);
      const receipt = await tx.wait();
      
      // Clear cache for this contract
      this._clearCache(contractAddress);
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to batch set text records: ${error.message}`);
    }
  }

  /**
   * Get multiple text records for a contract
   * @param {string} contractAddress - Contract address
   * @param {Array} keys - Array of text record keys
   * @returns {Promise<Array>} Array of text record values
   */
  async batchGetContractTextRecords(contractAddress, keys) {
    try {
      const contract = this.getContract('ensRegistry');
      const values = await contract.batchGetTextRecords(contractAddress, keys);
      
      return values;
    } catch (error) {
      throw new Error(`Failed to batch get text records: ${error.message}`);
    }
  }

  /**
   * Claim reverse ENS record for a contract
   * @param {string} contractAddress - Contract address
   * @param {string} ensName - ENS name to claim as reverse record
   * @returns {Promise<Object>} Transaction result
   */
  async claimReverseRecord(contractAddress, ensName) {
    try {
      const contract = this.getContract('ensRegistry');
      
      const tx = await contract.claimReverse(contractAddress, ensName);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to claim reverse record: ${error.message}`);
    }
  }

  /**
   * Set reverse ENS record for a contract
   * @param {string} contractAddress - Contract address
   * @param {string} ensName - ENS name to set as reverse record
   * @returns {Promise<Object>} Transaction result
   */
  async setReverseRecord(contractAddress, ensName) {
    try {
      const contract = this.getContract('ensRegistry');
      
      const tx = await contract.setReverseRecord(contractAddress, ensName);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to set reverse record: ${error.message}`);
    }
  }

  /**
   * Get reverse ENS record for a contract
   * @param {string} contractAddress - Contract address
   * @returns {Promise<string>} Reverse ENS record
   */
  async getReverseRecord(contractAddress) {
    try {
      const contract = this.getContract('ensRegistry');
      const reverseRecord = await contract.getReverseRecord(contractAddress);
      
      return reverseRecord;
    } catch (error) {
      throw new Error(`Failed to get reverse record: ${error.message}`);
    }
  }

  /**
   * Register contract for ENS integration
   * @param {string} contractAddress - Contract address
   * @param {string} ensName - ENS name
   * @returns {Promise<Object>} Transaction result
   */
  async registerContractForENS(contractAddress, ensName) {
    try {
      const contract = this.getContract('ensRegistry');
      
      const tx = await contract.registerContractForENS(contractAddress, ensName);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to register contract for ENS: ${error.message}`);
    }
  }

  /**
   * Sync metadata to ENS contract
   * @param {string} contractAddress - Contract address
   * @param {Object} metadata - Contract metadata
   * @returns {Promise<Object>} Transaction result
   */
  async syncMetadataToContract(contractAddress, metadata) {
    try {
      const contract = this.getContract('ensMetadataService');
      
      // Convert metadata to contract format
      const contractMetadata = {
        name: metadata.name || '',
        description: metadata.description || '',
        version: metadata.version || '1.0.0',
        url: metadata.url || '',
        avatar: metadata.avatar || '',
        email: metadata.email || '',
        notice: metadata.notice || '',
        keywords: metadata.keywords || [],
        socialLinks: metadata.socialLinks || [],
        author: metadata.author || ethers.constants.AddressZero,
        createdAt: metadata.createdAt || Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
        verified: metadata.verified || false,
        implementedInterfaces: metadata.implementedInterfaces || []
      };
      
      const tx = await contract.registerContractMetadata(contractAddress, contractMetadata);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to sync metadata to contract: ${error.message}`);
    }
  }

  /**
   * Get contract metadata from ENS service
   * @param {string} contractAddress - Contract address
   * @returns {Promise<Object>} Contract metadata
   */
  async getContractMetadata(contractAddress) {
    try {
      const contract = this.getContract('ensMetadataService');
      const metadata = await contract.getContractMetadata(contractAddress);
      
      return {
        name: metadata.name,
        description: metadata.description,
        version: metadata.version,
        url: metadata.url,
        avatar: metadata.avatar,
        email: metadata.email,
        notice: metadata.notice,
        keywords: metadata.keywords,
        socialLinks: metadata.socialLinks,
        author: metadata.author,
        createdAt: metadata.createdAt.toString(),
        updatedAt: metadata.updatedAt.toString(),
        verified: metadata.verified,
        implementedInterfaces: metadata.implementedInterfaces
      };
    } catch (error) {
      throw new Error(`Failed to get contract metadata: ${error.message}`);
    }
  }

  /**
   * Validate text records
   * @param {Array} records - Array of {key, value} objects
   * @returns {Promise<Object>} Validation result
   */
  async validateTextRecords(records) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    const standardKeys = [
      'description', 'url', 'avatar', 'email', 'notice', 'keywords',
      'com.twitter', 'com.github', 'com.discord', 'org.telegram',
      'com.reddit', 'com.youtube', 'com.medium'
    ];
    
    for (const record of records) {
      // Check key length
      if (record.key.length === 0) {
        validation.isValid = false;
        validation.errors.push(`Text record key cannot be empty`);
      }
      
      // Check value length
      if (record.value.length === 0) {
        validation.isValid = false;
        validation.errors.push(`Text record value for '${record.key}' cannot be empty`);
      } else if (record.value.length > 1000) {
        validation.isValid = false;
        validation.errors.push(`Text record value for '${record.key}' is too long (max 1000 characters)`);
      }
      
      // Check if key is standard
      if (!standardKeys.includes(record.key)) {
        validation.warnings.push(`'${record.key}' is not a standard ENS text record key`);
      }
      
      // Validate specific key formats
      if (record.key === 'email' && !this._isValidEmail(record.value)) {
        validation.isValid = false;
        validation.errors.push(`Invalid email format for '${record.key}'`);
      }
      
      if ((record.key === 'url' || record.key === 'avatar') && !this._isValidURL(record.value)) {
        validation.isValid = false;
        validation.errors.push(`Invalid URL format for '${record.key}'`);
      }
    }
    
    return validation;
  }

  /**
   * Listen for ENS events
   * @param {string} eventName - Event name to listen for
   * @param {Function} callback - Callback function
   * @returns {Object} Event listener
   */
  async listenForENSEvents(eventName, callback) {
    try {
      const contract = this.getContract('ensRegistry');
      
      const filter = contract.filters[eventName]();
      const listener = contract.on(filter, callback);
      
      this.eventListeners.set(eventName, listener);
      
      return {
        success: true,
        eventName,
        filter
      };
    } catch (error) {
      throw new Error(`Failed to listen for ENS events: ${error.message}`);
    }
  }

  /**
   * Stop listening for ENS events
   * @param {string} eventName - Event name to stop listening for
   */
  stopListeningForENSEvents(eventName) {
    const listener = this.eventListeners.get(eventName);
    if (listener) {
      listener.removeAllListeners();
      this.eventListeners.delete(eventName);
    }
  }

  /**
   * Stop all event listeners
   */
  stopAllEventListeners() {
    for (const [eventName, listener] of this.eventListeners) {
      listener.removeAllListeners();
    }
    this.eventListeners.clear();
  }

  /**
   * Get ENS integration status for a contract
   * @param {string} contractAddress - Contract address
   * @returns {Promise<Object>} Integration status
   */
  async getENSIntegrationStatus(contractAddress) {
    try {
      const contract = this.getContract('ensRegistry');
      
      const [isRegistered, isEnabled, ensInfo] = await Promise.all([
        contract.isContractRegistered(contractAddress),
        contract.isENSIntegrationEnabled(contractAddress),
        contract.getENSInfo(contractAddress)
      ]);
      
      return {
        isRegistered,
        isEnabled,
        ensName: ensInfo.ensName,
        reverseRecord: ensInfo.reverseRecord,
        resolverAddress: ensInfo.resolverAddress,
        textRecordCount: ensInfo.textRecordCount.toString()
      };
    } catch (error) {
      throw new Error(`Failed to get ENS integration status: ${error.message}`);
    }
  }

  /**
   * Get complete ENS metadata for a contract
   * @param {string} contractAddress - Contract address
   * @returns {Promise<Object>} Complete ENS metadata
   */
  async getCompleteENSMetadata(contractAddress) {
    try {
      const contract = this.getContract('ensRegistry');
      
      const [metadata, textRecords, ensName, reverseRecord, resolverAddress, metadataHash] = 
        await contract.getCompleteENSMetadata(contractAddress);
      
      return {
        metadata: {
          name: metadata.name,
          description: metadata.description,
          version: metadata.version,
          url: metadata.url,
          avatar: metadata.avatar,
          email: metadata.email,
          notice: metadata.notice,
          keywords: metadata.keywords,
          socialLinks: metadata.socialLinks,
          author: metadata.author,
          createdAt: metadata.createdAt.toString(),
          updatedAt: metadata.updatedAt.toString(),
          verified: metadata.verified,
          implementedInterfaces: metadata.implementedInterfaces
        },
        textRecords: textRecords.map(record => ({
          key: record.key,
          value: record.value,
          updatedAt: record.updatedAt.toString(),
          updatedBy: record.updatedBy
        })),
        ensName,
        reverseRecord,
        resolverAddress,
        metadataHash
      };
    } catch (error) {
      throw new Error(`Failed to get complete ENS metadata: ${error.message}`);
    }
  }

  /**
   * Cache management
   */
  _setCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  _isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    return (Date.now() - cached.timestamp) < this.cacheTimeout;
  }

  _clearCache(contractAddress) {
    for (const [key] of this.cache) {
      if (key.includes(contractAddress)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Validation helpers
   */
  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  _isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  getStatistics() {
    return {
      network: this.network,
      contractAddresses: this.contractAddresses,
      eventListeners: this.eventListeners.size,
      cacheSize: this.cache.size,
      cacheTimeout: this.cacheTimeout
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopAllEventListeners();
    this.cache.clear();
  }
}

module.exports = ENSContractService;




