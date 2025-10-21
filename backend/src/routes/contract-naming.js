/**
 * Contract Naming Routes
 * Handles smart contract naming conventions and operations
 */

const express = require('express');
const router = express.Router();

// Import services
const { ContractNamingService } = require('../services/naming/contract-naming-service.js');

// Initialize services
const contractNamingService = new ContractNamingService();

/**
 * POST /api/contract-naming/generate
 * Generate contract name following conventions
 */
router.post('/generate', (req, res) => {
  try {
    const { daoName, contractType, version, isInterface, isImplementation, isProxy } = req.body;

    // Validate required fields
    if (!daoName || !contractType) {
      return res.status(400).json({
        error: 'DAO name and contract type are required'
      });
    }

    const contractName = contractNamingService.generateContractName({
      daoName,
      contractType,
      version,
      isInterface,
      isImplementation,
      isProxy
    });
    
    res.json({
      success: true,
      data: { contractName }
    });
  } catch (error) {
    console.error('Contract name generation error:', error);
    res.status(500).json({
      error: 'Failed to generate contract name',
      message: error.message
    });
  }
});

/**
 * POST /api/contract-naming/validate
 * Validate contract name according to standards
 */
router.post('/validate', (req, res) => {
  try {
    const { contractName, contractType } = req.body;

    if (!contractName) {
      return res.status(400).json({
        error: 'Contract name is required'
      });
    }

    const validation = contractNamingService.validateContractName(contractName, contractType);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Contract name validation error:', error);
    res.status(500).json({
      error: 'Failed to validate contract name',
      message: error.message
    });
  }
});

/**
 * POST /api/contract-naming/generate-dao-contracts
 * Generate contract names for a complete DAO
 */
router.post('/generate-dao-contracts', (req, res) => {
  try {
    const { daoName, options } = req.body;

    if (!daoName) {
      return res.status(400).json({
        error: 'DAO name is required'
      });
    }

    const contracts = contractNamingService.generateDAOContractNames(daoName, options);
    
    res.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    console.error('DAO contract generation error:', error);
    res.status(500).json({
      error: 'Failed to generate DAO contracts',
      message: error.message
    });
  }
});

/**
 * POST /api/contract-naming/generate-canonical-id
 * Generate ENSIP-19 compliant canonical ID
 */
router.post('/generate-canonical-id', (req, res) => {
  try {
    const { org, protocol, category, role, version, chainId, variant } = req.body;

    if (!org || !protocol || !category || !role) {
      return res.status(400).json({
        error: 'org, protocol, category, and role are required'
      });
    }

    const canonicalId = contractNamingService.generateCanonicalId({
      org,
      protocol,
      category,
      role,
      version,
      chainId,
      variant
    });
    
    res.json({
      success: true,
      data: { canonicalId }
    });
  } catch (error) {
    console.error('Canonical ID generation error:', error);
    res.status(500).json({
      error: 'Failed to generate canonical ID',
      message: error.message
    });
  }
});

/**
 * POST /api/contract-naming/parse-canonical-id
 * Parse canonical ID into components
 */
router.post('/parse-canonical-id', (req, res) => {
  try {
    const { canonicalId } = req.body;

    if (!canonicalId) {
      return res.status(400).json({
        error: 'Canonical ID is required'
      });
    }

    const parsed = contractNamingService.parseCanonicalId(canonicalId);
    
    res.json({
      success: true,
      data: parsed
    });
  } catch (error) {
    console.error('Canonical ID parsing error:', error);
    res.status(500).json({
      error: 'Failed to parse canonical ID',
      message: error.message
    });
  }
});

/**
 * POST /api/contract-naming/generate-contract-domain
 * Generate ENS domain for contract
 */
router.post('/generate-contract-domain', (req, res) => {
  try {
    const { org, subcategory, category, project } = req.body;

    if (!org || !subcategory || !category) {
      return res.status(400).json({
        error: 'org, subcategory, and category are required'
      });
    }

    const domain = contractNamingService.generateContractDomain({
      org,
      subcategory,
      category,
      project
    });
    
    res.json({
      success: true,
      data: { domain }
    });
  } catch (error) {
    console.error('Contract domain generation error:', error);
    res.status(500).json({
      error: 'Failed to generate contract domain',
      message: error.message
    });
  }
});

/**
 * POST /api/contract-naming/generate-metadata
 * Generate contract metadata structure
 */
router.post('/generate-metadata', (req, res) => {
  try {
    const { daoName, contractType, contractAddress, chainId, version, org, protocol, category, role } = req.body;

    if (!daoName || !contractType || !contractAddress) {
      return res.status(400).json({
        error: 'DAO name, contract type, and contract address are required'
      });
    }

    const metadata = contractNamingService.generateContractMetadata({
      daoName,
      contractType,
      contractAddress,
      chainId,
      version,
      org,
      protocol,
      category,
      role
    });
    
    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('Contract metadata generation error:', error);
    res.status(500).json({
      error: 'Failed to generate contract metadata',
      message: error.message
    });
  }
});

/**
 * POST /api/contract-naming/validate-structure
 * Validate complete DAO contract structure
 */
router.post('/validate-structure', (req, res) => {
  try {
    const { daoContracts } = req.body;

    if (!daoContracts) {
      return res.status(400).json({
        error: 'DAO contracts object is required'
      });
    }

    const validation = contractNamingService.validateDAOContractStructure(daoContracts);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Contract structure validation error:', error);
    res.status(500).json({
      error: 'Failed to validate contract structure',
      message: error.message
    });
  }
});

/**
 * GET /api/contract-naming/types
 * Get available contract types
 */
router.get('/types', (req, res) => {
  try {
    const contractTypes = contractNamingService.contractTypes;
    
    res.json({
      success: true,
      data: contractTypes
    });
  } catch (error) {
    console.error('Contract types fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch contract types',
      message: error.message
    });
  }
});

/**
 * GET /api/contract-naming/patterns
 * Get available naming patterns
 */
router.get('/patterns', (req, res) => {
  try {
    const namingPatterns = contractNamingService.namingPatterns;
    
    res.json({
      success: true,
      data: namingPatterns
    });
  } catch (error) {
    console.error('Naming patterns fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch naming patterns',
      message: error.message
    });
  }
});

/**
 * GET /api/contract-naming/standards/:contractType
 * Get contract standards for a specific type
 */
router.get('/standards/:contractType', (req, res) => {
  try {
    const { contractType } = req.params;

    const standards = contractNamingService.getContractStandards(contractType);
    const interfaces = contractNamingService.getContractInterfaces(contractType);
    
    res.json({
      success: true,
      data: {
        standards,
        interfaces
      }
    });
  } catch (error) {
    console.error('Contract standards fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch contract standards',
      message: error.message
    });
  }
});

/**
 * POST /api/contract-naming/normalize-dao-name
 * Normalize DAO name for contract naming
 */
router.post('/normalize-dao-name', (req, res) => {
  try {
    const { daoName } = req.body;

    if (!daoName) {
      return res.status(400).json({
        error: 'DAO name is required'
      });
    }

    const normalizedName = contractNamingService.normalizeDAOName(daoName);
    
    res.json({
      success: true,
      data: { normalizedName }
    });
  } catch (error) {
    console.error('DAO name normalization error:', error);
    res.status(500).json({
      error: 'Failed to normalize DAO name',
      message: error.message
    });
  }
});

module.exports = router;
