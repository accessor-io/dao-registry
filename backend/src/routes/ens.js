const express = require('express');
const router = express.Router();

// Import the working ENS services
const ensResolverService = require('../services/metadata/ens/ens-resolver-service');
const reservedSubdomainsService = require('../services/metadata/reserved/subdomains/reserved-subdomains-service');

// Resolve ENS name
router.get('/resolve/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const resolution = await ensResolverService.resolve(name);
    
    if (!resolution) {
      return res.status(404).json({
        error: 'ENS name not found',
        name: name
      });
    }
    
    res.json(resolution);
  } catch (error) {
    console.error('Error resolving ENS name:', error);
    res.status(500).json({
      error: 'Failed to resolve ENS name',
      message: error.message
    });
  }
});

// Get ENS records for a name
router.get('/records/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const records = await ensResolverService.getRecords(name);
    
    res.json({
      name: name,
      records: records || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching ENS records:', error);
    res.status(500).json({
      error: 'Failed to fetch ENS records',
      message: error.message
    });
  }
});

// Check ENS name availability (for subdomains)
router.get('/availability/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    // Check if it's a reserved subdomain
    const isReserved = await reservedSubdomainsService.isReserved(name);
    
    if (isReserved) {
      return res.json({
        name: name,
        available: false,
        reason: 'Reserved subdomain',
        reserved: true
      });
    }
    
    // Check general availability
    const isAvailable = await ensResolverService.checkAvailability(name);
    
    res.json({
      name: name,
      available: isAvailable,
      reserved: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking ENS availability:', error);
    res.status(500).json({
      error: 'Failed to check ENS availability',
      message: error.message
    });
  }
});

// Get ENS subdomain suggestions
router.get('/suggestions/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const suggestions = await ensResolverService.getSuggestions(name);
    
    res.json({
      original: name,
      suggestions: suggestions || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting ENS suggestions:', error);
    res.status(500).json({
      error: 'Failed to get ENS suggestions',
      message: error.message
    });
  }
});

module.exports = router;