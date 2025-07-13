const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { DAOService } = require('../services/dao');
const { validateRequest } = require('../middleware/validation');
const { logger } = require('../utils/logger');

// Initialize DAO service
const daoService = new DAOService();

// Validation schemas
const createDAOSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  symbol: Joi.string().min(1).max(10).required(), 
  description: Joi.string().min(1).max(1000).required(),
  contractAddress: Joi.string().required(),
  tokenAddress: Joi.string().required(),
  treasuryAddress: Joi.string().required(),
  governanceAddress: Joi.string().required(),
  chainId: Joi.number().integer().positive().required(),
  governanceType: Joi.string().valid('TokenWeighted', 'Quadratic', 'Reputation', 'Liquid', 'Hybrid').required(),
  votingPeriod: Joi.number().integer().positive().required(),
  quorum: Joi.number().integer().min(0).max(10000).required(),
  proposalThreshold: Joi.number().integer().positive().required(),
  tags: Joi.array().items(Joi.string()).max(10).optional(),
  socialLinks: Joi.object({
    twitter: Joi.string().uri().optional(),
    discord: Joi.string().uri().optional(),
    telegram: Joi.string().uri().optional(),
    github: Joi.string().uri().optional(),
    medium: Joi.string().uri().optional(),
    reddit: Joi.string().uri().optional()
  }).optional()
});

const updateDAOSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  symbol: Joi.string().min(1).max(10).optional(),
  description: Joi.string().min(1).max(1000).optional(),
  logo: Joi.string().uri().optional(),
  website: Joi.string().uri().optional(),
  tags: Joi.array().items(Joi.string()).max(10).optional(),
  socialLinks: Joi.object({
    twitter: Joi.string().uri().optional(),
    discord: Joi.string().uri().optional(),
    telegram: Joi.string().uri().optional(),
    github: Joi.string().uri().optional(),
    medium: Joi.string().uri().optional(),
    reddit: Joi.string().uri().optional()
  }).optional()
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  chainId: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('Pending', 'Active', 'Suspended', 'Inactive', 'Banned').optional(),
  verified: Joi.boolean().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string().valid('name', 'createdAt', 'updatedAt', 'totalMembers', 'totalProposals').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Get all DAOs
router.get('/', validateRequest(querySchema, 'query'), async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      chainId,
      status,
      verified,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      chainId: chainId ? parseInt(chainId) : null,
      status,
      verified: verified !== undefined ? verified === 'true' : null,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : null,
      search
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    const result = await daoService.getAllDAOs(filters, options);
    
    logger.info(`Retrieved ${result.daos.length} DAOs`, {
      filters,
      options,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });

    res.json({
      success: true,
      data: result.daos,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get DAO by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const dao = await daoService.getDAOById(id);

    if (!dao) {
      return res.status(404).json({
        success: false,
        error: 'DAO not found'
      });
    }

    logger.info(`Retrieved DAO: ${id}`);

    res.json({
      success: true,
      data: dao
    });
  } catch (error) {
    next(error);
  }
});

// Create new DAO
router.post('/', validateRequest(createDAOSchema), async (req, res, next) => {
  try {
    const daoData = req.body;
    const userId = req.user.id;

    const existingDAO = await daoService.getDAOByAddress(daoData.contractAddress, daoData.chainId);
    if (existingDAO) {
      return res.status(409).json({
        success: false,
        error: 'DAO already registered with this contract address'
      });
    }

    const dao = await daoService.createDAO(daoData, userId);

    logger.info(`Created new DAO: ${dao.id}`, {
      daoId: dao.id,
      name: dao.name,
      contractAddress: dao.contractAddress,
      chainId: dao.chainId,
      userId
    });

    res.status(201).json({
      success: true,
      data: dao,
      message: 'DAO created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Update DAO
router.put('/:id', validateRequest(updateDAOSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const dao = await daoService.getDAOById(id);
    if (!dao) {
      return res.status(404).json({
        success: false,
        error: 'DAO not found'
      });
    }

    if (dao.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this DAO'
      });
    }

    const updatedDAO = await daoService.updateDAO(id, updateData);

    logger.info(`Updated DAO: ${id}`, {
      daoId: id,
      updates: updateData,
      userId
    });

    res.json({
      success: true,
      data: updatedDAO,
      message: 'DAO updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Delete DAO
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const dao = await daoService.getDAOById(id);
    if (!dao) {
      return res.status(404).json({
        success: false,
        error: 'DAO not found'
      });
    }

    if (dao.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this DAO'
      });
    }

    await daoService.deleteDAO(id);

    logger.info(`Deleted DAO: ${id}`, {
      daoId: id,
      userId
    });

    res.json({
      success: true,
      message: 'DAO deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get DAO proposals
router.get('/:id/proposals', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      status,
      proposer,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      daoId: id,
      status,
      proposer
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    const result = await daoService.getDAOProposals(id, filters, options);

    logger.info(`Retrieved proposals for DAO: ${id}`, {
      daoId: id,
      filters,
      total: result.total
    });

    res.json({
      success: true,
      data: result.proposals,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get DAO members
router.get('/:id/members', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      active,
      sortBy = 'votingPower',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      daoId: id,
      active: active !== undefined ? active === 'true' : null
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    const result = await daoService.getDAOMembers(id, filters, options);

    logger.info(`Retrieved members for DAO: ${id}`, {
      daoId: id,
      filters,
      total: result.total
    });

    res.json({
      success: true,
      data: result.members,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get DAO analytics
router.get('/:id/analytics', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { timeframe = '30d' } = req.query;

    const analytics = await daoService.getDAOAnalytics(id, timeframe);

    logger.info(`Retrieved analytics for DAO: ${id}`, {
      daoId: id,
      timeframe
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

// Verify DAO (admin only)
router.post('/:id/verify', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    const userId = req.user.id;

    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const dao = await daoService.verifyDAO(id, verified);

    logger.info(`Verified DAO: ${id}`, {
      daoId: id,
      verified,
      adminId: userId
    });

    res.json({
      success: true,
      data: dao,
      message: `DAO ${verified ? 'verified' : 'unverified'} successfully`
    });
  } catch (error) {
    next(error);
  }
});

// Change DAO status (admin only)
router.post('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const dao = await daoService.changeDAOStatus(id, status);

    logger.info(`Changed DAO status: ${id}`, {
      daoId: id,
      status,
      adminId: userId
    });

    res.json({
      success: true,
      data: dao,
      message: 'DAO status updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get DAO search suggestions
router.get('/search/suggestions', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const suggestions = await daoService.getSearchSuggestions(q);

    logger.info(`Retrieved search suggestions for: ${q}`, {
      query: q,
      count: suggestions.length
    });

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
});

// Get DAO registry overview statistics
router.get('/stats/overview', async (req, res, next) => {
  try {
    const stats = await daoService.getRegistryStats();

    logger.info('Retrieved registry overview stats');

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// Get trending DAOs
router.get('/stats/trending', async (req, res, next) => {
  try {
    const { timeframe = '7d', limit = 10 } = req.query;

    const trending = await daoService.getTrendingDAOs(timeframe, parseInt(limit));

    logger.info(`Retrieved trending DAOs for timeframe: ${timeframe}`);

    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;