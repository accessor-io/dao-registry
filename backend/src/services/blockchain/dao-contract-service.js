const { ethers } = require('ethers');
const { logger } = require('../../utils/logger');

// DAO Registry ABI - Core functions for reading DAO data
const DAO_REGISTRY_ABI = [
  "function getTotalDAOs() view returns (uint256)",
  "function getDAO(uint256 daoId) view returns (tuple(string name, string symbol, string description, string logo, string website, address contractAddress, address tokenAddress, address treasuryAddress, address governanceAddress, uint256 chainId, uint256 createdAt, uint256 updatedAt, bool verified, bool active, uint8 status, uint8 governanceType, uint256 votingPeriod, uint256 quorum, uint256 proposalThreshold, string[] tags, tuple(string twitter, string discord, string telegram, string github, string medium, string reddit) socialLinks))",
  "function getDAOByAddress(address contractAddress) view returns (uint256)",
  "function getAnalytics(uint256 daoId) view returns (tuple(uint256 totalProposals, uint256 activeProposals, uint256 totalMembers, uint256 activeMembers, uint256 treasuryValue, uint256 totalVotingPower, uint256 averageParticipation, uint256 lastProposalTime))",
  "function owner() view returns (address)",
  "function registrationFee() view returns (uint256)",
  "function paused() view returns (bool)"
];

// ERC20 ABI for token information
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)"
];

// Governance ABI for governance information
const GOVERNANCE_ABI = [
  "function proposalCount() view returns (uint256)",
  "function proposals(uint256 proposalId) view returns (tuple(uint256 id, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, bool canceled, bool executed))",
  "function quorumVotes() view returns (uint256)",
  "function proposalThreshold() view returns (uint256)",
  "function votingDelay() view returns (uint256)",
  "function votingPeriod() view returns (uint256)"
];

class DAOContractService {
  constructor() {
    this.providers = new Map();
    this.contracts = new Map();
    this.deploymentAddresses = new Map();
    
    this.initializeProviders();
    this.loadDeploymentAddresses();
  }

  /**
   * Initialize providers for different networks
   */
  initializeProviders() {
    const networks = {
      1: process.env.MAINNET_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
      11155111: process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo',
      137: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      80001: process.env.POLYGON_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
      42161: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
      10: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
      8453: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      1337: 'http://127.0.0.1:8545', // Local hardhat
      31337: 'http://127.0.0.1:8545' // Local hardhat
    };

    for (const [chainId, url] of Object.entries(networks)) {
      try {
        this.providers.set(parseInt(chainId), new ethers.JsonRpcProvider(url));
        logger.info(`Provider initialized for chain ${chainId}`);
      } catch (error) {
        logger.warn(`Failed to initialize provider for chain ${chainId}:`, error.message);
      }
    }
  }

  /**
   * Load deployment addresses from deployment files
   */
  loadDeploymentAddresses() {
    const fs = require('fs');
    const path = require('path');
    const deploymentsDir = path.join(__dirname, '../../../deployments');

    if (fs.existsSync(deploymentsDir)) {
      const files = fs.readdirSync(deploymentsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const deploymentData = JSON.parse(
              fs.readFileSync(path.join(deploymentsDir, file), 'utf8')
            );
            const chainId = parseInt(deploymentData.chainId);
            this.deploymentAddresses.set(chainId, deploymentData.contracts);
            logger.info(`Loaded deployment addresses for chain ${chainId}`);
          } catch (error) {
            logger.warn(`Failed to load deployment file ${file}:`, error.message);
          }
        }
      }
    }
  }

  /**
   * Get provider for a specific chain
   */
  getProvider(chainId) {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`No provider available for chain ${chainId}`);
    }
    return provider;
  }

  /**
   * Get DAO Registry contract for a specific chain
   */
  getDAORegistryContract(chainId) {
    const cacheKey = `daoRegistry_${chainId}`;
    
    if (this.contracts.has(cacheKey)) {
      return this.contracts.get(cacheKey);
    }

    const provider = this.getProvider(chainId);
    const deployment = this.deploymentAddresses.get(chainId);
    
    if (!deployment || !deployment.daoRegistry) {
      throw new Error(`No DAO Registry deployed on chain ${chainId}`);
    }

    const contract = new ethers.Contract(
      deployment.daoRegistry,
      DAO_REGISTRY_ABI,
      provider
    );

    this.contracts.set(cacheKey, contract);
    return contract;
  }

  /**
   * Get ERC20 token contract
   */
  getTokenContract(tokenAddress, chainId) {
    const cacheKey = `token_${chainId}_${tokenAddress}`;
    
    if (this.contracts.has(cacheKey)) {
      return this.contracts.get(cacheKey);
    }

    const provider = this.getProvider(chainId);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    this.contracts.set(cacheKey, contract);
    return contract;
  }

  /**
   * Get governance contract
   */
  getGovernanceContract(governanceAddress, chainId) {
    const cacheKey = `governance_${chainId}_${governanceAddress}`;
    
    if (this.contracts.has(cacheKey)) {
      return this.contracts.get(cacheKey);
    }

    const provider = this.getProvider(chainId);
    const contract = new ethers.Contract(governanceAddress, GOVERNANCE_ABI, provider);
    
    this.contracts.set(cacheKey, contract);
    return contract;
  }

  /**
   * Get all DAOs from blockchain with filtering and pagination
   */
  async getAllDAOs(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const offset = (page - 1) * limit;

      let daoIds = [];
      let total = 0;

      // Get DAOs based on filters
      if (filters.chainId) {
        // Get DAOs from specific chain - iterate through all DAOs and filter by chain
        const contract = this.getDAORegistryContract(filters.chainId);
        const totalDAOs = await contract.getTotalDAOs();
        daoIds = [];
        for (let i = 1; i <= totalDAOs; i++) {
          try {
            const dao = await contract.getDAO(i);
            if (dao.chainId === filters.chainId) {
              daoIds.push({ id: i.toString(), chainId: filters.chainId });
            }
          } catch (error) {
            // Skip non-existent DAOs
            continue;
          }
        }
        total = daoIds.length;
      } else {
        // Get all DAOs from all supported chains
        daoIds = [];
        for (const [chainId, deployment] of this.deploymentAddresses) {
          try {
            const contract = this.getDAORegistryContract(chainId);
            const totalDAOs = await contract.getTotalDAOs();
            
            for (let i = 1; i <= totalDAOs; i++) {
              try {
                const dao = await contract.getDAO(i);
                if (dao.chainId === chainId) {
                  daoIds.push({ id: i.toString(), chainId });
                }
              } catch (error) {
                // Skip non-existent DAOs
                continue;
              }
            }
          } catch (error) {
            logger.warn(`Failed to get DAOs from chain ${chainId}:`, error.message);
          }
        }
        total = daoIds.length;
      }

      // Apply additional filters
      if (filters.tags && filters.tags.length > 0) {
        const filteredIds = [];
        for (const daoRef of daoIds) {
          const daoId = typeof daoRef === 'object' ? daoRef.id : daoRef.toString();
          const chainId = typeof daoRef === 'object' ? daoRef.chainId : 1;
          
          try {
            const contract = this.getDAORegistryContract(chainId);
            const dao = await contract.getDAO(daoId);
            if (dao.tags.some(tag => filters.tags.includes(tag))) {
              filteredIds.push(daoRef);
            }
          } catch (error) {
            logger.warn(`Failed to get DAO ${daoId} from chain ${chainId}:`, error.message);
          }
        }
        daoIds = filteredIds;
        total = daoIds.length;
      }

      // Get detailed DAO data
      const daos = [];
      for (const daoRef of daoIds.slice(offset, offset + limit)) {
        try {
          const daoId = typeof daoRef === 'object' ? daoRef.id : daoRef.toString();
          const chainId = typeof daoRef === 'object' ? daoRef.chainId : 1;
          
          const dao = await this.getDAOById(daoId, chainId);
          if (dao) {
            daos.push(dao);
          }
        } catch (error) {
          logger.warn(`Failed to get detailed DAO data:`, error.message);
        }
      }

      // Sort results
      daos.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        daos,
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev
      };

    } catch (error) {
      logger.error('Error getting all DAOs from blockchain:', error);
      throw error;
    }
  }

  /**
   * Get DAO by ID from blockchain
   */
  async getDAOById(daoId, chainId = 1) {
    try {
      const contract = this.getDAORegistryContract(chainId);
      const daoData = await contract.getDAO(daoId);

      // Transform blockchain data to API format
      const dao = {
        id: daoId,
        name: daoData.name,
        symbol: daoData.symbol,
        description: daoData.description,
        logo: daoData.logo,
        website: daoData.website,
        contractAddress: daoData.contractAddress,
        tokenAddress: daoData.tokenAddress,
        treasuryAddress: daoData.treasuryAddress,
        governanceAddress: daoData.governanceAddress,
        chainId: daoData.chainId,
        governanceType: this.getGovernanceTypeString(daoData.governanceType),
        votingPeriod: daoData.votingPeriod,
        quorum: daoData.quorum,
        proposalThreshold: daoData.proposalThreshold,
        status: this.getStatusString(daoData.status),
        verified: daoData.verified,
        active: daoData.active,
        tags: daoData.tags,
        socialLinks: {
          twitter: daoData.socialLinks.twitter,
          discord: daoData.socialLinks.discord,
          telegram: daoData.socialLinks.telegram,
          github: daoData.socialLinks.github,
          medium: daoData.socialLinks.medium,
          reddit: daoData.socialLinks.reddit
        },
        createdAt: new Date(daoData.createdAt * 1000),
        updatedAt: new Date(daoData.updatedAt * 1000)
      };

      // Get additional on-chain data
      try {
        const analytics = await contract.getDAOAnalytics(daoId);
        dao.analytics = {
          totalProposals: analytics.totalProposals,
          activeProposals: analytics.activeProposals,
          totalMembers: analytics.totalMembers,
          activeMembers: analytics.activeMembers,
          treasuryValue: analytics.treasuryValue,
          totalVotingPower: analytics.totalVotingPower,
          averageParticipation: analytics.averageParticipation,
          lastProposalTime: analytics.lastProposalTime > 0 ? new Date(analytics.lastProposalTime * 1000) : null
        };
      } catch (error) {
        logger.warn(`Failed to get analytics for DAO ${daoId}:`, error.message);
      }

      // Get token information
      try {
        const tokenContract = this.getTokenContract(daoData.tokenAddress, chainId);
        const [tokenName, tokenSymbol, tokenDecimals, totalSupply] = await Promise.all([
          tokenContract.name(),
          tokenContract.symbol(),
          tokenContract.decimals(),
          tokenContract.totalSupply()
        ]);

        dao.tokenInfo = {
          name: tokenName,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          totalSupply: totalSupply.toString()
        };
      } catch (error) {
        logger.warn(`Failed to get token info for DAO ${daoId}:`, error.message);
      }

      return dao;

    } catch (error) {
      logger.error(`Error getting DAO ${daoId} from blockchain:`, error);
      return null;
    }
  }

  /**
   * Get DAO by contract address
   */
  async getDAOByAddress(contractAddress, chainId) {
    try {
      const contract = this.getDAORegistryContract(chainId);
      const daoId = await contract.getDAOByAddress(contractAddress);
      
      if (daoId > 0) {
        return await this.getDAOById(daoId.toString(), chainId);
      }
      
      return null;
    } catch (error) {
      logger.error(`Error getting DAO by address ${contractAddress}:`, error);
      return null;
    }
  }

  /**
   * Get registry statistics from blockchain
   */
  async getRegistryStats() {
    try {
      const stats = {
        totalDAOs: 0,
        activeDAOs: 0,
        verifiedDAOs: 0,
        pendingDAOs: 0,
        chainStats: {},
        governanceTypeStats: {}
      };

      for (const [chainId, deployment] of this.deploymentAddresses) {
        try {
          const contract = this.getDAORegistryContract(chainId);
          const totalDAOs = await contract.getTotalDAOs();
          stats.totalDAOs += parseInt(totalDAOs);

          // Get DAOs from this chain
          const chainDAOs = await contract.getDAOsByChain(chainId, 0, 1000);
          
          for (const daoId of chainDAOs) {
            try {
              const dao = await contract.getDAO(daoId);
              
              // Count by status
              if (dao.active) stats.activeDAOs++;
              if (dao.verified) stats.verifiedDAOs++;
              if (dao.status === 0) stats.pendingDAOs++; // Assuming 0 = Pending
              
              // Count by chain
              stats.chainStats[chainId] = (stats.chainStats[chainId] || 0) + 1;
              
              // Count by governance type
              const governanceType = this.getGovernanceTypeString(dao.governanceType);
              stats.governanceTypeStats[governanceType] = (stats.governanceTypeStats[governanceType] || 0) + 1;
              
            } catch (error) {
              logger.warn(`Failed to get DAO ${daoId} stats:`, error.message);
            }
          }
          
        } catch (error) {
          logger.warn(`Failed to get stats from chain ${chainId}:`, error.message);
        }
      }

      return stats;

    } catch (error) {
      logger.error('Error getting registry stats from blockchain:', error);
      throw error;
    }
  }

  /**
   * Helper: Convert governance type enum to string
   */
  getGovernanceTypeString(type) {
    const types = ['TokenWeighted', 'NFTWeighted', 'ReputationBased', 'Quadratic', 'Custom'];
    return types[type] || 'Unknown';
  }

  /**
   * Helper: Convert status enum to string
   */
  getStatusString(status) {
    const statuses = ['Pending', 'Active', 'Suspended', 'Inactive', 'Banned'];
    return statuses[status] || 'Unknown';
  }

  /**
   * Get supported networks
   */
  getSupportedNetworks() {
    return Array.from(this.deploymentAddresses.keys());
  }

  /**
   * Check if network is supported
   */
  isNetworkSupported(chainId) {
    return this.deploymentAddresses.has(chainId);
  }
}

module.exports = {
  DAOContractService
}; 