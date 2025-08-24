const fs = require('fs');
const path = require('path');

class JSONLDService {
  constructor() {
    this.context = this.loadContext();
  }

  loadContext() {
    try {
      const contextPath = path.join(__dirname, '../../../shared/schemas/json-ld-context.json');
      const contextData = fs.readFileSync(contextPath, 'utf8');
      return JSON.parse(contextData);
    } catch (error) {
      console.error('Error loading JSON-LD context:', error);
      return null;
    }
  }

  /**
   * Convert a DAO object to JSON-LD format
   * @param {Object} dao - The DAO object
   * @param {string} baseUrl - The base URL for generating URIs
   * @returns {Object} JSON-LD formatted DAO
   */
  toJSONLD(dao, baseUrl = 'https://dao-registry.org') {
    if (!dao || !this.context) {
      return dao;
    }

    const jsonld = {
      '@context': this.context['@context'],
      '@type': 'DAO',
      '@id': `${baseUrl}/api/daos/${dao.id}`,
      ...dao
    };

    // Add semantic annotations for blockchain addresses
    if (dao.contractAddress) {
      jsonld.contractAddress = {
        '@type': 'EthereumAddress',
        '@value': dao.contractAddress
      };
    }

    if (dao.tokenAddress) {
      jsonld.tokenAddress = {
        '@type': 'EthereumAddress',
        '@value': dao.tokenAddress
      };
    }

    if (dao.treasuryAddress) {
      jsonld.treasuryAddress = {
        '@type': 'EthereumAddress',
        '@value': dao.treasuryAddress
      };
    }

    if (dao.governanceAddress) {
      jsonld.governanceAddress = {
        '@type': 'EthereumAddress',
        '@value': dao.governanceAddress
      };
    }

    // Add semantic annotations for dates
    if (dao.createdAt) {
      jsonld.createdAt = {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': dao.createdAt
      };
    }

    if (dao.updatedAt) {
      jsonld.updatedAt = {
        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
        '@value': dao.updatedAt
      };
    }

    // Add semantic annotations for numbers
    if (typeof dao.chainId === 'number') {
      jsonld.chainId = {
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
        '@value': dao.chainId
      };
    }

    if (typeof dao.votingPeriod === 'number') {
      jsonld.votingPeriod = {
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
        '@value': dao.votingPeriod
      };
    }

    if (typeof dao.quorum === 'number') {
      jsonld.quorum = {
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
        '@value': dao.quorum
      };
    }

    if (typeof dao.proposalThreshold === 'number') {
      jsonld.proposalThreshold = {
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
        '@value': dao.proposalThreshold
      };
    }

    // Add semantic annotations for boolean values
    if (typeof dao.verified === 'boolean') {
      jsonld.verified = {
        '@type': 'http://www.w3.org/2001/XMLSchema#boolean',
        '@value': dao.verified
      };
    }

    return jsonld;
  }

  /**
   * Convert a collection of DAOs to JSON-LD format
   * @param {Array} daos - Array of DAO objects
   * @param {Object} pagination - Pagination metadata
   * @param {string} baseUrl - The base URL for generating URIs
   * @returns {Object} JSON-LD formatted collection
   */
  toJSONLDCollection(daos, pagination = null, baseUrl = 'https://dao-registry.org') {
    const collection = {
      '@context': this.context['@context'],
      '@type': 'Collection',
      '@id': `${baseUrl}/api/daos`,
      'member': daos.map(dao => this.toJSONLD(dao, baseUrl))
    };

    if (pagination) {
      collection.pagination = {
        '@type': 'Pagination',
        'page': {
          '@type': 'http://www.w3.org/2001/XMLSchema#integer',
          '@value': pagination.page
        },
        'limit': {
          '@type': 'http://www.w3.org/2001/XMLSchema#integer',
          '@value': pagination.limit
        },
        'total': {
          '@type': 'http://www.w3.org/2001/XMLSchema#integer',
          '@value': pagination.total
        },
        'totalPages': {
          '@type': 'http://www.w3.org/2001/XMLSchema#integer',
          '@value': pagination.totalPages
        },
        'hasNext': {
          '@type': 'http://www.w3.org/2001/XMLSchema#boolean',
          '@value': pagination.hasNext
        },
        'hasPrev': {
          '@type': 'http://www.w3.org/2001/XMLSchema#boolean',
          '@value': pagination.hasPrev
        }
      };
    }

    return collection;
  }

  /**
   * Convert a success response to JSON-LD format
   * @param {Object} data - The response data
   * @param {string} message - Optional success message
   * @param {string} baseUrl - The base URL for generating URIs
   * @returns {Object} JSON-LD formatted success response
   */
  toJSONLDSuccess(data, message = null, baseUrl = 'https://dao-registry.org') {
    const response = {
      '@context': this.context['@context'],
      '@type': 'Success',
      'success': {
        '@type': 'http://www.w3.org/2001/XMLSchema#boolean',
        '@value': true
      },
      'data': data
    };

    if (message) {
      response.message = message;
    }

    return response;
  }

  /**
   * Convert an error response to JSON-LD format
   * @param {string} error - The error message
   * @param {string} details - Optional error details
   * @param {number} statusCode - HTTP status code
   * @param {string} baseUrl - The base URL for generating URIs
   * @returns {Object} JSON-LD formatted error response
   */
  toJSONLDError(error, details = null, statusCode = 400, baseUrl = 'https://dao-registry.org') {
    const response = {
      '@context': this.context['@context'],
      '@type': 'Error',
      'success': {
        '@type': 'http://www.w3.org/2001/XMLSchema#boolean',
        '@value': false
      },
      'error': error,
      'statusCode': {
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
        '@value': statusCode
      }
    };

    if (details) {
      response.details = details;
    }

    return response;
  }

  /**
   * Convert JSON-LD back to regular JSON format
   * @param {Object} jsonld - The JSON-LD object
   * @returns {Object} Regular JSON object
   */
  fromJSONLD(jsonld) {
    if (!jsonld || !jsonld['@context']) {
      return jsonld;
    }

    const result = { ...jsonld };

    // Remove JSON-LD specific properties
    delete result['@context'];
    delete result['@type'];
    delete result['@id'];

    // Convert typed values back to primitive types
    Object.keys(result).forEach(key => {
      if (result[key] && typeof result[key] === 'object' && result[key]['@value'] !== undefined) {
        result[key] = result[key]['@value'];
      }
    });

    return result;
  }

  /**
   * Validate JSON-LD structure
   * @param {Object} jsonld - The JSON-LD object to validate
   * @returns {Object} Validation result with isValid and errors
   */
  validateJSONLD(jsonld) {
    const errors = [];

    if (!jsonld) {
      errors.push('JSON-LD object is required');
      return { isValid: false, errors };
    }

    if (!jsonld['@context']) {
      errors.push('@context is required in JSON-LD');
    }

    if (!jsonld['@type']) {
      errors.push('@type is required in JSON-LD');
    }

    if (!jsonld['@id']) {
      errors.push('@id is required in JSON-LD');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get the JSON-LD context
   * @returns {Object} The JSON-LD context
   */
  getContext() {
    return this.context;
  }
}

module.exports = JSONLDService;
