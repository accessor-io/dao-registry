/**
 * Metadata Registry Service
 * Handles all API calls to the metadata registry backend
 */

class MetadataRegistryService {
  constructor(baseURL = '/api/metadata-registry') {
    this.baseURL = baseURL;
  }

  // Health check
  async getHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  // Get all schemas
  async getSchemas() {
    try {
      const response = await fetch(`${this.baseURL}/schemas`);
      if (!response.ok) {
        throw new Error(`Failed to fetch schemas: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get schemas error:', error);
      throw error;
    }
  }

  // Register DAO metadata
  async registerDAO(daoData) {
    try {
      const response = await fetch(`${this.baseURL}/register/dao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(daoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to register DAO: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Register DAO error:', error);
      throw error;
    }
  }

  // Register contract metadata
  async registerContract(contractData) {
    try {
      const response = await fetch(`${this.baseURL}/register/contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to register contract: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Register contract error:', error);
      throw error;
    }
  }

  // Register ENS metadata
  async registerENS(ensData) {
    try {
      const response = await fetch(`${this.baseURL}/register/ens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ensData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to register ENS: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Register ENS error:', error);
      throw error;
    }
  }

  // Get metadata by ID
  async getMetadata(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to get metadata: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get metadata error:', error);
      throw error;
    }
  }

  // Search metadata
  async searchMetadata(query, options = {}) {
    try {
      const { type, limit = 10, offset = 0 } = options;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      
      if (type) {
        params.append('type', type);
      }

      const response = await fetch(`${this.baseURL}/search/${encodeURIComponent(query)}?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to search metadata: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Search metadata error:', error);
      throw error;
    }
  }

  // Update metadata
  async updateMetadata(id, updates) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update metadata: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Update metadata error:', error);
      throw error;
    }
  }

  // Delete metadata
  async deleteMetadata(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete metadata: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Delete metadata error:', error);
      throw error;
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      const response = await fetch(`${this.baseURL}/stats/overview`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to get statistics: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  }

  // Helper methods for common operations

  // Register complete DAO with all components
  async registerCompleteDAO(daoData) {
    try {
      const results = {
        dao: null,
        contracts: [],
        ens: null,
        errors: []
      };

      // Register DAO
      try {
        results.dao = await this.registerDAO(daoData.dao);
      } catch (error) {
        results.errors.push(`DAO registration failed: ${error.message}`);
      }

      // Register ENS if provided
      if (daoData.ens) {
        try {
          results.ens = await this.registerENS(daoData.ens);
        } catch (error) {
          results.errors.push(`ENS registration failed: ${error.message}`);
        }
      }

      // Register contracts if provided
      if (daoData.contracts && Array.isArray(daoData.contracts)) {
        for (const contract of daoData.contracts) {
          try {
            const contractResult = await this.registerContract(contract);
            results.contracts.push(contractResult);
          } catch (error) {
            results.errors.push(`Contract ${contract.name} registration failed: ${error.message}`);
          }
        }
      }

      return {
        success: results.errors.length === 0,
        results,
        message: results.errors.length === 0 
          ? 'Complete DAO registration successful' 
          : `Registration completed with ${results.errors.length} errors`
      };
    } catch (error) {
      console.error('Register complete DAO error:', error);
      throw error;
    }
  }

  // Bulk search across all types
  async bulkSearch(query, options = {}) {
    try {
      const { limit = 20, offset = 0 } = options;
      const results = await this.searchMetadata(query, { limit, offset });
      
      // Group results by type
      const groupedResults = {
        dao: [],
        contract: [],
        ens: [],
        all: results.results
      };

      results.results.forEach(item => {
        if (groupedResults[item.type]) {
          groupedResults[item.type].push(item);
        }
      });

      return {
        ...results,
        grouped: groupedResults
      };
    } catch (error) {
      console.error('Bulk search error:', error);
      throw error;
    }
  }

  // Get metadata by type
  async getMetadataByType(type, options = {}) {
    try {
      const { limit = 50, offset = 0 } = options;
      return await this.searchMetadata('', { type, limit, offset });
    } catch (error) {
      console.error('Get metadata by type error:', error);
      throw error;
    }
  }

  // Validate metadata before registration
  validateMetadata(type, data) {
    const errors = [];

    switch (type) {
      case 'dao':
        if (!data.name) errors.push('DAO name is required');
        if (!data.ens) errors.push('ENS domain is required');
        if (data.ens && !data.ens.endsWith('.eth')) {
          errors.push('ENS domain must end with .eth');
        }
        break;

      case 'contract':
        if (!data.name) errors.push('Contract name is required');
        if (!data.type) errors.push('Contract type is required');
        if (!data.address) errors.push('Contract address is required');
        if (data.address && !/^0x[a-fA-F0-9]{40}$/.test(data.address)) {
          errors.push('Contract address must be a valid Ethereum address');
        }
        break;

      case 'ens':
        if (!data.domain) errors.push('ENS domain is required');
        if (!data.owner) errors.push('ENS owner is required');
        if (data.domain && !data.domain.endsWith('.eth')) {
          errors.push('ENS domain must end with .eth');
        }
        if (data.owner && !/^0x[a-fA-F0-9]{40}$/.test(data.owner)) {
          errors.push('ENS owner must be a valid Ethereum address');
        }
        break;

      default:
        errors.push(`Unknown metadata type: ${type}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default MetadataRegistryService;




