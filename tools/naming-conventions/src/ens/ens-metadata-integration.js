/**
 * ENS Metadata Service Integration
 * Integrates the official ENS metadata service with DAO Registry naming conventions
 */

const { ethers } = require('ethers');
const axios = require('axios');

class ENSMetadataIntegration {
  constructor(options = {}) {
    this.provider = options.provider || null;
    this.metadataServiceUrl = options.metadataServiceUrl || 'https://metadata.ens.domains';
    this.networks = {
      mainnet: 'mainnet',
      sepolia: 'sepolia',
      goerli: 'goerli'
    };
    
    // ENS contract addresses
    this.contractAddresses = {
      mainnet: {
        nftV1: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
        nftV2: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85'
      },
      sepolia: {
        nftV1: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
        nftV2: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85'
      }
    };
    
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
  }

  /**
   * Get ENS metadata from the official metadata service
   * @param {string} domain - ENS domain name
   * @param {string} network - Network name (mainnet, sepolia, etc.)
   * @param {string} version - NFT version (v1 or v2)
   * @returns {Promise<Object>} ENS metadata
   */
  async getENSMetadata(domain, network = 'mainnet', version = 'v2') {
    try {
      // Check cache first
      const cacheKey = `${domain}-${network}-${version}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      // Get token ID for the domain
      const tokenId = await this.getTokenId(domain, version);
      if (!tokenId) {
        throw new Error(`Could not get token ID for domain: ${domain}`);
      }

      // Get contract address
      const contractAddress = this.contractAddresses[network]?.[`nft${version.toUpperCase()}`];
      if (!contractAddress) {
        throw new Error(`Contract address not found for network: ${network}`);
      }

      // Fetch metadata from ENS metadata service
      const url = `${this.metadataServiceUrl}/${network}/${contractAddress}/${tokenId}`;
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'DAO-Registry-Naming-Toolkit/1.0.0'
        }
      });

      const metadata = response.data;

      // Cache the result
      this.cache.set(cacheKey, {
        data: metadata,
        timestamp: Date.now()
      });

      return metadata;

    } catch (error) {
      console.error(`Failed to fetch ENS metadata for ${domain}:`, error.message);
      throw error;
    }
  }

  /**
   * Get token ID for ENS domain
   * @param {string} domain - ENS domain name
   * @param {string} version - NFT version (v1 or v2)
   * @returns {Promise<string>} Token ID
   */
  async getTokenId(domain, version = 'v2') {
    try {
      if (version === 'v1') {
        // For v1, use labelhash
        const label = domain.split('.')[0];
        const labelhash = ethers.keccak256(ethers.toUtf8Bytes(label));
        return BigInt(labelhash).toString();
      } else {
        // For v2, use namehash
        const namehash = ethers.namehash(domain);
        return BigInt(namehash).toString();
      }
    } catch (error) {
      console.error(`Failed to get token ID for ${domain}:`, error.message);
      return null;
    }
  }

  /**
   * Get domain attributes from ENS metadata
   * @param {Object} metadata - ENS metadata object
   * @returns {Object} Parsed domain attributes
   */
  parseDomainAttributes(metadata) {
    const attributes = {};
    
    if (metadata.attributes && Array.isArray(metadata.attributes)) {
      metadata.attributes.forEach(attr => {
        attributes[attr.trait_type.toLowerCase().replace(/\s+/g, '_')] = {
          value: attr.value,
          displayType: attr.display_type,
          traitType: attr.trait_type
        };
      });
    }

    return {
      name: metadata.name,
      description: metadata.description,
      isNormalized: metadata.is_normalized,
      image: metadata.image,
      url: metadata.url,
      attributes,
      // Extract specific attributes
      createdDate: attributes.created_date?.value,
      length: attributes.length?.value,
      segmentLength: attributes.segment_length?.value,
      characterSet: attributes.character_set?.value,
      registrationDate: attributes.registration_date?.value,
      expirationDate: attributes.expiration_date?.value,
      hasSpecialCharacters: attributes.has_special_characters?.value,
      isEmoji: attributes.is_emoji?.value,
      isPunycode: attributes.is_punycode?.value
    };
  }

  /**
   * Validate domain against ENS metadata standards
   * @param {string} domain - Domain to validate
   * @param {string} network - Network name
   * @returns {Promise<Object>} Validation result
   */
  async validateDomainWithMetadata(domain, network = 'mainnet') {
    const result = {
      isValid: false,
      errors: [],
      warnings: [],
      suggestions: [],
      metadata: null,
      attributes: null
    };

    try {
      // Get metadata from ENS service
      const metadata = await this.getENSMetadata(domain, network);
      const attributes = this.parseDomainAttributes(metadata);

      result.metadata = metadata;
      result.attributes = attributes;

      // Validate based on metadata
      if (!attributes.isNormalized) {
        result.warnings.push('Domain is not normalized according to ENS standards');
      }

      if (attributes.length && attributes.length > 50) {
        result.warnings.push('Domain is very long, consider shortening');
      }

      if (attributes.hasSpecialCharacters) {
        result.warnings.push('Domain contains special characters');
      }

      if (attributes.isEmoji) {
        result.warnings.push('Domain contains emoji characters');
      }

      if (attributes.isPunycode) {
        result.warnings.push('Domain uses punycode encoding');
      }

      // Check expiration
      if (attributes.expirationDate) {
        const expirationDate = new Date(attributes.expirationDate);
        const now = new Date();
        const daysUntilExpiration = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiration < 0) {
          result.errors.push('Domain has expired');
        } else if (daysUntilExpiration < 30) {
          result.warnings.push(`Domain expires in ${daysUntilExpiration} days`);
        }
      }

      result.isValid = result.errors.length === 0;

    } catch (error) {
      result.errors.push(`Failed to validate domain: ${error.message}`);
    }

    return result;
  }

  /**
   * Get domain history and registration info
   * @param {string} domain - ENS domain
   * @param {string} network - Network name
   * @returns {Promise<Object>} Domain history
   */
  async getDomainHistory(domain, network = 'mainnet') {
    try {
      const metadata = await this.getENSMetadata(domain, network);
      const attributes = this.parseDomainAttributes(metadata);

      return {
        domain,
        network,
        createdDate: attributes.createdDate ? new Date(attributes.createdDate) : null,
        registrationDate: attributes.registrationDate ? new Date(attributes.registrationDate) : null,
        expirationDate: attributes.expirationDate ? new Date(attributes.expirationDate) : null,
        length: attributes.length,
        characterSet: attributes.characterSet,
        hasSpecialCharacters: attributes.hasSpecialCharacters,
        isEmoji: attributes.isEmoji,
        isPunycode: attributes.isPunycode,
        metadata: metadata
      };

    } catch (error) {
      console.error(`Failed to get domain history for ${domain}:`, error.message);
      throw error;
    }
  }

  /**
   * Check if domain is available for registration
   * @param {string} domain - Domain to check
   * @param {string} network - Network name
   * @returns {Promise<Object>} Availability result
   */
  async checkDomainAvailability(domain, network = 'mainnet') {
    const result = {
      domain,
      network,
      isAvailable: false,
      isRegistered: false,
      isExpired: false,
      expirationDate: null,
      gracePeriodEnd: null,
      canRegister: false,
      errors: []
    };

    try {
      // Try to get metadata - if it exists, domain is registered
      const metadata = await this.getENSMetadata(domain, network);
      const attributes = this.parseDomainAttributes(metadata);

      result.isRegistered = true;
      result.expirationDate = attributes.expirationDate ? new Date(attributes.expirationDate) : null;

      if (result.expirationDate) {
        const now = new Date();
        const gracePeriod = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
        result.gracePeriodEnd = new Date(result.expirationDate.getTime() + gracePeriod);

        if (now > result.expirationDate) {
          result.isExpired = true;
          if (now > result.gracePeriodEnd) {
            result.canRegister = true;
          }
        }
      }

    } catch (error) {
      // If metadata doesn't exist, domain might be available
      if (error.response && error.response.status === 404) {
        result.isAvailable = true;
        result.canRegister = true;
      } else {
        result.errors.push(`Error checking availability: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Get domain suggestions based on ENS metadata patterns
   * @param {string} baseName - Base name for suggestions
   * @param {string} network - Network name
   * @returns {Promise<Array>} Domain suggestions
   */
  async getDomainSuggestions(baseName, network = 'mainnet') {
    const suggestions = [];
    const variations = [
      baseName,
      `${baseName}dao`,
      `${baseName}-dao`,
      `${baseName}protocol`,
      `${baseName}-protocol`,
      `${baseName}governance`,
      `${baseName}-governance`
    ];

    for (const variation of variations) {
      const domain = `${variation}.eth`;
      try {
        const availability = await this.checkDomainAvailability(domain, network);
        suggestions.push({
          domain,
          isAvailable: availability.isAvailable,
          canRegister: availability.canRegister,
          isExpired: availability.isExpired,
          expirationDate: availability.expirationDate
        });
      } catch (error) {
        // Skip domains that can't be checked
        continue;
      }
    }

    return suggestions.sort((a, b) => {
      // Prioritize available domains
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;
      return 0;
    });
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

module.exports = ENSMetadataIntegration;




