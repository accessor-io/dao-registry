const express = require('express');
const { validateRequest } = require('../middleware/validation');
const router = express.Router();

// Data source classification
const DATA_SOURCES = {
  ON_CHAIN: 'on_chain',
  MANUAL: 'manual',
  ENS: 'ens',
  EXTERNAL_API: 'external_api'
};

// Data point categories from RFC-002
const DATA_CATEGORIES = {
  // ENS Data
  ENS_DOMAIN: 'ens_domain',
  ENS_METADATA: 'ens_metadata',
  ENS_TEXT_RECORD: 'ens_text_record',
  ENS_CONTENT_HASH: 'ens_content_hash',
  
  // User Input Data
  TEXT_INPUT: 'text_input',
  ADDRESS_INPUT: 'address_input',
  NUMERIC_INPUT: 'numeric_input',
  
  // Blockchain Data
  TRANSACTION_EVENT: 'transaction_event',
  CONTRACT_EVENT: 'contract_event',
  TRANSACTION_STATE: 'transaction_state',
  
  // Off-chain Data
  API_RESPONSE: 'api_response',
  FILE_DATA: 'file_data'
};

// Data point endpoints for each category
router.get('/categories', (req, res) => {
  res.json({
    dataSources: DATA_SOURCES,
    categories: DATA_CATEGORIES,
    description: 'Available data point categories and sources'
  });
});

// POST analytics (Ajv-validated)
router.post('/external/analytics', validateRequest(null, 'body', 'AnalyticsRequest'), async (req, res) => {
  try {
    const { daoId, timeRange, metrics } = req.body;
    // Mock external analytics call
    res.json({
      daoAnalytics: {
        totalMembers: 1000,
        totalProposals: 50,
        treasuryValue: 1_000_000,
        participationRate: 0.5,
        averageVotingPower: 10000,
        activeProposals: 2,
        executedProposals: 20,
        totalVotingPower: 200000,
        quorumMet: 18,
        proposalsThisMonth: 3,
        proposalsThisYear: 25,
        averageProposalDuration: 5,
        treasuryGrowth: 0.12,
        averageProposalValue: 10000,
        totalExecutedValue: 200000
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process analytics request', message: error.message });
  }
});

// =======================================================================
// ON-CHAIN DATA ENDPOINTS (from external contracts)
// =======================================================================

// Get governance token data from external contracts
router.get('/on-chain/governance/:daoAddress', async (req, res) => {
  try {
    const { daoAddress } = req.params;
    const contractIntegration = require('../services/contract-integration');
    const contractService = new contractIntegration();
    
    // Get DAO by address first
    const daoInfo = await contractService.getDAOByAddress(daoAddress);
    if (!daoInfo) {
      return res.status(404).json({
        error: 'DAO not found',
        daoAddress
      });
    }
    
    // Get governance data from contract
    const governanceData = await contractService.getGovernanceData(daoInfo.data.daoId);
    
    res.json(governanceData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch on-chain governance data',
      message: error.message
    });
  }
});

// Get treasury data from external contracts
router.get('/on-chain/treasury/:daoAddress', async (req, res) => {
  try {
    const { daoAddress } = req.params;
    const contractIntegration = require('../services/contract-integration');
    const contractService = new contractIntegration();
    
    // Get DAO by address first
    const daoInfo = await contractService.getDAOByAddress(daoAddress);
    if (!daoInfo) {
      return res.status(404).json({
        error: 'DAO not found',
        daoAddress
      });
    }
    
    // Get treasury data from contract
    const treasuryData = await contractService.getTreasuryData(daoInfo.data.daoId);
    
    res.json(treasuryData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch on-chain treasury data',
      message: error.message
    });
  }
});

// Get voting data from external governance contracts
router.get('/on-chain/voting/:daoAddress', async (req, res) => {
  try {
    const { daoAddress } = req.params;
    const contractIntegration = require('../services/contract-integration');
    const contractService = new contractIntegration();
    
    // Get DAO by address first
    const daoInfo = await contractService.getDAOByAddress(daoAddress);
    if (!daoInfo) {
      return res.status(404).json({
        error: 'DAO not found',
        daoAddress
      });
    }
    
    // Get voting data from contract
    const votingData = await contractService.getVotingData(daoInfo.data.daoId);
    
    res.json(votingData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch on-chain voting data',
      message: error.message
    });
  }
});

// =======================================================================
// MANUAL DATA ENDPOINTS (user-entered information)
// =======================================================================

// Get manually entered DAO information
router.get('/manual/dao/:daoId', async (req, res) => {
  try {
    const { daoId } = req.params;
    
    const manualData = {
      source: DATA_SOURCES.MANUAL,
      category: DATA_CATEGORIES.TEXT_INPUT,
      daoId,
      data: {
        name: 'Example DAO',
        description: 'A decentralized autonomous organization focused on governance',
        website: 'https://example-dao.com',
        socialMedia: {
          twitter: '@example_dao',
          discord: 'discord.gg/example',
          telegram: 't.me/example_dao'
        },
        tags: ['governance', 'defi', 'dao'],
        category: 'DeFi',
        founded: '2023-01-15',
        team: [
          {
            name: 'Alice Johnson',
            role: 'Founder',
            bio: 'Blockchain developer with 5 years experience'
          }
        ],
        lastUpdated: new Date().toISOString()
      }
    };
    
    res.json(manualData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch manual DAO data',
      message: error.message
    });
  }
});

// Update manual DAO information
router.put('/manual/dao/:daoId', async (req, res) => {
  try {
    const { daoId } = req.params;
    const updateData = req.body;
    
    // Validate manual input data
    const validationResult = validateManualData(updateData);
    
    if (!validationResult.isValid) {
      return res.status(400).json({
        error: 'Invalid manual data',
        validation: validationResult
      });
    }
    
    const updatedData = {
      source: DATA_SOURCES.MANUAL,
      category: DATA_CATEGORIES.TEXT_INPUT,
      daoId,
      data: updateData,
      lastUpdated: new Date().toISOString()
    };
    
    res.json(updatedData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update manual DAO data',
      message: error.message
    });
  }
});

// =======================================================================
// ENS DATA ENDPOINTS (ENS resolution and metadata)
// =======================================================================

// Get ENS domain resolution data
router.get('/ens/resolution/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    const ensData = {
      source: DATA_SOURCES.ENS,
      category: DATA_CATEGORIES.ENS_DOMAIN,
      domain,
      data: {
        resolvedAddress: '0x1234567890123456789012345678901234567890',
        owner: '0x9876543210987654321098765432109876543210',
        resolver: '0x0000000000000000000000000000000000000000',
        ttl: 300,
        lastUpdated: new Date().toISOString()
      }
    };
    
    res.json(ensData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch ENS resolution data',
      message: error.message
    });
  }
});

// Get ENS text records
router.get('/ens/text-records/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    const textRecords = {
      source: DATA_SOURCES.ENS,
      category: DATA_CATEGORIES.ENS_TEXT_RECORD,
      domain,
      data: {
        description: 'Example DAO - A decentralized autonomous organization',
        url: 'https://example-dao.com',
        avatar: 'https://example-dao.com/avatar.png',
        email: 'contact@example-dao.com',
        'com.twitter': '@example_dao',
        'com.github': 'example-dao',
        'org.telegram': 't.me/example_dao',
        lastUpdated: new Date().toISOString()
      }
    };
    
    res.json(textRecords);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch ENS text records',
      message: error.message
    });
  }
});

// =======================================================================
// EXTERNAL API DATA ENDPOINTS (third-party integrations)
// =======================================================================

// Get token price data from external APIs
router.get('/external/token-price/:tokenAddress', async (req, res) => {
  try {
    const { tokenAddress } = req.params;
    
    const priceData = {
      source: DATA_SOURCES.EXTERNAL_API,
      category: DATA_CATEGORIES.API_RESPONSE,
      tokenAddress,
      data: {
        price: '1.25',
        priceChange24h: '0.05',
        marketCap: '1250000000',
        volume24h: '50000000',
        source: 'CoinGecko API',
        lastUpdated: new Date().toISOString()
      }
    };
    
    res.json(priceData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch external token price data',
      message: error.message
    });
  }
});

// Get DAO analytics from external APIs
router.get('/external/analytics/:daoAddress', async (req, res) => {
  try {
    const { daoAddress } = req.params;
    
    const analyticsData = {
      source: DATA_SOURCES.EXTERNAL_API,
      category: DATA_CATEGORIES.API_RESPONSE,
      daoAddress,
      data: {
        memberCount: 1250,
        activeProposals: 3,
        totalProposals: 45,
        participationRate: 0.68,
        averageVotingPower: '25000000000000000000000',
        source: 'DAO Analytics API',
        lastUpdated: new Date().toISOString()
      }
    };
    
    res.json(analyticsData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch external analytics data',
      message: error.message
    });
  }
});

// =======================================================================
// ADDITIONAL DATA POINTS FROM SPECIFICATION
// =======================================================================

// Get DAO analytics data
router.get('/on-chain/analytics/:daoAddress', async (req, res) => {
  try {
    const { daoAddress } = req.params;
    const contractIntegration = require('../services/contract-integration');
    const contractService = new contractIntegration();
    
    // Get DAO by address first
    const daoInfo = await contractService.getDAOByAddress(daoAddress);
    if (!daoInfo) {
      return res.status(404).json({
        error: 'DAO not found',
        daoAddress
      });
    }
    
    // Get analytics data from contract
    const analyticsData = await contractService.getDAOAnalytics(daoInfo.data.daoId);
    
    res.json(analyticsData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch on-chain analytics data',
      message: error.message
    });
  }
});

// Get DAO proposals
router.get('/on-chain/proposals/:daoAddress', async (req, res) => {
  try {
    const { daoAddress } = req.params;
    const { status } = req.query;
    const contractIntegration = require('../services/contract-integration');
    const contractService = new contractIntegration();
    
    // Get DAO by address first
    const daoInfo = await contractService.getDAOByAddress(daoAddress);
    if (!daoInfo) {
      return res.status(404).json({
        error: 'DAO not found',
        daoAddress
      });
    }
    
    // Get proposals data from contract
    const proposalsData = await contractService.getDAOProposals(daoInfo.data.daoId, status);
    
    res.json(proposalsData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch on-chain proposals data',
      message: error.message
    });
  }
});

// Get DAO members
router.get('/on-chain/members/:daoAddress', async (req, res) => {
  try {
    const { daoAddress } = req.params;
    const contractIntegration = require('../services/contract-integration');
    const contractService = new contractIntegration();
    
    // Get DAO by address first
    const daoInfo = await contractService.getDAOByAddress(daoAddress);
    if (!daoInfo) {
      return res.status(404).json({
        error: 'DAO not found',
        daoAddress
      });
    }
    
    // Get members data from contract
    const membersData = await contractService.getDAOMembers(daoInfo.data.daoId);
    
    res.json(membersData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch on-chain members data',
      message: error.message
    });
  }
});

// Get specific proposal details
router.get('/on-chain/proposal/:proposalId', async (req, res) => {
  try {
    const { proposalId } = req.params;
    const contractIntegration = require('../services/contract-integration');
    const contractService = new contractIntegration();
    
    // Get proposal data from contract
    const proposalData = await contractService.getProposalInfo(proposalId);
    
    res.json(proposalData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch on-chain proposal data',
      message: error.message
    });
  }
});

// Get specific member details
router.get('/on-chain/member/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    const contractIntegration = require('../services/contract-integration');
    const contractService = new contractIntegration();
    
    // Get member data from contract
    const memberData = await contractService.getMemberInfo(memberId);
    
    res.json(memberData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch on-chain member data',
      message: error.message
    });
  }
});

// =======================================================================
// COMBINED DATA ENDPOINTS (aggregated from multiple sources)
// =======================================================================

// Get comprehensive DAO data from all sources
router.get('/combined/dao/:daoAddress', async (req, res) => {
  try {
    const { daoAddress } = req.params;
    const contractIntegration = require('../services/contract-integration');
    const contractService = new contractIntegration();
    
    // Get DAO by address first
    const daoInfo = await contractService.getDAOByAddress(daoAddress);
    if (!daoInfo) {
      return res.status(404).json({
        error: 'DAO not found',
        daoAddress
      });
    }
    
    const combinedData = {
      daoAddress,
      daoInfo: daoInfo.data,
      sources: {
        onChain: {
          governance: `/api/data-points/on-chain/governance/${daoAddress}`,
          treasury: `/api/data-points/on-chain/treasury/${daoAddress}`,
          voting: `/api/data-points/on-chain/voting/${daoAddress}`,
          analytics: `/api/data-points/on-chain/analytics/${daoAddress}`,
          proposals: `/api/data-points/on-chain/proposals/${daoAddress}`,
          members: `/api/data-points/on-chain/members/${daoAddress}`
        },
        manual: {
          info: `/api/data-points/manual/dao/${daoAddress}`,
          description: `/api/data-points/manual/dao/${daoAddress}/description`
        },
        ens: {
          resolution: `/api/data-points/ens/resolution/${daoAddress}`,
          textRecords: `/api/data-points/ens/text-records/${daoAddress}`
        },
        external: {
          tokenPrice: `/api/data-points/external/token-price/${daoAddress}`,
          analytics: `/api/data-points/external/analytics/${daoAddress}`
        }
      },
      lastUpdated: new Date().toISOString()
    };
    
    res.json(combinedData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch combined DAO data',
      message: error.message
    });
  }
});

// =======================================================================
// VALIDATION FUNCTIONS
// =======================================================================

function validateManualData(data) {
  const errors = [];
  
  // Validate text inputs
  if (data.name && data.name.length > 100) {
    errors.push('Name exceeds maximum length');
  }
  
  if (data.description && data.description.length > 1000) {
    errors.push('Description exceeds maximum length');
  }
  
  // Validate URLs
  if (data.website && !isValidUrl(data.website)) {
    errors.push('Invalid website URL');
  }
  
  // Validate addresses
  if (data.contractAddress && !isValidAddress(data.contractAddress)) {
    errors.push('Invalid contract address');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

module.exports = router; 