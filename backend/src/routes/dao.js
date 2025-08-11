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
  governanceType: Joi.string().required(),
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
  }).optional(),
  ensDomain: Joi.string().optional()
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
  }).optional(),
  status: Joi.string().optional()
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  chainId: Joi.any().optional(),
  status: Joi.any().optional(),
  verified: Joi.any().optional(),
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
      chainId: chainId && chainId !== '' ? parseInt(chainId) : null,
      status: status && status !== '' ? status : null,
      verified: verified !== undefined && verified !== '' ? verified === 'true' : null,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : null,
      search: search && search !== '' ? search : null
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

// Get registry statistics
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await daoService.getRegistryStats();

    logger.info('Retrieved registry statistics');

    res.json({
      success: true,
      data: stats
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
router.post('/', validateRequest(createDAOSchema, 'body', 'CreateDAORequest'), async (req, res, next) => {
  try {
    const daoData = req.body;
    const userId = 'demo-user'; // Mock user ID for demo

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
router.put('/:id', validateRequest(updateDAOSchema, 'body', 'UpdateDAORequest'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = 'demo-user'; // Mock user ID for demo

    const dao = await daoService.getDAOById(id);
    if (!dao) {
      return res.status(404).json({
        success: false,
        error: 'DAO not found'
      });
    }

    // For demo purposes, allow updates without strict ownership check
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
    const userId = 'demo-user'; // Mock user ID for demo

    const dao = await daoService.getDAOById(id);
    if (!dao) {
      return res.status(404).json({
        success: false,
        error: 'DAO not found'
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

// Verify DAO
router.patch('/:id/verify', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    if (typeof verified !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Verified field must be a boolean'
      });
    }

    const dao = await daoService.getDAOById(id);
    if (!dao) {
      return res.status(404).json({
        success: false,
        error: 'DAO not found'
      });
    }

    const updatedDAO = await daoService.verifyDAO(id, verified);

    logger.info(`Updated DAO verification: ${id}`, {
      daoId: id,
      verified
    });

    res.json({
      success: true,
      data: updatedDAO,
      message: `DAO ${verified ? 'verified' : 'unverified'} successfully`
    });
  } catch (error) {
    next(error);
  }
});

// Change DAO status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Active', 'Suspended', 'Inactive', 'Banned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const dao = await daoService.getDAOById(id);
    if (!dao) {
      return res.status(404).json({
        success: false,
        error: 'DAO not found'
      });
    }

    const updatedDAO = await daoService.changeDAOStatus(id, status);

    logger.info(`Changed DAO status: ${id}`, {
      daoId: id,
      status
    });

    res.json({
      success: true,
      data: updatedDAO,
      message: `DAO status changed to ${status}`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;