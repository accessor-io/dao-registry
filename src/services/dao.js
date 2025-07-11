const { DAOModel } = require('../models/dao');
const { ProposalModel } = require('../models/proposal');
const { MemberModel } = require('../models/member');
const { AnalyticsModel } = require('../models/analytics');
const { BlockchainService } = require('./blockchain');
const { CacheService } = require('./cache');
const { logger } = require('../utils/logger');
const { ValidationError, NotFoundError, AuthorizationError } = require('../utils/errors');

class DAOService {
  constructor() {
    this.blockchainService = new BlockchainService();
    this.cacheService = new CacheService();
  }

  /**
   * Get all DAOs with filtering and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Object} Paginated DAO results
   */
  async getAllDAOs(filters = {}, options = {}) {
    try {
      const cacheKey = `daos:${JSON.stringify(filters)}:${JSON.stringify(options)}`;
      const cached = await this.cacheService.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = this.buildWhereClause(filters);

      const [daos, total] = await Promise.all([
        DAOModel.query()
          .where(whereClause)
          .orderBy(sortBy, sortOrder)
          .limit(limit)
          .offset(offset)
          .withGraphFetched('[proposals, members, analytics]'),
        DAOModel.query()
          .where(whereClause)
          .resultSize()
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      const result = {
        daos,
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev
      };

      // Cache for 5 minutes
      await this.cacheService.set(cacheKey, result, 300);

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
      const cacheKey = `dao:${id}`;
      const cached = await this.cacheService.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      const dao = await DAOModel.query()
        .findById(id)
        .withGraphFetched('[proposals, members, analytics, socialLinks]');

      if (!dao) {
        throw new NotFoundError('DAO not found');
      }

      // Cache for 10 minutes
      await this.cacheService.set(cacheKey, dao, 600);

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
      const dao = await DAOModel.query()
        .where({
          contractAddress,
          chainId
        })
        .first();

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
      // Validate contract addresses on blockchain
      await this.validateContractAddresses(daoData);

      const dao = await DAOModel.query().insert({
        ...daoData,
        ownerId: userId,
        status: 'Pending',
        verified: false,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Initialize analytics
      await AnalyticsModel.query().insert({
        daoId: dao.id,
        totalProposals: 0,
        activeProposals: 0,
        totalMembers: 0,
        activeMembers: 0,
        treasuryValue: 0,
        participationRate: 0,
        averageVotingPower: 0,
        lastUpdated: new Date()
      });

      // Clear cache
      await this.cacheService.delete('daos:*');

      logger.info(`Created DAO: ${dao.id}`, {
        daoId: dao.id,
        name: dao.name,
        contractAddress: dao.contractAddress,
        chainId: dao.chainId,
        userId
      });

      return dao;
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
      const dao = await this.getDAOById(id);
      
      const updatedDAO = await DAOModel.query()
        .patchAndFetchById(id, {
          ...updateData,
          updatedAt: new Date()
        });

      // Clear cache
      await this.cacheService.delete(`dao:${id}`);
      await this.cacheService.delete('daos:*');

      logger.info(`Updated DAO: ${id}`, {
        daoId: id,
        updates: updateData
      });

      return updatedDAO;
    } catch (error) {
      logger.error(`Error updating DAO ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete DAO
   * @param {string} id - DAO ID
   */
  async deleteDAO(id) {
    try {
      const dao = await this.getDAOById(id);
      
      await DAOModel.query().deleteById(id);

      // Clear cache
      await this.cacheService.delete(`dao:${id}`);
      await this.cacheService.delete('daos:*');

      logger.info(`Deleted DAO: ${id}`);
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
      
      const updatedDAO = await DAOModel.query()
        .patchAndFetchById(id, {
          verified,
          status: verified ? 'Active' : 'Pending',
          updatedAt: new Date()
        });

      // Clear cache
      await this.cacheService.delete(`dao:${id}`);
      await this.cacheService.delete('daos:*');

      logger.info(`Verified DAO: ${id}`, {
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
      const dao = await this.getDAOById(id);
      
      const updatedDAO = await DAOModel.query()
        .patchAndFetchById(id, {
          status,
          active: status === 'Active',
          updatedAt: new Date()
        });

      // Clear cache
      await this.cacheService.delete(`dao:${id}`);
      await this.cacheService.delete('daos:*');

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
   * Get DAO proposals
   * @param {string} daoId - DAO ID
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination options
   * @returns {Object} Paginated proposal results
   */
  async getDAOProposals(daoId, filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {
        daoId,
        ...filters
      };

      const [proposals, total] = await Promise.all([
        ProposalModel.query()
          .where(whereClause)
          .orderBy(sortBy, sortOrder)
          .limit(limit)
          .offset(offset),
        ProposalModel.query()
          .where(whereClause)
          .resultSize()
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        proposals,
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev
      };
    } catch (error) {
      logger.error(`Error getting DAO proposals ${daoId}:`, error);
      throw error;
    }
  }

  /**
   * Get DAO members
   * @param {string} daoId - DAO ID
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination options
   * @returns {Object} Paginated member results
   */
  async getDAOMembers(daoId, filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'votingPower',
        sortOrder = 'desc'
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {
        daoId,
        ...filters
      };

      const [members, total] = await Promise.all([
        MemberModel.query()
          .where(whereClause)
          .orderBy(sortBy, sortOrder)
          .limit(limit)
          .offset(offset),
        MemberModel.query()
          .where(whereClause)
          .resultSize()
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        members,
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev
      };
    } catch (error) {
      logger.error(`Error getting DAO members ${daoId}:`, error);
      throw error;
    }
  }

  /**
   * Get DAO analytics
   * @param {string} daoId - DAO ID
   * @param {string} timeframe - Timeframe for analytics
   * @returns {Object} Analytics data
   */
  async getDAOAnalytics(daoId, timeframe = '30d') {
    try {
      const cacheKey = `analytics:${daoId}:${timeframe}`;
      const cached = await this.cacheService.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      const analytics = await AnalyticsModel.query()
        .where({ daoId })
        .first();

      if (!analytics) {
        throw new NotFoundError('Analytics not found');
      }

      // Get additional analytics based on timeframe
      const additionalAnalytics = await this.calculateTimeframeAnalytics(daoId, timeframe);

      const result = {
        ...analytics,
        ...additionalAnalytics
      };

      // Cache for 5 minutes
      await this.cacheService.set(cacheKey, result, 300);

      return result;
    } catch (error) {
      logger.error(`Error getting DAO analytics ${daoId}:`, error);
      throw error;
    }
  }

  /**
   * Get search suggestions
   * @param {string} query - Search query
   * @returns {Array} Search suggestions
   */
  async getSearchSuggestions(query) {
    try {
      const suggestions = await DAOModel.query()
        .select('id', 'name', 'symbol', 'description')
        .where('name', 'ilike', `%${query}%`)
        .orWhere('symbol', 'ilike', `%${query}%`)
        .orWhere('description', 'ilike', `%${query}%`)
        .limit(10);

      return suggestions;
    } catch (error) {
      logger.error(`Error getting search suggestions for ${query}:`, error);
      throw error;
    }
  }

  /**
   * Get registry statistics
   * @returns {Object} Registry statistics
   */
  async getRegistryStats() {
    try {
      const cacheKey = 'stats:registry';
      const cached = await this.cacheService.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      const [
        totalDAOs,
        activeDAOs,
        verifiedDAOs,
        totalProposals,
        totalMembers,
        totalTreasuryValue
      ] = await Promise.all([
        DAOModel.query().resultSize(),
        DAOModel.query().where({ active: true }).resultSize(),
        DAOModel.query().where({ verified: true }).resultSize(),
        ProposalModel.query().resultSize(),
        MemberModel.query().resultSize(),
        AnalyticsModel.query().sum('treasuryValue as total').first()
      ]);

      const stats = {
        totalDAOs,
        activeDAOs,
        verifiedDAOs,
        totalProposals,
        totalMembers,
        totalTreasuryValue: totalTreasuryValue.total || 0,
        averageParticipationRate: await this.calculateAverageParticipationRate(),
        topChains: await this.getTopChains(),
        recentActivity: await this.getRecentActivity()
      };

      // Cache for 10 minutes
      await this.cacheService.set(cacheKey, stats, 600);

      return stats;
    } catch (error) {
      logger.error('Error getting registry stats:', error);
      throw error;
    }
  }

  /**
   * Get trending DAOs
   * @param {string} timeframe - Timeframe
   * @param {number} limit - Number of results
   * @returns {Array} Trending DAOs
   */
  async getTrendingDAOs(timeframe = '7d', limit = 10) {
    try {
      const cacheKey = `trending:${timeframe}:${limit}`;
      const cached = await this.cacheService.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      const trending = await DAOModel.query()
        .select('daos.*')
        .joinRelated('analytics')
        .orderBy('analytics.participationRate', 'desc')
        .limit(limit);

      // Cache for 15 minutes
      await this.cacheService.set(cacheKey, trending, 900);

      return trending;
    } catch (error) {
      logger.error(`Error getting trending DAOs for ${timeframe}:`, error);
      throw error;
    }
  }

  /**
   * Validate contract addresses on blockchain
   * @param {Object} daoData - DAO data
   */
  async validateContractAddresses(daoData) {
    try {
      const { contractAddress, tokenAddress, treasuryAddress, chainId } = daoData;

      // Validate contract addresses exist and are contracts
      await Promise.all([
        this.blockchainService.validateContract(contractAddress, chainId),
        this.blockchainService.validateContract(tokenAddress, chainId),
        this.blockchainService.validateContract(treasuryAddress, chainId)
      ]);
    } catch (error) {
      logger.error('Contract validation failed:', error);
      throw new ValidationError('Invalid contract addresses');
    }
  }

  /**
   * Build where clause for filtering
   * @param {Object} filters - Filter criteria
   * @returns {Object} Where clause
   */
  buildWhereClause(filters) {
    const whereClause = {};

    if (filters.chainId) {
      whereClause.chainId = filters.chainId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.verified !== null && filters.verified !== undefined) {
      whereClause.verified = filters.verified;
    }

    if (filters.active !== null && filters.active !== undefined) {
      whereClause.active = filters.active;
    }

    return whereClause;
  }

  /**
   * Calculate timeframe analytics
   * @param {string} daoId - DAO ID
   * @param {string} timeframe - Timeframe
   * @returns {Object} Timeframe analytics
   */
  async calculateTimeframeAnalytics(daoId, timeframe) {
    try {
      const dateFilter = this.getDateFilter(timeframe);

      const [proposals, votes, members] = await Promise.all([
        ProposalModel.query()
          .where({ daoId })
          .where('createdAt', '>=', dateFilter)
          .resultSize(),
        // Add vote counting logic here
        MemberModel.query()
          .where({ daoId })
          .where('lastActivity', '>=', dateFilter)
          .resultSize()
      ]);

      return {
        proposalsInTimeframe: proposals,
        activeMembersInTimeframe: members,
        participationRateInTimeframe: await this.calculateParticipationRate(daoId, timeframe)
      };
    } catch (error) {
      logger.error(`Error calculating timeframe analytics for DAO ${daoId}:`, error);
      throw error;
    }
  }

  /**
   * Get date filter for timeframe
   * @param {string} timeframe - Timeframe
   * @returns {Date} Date filter
   */
  getDateFilter(timeframe) {
    const now = new Date();
    const days = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    const daysToSubtract = days[timeframe] || 30;
    return new Date(now.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
  }

  /**
   * Calculate participation rate
   * @param {string} daoId - DAO ID
   * @param {string} timeframe - Timeframe
   * @returns {number} Participation rate
   */
  async calculateParticipationRate(daoId, timeframe) {
    try {
      const dateFilter = this.getDateFilter(timeframe);
      
      const [totalMembers, activeMembers] = await Promise.all([
        MemberModel.query().where({ daoId }).resultSize(),
        MemberModel.query()
          .where({ daoId })
          .where('lastActivity', '>=', dateFilter)
          .resultSize()
      ]);

      return totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;
    } catch (error) {
      logger.error(`Error calculating participation rate for DAO ${daoId}:`, error);
      return 0;
    }
  }

  /**
   * Calculate average participation rate across all DAOs
   * @returns {number} Average participation rate
   */
  async calculateAverageParticipationRate() {
    try {
      const result = await AnalyticsModel.query()
        .avg('participationRate as average')
        .first();

      return result.average || 0;
    } catch (error) {
      logger.error('Error calculating average participation rate:', error);
      return 0;
    }
  }

  /**
   * Get top chains by DAO count
   * @returns {Array} Top chains
   */
  async getTopChains() {
    try {
      const chains = await DAOModel.query()
        .select('chainId')
        .count('* as count')
        .groupBy('chainId')
        .orderBy('count', 'desc')
        .limit(10);

      return chains;
    } catch (error) {
      logger.error('Error getting top chains:', error);
      return [];
    }
  }

  /**
   * Get recent activity
   * @returns {Array} Recent activity
   */
  async getRecentActivity() {
    try {
      const activity = await DAOModel.query()
        .select('id', 'name', 'createdAt', 'status')
        .orderBy('createdAt', 'desc')
        .limit(10);

      return activity;
    } catch (error) {
      logger.error('Error getting recent activity:', error);
      return [];
    }
  }
}

module.exports = { DAOService }; 