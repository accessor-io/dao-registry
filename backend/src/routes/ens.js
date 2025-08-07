const express = require('express');
const { validateRequest } = require('../middleware/validation');
const router = express.Router();

// Simplified ENS service (no TypeScript dependencies)
const ensService = {
  // Mock ENS resolution
  async resolve(name) {
    if (!name || !name.includes('.')) {
      return null;
    }
    return {
      name: name,
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      contentHash: '',
      textRecords: {
        'description': `ENS record for ${name}`,
        'url': `https://${name}`,
        'avatar': '',
        'email': '',
        'notice': '',
        'keywords': '',
        'com.discord': '',
        'com.github': '',
        'com.twitter': '',
        'org.telegram': ''
      },
      resolver: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
      owner: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      ttl: 0,
      timestamp: new Date().toISOString()
    };
  },
  async getRecords(name) {
    const resolution = await this.resolve(name);
    return resolution ? resolution.textRecords : {};
  },
  async checkAvailability(name) {
    const reservedNames = ['admin', 'www', 'api', 'docs', 'app'];
    const isReserved = reservedNames.some(reserved => name.includes(reserved));
    return !isReserved;
  },
  async getSuggestions(name) {
    const suggestions = [];
    const base = name.split('.')[0];
    if (base) {
      suggestions.push(`${base}-dao.eth`);
      suggestions.push(`${base}-governance.eth`);
      suggestions.push(`${base}-treasury.eth`);
      suggestions.push(`${base}-token.eth`);
    }
    return suggestions;
  }
};

const reservedSubdomainsService = {
  async isReserved(name) {
    const reservedNames = ['admin', 'www', 'api', 'docs', 'app', 'test'];
    return reservedNames.some(reserved => name.includes(reserved));
  }
};

// Resolve ENS name (GET by path param)
router.get('/resolve/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const resolution = await ensService.resolve(name);
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

// Resolve ENS name (POST with body, Ajv schema validation)
router.post('/resolve', validateRequest(null, 'body', 'ENSResolveRequest'), async (req, res) => {
  try {
    const { domain } = req.body;
    const resolution = await ensService.resolve(domain);
    if (!resolution) {
      return res.status(404).json({ error: 'ENS name not found', domain });
    }
    res.json(resolution);
  } catch (error) {
    console.error('Error resolving ENS name:', error);
    res.status(500).json({ error: 'Failed to resolve ENS name', message: error.message });
  }
});

// Get ENS records for a name
router.get('/records/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const records = await ensService.getRecords(name);
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
    const isReserved = await reservedSubdomainsService.isReserved(name);
    if (isReserved) {
      return res.json({ name, available: false, reason: 'Reserved subdomain', reserved: true });
    }
    const isAvailable = await ensService.checkAvailability(name);
    res.json({ name, available: isAvailable, reserved: false, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error checking ENS availability:', error);
    res.status(500).json({ error: 'Failed to check ENS availability', message: error.message });
  }
});

// Get ENS subdomain suggestions
router.get('/suggestions/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const suggestions = await ensService.getSuggestions(name);
    res.json({ original: name, suggestions: suggestions || [], timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting ENS suggestions:', error);
    res.status(500).json({ error: 'Failed to get ENS suggestions', message: error.message });
  }
});

// Ownership verification (POST with Ajv schema)
router.post('/verify-ownership', validateRequest(null, 'body', 'ENSOwnershipVerificationRequest'), async (req, res) => {
  try {
    const { domain, address, signature } = req.body;
    // Mock verification
    const ownershipVerified = Boolean(domain && address && signature);
    res.json({ ownershipVerified });
  } catch (error) {
    console.error('Error verifying ENS ownership:', error);
    res.status(500).json({ error: 'Failed to verify ENS ownership', message: error.message });
  }
});

module.exports = router;