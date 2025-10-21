/**
 * Naming Toolkit API Routes
 * Provides API endpoints for the frontend to access the naming convention toolkit
 */

const express = require('express');
const router = express.Router();
const { DAORegistryNamingToolkit } = require('../../../tools/naming-conventions/src/index');

// Initialize the toolkit
const toolkit = new DAORegistryNamingToolkit();

// Middleware for error handling
const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validate ENS domain
router.post('/validate-ens', handleAsync(async (req, res) => {
  const { domain, type = 'primary' } = req.body;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    const result = toolkit.getENSValidator().validateDomain(domain, type);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Generate ENS subdomains
router.post('/generate-ens-subdomains', handleAsync(async (req, res) => {
  const { domain } = req.body;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    const result = toolkit.getENSValidator().generateStandardSubdomains(domain);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Validate contract name
router.post('/validate-contract', handleAsync(async (req, res) => {
  const { contractName } = req.body;
  
  if (!contractName) {
    return res.status(400).json({ error: 'Contract name is required' });
  }

  try {
    const result = toolkit.getContractNaming().validateContractName(contractName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Generate contract names
router.post('/generate-contracts', handleAsync(async (req, res) => {
  const { daoName, options = {} } = req.body;
  
  if (!daoName) {
    return res.status(400).json({ error: 'DAO name is required' });
  }

  try {
    const result = toolkit.getContractNaming().generateDAOContractNames(daoName, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Generate DAO structure
router.post('/generate-dao-structure', handleAsync(async (req, res) => {
  const { daoName, options = {} } = req.body;
  
  if (!daoName) {
    return res.status(400).json({ error: 'DAO name is required' });
  }

  try {
    const result = toolkit.generateDAOStructure(daoName, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Validate DAO metadata
router.post('/validate-dao', handleAsync(async (req, res) => {
  const { daoData } = req.body;
  
  if (!daoData) {
    return res.status(400).json({ error: 'DAO data is required' });
  }

  try {
    const result = toolkit.validateDAO(daoData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Get ENS metadata
router.post('/ens-metadata', handleAsync(async (req, res) => {
  const { domain, network = 'mainnet', version = 'v2' } = req.body;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    const result = await toolkit.getENSMetadataIntegration().getENSMetadata(domain, network, version);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Check domain availability
router.post('/domain-availability', handleAsync(async (req, res) => {
  const { domain, network = 'mainnet' } = req.body;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    const result = await toolkit.getENSMetadataIntegration().checkDomainAvailability(domain, network);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Get domain suggestions
router.post('/domain-suggestions', handleAsync(async (req, res) => {
  const { baseName, network = 'mainnet' } = req.body;
  
  if (!baseName) {
    return res.status(400).json({ error: 'Base name is required' });
  }

  try {
    const result = await toolkit.getENSMetadataIntegration().getDomainSuggestions(baseName, network);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Get domain history
router.post('/domain-history', handleAsync(async (req, res) => {
  const { domain, network = 'mainnet' } = req.body;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    const result = await toolkit.getENSMetadataIntegration().getDomainHistory(domain, network);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Migrate DAO
router.post('/migrate-dao', handleAsync(async (req, res) => {
  const { existingDAO } = req.body;
  
  if (!existingDAO) {
    return res.status(400).json({ error: 'Existing DAO data is required' });
  }

  try {
    const result = toolkit.migrateDAO(existingDAO);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Get toolkit statistics
router.get('/stats', handleAsync(async (req, res) => {
  try {
    const stats = toolkit.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Clear cache
router.post('/clear-cache', handleAsync(async (req, res) => {
  const { pattern } = req.body;
  
  try {
    toolkit.clearCaches();
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    toolkit: 'DAO Registry Naming Convention Toolkit'
  });
});

module.exports = router;
