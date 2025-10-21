/**
 * Frontend Naming Convention Toolkit Service
 * Provides access to the DAO Registry naming convention toolkit from the frontend
 */

import axios from 'axios';

class NamingToolkitService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Make API call to backend naming toolkit
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @returns {Promise} API response
   */
  async apiCall(endpoint, data = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/api/naming-toolkit${endpoint}`, data, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Naming toolkit API error (${endpoint}):`, error.message);
      throw error;
    }
  }

  /**
   * Get cached result or make API call
   * @param {string} key - Cache key
   * @param {Function} apiCall - API call function
   * @returns {Promise} Cached or fresh result
   */
  async getCachedResult(key, apiCall) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const result = await apiCall();
    this.cache.set(key, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Validate ENS domain
   * @param {string} domain - Domain to validate
   * @param {string} type - Domain type (primary, subdomain)
   * @returns {Promise<Object>} Validation result
   */
  async validateENSDomain(domain, type = 'primary') {
    const cacheKey = `ens-validate-${domain}-${type}`;
    return this.getCachedResult(cacheKey, () => 
      this.apiCall('/validate-ens', { domain, type })
    );
  }

  /**
   * Generate ENS subdomains
   * @param {string} domain - Base domain
   * @returns {Promise<Array>} Generated subdomains
   */
  async generateENSSubdomains(domain) {
    const cacheKey = `ens-subdomains-${domain}`;
    return this.getCachedResult(cacheKey, () => 
      this.apiCall('/generate-ens-subdomains', { domain })
    );
  }

  /**
   * Validate contract name
   * @param {string} contractName - Contract name to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateContractName(contractName) {
    const cacheKey = `contract-validate-${contractName}`;
    return this.getCachedResult(cacheKey, () => 
      this.apiCall('/validate-contract', { contractName })
    );
  }

  /**
   * Generate contract names for DAO
   * @param {string} daoName - DAO name
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated contract names
   */
  async generateContractNames(daoName, options = {}) {
    const cacheKey = `contract-generate-${daoName}-${JSON.stringify(options)}`;
    return this.getCachedResult(cacheKey, () => 
      this.apiCall('/generate-contracts', { daoName, options })
    );
  }

  /**
   * Generate complete DAO structure
   * @param {string} daoName - DAO name
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Complete DAO structure
   */
  async generateDAOStructure(daoName, options = {}) {
    const cacheKey = `dao-structure-${daoName}-${JSON.stringify(options)}`;
    return this.getCachedResult(cacheKey, () => 
      this.apiCall('/generate-dao-structure', { daoName, options })
    );
  }

  /**
   * Validate DAO metadata
   * @param {Object} daoData - DAO data to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateDAOMetadata(daoData) {
    return this.apiCall('/validate-dao', { daoData });
  }

  /**
   * Get ENS metadata from official service
   * @param {string} domain - ENS domain
   * @param {string} network - Network (mainnet, sepolia)
   * @param {string} version - NFT version (v1, v2)
   * @returns {Promise<Object>} ENS metadata
   */
  async getENSMetadata(domain, network = 'mainnet', version = 'v2') {
    const cacheKey = `ens-metadata-${domain}-${network}-${version}`;
    return this.getCachedResult(cacheKey, () => 
      this.apiCall('/ens-metadata', { domain, network, version })
    );
  }

  /**
   * Check domain availability
   * @param {string} domain - Domain to check
   * @param {string} network - Network
   * @returns {Promise<Object>} Availability result
   */
  async checkDomainAvailability(domain, network = 'mainnet') {
    const cacheKey = `domain-availability-${domain}-${network}`;
    return this.getCachedResult(cacheKey, () => 
      this.apiCall('/domain-availability', { domain, network })
    );
  }

  /**
   * Get domain suggestions
   * @param {string} baseName - Base name for suggestions
   * @param {string} network - Network
   * @returns {Promise<Array>} Domain suggestions
   */
  async getDomainSuggestions(baseName, network = 'mainnet') {
    const cacheKey = `domain-suggestions-${baseName}-${network}`;
    return this.getCachedResult(cacheKey, () => 
      this.apiCall('/domain-suggestions', { baseName, network })
    );
  }

  /**
   * Get domain history
   * @param {string} domain - Domain
   * @param {string} network - Network
   * @returns {Promise<Object>} Domain history
   */
  async getDomainHistory(domain, network = 'mainnet') {
    const cacheKey = `domain-history-${domain}-${network}`;
    return this.getCachedResult(cacheKey, () => 
      this.apiCall('/domain-history', { domain, network })
    );
  }

  /**
   * Migrate existing DAO to new standards
   * @param {Object} existingDAO - Existing DAO data
   * @returns {Promise<Object>} Migration result
   */
  async migrateDAO(existingDAO) {
    return this.apiCall('/migrate-dao', { existingDAO });
  }

  /**
   * Clear cache
   * @param {string} pattern - Cache pattern (optional)
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
      memoryUsage: this.cache.size * 1024 // Rough estimate
    };
  }
}

// Create singleton instance
const namingToolkitService = new NamingToolkitService();

export default namingToolkitService;




