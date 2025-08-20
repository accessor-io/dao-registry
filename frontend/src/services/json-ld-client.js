import axios from 'axios';

class JSONLDClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      headers: {
        'Accept': 'application/ld+json, application/json',
        'Content-Type': 'application/ld+json'
      }
    });
  }

  /**
   * Get JSON-LD context
   * @returns {Promise<Object>} JSON-LD context
   */
  async getContext() {
    try {
      const response = await this.client.get('/contexts/dao.jsonld');
      return response.data;
    } catch (error) {
      console.error('Error fetching JSON-LD context:', error);
      throw error;
    }
  }

  /**
   * Convert regular JSON to JSON-LD format
   * @param {Object} data - Regular JSON data
   * @param {Object} context - JSON-LD context
   * @returns {Object} JSON-LD formatted data
   */
  toJSONLD(data, context) {
    if (!data || !context) {
      return data;
    }

    const jsonld = {
      '@context': context['@context'],
      '@type': 'DAO',
      '@id': `${this.baseURL}/daos/${data.id}`,
      ...data
    };

    return jsonld;
  }

  /**
   * Convert JSON-LD to regular JSON format
   * @param {Object} jsonld - JSON-LD data
   * @returns {Object} Regular JSON data
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
   * Get all DAOs in JSON-LD format
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} JSON-LD collection
   */
  async getAllDAOs(params = {}) {
    try {
      const response = await this.client.get('/daos', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching DAOs in JSON-LD:', error);
      throw error;
    }
  }

  /**
   * Get a single DAO in JSON-LD format
   * @param {string} id - DAO ID
   * @returns {Promise<Object>} JSON-LD DAO
   */
  async getDAO(id) {
    try {
      const response = await this.client.get(`/daos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching DAO in JSON-LD:', error);
      throw error;
    }
  }

  /**
   * Create a new DAO using JSON-LD format
   * @param {Object} daoData - DAO data in JSON-LD format
   * @returns {Promise<Object>} Created DAO in JSON-LD format
   */
  async createDAO(daoData) {
    try {
      const response = await this.client.post('/daos', daoData);
      return response.data;
    } catch (error) {
      console.error('Error creating DAO in JSON-LD:', error);
      throw error;
    }
  }

  /**
   * Update a DAO using JSON-LD format
   * @param {string} id - DAO ID
   * @param {Object} updateData - Update data in JSON-LD format
   * @returns {Promise<Object>} Updated DAO in JSON-LD format
   */
  async updateDAO(id, updateData) {
    try {
      const response = await this.client.put(`/daos/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating DAO in JSON-LD:', error);
      throw error;
    }
  }

  /**
   * Delete a DAO
   * @param {string} id - DAO ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteDAO(id) {
    try {
      const response = await this.client.delete(`/daos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting DAO:', error);
      throw error;
    }
  }

  /**
   * Verify a DAO
   * @param {string} id - DAO ID
   * @param {boolean} verified - Verification status
   * @returns {Promise<Object>} Updated DAO in JSON-LD format
   */
  async verifyDAO(id, verified) {
    try {
      const response = await this.client.patch(`/daos/${id}/verify`, {
        verified: {
          '@type': 'http://www.w3.org/2001/XMLSchema#boolean',
          '@value': verified
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying DAO:', error);
      throw error;
    }
  }

  /**
   * Change DAO status
   * @param {string} id - DAO ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated DAO in JSON-LD format
   */
  async changeDAOStatus(id, status) {
    try {
      const response = await this.client.patch(`/daos/${id}/status`, {
        status: {
          '@type': 'https://dao-registry.org/vocab/status',
          '@value': status
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error changing DAO status:', error);
      throw error;
    }
  }

  /**
   * Get registry statistics in JSON-LD format
   * @returns {Promise<Object>} Statistics in JSON-LD format
   */
  async getStats() {
    try {
      const response = await this.client.get('/daos/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats in JSON-LD:', error);
      throw error;
    }
  }

  /**
   * Search DAOs with JSON-LD support
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results in JSON-LD format
   */
  async searchDAOs(searchParams) {
    try {
      const response = await this.client.get('/daos', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching DAOs in JSON-LD:', error);
      throw error;
    }
  }
}

export default JSONLDClient;
