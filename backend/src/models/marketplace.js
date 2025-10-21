/**
 * Marketplace Database Models
 * Defines database schemas for marketplace listings, auctions, and offers
 */

const { DataTypes } = require('sequelize');

/**
 * Marketplace Listing Model
 */
const MarketplaceListing = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  listingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'listing_id'
  },
  seller: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  tokenContract: {
    type: DataTypes.STRING(42),
    allowNull: false,
    field: 'token_contract',
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  tokenId: {
    type: DataTypes.STRING(78),
    allowNull: false,
    field: 'token_id'
  },
  price: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: false
  },
  paymentToken: {
    type: DataTypes.STRING(42),
    allowNull: false,
    field: 'payment_token',
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  listingName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'listing_name'
  },
  cancelled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  selectedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'selected_at'
  },
  buyer: {
    type: DataTypes.STRING(42),
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  txHash: {
    type: DataTypes.STRING(66),
    allowNull: true,
    field: 'tx_hash',
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  },
  blockNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'block_number'
  }
};

/**
 * Marketplace Auction Model
 */
const MarketplaceAuction = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  auctionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'auction_id'
  },
  seller: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  tokenContract: {
    type: DataTypes.STRING(42),
    allowNull: false,
    field: 'token_contract',
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  tokenId: {
    type: DataTypes.STRING(78),
    allowNull: false,
    field: 'token_id'
  },
  startingPrice: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: false,
    field: 'starting_price'
  },
  reservePrice: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: false,
    field: 'reserve_price'
  },
  paymentToken: {
    type: DataTypes.STRING(42),
    allowNull: false,
    field: 'payment_token',
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_time'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  highestBidder: {
    type: DataTypes.STRING(42),
    allowNull: true,
    field: 'highest_bidder',
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  highestBid: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: false,
    defaultValue: 0,
    field: 'highest_bid'
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  auctionName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'auction_name'
  },
  cancelled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  selectedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'selected_at'
  },
  txHash: {
    type: DataTypes.STRING(66),
    allowNull: true,
    field: 'tx_hash',
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  },
  blockNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'block_number'
  }
};

/**
 * Marketplace Offer Model
 */
const MarketplaceOffer = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  offerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'offer_id'
  },
  domainOwner: {
    type: DataTypes.STRING(42),
    allowNull: false,
    field: 'domain_owner',
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  offerMaker: {
    type: DataTypes.STRING(42),
    allowNull: false,
    field: 'offer_maker',
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  tokenId: {
    type: DataTypes.STRING(78),
    allowNull: false,
    field: 'token_id'
  },
  offeredAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'offered_at'
  },
  offerUntil: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'offer_until'
  },
  selectedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'selected_at'
  },
  price: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: false
  },
  cancelled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  cancelReason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'cancel_reason'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'cancelled_at'
  },
  offerName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'offer_name'
  },
  txHash: {
    type: DataTypes.STRING(66),
    allowNull: true,
    field: 'tx_hash',
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  },
  blockNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'block_number'
  }
};

/**
 * Marketplace Bid Model (for auction bids)
 */
const MarketplaceBid = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  auctionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'auction_id'
  },
  bidder: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  amount: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  txHash: {
    type: DataTypes.STRING(66),
    allowNull: true,
    field: 'tx_hash',
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  },
  blockNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'block_number'
  }
};

/**
 * Offchain Marketplace Transaction Model
 */
const OffchainMarketplaceTransaction = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tokenId: {
    type: DataTypes.STRING(78),
    allowNull: false,
    field: 'token_id'
  },
  seller: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  buyer: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  amount: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: false
  },
  soldAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'sold_at'
  },
  signature: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  txHash: {
    type: DataTypes.STRING(66),
    allowNull: true,
    field: 'tx_hash',
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  },
  blockNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'block_number'
  }
};

/**
 * Marketplace Statistics Model
 */
const MarketplaceStats = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  totalListings: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_listings'
  },
  totalAuctions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_auctions'
  },
  totalOffers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_offers'
  },
  totalSales: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_sales'
  },
  totalVolume: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: false,
    defaultValue: 0,
    field: 'total_volume'
  },
  averageSalePrice: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: false,
    defaultValue: 0,
    field: 'average_sale_price'
  },
  platformFees: {
    type: DataTypes.DECIMAL(36, 18),
    allowNull: false,
    defaultValue: 0,
    field: 'platform_fees'
  }
};

/**
 * Marketplace Configuration Model
 */
const MarketplaceConfig = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at'
  }
};

module.exports = {
  MarketplaceListing,
  MarketplaceAuction,
  MarketplaceOffer,
  MarketplaceBid,
  OffchainMarketplaceTransaction,
  MarketplaceStats,
  MarketplaceConfig
};


