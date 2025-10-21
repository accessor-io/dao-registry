/**
 * Enhanced Marketplace Configuration
 * Centralized configuration for marketplace functionality
 */

const config = {
  // Contract addresses
  contracts: {
    enhancedMarketplace: process.env.ENHANCED_MARKETPLACE_CONTRACT_ADDRESS,
    ensNFT: process.env.ENS_NFT_ADDRESS || '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    ensPublicResolver: process.env.ENS_PUBLIC_RESOLVER_ADDRESS || '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
    ensRegistry: process.env.ENS_REGISTRY_ADDRESS || '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
  },

  // Network configuration
  network: {
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    chainId: parseInt(process.env.CHAIN_ID) || 1337,
    gasLimit: parseInt(process.env.GAS_LIMIT) || 8000000,
    gasPrice: process.env.GAS_PRICE || 'auto'
  },

  // Marketplace settings
  marketplace: {
    platformFeePercentage: 100, // 1% in basis points
    offerFeePercentage: 100, // 1% in basis points
    feeDenominator: 10000,
    minimumListingDuration: 86400, // 1 day in seconds
    maximumListingDuration: 31536000, // 365 days in seconds
    minimumAuctionDuration: 3600, // 1 hour in seconds
    maximumAuctionDuration: 604800 // 7 days in seconds
  },

  // Signer configuration for offchain operations
  signer: {
    address: process.env.MARKETPLACE_SIGNER_ADDRESS,
    privateKey: process.env.MARKETPLACE_SIGNER_PRIVATE_KEY
  },

  // Supported tokens and contracts
  supportedTokens: {
    paymentTokens: [
      {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        isNative: true
      }
    ],
    tokenContracts: [
      {
        address: process.env.ENS_REGISTRY_ADDRESS || '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
        name: 'ENS Registry',
        type: 'ENS',
        standard: 'ERC1155'
      }
    ]
  },

  // API configuration
  api: {
    defaultLimit: 50,
    maxLimit: 1000,
    defaultOffset: 0,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000 // limit each IP to 1000 requests per windowMs
    }
  },

  // Database configuration
  database: {
    tables: {
      listings: 'marketplace_listings',
      auctions: 'marketplace_auctions',
      offers: 'marketplace_offers',
      bids: 'marketplace_bids',
      offchainTransactions: 'offchain_marketplace_transactions',
      stats: 'marketplace_stats',
      config: 'marketplace_config'
    }
  },

  // Event configuration
  events: {
    // Event names from the contract
    listingCreated: 'ListingCreated',
    listingUpdated: 'ListingUpdated',
    listingCancelled: 'ListingCancelled',
    itemSold: 'ItemSold',
    newOffchainSold: 'NewOffchainSold',
    offerMade: 'OfferMade',
    offerAccepted: 'OfferAccepted',
    offerCancelled: 'OfferCancelled',
    auctionCreated: 'AuctionCreated',
    bidPlaced: 'BidPlaced',
    auctionEnded: 'AuctionEnded',
    paymentTokenUpdated: 'PaymentTokenUpdated',
    tokenContractUpdated: 'TokenContractUpdated',
    platformFeeUpdated: 'PlatformFeeUpdated',
    signerUpdated: 'SignerUpdated'
  },

  // Validation rules
  validation: {
    address: /^0x[a-fA-F0-9]{40}$/,
    tokenId: /^[0-9]+$/,
    price: {
      min: '0.000000000000000001', // 1 wei
      max: '1000000000000000000000000' // 1M ETH in wei
    },
    duration: {
      min: 3600, // 1 hour
      max: 31536000 // 365 days
    },
    listingName: {
      minLength: 1,
      maxLength: 255
    },
    metadata: {
      maxLength: 10000
    }
  },

  // Error messages
  errors: {
    contractNotDeployed: 'Marketplace contract not deployed',
    invalidAddress: 'Invalid Ethereum address',
    invalidTokenId: 'Invalid token ID',
    invalidPrice: 'Invalid price value',
    invalidDuration: 'Invalid duration value',
    insufficientBalance: 'Insufficient balance',
    listingNotFound: 'Listing not found',
    auctionNotFound: 'Auction not found',
    offerNotFound: 'Offer not found',
    listingExpired: 'Listing has expired',
    auctionEnded: 'Auction has ended',
    offerExpired: 'Offer has expired',
    notOwner: 'Not the owner of this item',
    alreadySold: 'Item has already been sold',
    alreadyCancelled: 'Item has already been cancelled',
    invalidSignature: 'Invalid signature',
    signerNotConfigured: 'Marketplace signer not configured'
  },

  // Success messages
  success: {
    listingCreated: 'Listing created successfully',
    listingUpdated: 'Listing updated successfully',
    listingCancelled: 'Listing cancelled successfully',
    itemSold: 'Item sold successfully',
    offerMade: 'Offer made successfully',
    offerAccepted: 'Offer accepted successfully',
    offerRejected: 'Offer rejected successfully',
    auctionCreated: 'Auction created successfully',
    bidPlaced: 'Bid placed successfully',
    auctionEnded: 'Auction ended successfully',
    offchainBuyCompleted: 'Offchain buy completed successfully'
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableContractLogs: process.env.ENABLE_CONTRACT_LOGS === 'true',
    enableApiLogs: process.env.ENABLE_API_LOGS !== 'false'
  },

  // Feature flags
  features: {
    enableOffchainBuying: process.env.ENABLE_OFFCHAIN_BUYING !== 'false',
    enableBulkOperations: process.env.ENABLE_BULK_OPERATIONS !== 'false',
    enableOffers: process.env.ENABLE_OFFERS !== 'false',
    enableAuctions: process.env.ENABLE_AUCTIONS !== 'false',
    enableSignatureVerification: process.env.ENABLE_SIGNATURE_VERIFICATION !== 'false',
    enableAdvancedFiltering: process.env.ENABLE_ADVANCED_FILTERING !== 'false'
  },

  // Cache configuration
  cache: {
    enabled: process.env.ENABLE_CACHE !== 'false',
    ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000
  },

  // Monitoring configuration
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    metricsPort: parseInt(process.env.METRICS_PORT) || 9090,
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000 // 30 seconds
  }
};

// Validation function
function validateConfig() {
  const errors = [];

  if (!config.contracts.enhancedMarketplace) {
    errors.push('ENHANCED_MARKETPLACE_CONTRACT_ADDRESS is required');
  }

  if (!config.signer.address) {
    errors.push('MARKETPLACE_SIGNER_ADDRESS is required');
  }

  if (!config.signer.privateKey) {
    errors.push('MARKETPLACE_SIGNER_PRIVATE_KEY is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }

  return true;
}

// Get configuration for specific environment
function getConfig(environment = 'development') {
  const envConfig = {
    development: {
      ...config,
      network: {
        ...config.network,
        rpcUrl: 'http://localhost:8545',
        chainId: 1337
      },
      logging: {
        ...config.logging,
        level: 'debug'
      }
    },
    test: {
      ...config,
      network: {
        ...config.network,
        rpcUrl: 'http://localhost:8545',
        chainId: 1337
      },
      logging: {
        ...config.logging,
        level: 'error'
      }
    },
    production: {
      ...config,
      logging: {
        ...config.logging,
        level: 'info'
      }
    }
  };

  return envConfig[environment] || config;
}

module.exports = {
  config,
  validateConfig,
  getConfig
};


