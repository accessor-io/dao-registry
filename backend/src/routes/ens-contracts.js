const express = require('express');
const router = express.Router();
const ENSContractService = require('../services/blockchain/ens-contract-service');

// Initialize ENS Contract Service
const ensContractService = new ENSContractService({
  provider: process.env.PROVIDER_URL || 'http://localhost:8545',
  network: process.env.NETWORK || 'localhost'
});

// Set contract addresses (these would typically come from deployment config)
ensContractService.setContractAddresses({
  ensRegistry: process.env.ENS_REGISTRY_ADDRESS,
  ensMetadataService: process.env.ENS_METADATA_SERVICE_ADDRESS,
  daoRegistryResolver: process.env.DAO_REGISTRY_RESOLVER_ADDRESS,
  daoRegistry: process.env.DAO_REGISTRY_ADDRESS,
  reservedSubdomains: process.env.RESERVED_SUBDOMAINS_ADDRESS,
  dataRegistry: process.env.DATA_REGISTRY_ADDRESS
});

// =======================================================================
// HEALTH CHECK
// =======================================================================

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ens-contracts',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    statistics: ensContractService.getStatistics()
  });
});

// =======================================================================
// CONTRACT REGISTRATION
// =======================================================================

/**
 * Register contract with ENS
 * POST /api/ens-contracts/register
 */
router.post('/register', async (req, res) => {
  try {
    const { contractAddress, ensName, textRecords, reverseRecord, metadata } = req.body;
    
    // Validate required fields
    if (!contractAddress || !ensName) {
      return res.status(400).json({
        error: 'Missing required fields: contractAddress and ensName are required'
      });
    }

    // Validate contract address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      return res.status(400).json({
        error: 'Invalid contract address format'
      });
    }

    // Register contract for ENS integration
    const registrationResult = await ensContractService.registerContractForENS(
      contractAddress,
      ensName
    );

    // Set text records if provided
    if (textRecords && Object.keys(textRecords).length > 0) {
      const records = Object.entries(textRecords).map(([key, value]) => ({
        key,
        value
      }));

      await ensContractService.batchSetContractTextRecords(contractAddress, records);
    }

    // Set reverse record if provided
    if (reverseRecord) {
      await ensContractService.setReverseRecord(contractAddress, reverseRecord);
    }

    // Sync metadata if provided
    if (metadata) {
      await ensContractService.syncMetadataToContract(contractAddress, metadata);
    }

    res.json({
      success: true,
      contractAddress,
      ensName,
      registrationResult,
      message: 'Contract registered with ENS successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to register contract with ENS',
      details: error.message
    });
  }
});

// =======================================================================
// TEXT RECORD MANAGEMENT
// =======================================================================

/**
 * Update text records for a contract
 * PUT /api/ens-contracts/:address/text-records
 */
router.put('/:address/text-records', async (req, res) => {
  try {
    const { address } = req.params;
    const { textRecords } = req.body;
    
    // Validate contract address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        error: 'Invalid contract address format'
      });
    }

    if (!textRecords || Object.keys(textRecords).length === 0) {
      return res.status(400).json({
        error: 'textRecords is required and cannot be empty'
      });
    }

    // Validate text records
    const records = Object.entries(textRecords).map(([key, value]) => ({
      key,
      value
    }));

    const validation = await ensContractService.validateTextRecords(records);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Text record validation failed',
        details: validation.errors
      });
    }

    // Update text records
    const result = await ensContractService.batchSetContractTextRecords(address, records);

    res.json({
      success: true,
      contractAddress: address,
      textRecords,
      result,
      message: 'Text records updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update text records',
      details: error.message
    });
  }
});

/**
 * Get text records for a contract
 * GET /api/ens-contracts/:address/text-records
 */
router.get('/:address/text-records', async (req, res) => {
  try {
    const { address } = req.params;
    const { keys } = req.query;
    
    // Validate contract address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        error: 'Invalid contract address format'
      });
    }

    let textRecords = {};

    if (keys) {
      // Get specific keys
      const keyArray = Array.isArray(keys) ? keys : [keys];
      const values = await ensContractService.batchGetContractTextRecords(address, keyArray);
      
      keyArray.forEach((key, index) => {
        if (values[index] && values[index].length > 0) {
          textRecords[key] = values[index];
        }
      });
    } else {
      // Get all standard text record keys
      const standardKeys = [
        'description', 'url', 'avatar', 'email', 'notice', 'keywords',
        'com.twitter', 'com.github', 'com.discord', 'org.telegram',
        'com.reddit', 'com.youtube', 'com.medium'
      ];
      
      const values = await ensContractService.batchGetContractTextRecords(address, standardKeys);
      
      standardKeys.forEach((key, index) => {
        if (values[index] && values[index].length > 0) {
          textRecords[key] = values[index];
        }
      });
    }

    res.json({
      success: true,
      contractAddress: address,
      textRecords
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get text records',
      details: error.message
    });
  }
});

/**
 * Get a specific text record for a contract
 * GET /api/ens-contracts/:address/text-records/:key
 */
router.get('/:address/text-records/:key', async (req, res) => {
  try {
    const { address, key } = req.params;
    
    // Validate contract address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        error: 'Invalid contract address format'
      });
    }

    const value = await ensContractService.getContractTextRecord(address, key);

    res.json({
      success: true,
      contractAddress: address,
      key,
      value
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get text record',
      details: error.message
    });
  }
});

// =======================================================================
// REVERSE RECORD MANAGEMENT
// =======================================================================

/**
 * Claim reverse record for a contract
 * POST /api/ens-contracts/:address/claim-reverse
 */
router.post('/:address/claim-reverse', async (req, res) => {
  try {
    const { address } = req.params;
    const { ensName } = req.body;
    
    // Validate contract address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        error: 'Invalid contract address format'
      });
    }

    if (!ensName) {
      return res.status(400).json({
        error: 'ensName is required'
      });
    }

    const result = await ensContractService.claimReverseRecord(address, ensName);

    res.json({
      success: true,
      contractAddress: address,
      ensName,
      result,
      message: 'Reverse record claimed successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to claim reverse record',
      details: error.message
    });
  }
});

/**
 * Set reverse record for a contract
 * PUT /api/ens-contracts/:address/reverse-record
 */
router.put('/:address/reverse-record', async (req, res) => {
  try {
    const { address } = req.params;
    const { ensName } = req.body;
    
    // Validate contract address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        error: 'Invalid contract address format'
      });
    }

    if (!ensName) {
      return res.status(400).json({
        error: 'ensName is required'
      });
    }

    const result = await ensContractService.setReverseRecord(address, ensName);

    res.json({
      success: true,
      contractAddress: address,
      ensName,
      result,
      message: 'Reverse record set successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to set reverse record',
      details: error.message
    });
  }
});

/**
 * Get reverse record for a contract
 * GET /api/ens-contracts/:address/reverse-record
 */
router.get('/:address/reverse-record', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate contract address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        error: 'Invalid contract address format'
      });
    }

    const reverseRecord = await ensContractService.getReverseRecord(address);

    res.json({
      success: true,
      contractAddress: address,
      reverseRecord
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get reverse record',
      details: error.message
    });
  }
});

// =======================================================================
// METADATA MANAGEMENT
// =======================================================================

/**
 * Get full metadata for a contract
 * GET /api/ens-contracts/:address/metadata
 */
router.get('/:address/metadata', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate contract address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        error: 'Invalid contract address format'
      });
    }

    const metadata = await ensContractService.getCompleteENSMetadata(address);

    res.json({
      success: true,
      contractAddress: address,
      metadata
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get contract metadata',
      details: error.message
    });
  }
});

/**
 * Sync metadata to contract
 * POST /api/ens-contracts/:address/sync-metadata
 */
router.post('/:address/sync-metadata', async (req, res) => {
  try {
    const { address } = req.params;
    const { metadata } = req.body;
    
    // Validate contract address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        error: 'Invalid contract address format'
      });
    }

    if (!metadata) {
      return res.status(400).json({
        error: 'metadata is required'
      });
    }

    const result = await ensContractService.syncMetadataToContract(address, metadata);

    res.json({
      success: true,
      contractAddress: address,
      result,
      message: 'Metadata synced successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to sync metadata',
      details: error.message
    });
  }
});

// =======================================================================
// INTEGRATION STATUS
// =======================================================================

/**
 * Get ENS integration status for a contract
 * GET /api/ens-contracts/:address/status
 */
router.get('/:address/status', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate contract address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        error: 'Invalid contract address format'
      });
    }

    const status = await ensContractService.getENSIntegrationStatus(address);

    res.json({
      success: true,
      contractAddress: address,
      status
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get integration status',
      details: error.message
    });
  }
});

// =======================================================================
// BATCH OPERATIONS
// =======================================================================

/**
 * Batch update text records for multiple contracts
 * POST /api/ens-contracts/batch/text-records
 */
router.post('/batch/text-records', async (req, res) => {
  try {
    const { contracts } = req.body;
    
    if (!contracts || !Array.isArray(contracts) || contracts.length === 0) {
      return res.status(400).json({
        error: 'contracts array is required and cannot be empty'
      });
    }

    const results = [];
    const errors = [];

    for (const contract of contracts) {
      try {
        const { address, textRecords } = contract;
        
        if (!address || !textRecords) {
          errors.push({
            address: address || 'unknown',
            error: 'address and textRecords are required'
          });
          continue;
        }

        // Validate contract address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
          errors.push({
            address,
            error: 'Invalid contract address format'
          });
          continue;
        }

        const records = Object.entries(textRecords).map(([key, value]) => ({
          key,
          value
        }));

        const result = await ensContractService.batchSetContractTextRecords(address, records);
        
        results.push({
          address,
          result,
          success: true
        });
      } catch (error) {
        errors.push({
          address: contract.address || 'unknown',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      results,
      errors,
      totalProcessed: contracts.length,
      successful: results.length,
      failed: errors.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to batch update text records',
      details: error.message
    });
  }
});

// =======================================================================
// VALIDATION
// =======================================================================

/**
 * Validate text records
 * POST /api/ens-contracts/validate/text-records
 */
router.post('/validate/text-records', async (req, res) => {
  try {
    const { textRecords } = req.body;
    
    if (!textRecords || Object.keys(textRecords).length === 0) {
      return res.status(400).json({
        error: 'textRecords is required and cannot be empty'
      });
    }

    const records = Object.entries(textRecords).map(([key, value]) => ({
      key,
      value
    }));

    const validation = await ensContractService.validateTextRecords(records);

    res.json({
      success: true,
      validation
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to validate text records',
      details: error.message
    });
  }
});

// =======================================================================
// STATISTICS
// =======================================================================

/**
 * Get ENS contract service statistics
 * GET /api/ens-contracts/statistics
 */
router.get('/statistics', (req, res) => {
  try {
    const statistics = ensContractService.getStatistics();

    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get statistics',
      details: error.message
    });
  }
});

// =======================================================================
// ERROR HANDLING
// =======================================================================

// Handle 404 for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
router.use((error, req, res, next) => {
  console.error('ENS Contracts API Error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;




