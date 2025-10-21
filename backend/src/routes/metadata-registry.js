const express = require('express');
const router = express.Router();
const { DAORegistryNamingToolkit } = require('../../../tools/naming-conventions/src/index');

const toolkit = new DAORegistryNamingToolkit();

// Metadata Registry Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'metadata-registry',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Get all metadata schemas
router.get('/schemas', (req, res) => {
  const schemas = {
    dao: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        ens: { type: 'string' },
        governance: { type: 'object' },
        treasury: { type: 'object' },
        metadata: { type: 'object' }
      }
    },
    contract: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string' },
        address: { type: 'string' },
        abi: { type: 'array' },
        metadata: { type: 'object' }
      }
    },
    ens: {
      type: 'object',
      properties: {
        domain: { type: 'string' },
        owner: { type: 'string' },
        resolver: { type: 'string' },
        textRecords: { type: 'object' },
        metadata: { type: 'object' }
      }
    }
  };
  
  res.json({
    schemas,
    count: Object.keys(schemas).length
  });
});

// Register DAO metadata
router.post('/register/dao', async (req, res) => {
  try {
    const { name, ens, governance, treasury, metadata } = req.body;
    
    // Validate required fields
    if (!name || !ens) {
      return res.status(400).json({
        error: 'Missing required fields: name and ens are required'
      });
    }
    
    // Generate contract names using naming toolkit
    const contractGeneration = toolkit.contractNaming.generateDAOContractNames(name, {
      includeInterfaces: true,
      includeImplementations: true
    });
    
    const daoMetadata = {
      id: `dao_${Date.now()}`,
      name: name,
      ens: ens,
      governance: governance || {},
      treasury: treasury || {},
      contracts: contractGeneration,
      metadata: {
        ...metadata,
        registeredAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
    
    res.json({
      success: true,
      dao: daoMetadata,
      message: 'DAO metadata registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to register DAO metadata',
      details: error.message
    });
  }
});

// Register contract metadata
router.post('/register/contract', async (req, res) => {
  try {
    const { contractName, contractType, address, abi, metadata } = req.body;
    
    // Validate required fields
    if (!contractName || !contractType || !address) {
      return res.status(400).json({
        error: 'Missing required fields: contractName, contractType, and address are required'
      });
    }
    
    const contractMetadata = {
      id: `contract_${Date.now()}`,
      name: contractName,
      type: contractType,
      address: address,
      abi: abi || [],
      metadata: {
        ...metadata,
        registeredAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
    
    res.json({
      success: true,
      contract: contractMetadata,
      message: 'Contract metadata registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to register contract metadata',
      details: error.message
    });
  }
});

// Register ENS metadata
router.post('/register/ens', async (req, res) => {
  try {
    const { domain, owner, resolver, textRecords, metadata } = req.body;
    
    // Validate required fields
    if (!domain || !owner) {
      return res.status(400).json({
        error: 'Missing required fields: domain and owner are required'
      });
    }
    
    // Validate domain using naming toolkit
    const validation = await toolkit.validateENSDomain(domain);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Invalid ENS domain',
        details: validation.errors
      });
    }
    
    const ensMetadata = {
      id: `ens_${Date.now()}`,
      domain: domain,
      owner: owner,
      resolver: resolver || '',
      textRecords: textRecords || {},
      metadata: {
        ...metadata,
        registeredAt: new Date().toISOString(),
        version: '1.0.0',
        validation: validation
      }
    };
    
    res.json({
      success: true,
      ens: ensMetadata,
      message: 'ENS metadata registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to register ENS metadata',
      details: error.message
    });
  }
});

// Get metadata by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // This would typically query a database
    // For now, return a mock response
    const metadata = {
      id: id,
      type: id.startsWith('dao_') ? 'dao' : id.startsWith('contract_') ? 'contract' : 'ens',
      data: {
        // Mock data - in production this would come from database
        name: 'Example DAO',
        description: 'A sample DAO for demonstration',
        registeredAt: new Date().toISOString()
      }
    };
    
    res.json(metadata);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve metadata',
      details: error.message
    });
  }
});

// =======================================================================
// ENS INTEGRATION ROUTES
// =======================================================================

/**
 * Register contract with ENS
 * POST /api/metadata-registry/register/ens-contract
 */
router.post('/register/ens-contract', async (req, res) => {
  try {
    const { contractData, ensData } = req.body;
    
    if (!contractData || !ensData) {
      return res.status(400).json({
        error: 'contractData and ensData are required'
      });
    }

    const result = await metadataRegistryService.registerContractWithENS(contractData, ensData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to register contract with ENS',
      details: error.message
    });
  }
});

/**
 * Update contract ENS metadata
 * PUT /api/metadata-registry/:id/ens-metadata
 */
router.put('/:id/ens-metadata', async (req, res) => {
  try {
    const { id } = req.params;
    const { ensMetadata } = req.body;
    
    if (!ensMetadata) {
      return res.status(400).json({
        error: 'ensMetadata is required'
      });
    }

    const result = await metadataRegistryService.updateContractENSMetadata(id, ensMetadata);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update contract ENS metadata',
      details: error.message
    });
  }
});

/**
 * Validate ENS text records
 * POST /api/metadata-registry/validate/ens-text-records
 */
router.post('/validate/ens-text-records', async (req, res) => {
  try {
    const { textRecords } = req.body;
    
    if (!textRecords) {
      return res.status(400).json({
        error: 'textRecords is required'
      });
    }

    const validation = await metadataRegistryService.validateENSTextRecords(textRecords);
    res.json({
      success: true,
      validation
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to validate ENS text records',
      details: error.message
    });
  }
});

/**
 * Sync metadata to ENS contract
 * POST /api/metadata-registry/:id/sync-ens
 */
router.post('/:id/sync-ens', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await metadataRegistryService.syncToENSContract(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to sync to ENS contract',
      details: error.message
    });
  }
});

/**
 * Get ENS integration status
 * GET /api/metadata-registry/:id/ens-status
 */
router.get('/:id/ens-status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await metadataRegistryService.getENSIntegrationStatus(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get ENS integration status',
      details: error.message
    });
  }
});

/**
 * Get complete ENS metadata
 * GET /api/metadata-registry/:id/ens-metadata
 */
router.get('/:id/ens-metadata', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await metadataRegistryService.getCompleteENSMetadata(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get complete ENS metadata',
      details: error.message
    });
  }
});

/**
 * Get ENS service statistics
 * GET /api/metadata-registry/ens-statistics
 */
router.get('/ens-statistics', (req, res) => {
  try {
    const statistics = metadataRegistryService.getENSStatistics();
    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get ENS statistics',
      details: error.message
    });
  }
});

// Search metadata
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { type, limit = 10, offset = 0 } = req.query;
    
    // Mock search results - in production this would query a database
    const results = [
      {
        id: 'dao_1',
        type: 'dao',
        name: 'Example DAO',
        ens: 'example.eth',
        score: 0.95
      },
      {
        id: 'contract_1',
        type: 'contract',
        name: 'ExampleGovernance',
        address: '0x123...',
        score: 0.87
      }
    ].filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.ens?.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json({
      query,
      results,
      total: results.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to search metadata',
      details: error.message
    });
  }
});

// Update metadata
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Mock update - in production this would update database
    const updatedMetadata = {
      id: id,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      metadata: updatedMetadata,
      message: 'Metadata updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update metadata',
      details: error.message
    });
  }
});

// Delete metadata
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock deletion - in production this would delete from database
    res.json({
      success: true,
      message: `Metadata ${id} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete metadata',
      details: error.message
    });
  }
});

// Get metadata statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = {
      total: 150,
      byType: {
        dao: 45,
        contract: 78,
        ens: 27
      },
      byStatus: {
        active: 142,
        inactive: 8
      },
      recentRegistrations: 12,
      lastUpdated: new Date().toISOString()
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      details: error.message
    });
  }
});

module.exports = router;
