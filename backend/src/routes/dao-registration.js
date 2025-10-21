/**
 * DAO Registration Routes
 * Handles DAO-specific registration and naming operations
 */

const express = require('express');
const router = express.Router();

// Import services
const { DAONamingService } = require('../services/naming/dao-naming-service.js');
const { ENSDomainService } = require('../services/naming/ens-domain-service.js');

// Initialize services
const daoNamingService = new DAONamingService();
const ensDomainService = new ENSDomainService();

/**
 * POST /api/dao-registration/register
 * Register a new DAO with standardized naming
 */
router.post('/register', async (req, res) => {
  try {
    const { name, symbol, description, ensDomain, tags, metadata } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: 'DAO name is required'
      });
    }

    // Generate DAO naming structure
    const namingStructure = daoNamingService.generateDAONamingStructure(name, {
      symbol,
      description,
      tags
    });

    // Validate ENS domain if provided
    if (ensDomain) {
      const ensValidation = ensDomainService.validateDomain(ensDomain, 'primary');
      if (!ensValidation.isValid) {
        return res.status(400).json({
          error: 'Invalid ENS domain',
          details: ensValidation.errors
        });
      }
    }

    // Generate DAO metadata
    const daoMetadata = daoNamingService.generateDAOMetadata(name, {
      symbol,
      description,
      tags,
      metadata
    });

    // Create standardized DAO object
    const standardizedDAO = {
      ...daoMetadata,
      ensDomain: ensDomain || namingStructure.basic.ensDomain,
      ensSubdomains: namingStructure.ens.subdomains,
      validation: namingStructure.validation
    };

    res.json({
      success: true,
      data: standardizedDAO,
      message: 'DAO registered successfully with standardized naming'
    });

  } catch (error) {
    console.error('DAO registration error:', error);
    res.status(500).json({
      error: 'Failed to register DAO',
      message: error.message
    });
  }
});

/**
 * POST /api/dao-registration/validate-name
 * Validate DAO name according to standards
 */
router.post('/validate-name', (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'DAO name is required'
      });
    }

    const validation = daoNamingService.validateDAOName(name);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('DAO name validation error:', error);
    res.status(500).json({
      error: 'Failed to validate DAO name',
      message: error.message
    });
  }
});

/**
 * POST /api/dao-registration/validate-symbol
 * Validate DAO symbol according to standards
 */
router.post('/validate-symbol', (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({
        error: 'DAO symbol is required'
      });
    }

    const validation = daoNamingService.validateDAOSymbol(symbol);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('DAO symbol validation error:', error);
    res.status(500).json({
      error: 'Failed to validate DAO symbol',
      message: error.message
    });
  }
});

/**
 * POST /api/dao-registration/generate-structure
 * Generate complete DAO naming structure
 */
router.post('/generate-structure', (req, res) => {
  try {
    const { name, symbol, description, tags } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'DAO name is required'
      });
    }

    const structure = daoNamingService.generateDAONamingStructure(name, {
      symbol,
      description,
      tags
    });
    
    res.json({
      success: true,
      data: structure
    });
  } catch (error) {
    console.error('DAO structure generation error:', error);
    res.status(500).json({
      error: 'Failed to generate DAO structure',
      message: error.message
    });
  }
});

/**
 * POST /api/dao-registration/generate-metadata
 * Generate DAO metadata structure
 */
router.post('/generate-metadata', (req, res) => {
  try {
    const { name, symbol, description, tags, metadata } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'DAO name is required'
      });
    }

    const daoMetadata = daoNamingService.generateDAOMetadata(name, {
      symbol,
      description,
      tags,
      metadata
    });
    
    res.json({
      success: true,
      data: daoMetadata
    });
  } catch (error) {
    console.error('DAO metadata generation error:', error);
    res.status(500).json({
      error: 'Failed to generate DAO metadata',
      message: error.message
    });
  }
});

/**
 * POST /api/dao-registration/migrate
 * Migrate existing DAO to new naming standards
 */
router.post('/migrate', (req, res) => {
  try {
    const { existingDAO, options } = req.body;

    if (!existingDAO) {
      return res.status(400).json({
        error: 'Existing DAO data is required'
      });
    }

    const migration = daoNamingService.migrateDAONaming(existingDAO, options);
    
    res.json({
      success: true,
      data: migration
    });
  } catch (error) {
    console.error('DAO migration error:', error);
    res.status(500).json({
      error: 'Failed to migrate DAO',
      message: error.message
    });
  }
});

/**
 * GET /api/dao-registration/ens-domain/:daoName
 * Generate ENS domain for DAO
 */
router.get('/ens-domain/:daoName', (req, res) => {
  try {
    const { daoName } = req.params;

    const ensDomain = ensDomainService.generateDAODomain(daoName);
    const subdomains = ensDomainService.generateStandardSubdomains(daoName);
    
    res.json({
      success: true,
      data: {
        primary: ensDomain,
        subdomains
      }
    });
  } catch (error) {
    console.error('ENS domain generation error:', error);
    res.status(500).json({
      error: 'Failed to generate ENS domain',
      message: error.message
    });
  }
});

/**
 * POST /api/dao-registration/validate-ens
 * Validate ENS domain structure
 */
router.post('/validate-ens', (req, res) => {
  try {
    const { ensStructure } = req.body;

    if (!ensStructure) {
      return res.status(400).json({
        error: 'ENS structure is required'
      });
    }

    const validation = ensDomainService.validateENSStructure(ensStructure);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('ENS validation error:', error);
    res.status(500).json({
      error: 'Failed to validate ENS structure',
      message: error.message
    });
  }
});

/**
 * GET /api/dao-registration/reserved-subdomains
 * Get list of reserved subdomains
 */
router.get('/reserved-subdomains', (req, res) => {
  try {
    const reservedSubdomains = ensDomainService.reservedSubdomains;
    
    res.json({
      success: true,
      data: reservedSubdomains
    });
  } catch (error) {
    console.error('Reserved subdomains fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch reserved subdomains',
      message: error.message
    });
  }
});

/**
 * POST /api/dao-registration/suggestions
 * Generate domain suggestions
 */
router.post('/suggestions', (req, res) => {
  try {
    const { input, type } = req.body;

    if (!input) {
      return res.status(400).json({
        error: 'Input is required'
      });
    }

    const suggestions = ensDomainService.generateDomainSuggestions(input, type);
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Domain suggestions error:', error);
    res.status(500).json({
      error: 'Failed to generate domain suggestions',
      message: error.message
    });
  }
});

module.exports = router;
