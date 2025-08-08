const { logger } = require('../utils/logger');
const { DAOContractService } = require('./blockchain/dao-contract-service');

class DAOService {
  constructor() {
    this.blockchainService = new DAOContractService();
    // Respect environment variable only; default to false when not explicitly true
    this.useBlockchainData = process.env.USE_BLOCKCHAIN_DATA === 'true';
    // Initialize in-memory store for demo/mock mode
    this.daos = [];
  }

  /**
   * Get all DAOs with filtering and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Object} Paginated DAO results
   */
  async getAllDAOs(filters = {}, options = {}) {
    try {
      if (this.useBlockchainData) {
        // Use blockchain data
        const result = await this.blockchainService.getAllDAOs(filters, options);
        
        logger.info(`Retrieved ${result.daos.length} DAOs from blockchain`, {
          filters,
          options,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages
        });

        return result;
      } else {
        // Fallback to mock/in-memory data (for development/testing)
        const {
          page = 1,
          limit = 20,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = options;

        // Start with in-memory daos if present; otherwise use mock
        let filteredDAOs = this.daos.length ? [...this.daos] : [...require('./mock-data').MockDAOs];

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

        logger.info(`Retrieved ${paginatedDAOs.length} DAOs from mock/in-memory data`, {
          filters,
          options,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages
        });

        return result;
      }
    } catch (error) {
      logger.error('Error getting all DAOs:', error);
      throw error;
    }
  }

  /**
   * Get DAO by ID
   * @param {string} id - DAO ID
   * @param {number} chainId - Chain ID (optional, defaults to 1)
   * @returns {Object} DAO data
   */
  async getDAOById(id, chainId = 1) {
    try {
      if (this.useBlockchainData) {
        // Use blockchain data
        const dao = await this.blockchainService.getDAOById(id, chainId);
        
        if (!dao) {
          throw new Error('DAO not found');
        }

        logger.info(`Retrieved DAO from blockchain: ${id} on chain ${chainId}`);
        return dao;
      } else {
        // Fallback to in-memory/mock data
        const source = this.daos.length ? this.daos : require('./mock-data').MockDAOs;
        const dao = source.find(d => d.id === id);
        
        if (!dao) {
          throw new Error('DAO not found');
        }

        logger.info(`Retrieved DAO from mock/in-memory data: ${id}`);
        return dao;
      }
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
      if (this.useBlockchainData) {
        // Use blockchain data
        const dao = await this.blockchainService.getDAOByAddress(contractAddress, chainId);
        
        if (!dao) {
          throw new Error('DAO not found');
        }

        logger.info(`Retrieved DAO from blockchain by address: ${contractAddress} on chain ${chainId}`);
        return dao;
      } else {
        // Fallback to in-memory/mock data
        const source = this.daos.length ? this.daos : require('./mock-data').MockDAOs;
        const dao = source.find(d => 
          d.contractAddress.toLowerCase() === contractAddress.toLowerCase() && 
          d.chainId === chainId
        );

        if (!dao) {
          throw new Error('DAO not found');
        }

        logger.info(`Retrieved DAO from mock/in-memory data by address: ${contractAddress}`);
        return dao;
      }
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
      const id = (this.daos.length + 1).toString();
      const newDAO = {
        id,
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
      const _ = await this.getDAOById(id);
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
      if (this.useBlockchainData) {
        // Use blockchain data
        const stats = await this.blockchainService.getRegistryStats();
        logger.info('Retrieved registry stats from blockchain');
        return stats;
      } else {
        // Fallback to mock data based on in-memory / mock arrays
        const source = this.daos.length ? this.daos : require('./mock-data').MockDAOs;
        const totalDAOs = source.length;
        const activeDAOs = source.filter(d => d.status === 'Active').length;
        const verifiedDAOs = source.filter(d => d.verified).length;
        const pendingDAOs = source.filter(d => d.status === 'Pending').length;

        const chainStats = {};
        source.forEach(dao => { chainStats[dao.chainId] = (chainStats[dao.chainId] || 0) + 1; });

        const governanceTypeStats = {};
        source.forEach(dao => { governanceTypeStats[dao.governanceType] = (governanceTypeStats[dao.governanceType] || 0) + 1; });

        const stats = { totalDAOs, activeDAOs, verifiedDAOs, pendingDAOs, chainStats, governanceTypeStats };
        logger.info('Retrieved registry stats from mock/in-memory data');
        return stats;
      }
    } catch (error) {
      logger.error('Error getting registry stats:', error);
      throw error;
    }
  }
}

module.exports = {
  DAOService
}; 