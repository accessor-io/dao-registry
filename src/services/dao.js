const { logger } = require('../utils/logger');

// Import comprehensive mock data
const { comprehensiveMockDAOs } = require('./mock-data');

// Use comprehensive mock data
const mockDAOs = comprehensiveMockDAOs;

class DAOService {
  constructor() {
    this.daos = [...mockDAOs];
  }

  /**
   * Get all DAOs with filtering and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Object} Paginated DAO results
   */
  async getAllDAOs(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      let filteredDAOs = [...this.daos];

      // Apply filters
      if (filters.chainId) {
        filteredDAOs = filteredDAOs.filter(dao => dao.chainId === filters.chainId);
      }

      if (filters.status) {
        filteredDAOs = filteredDAOs.filter(dao => dao.status === filters.status);
      }

      if (filters.verified !== null) {
        filteredDAOs = filteredDAOs.filter(dao => dao.verified === filters.verified);
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredDAOs = filteredDAOs.filter(dao => 
          dao.tags && dao.tags.some(tag => filters.tags.includes(tag))
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredDAOs = filteredDAOs.filter(dao => 
          dao.name.toLowerCase().includes(searchLower) ||
          dao.description.toLowerCase().includes(searchLower)
        );
      }

      // Sort
      filteredDAOs.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });

      // Paginate
      const offset = (page - 1) * limit;
      const paginatedDAOs = filteredDAOs.slice(offset, offset + limit);

      const total = filteredDAOs.length;
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      const result = {
        daos: paginatedDAOs,
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev
      };

      logger.info(`Retrieved ${paginatedDAOs.length} DAOs`, {
        filters,
        options,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      });

      return result;
    } catch (error) {
      logger.error('Error getting all DAOs:', error);
      throw error;
    }
  }

  /**
   * Get DAO by ID
   * @param {string} id - DAO ID
   * @returns {Object} DAO data
   */
  async getDAOById(id) {
    try {
      const dao = this.daos.find(d => d.id === id);
      
      if (!dao) {
        throw new Error('DAO not found');
      }

      logger.info(`Retrieved DAO: ${id}`);
      return dao;
    } catch (error) {
      logger.error(`Error getting DAO by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get DAO by contract address and chain ID
   * @param {string} contractAddress - Contract address
   * @param {number} chainId - Chain ID
   * @returns {Object} DAO data
   */
  async getDAOByAddress(contractAddress, chainId) {
    try {
      const dao = this.daos.find(d => 
        d.contractAddress.toLowerCase() === contractAddress.toLowerCase() && 
        d.chainId === chainId
      );

      return dao;
    } catch (error) {
      logger.error(`Error getting DAO by address ${contractAddress}:`, error);
      throw error;
    }
  }

  /**
   * Create new DAO
   * @param {Object} daoData - DAO data
   * @param {string} userId - User ID
   * @returns {Object} Created DAO
   */
  async createDAO(daoData, userId) {
    try {
      const newDAO = {
        id: (this.daos.length + 1).toString(),
        ...daoData,
        ownerId: userId,
        status: 'Pending',
        verified: false,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.daos.push(newDAO);

      logger.info(`Created DAO: ${newDAO.id}`, {
        daoId: newDAO.id,
        name: newDAO.name,
        contractAddress: newDAO.contractAddress,
        chainId: newDAO.chainId,
        userId
      });

      return newDAO;
    } catch (error) {
      logger.error('Error creating DAO:', error);
      throw error;
    }
  }

  /**
   * Update DAO
   * @param {string} id - DAO ID
   * @param {Object} updateData - Update data
   * @returns {Object} Updated DAO
   */
  async updateDAO(id, updateData) {
    try {
      const daoIndex = this.daos.findIndex(d => d.id === id);
      
      if (daoIndex === -1) {
        throw new Error('DAO not found');
      }

      this.daos[daoIndex] = {
        ...this.daos[daoIndex],
        ...updateData,
        updatedAt: new Date()
      };

      logger.info(`Updated DAO: ${id}`);
      return this.daos[daoIndex];
    } catch (error) {
      logger.error(`Error updating DAO ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete DAO
   * @param {string} id - DAO ID
   * @returns {boolean} Success status
   */
  async deleteDAO(id) {
    try {
      const daoIndex = this.daos.findIndex(d => d.id === id);
      
      if (daoIndex === -1) {
        throw new Error('DAO not found');
      }

      this.daos.splice(daoIndex, 1);

      logger.info(`Deleted DAO: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting DAO ${id}:`, error);
      throw error;
    }
  }

  /**
   * Verify DAO
   * @param {string} id - DAO ID
   * @param {boolean} verified - Verification status
   * @returns {Object} Updated DAO
   */
  async verifyDAO(id, verified) {
    try {
      const dao = await this.getDAOById(id);
      
      const updatedDAO = await this.updateDAO(id, { verified });

      logger.info(`Updated DAO verification: ${id}`, {
        daoId: id,
        verified
      });

      return updatedDAO;
    } catch (error) {
      logger.error(`Error verifying DAO ${id}:`, error);
      throw error;
    }
  }

  /**
   * Change DAO status
   * @param {string} id - DAO ID
   * @param {string} status - New status
   * @returns {Object} Updated DAO
   */
  async changeDAOStatus(id, status) {
    try {
      const validStatuses = ['Pending', 'Active', 'Suspended', 'Inactive', 'Banned'];
      
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const updatedDAO = await this.updateDAO(id, { status });

      logger.info(`Changed DAO status: ${id}`, {
        daoId: id,
        status
      });

      return updatedDAO;
    } catch (error) {
      logger.error(`Error changing DAO status ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get registry statistics
   * @returns {Object} Registry stats
   */
  async getRegistryStats() {
    try {
      const totalDAOs = this.daos.length;
      const activeDAOs = this.daos.filter(d => d.status === 'Active').length;
      const verifiedDAOs = this.daos.filter(d => d.verified).length;
      const pendingDAOs = this.daos.filter(d => d.status === 'Pending').length;

      const chainStats = {};
      this.daos.forEach(dao => {
        chainStats[dao.chainId] = (chainStats[dao.chainId] || 0) + 1;
      });

      const governanceTypeStats = {};
      this.daos.forEach(dao => {
        governanceTypeStats[dao.governanceType] = (governanceTypeStats[dao.governanceType] || 0) + 1;
      });

      return {
        totalDAOs,
        activeDAOs,
        verifiedDAOs,
        pendingDAOs,
        chainStats,
        governanceTypeStats
      };
    } catch (error) {
      logger.error('Error getting registry stats:', error);
      throw error;
    }
  }
}

module.exports = {
  DAOService
}; 