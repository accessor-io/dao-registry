const express = require('express');
const { validateRequest } = require('../middleware/validation');
const { ethers } = require('ethers');
const router = express.Router();

// Provider (mainnet by default, override via MAINNET_RPC_URL)
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || 'https://cloudflare-eth.com';
const provider = new ethers.JsonRpcProvider(MAINNET_RPC_URL);

function normalizeEnsDomain(input) {
  if (!input) return input;
  return input.includes('.') ? input : `${input}.eth`;
}

function namehash(domain) {
  // EIP-137 namehash implemented using ethers v6 helpers
  let node = '0x' + '00'.repeat(32);
  if (!domain) return node;
  const labels = domain.toLowerCase().split('.');
  while (labels.length) {
    const label = labels.pop();
    const labelHash = ethers.id(label);
    node = ethers.solidityPackedKeccak256(['bytes32', 'bytes32'], [node, labelHash]);
  }
  return node;
}

// ENS Registry (mainnet)
const ENS_REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const ENS_REGISTRY_ABI = [
  'function owner(bytes32 node) view returns (address)',
  'function ttl(bytes32 node) view returns (uint64)'
];
const ensRegistry = new ethers.Contract(ENS_REGISTRY_ADDRESS, ENS_REGISTRY_ABI, provider);

// Real ENS service using ethers
const ensService = {
  async resolve(rawName) {
    const name = normalizeEnsDomain(rawName);
    if (!name || !name.includes('.')) return null;

    // Get resolver
    const resolver = await provider.getResolver(name);
    if (!resolver) return null;

    // Address
    let address = null;
    try { address = await resolver.getAddress(); } catch {}

    // Content hash
    let contentHash = '';
    try { contentHash = await resolver.getContentHash(); } catch {}

    // Common text records
    const textKeys = [
      'description', 'url', 'avatar', 'email', 'notice', 'keywords',
      'com.discord', 'com.github', 'com.twitter', 'org.telegram'
    ];
    const textRecords = {};
    for (const key of textKeys) {
      try { textRecords[key] = await resolver.getText(key); } catch { textRecords[key] = ''; }
    }

    // Owner and TTL from registry
    let owner = null; let ttl = 0;
    try {
      const node = namehash(name);
      owner = await ensRegistry.owner(node);
      ttl = Number(await ensRegistry.ttl(node));
    } catch {}

    return {
      name,
      address,
      contentHash,
      textRecords,
      resolver: resolver.address,
      owner,
      ttl,
      timestamp: new Date().toISOString()
    };
  },

  async getRecords(rawName) {
    const resolution = await this.resolve(rawName);
    return resolution ? resolution.textRecords : {};
  },

  async checkAvailability(label) {
    // Simple availability heuristic: reserved words filtered elsewhere; otherwise suggest available
    const reservedNames = ['admin', 'www', 'api', 'docs', 'app'];
    const isReserved = reservedNames.some(r => label.includes(r));
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
      return res.status(404).json({ error: 'ENS name not found', name: normalizeEnsDomain(name) });
    }
    res.json(resolution);
  } catch (error) {
    console.error('Error resolving ENS name:', error);
    res.status(500).json({ error: 'Failed to resolve ENS name', message: error.message });
  }
});

// Resolve ENS name (GET: label + parent composed as label.parent)
router.get('/resolve/:label/under/:parent', async (req, res) => {
  try {
    const { label, parent } = req.params;
    const domain = `${label}.${normalizeEnsDomain(parent)}`;
    const resolution = await ensService.resolve(domain);
    if (!resolution) {
      return res.status(404).json({ error: 'ENS name not found', name: domain });
    }
    res.json(resolution);
  } catch (error) {
    console.error('Error resolving ENS subdomain:', error);
    res.status(500).json({ error: 'Failed to resolve ENS subdomain', message: error.message });
  }
});

// Resolve ENS name (POST with body, Ajv schema validation)
router.post('/resolve', validateRequest(null, 'body', 'ENSResolveRequest'), async (req, res) => {
  try {
    const { domain } = req.body;
    const resolution = await ensService.resolve(domain);
    if (!resolution) {
      return res.status(404).json({ error: 'ENS name not found', domain: normalizeEnsDomain(domain) });
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
    res.json({ name: normalizeEnsDomain(name), records: records || {}, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error fetching ENS records:', error);
    res.status(500).json({ error: 'Failed to fetch ENS records', message: error.message });
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
    // Placeholder verification; real flow would verify a signed message proving control over the resolver/owner
    const ownershipVerified = Boolean(domain && address && signature);
    res.json({ ownershipVerified });
  } catch (error) {
    console.error('Error verifying ENS ownership:', error);
    res.status(500).json({ error: 'Failed to verify ENS ownership', message: error.message });
  }
});

module.exports = router;