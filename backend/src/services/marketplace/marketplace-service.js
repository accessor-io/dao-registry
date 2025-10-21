/**
 * ENS Marketplace Service
 * Handles marketplace operations including listings, auctions, and trading
 */

const ethers = require('ethers');
const { logger } = require('../../utils/logger');

class MarketplaceService {
  constructor() {
    this.provider = null;
    this.marketplaceContract = null;
    this.initialized = false;
  }

  /**
   * Initialize the marketplace service
   */
  async initialize() {
    try {
      // Initialize provider
      try {
        this.provider = new ethers.providers.JsonRpcProvider(
          process.env.RPC_URL || 'http://localhost:8545'
        );
      } catch (providerError) {
        logger.warn('Failed to initialize provider, using mock mode:', providerError.message);
        this.provider = null;
      }

      // Initialize marketplace contract
      const marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;
      if (marketplaceAddress && this.provider) {
        try {
          const marketplaceABI = require('../../../contracts/artifacts/Marketplace.sol/Marketplace.json');
          this.marketplaceContract = new ethers.Contract(
            marketplaceAddress,
            marketplaceABI.abi,
            this.provider
          );
          logger.info('Marketplace contract connected:', marketplaceAddress);
        } catch (contractError) {
          logger.warn('Marketplace contract not found, using mock mode:', contractError.message);
          this.marketplaceContract = null;
        }
      } else {
        if (!marketplaceAddress) {
          logger.warn('MARKETPLACE_CONTRACT_ADDRESS not set, using mock mode');
        }
        if (!this.provider) {
          logger.warn('Provider not available, using mock mode');
        }
        this.marketplaceContract = null;
      }

      this.initialized = true;
      logger.info('Marketplace service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize marketplace service:', error);
      // Don't throw error, just log it and continue in mock mode
      this.initialized = true;
      this.marketplaceContract = null;
    }
  }

  /**
   * Create a new listing
   */
  async createListing(listingData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const {
        tokenContract,
        tokenId,
        price,
        paymentToken = ethers.constants.AddressZero, // ETH by default
        duration,
        metadata = '',
        sellerWallet
      } = listingData;

      // Validate inputs
      if (!tokenContract || !tokenId || !price || !duration || !sellerWallet) {
        throw new Error('Missing required listing parameters');
      }

      // Create listing transaction
      const tx = await this.marketplaceContract
        .connect(sellerWallet)
        .createListing(
          tokenContract,
          tokenId,
          ethers.parseEther(price.toString()),
          paymentToken,
          duration,
          metadata
        );

      const receipt = await tx.wait();
      logger.info('Listing created successfully', { txHash: receipt.transactionHash });

      return {
        success: true,
        txHash: receipt.transactionHash,
        listingId: this.extractListingIdFromEvent(receipt)
      };
    } catch (error) {
      logger.error('Failed to create listing:', error);
      throw error;
    }
  }

  /**
   * Update an existing listing
   */
  async updateListing(listingId, updateData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const { newPrice, newDuration, sellerWallet } = updateData;

      if (!newPrice || !newDuration || !sellerWallet) {
        throw new Error('Missing required update parameters');
      }

      const tx = await this.marketplaceContract
        .connect(sellerWallet)
        .updateListing(
          listingId,
          ethers.parseEther(newPrice.toString()),
          newDuration
        );

      const receipt = await tx.wait();
      logger.info('Listing updated successfully', { txHash: receipt.transactionHash });

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Failed to update listing:', error);
      throw error;
    }
  }

  /**
   * Cancel a listing
   */
  async cancelListing(listingId, sellerWallet) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const tx = await this.marketplaceContract
        .connect(sellerWallet)
        .cancelListing(listingId);

      const receipt = await tx.wait();
      logger.info('Listing cancelled successfully', { txHash: receipt.transactionHash });

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Failed to cancel listing:', error);
      throw error;
    }
  }

  /**
   * Buy an item from a listing
   */
  async buyItem(listingId, buyerWallet, paymentAmount) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const tx = await this.marketplaceContract
        .connect(buyerWallet)
        .buyItem(listingId, {
          value: ethers.parseEther(paymentAmount.toString())
        });

      const receipt = await tx.wait();
      logger.info('Item purchased successfully', { txHash: receipt.transactionHash });

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Failed to buy item:', error);
      throw error;
    }
  }

  /**
   * Create a new auction
   */
  async createAuction(auctionData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const {
        tokenContract,
        tokenId,
        startingPrice,
        reservePrice,
        paymentToken = ethers.constants.AddressZero,
        duration,
        metadata = '',
        sellerWallet
      } = auctionData;

      if (!tokenContract || !tokenId || !startingPrice || !reservePrice || !duration || !sellerWallet) {
        throw new Error('Missing required auction parameters');
      }

      const tx = await this.marketplaceContract
        .connect(sellerWallet)
        .createAuction(
          tokenContract,
          tokenId,
          ethers.parseEther(startingPrice.toString()),
          ethers.parseEther(reservePrice.toString()),
          paymentToken,
          duration,
          metadata
        );

      const receipt = await tx.wait();
      logger.info('Auction created successfully', { txHash: receipt.transactionHash });

      return {
        success: true,
        txHash: receipt.transactionHash,
        auctionId: this.extractAuctionIdFromEvent(receipt)
      };
    } catch (error) {
      logger.error('Failed to create auction:', error);
      throw error;
    }
  }

  /**
   * Place a bid on an auction
   */
  async placeBid(auctionId, bidAmount, bidderWallet) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const tx = await this.marketplaceContract
        .connect(bidderWallet)
        .placeBid(auctionId, {
          value: ethers.parseEther(bidAmount.toString())
        });

      const receipt = await tx.wait();
      logger.info('Bid placed successfully', { txHash: receipt.transactionHash });

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Failed to place bid:', error);
      throw error;
    }
  }

  /**
   * End an auction
   */
  async endAuction(auctionId, callerWallet) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const tx = await this.marketplaceContract
        .connect(callerWallet)
        .endAuction(auctionId);

      const receipt = await tx.wait();
      logger.info('Auction ended successfully', { txHash: receipt.transactionHash });

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Failed to end auction:', error);
      throw error;
    }
  }

  /**
   * Get listing details
   */
  async getListing(listingId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const listing = await this.marketplaceContract.getListing(listingId);
      
      return {
        id: listingId,
        seller: listing.seller,
        tokenContract: listing.tokenContract,
        tokenId: listing.tokenId.toString(),
        price: ethers.formatEther(listing.price),
        paymentToken: listing.paymentToken,
        isActive: listing.isActive,
        createdAt: new Date(listing.createdAt.toNumber() * 1000),
        expiresAt: new Date(listing.expiresAt.toNumber() * 1000),
        metadata: listing.metadata
      };
    } catch (error) {
      logger.error('Failed to get listing:', error);
      throw error;
    }
  }

  /**
   * Get auction details
   */
  async getAuction(auctionId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const auction = await this.marketplaceContract.getAuction(auctionId);
      
      return {
        id: auctionId,
        seller: auction.seller,
        tokenContract: auction.tokenContract,
        tokenId: auction.tokenId.toString(),
        startingPrice: ethers.formatEther(auction.startingPrice),
        reservePrice: ethers.formatEther(auction.reservePrice),
        paymentToken: auction.paymentToken,
        startTime: new Date(auction.startTime.toNumber() * 1000),
        endTime: new Date(auction.endTime.toNumber() * 1000),
        isActive: auction.isActive,
        highestBidder: auction.highestBidder,
        highestBid: ethers.formatEther(auction.highestBid),
        metadata: auction.metadata
      };
    } catch (error) {
      logger.error('Failed to get auction:', error);
      throw error;
    }
  }

  /**
   * Get all active listings
   */
  async getActiveListings(limit = 50, offset = 0) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // If contract is not available, return mock data
      if (!this.marketplaceContract) {
        return {
          listings: [],
          total: 0,
          limit,
          offset
        };
      }

      const totalListings = await this.marketplaceContract.getTotalListings();
      const listings = [];

      const startId = Math.max(1, totalListings.toNumber() - offset - limit + 1);
      const endId = totalListings.toNumber() - offset;

      for (let i = startId; i <= endId; i++) {
        try {
          const listing = await this.getListing(i);
          if (listing.isActive && listing.expiresAt > new Date()) {
            listings.push(listing);
          }
        } catch (error) {
          // Skip invalid listings
          continue;
        }
      }

      return {
        listings,
        total: totalListings.toNumber(),
        limit,
        offset
      };
    } catch (error) {
      logger.error('Failed to get active listings:', error);
      // Return empty result on error
      return {
        listings: [],
        total: 0,
        limit,
        offset
      };
    }
  }

  /**
   * Get all active auctions
   */
  async getActiveAuctions(limit = 50, offset = 0) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // If contract is not available, return mock data
      if (!this.marketplaceContract) {
        return {
          auctions: [],
          total: 0,
          limit,
          offset
        };
      }

      const totalAuctions = await this.marketplaceContract.getTotalAuctions();
      const auctions = [];

      const startId = Math.max(1, totalAuctions.toNumber() - offset - limit + 1);
      const endId = totalAuctions.toNumber() - offset;

      for (let i = startId; i <= endId; i++) {
        try {
          const auction = await this.getAuction(i);
          if (auction.isActive && auction.endTime > new Date()) {
            auctions.push(auction);
          }
        } catch (error) {
          // Skip invalid auctions
          continue;
        }
      }

      return {
        auctions,
        total: totalAuctions.toNumber(),
        limit,
        offset
      };
    } catch (error) {
      logger.error('Failed to get active auctions:', error);
      // Return empty result on error
      return {
        auctions: [],
        total: 0,
        limit,
        offset
      };
    }
  }

  /**
   * Get marketplace statistics
   */
  async getMarketplaceStats() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // If contract is not available, return mock data
      if (!this.marketplaceContract) {
        return {
          totalListings: 0,
          totalAuctions: 0,
          platformFeePercentage: 2.5,
          feeRecipient: '0x0000000000000000000000000000000000000000',
          averageSalePrice: '0.0',
          totalVolume: '0.0'
        };
      }

      const totalListings = await this.marketplaceContract.getTotalListings();
      const totalAuctions = await this.marketplaceContract.getTotalAuctions();
      const platformFeePercentage = await this.marketplaceContract.platformFeePercentage();

      return {
        totalListings: totalListings.toNumber(),
        totalAuctions: totalAuctions.toNumber(),
        platformFeePercentage: platformFeePercentage.toNumber() / 100, // Convert from basis points
        feeRecipient: await this.marketplaceContract.feeRecipient(),
        averageSalePrice: '0.0',
        totalVolume: '0.0'
      };
    } catch (error) {
      logger.error('Failed to get marketplace stats:', error);
      // Return mock data on error
      return {
        totalListings: 0,
        totalAuctions: 0,
        platformFeePercentage: 2.5,
        feeRecipient: '0x0000000000000000000000000000000000000000',
        averageSalePrice: '0.0',
        totalVolume: '0.0'
      };
    }
  }

  /**
   * Extract listing ID from transaction receipt
   */
  extractListingIdFromEvent(receipt) {
    const event = receipt.events?.find(e => e.event === 'ListingCreated');
    return event ? event.args.listingId.toNumber() : null;
  }

  /**
   * Extract auction ID from transaction receipt
   */
  extractAuctionIdFromEvent(receipt) {
    const event = receipt.events?.find(e => e.event === 'AuctionCreated');
    return event ? event.args.auctionId.toNumber() : null;
  }

  /**
   * Get supported payment tokens
   */
  async getSupportedPaymentTokens() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // This would require additional contract methods to track supported tokens
      // For now, return common tokens
      return [
        {
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18
        }
      ];
    } catch (error) {
      logger.error('Failed to get supported payment tokens:', error);
      // Return default tokens on error
      return [
        {
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18
        }
      ];
    }
  }

  /**
   * Get supported token contracts
   */
  async getSupportedTokenContracts() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // This would require additional contract methods to track supported contracts
      // For now, return common NFT contracts
      return [
        {
          address: process.env.ENS_REGISTRY_ADDRESS || '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
          name: 'ENS Registry',
          type: 'ENS'
        }
      ];
    } catch (error) {
      logger.error('Failed to get supported token contracts:', error);
      throw error;
    }
  }
}

module.exports = new MarketplaceService();
