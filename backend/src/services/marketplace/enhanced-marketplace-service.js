/**
 * Enhanced ENS Marketplace Service
 * Combines features from both the original marketplace and Enstools marketplace
 * Handles marketplace operations including listings, auctions, offers, and trading
 */

const ethers = require('ethers');
const { logger } = require('../../utils/logger');

class EnhancedMarketplaceService {
  constructor() {
    this.provider = null;
    this.marketplaceContract = null;
    this.initialized = false;
    this.signer = null;
  }

  /**
   * Initialize the enhanced marketplace service
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
      const marketplaceAddress = process.env.ENHANCED_MARKETPLACE_CONTRACT_ADDRESS;
      if (marketplaceAddress && this.provider) {
        try {
          const marketplaceABI = require('../../../contracts/artifacts/EnhancedMarketplace.sol/EnhancedMarketplace.json');
          this.marketplaceContract = new ethers.Contract(
            marketplaceAddress,
            marketplaceABI.abi,
            this.provider
          );
          logger.info('Enhanced marketplace contract connected:', marketplaceAddress);
        } catch (contractError) {
          logger.warn('Enhanced marketplace contract not found, using mock mode:', contractError.message);
          this.marketplaceContract = null;
        }
      } else {
        if (!marketplaceAddress) {
          logger.warn('ENHANCED_MARKETPLACE_CONTRACT_ADDRESS not set, using mock mode');
        }
        if (!this.provider) {
          logger.warn('Provider not available, using mock mode');
        }
        this.marketplaceContract = null;
      }

      // Initialize signer for offchain operations
      if (process.env.MARKETPLACE_SIGNER_PRIVATE_KEY) {
        try {
          this.signer = new ethers.Wallet(process.env.MARKETPLACE_SIGNER_PRIVATE_KEY, this.provider);
          logger.info('Marketplace signer initialized');
        } catch (signerError) {
          logger.warn('Failed to initialize marketplace signer:', signerError.message);
          this.signer = null;
        }
      }

      this.initialized = true;
      logger.info('Enhanced marketplace service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize enhanced marketplace service:', error);
      this.initialized = true;
      this.marketplaceContract = null;
      this.signer = null;
    }
  }

  // ========== LISTING FUNCTIONS ==========

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
        paymentToken = ethers.constants.AddressZero,
        duration,
        metadata = '',
        listingName = '',
        sellerWallet
      } = listingData;

      if (!tokenContract || !tokenId || !price || !duration || !sellerWallet) {
        throw new Error('Missing required listing parameters');
      }

      const tx = await this.marketplaceContract
        .connect(sellerWallet)
        .createListing(
          tokenContract,
          tokenId,
          ethers.parseEther(price.toString()),
          paymentToken,
          duration,
          metadata,
          listingName
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
   * Create multiple listings in a single transaction
   */
  async createBulkListing(bulkListingData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const {
        listingNames,
        tokenIds,
        durations,
        prices,
        tokenContract,
        paymentToken = ethers.constants.AddressZero,
        sellerWallet
      } = bulkListingData;

      if (!listingNames || !tokenIds || !durations || !prices || !tokenContract || !sellerWallet) {
        throw new Error('Missing required bulk listing parameters');
      }

      const parsedPrices = prices.map(price => ethers.parseEther(price.toString()));

      const tx = await this.marketplaceContract
        .connect(sellerWallet)
        .createBulkListing(
          listingNames,
          tokenIds,
          durations,
          parsedPrices,
          tokenContract,
          paymentToken
        );

      const receipt = await tx.wait();
      logger.info('Bulk listing created successfully', { txHash: receipt.transactionHash });

      return {
        success: true,
        txHash: receipt.transactionHash,
        listingIds: this.extractListingIdsFromEvents(receipt)
      };
    } catch (error) {
      logger.error('Failed to create bulk listing:', error);
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

  // ========== OFFCHAIN FUNCTIONS ==========

  /**
   * Generate signature for offchain buy
   */
  async generateOffchainBuySignature(seller, buyer, tokenId, price) {
    try {
      if (!this.signer) {
        throw new Error('Marketplace signer not initialized');
      }

      const message = ethers.solidityPacked(
        ['address', 'address', 'uint256', 'uint256'],
        [seller, buyer, tokenId, price]
      );

      const signature = await this.signer.signMessage(ethers.getBytes(message));
      return signature;
    } catch (error) {
      logger.error('Failed to generate offchain buy signature:', error);
      throw error;
    }
  }

  /**
   * Buy an item offchain with signature
   */
  async offchainBuy(offchainBuyData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const {
        tokenId,
        seller,
        paymentValue,
        signature,
        buyerWallet
      } = offchainBuyData;

      if (!tokenId || !seller || !paymentValue || !signature || !buyerWallet) {
        throw new Error('Missing required offchain buy parameters');
      }

      const tx = await this.marketplaceContract
        .connect(buyerWallet)
        .offchainBuy(
          tokenId,
          seller,
          ethers.parseEther(paymentValue.toString()),
          signature,
          {
            value: ethers.parseEther(paymentValue.toString())
          }
        );

      const receipt = await tx.wait();
      logger.info('Offchain buy completed successfully', { txHash: receipt.transactionHash });

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Failed to complete offchain buy:', error);
      throw error;
    }
  }

  /**
   * Buy multiple items offchain in a single transaction
   */
  async offchainBulkBuy(bulkBuyData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const {
        tokenIds,
        sellers,
        paymentValues,
        signatures,
        buyerWallet
      } = bulkBuyData;

      if (!tokenIds || !sellers || !paymentValues || !signatures || !buyerWallet) {
        throw new Error('Missing required bulk buy parameters');
      }

      const parsedPaymentValues = paymentValues.map(value => ethers.parseEther(value.toString()));
      const totalPayment = parsedPaymentValues.reduce((sum, value) => sum + value, 0n);

      const tx = await this.marketplaceContract
        .connect(buyerWallet)
        .offchainBulkBuy(
          tokenIds,
          sellers,
          parsedPaymentValues,
          signatures,
          {
            value: totalPayment
          }
        );

      const receipt = await tx.wait();
      logger.info('Offchain bulk buy completed successfully', { txHash: receipt.transactionHash });

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Failed to complete offchain bulk buy:', error);
      throw error;
    }
  }

  // ========== OFFER FUNCTIONS ==========

  /**
   * Make an offer for a domain
   */
  async makeOffer(offerData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const {
        domainOwner,
        offerName,
        tokenId,
        offerUntil,
        price,
        offerMakerWallet
      } = offerData;

      if (!domainOwner || !tokenId || !offerUntil || !price || !offerMakerWallet) {
        throw new Error('Missing required offer parameters');
      }

      const tx = await this.marketplaceContract
        .connect(offerMakerWallet)
        .makeOffer(
          domainOwner,
          offerName || '',
          tokenId,
          offerUntil,
          ethers.parseEther(price.toString()),
          {
            value: ethers.parseEther(price.toString())
          }
        );

      const receipt = await tx.wait();
      logger.info('Offer made successfully', { txHash: receipt.transactionHash });

      return {
        success: true,
        txHash: receipt.transactionHash,
        offerId: this.extractOfferIdFromEvent(receipt)
      };
    } catch (error) {
      logger.error('Failed to make offer:', error);
      throw error;
    }
  }

  /**
   * Accept an offer
   */
  async acceptOffer(offerId, cancelOfferIds, domainOwnerWallet) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const tx = await this.marketplaceContract
        .connect(domainOwnerWallet)
        .acceptOffer(offerId, cancelOfferIds || []);

      const receipt = await tx.wait();
      logger.info('Offer accepted successfully', { txHash: receipt.transactionHash });

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Failed to accept offer:', error);
      throw error;
    }
  }

  /**
   * Reject offers
   */
  async rejectOffers(offerIds, domainOwnerWallet) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const tx = await this.marketplaceContract
        .connect(domainOwnerWallet)
        .rejectOffers(offerIds);

      const receipt = await tx.wait();
      logger.info('Offers rejected successfully', { txHash: receipt.transactionHash });

      return {
        success: true,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      logger.error('Failed to reject offers:', error);
      throw error;
    }
  }

  // ========== AUCTION FUNCTIONS ==========

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
        auctionName = '',
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
          metadata,
          auctionName
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

  // ========== VIEW FUNCTIONS ==========

  /**
   * Get listing details
   */
  async getListing(listingId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.marketplaceContract) {
        return null;
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
        metadata: listing.metadata,
        listingName: listing.listingName,
        cancelled: listing.cancelled,
        selectedAt: listing.selectedAt.toNumber() > 0 ? new Date(listing.selectedAt.toNumber() * 1000) : null,
        buyer: listing.buyer
      };
    } catch (error) {
      logger.error('Failed to get listing:', error);
      return null;
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

      if (!this.marketplaceContract) {
        return null;
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
        metadata: auction.metadata,
        auctionName: auction.auctionName,
        cancelled: auction.cancelled,
        selectedAt: auction.selectedAt.toNumber() > 0 ? new Date(auction.selectedAt.toNumber() * 1000) : null
      };
    } catch (error) {
      logger.error('Failed to get auction:', error);
      return null;
    }
  }

  /**
   * Get offer details
   */
  async getOffer(offerId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.marketplaceContract) {
        return null;
      }

      const offer = await this.marketplaceContract.getOffer(offerId);
      
      return {
        id: offerId,
        domainOwner: offer.domainOwner,
        offerMaker: offer.offerMaker,
        tokenId: offer.tokenId.toString(),
        offeredAt: new Date(offer.offeredAt.toNumber() * 1000),
        offerUntil: new Date(offer.offerUntil.toNumber() * 1000),
        selectedAt: offer.selectedAt.toNumber() > 0 ? new Date(offer.selectedAt.toNumber() * 1000) : null,
        price: ethers.formatEther(offer.price),
        cancelled: offer.cancelled,
        cancelReason: offer.cancelReason,
        cancelledAt: offer.cancelledAt.toNumber() > 0 ? new Date(offer.cancelledAt.toNumber() * 1000) : null,
        offerName: offer.offerName
      };
    } catch (error) {
      logger.error('Failed to get offer:', error);
      return null;
    }
  }

  /**
   * Get all active listings with pagination
   */
  async getActiveListings(limit = 50, offset = 0) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

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
          if (listing && listing.isActive && listing.expiresAt > new Date() && !listing.cancelled) {
            listings.push(listing);
          }
        } catch (error) {
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
      return {
        listings: [],
        total: 0,
        limit,
        offset
      };
    }
  }

  /**
   * Get all active auctions with pagination
   */
  async getActiveAuctions(limit = 50, offset = 0) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

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
          if (auction && auction.isActive && auction.endTime > new Date() && !auction.cancelled) {
            auctions.push(auction);
          }
        } catch (error) {
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
      return {
        auctions: [],
        total: 0,
        limit,
        offset
      };
    }
  }

  /**
   * Get all active offers with pagination
   */
  async getActiveOffers(limit = 50, offset = 0) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.marketplaceContract) {
        return {
          offers: [],
          total: 0,
          limit,
          offset
        };
      }

      const totalOffers = await this.marketplaceContract.getTotalOffers();
      const offers = [];

      const startId = Math.max(1, totalOffers.toNumber() - offset - limit + 1);
      const endId = totalOffers.toNumber() - offset;

      for (let i = startId; i <= endId; i++) {
        try {
          const offer = await this.getOffer(i);
          if (offer && offer.offerUntil > new Date() && !offer.cancelled && !offer.selectedAt) {
            offers.push(offer);
          }
        } catch (error) {
          continue;
        }
      }

      return {
        offers,
        total: totalOffers.toNumber(),
        limit,
        offset
      };
    } catch (error) {
      logger.error('Failed to get active offers:', error);
      return {
        offers: [],
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

      if (!this.marketplaceContract) {
        return {
          totalListings: 0,
          totalAuctions: 0,
          totalOffers: 0,
          platformFeePercentage: 1.0,
          offerFeePercentage: 1.0,
          feeRecipient: '0x0000000000000000000000000000000000000000',
          averageSalePrice: '0.0',
          totalVolume: '0.0'
        };
      }

      const totalListings = await this.marketplaceContract.getTotalListings();
      const totalAuctions = await this.marketplaceContract.getTotalAuctions();
      const totalOffers = await this.marketplaceContract.getTotalOffers();
      const platformFeePercentage = await this.marketplaceContract.FEE_PERCENTAGE();
      const offerFeePercentage = await this.marketplaceContract.OFFER_FEE();

      return {
        totalListings: totalListings.toNumber(),
        totalAuctions: totalAuctions.toNumber(),
        totalOffers: totalOffers.toNumber(),
        platformFeePercentage: platformFeePercentage.toNumber() / 100, // Convert from basis points
        offerFeePercentage: offerFeePercentage.toNumber() / 100, // Convert from basis points
        feeRecipient: await this.marketplaceContract.owner(),
        averageSalePrice: '0.0',
        totalVolume: '0.0'
      };
    } catch (error) {
      logger.error('Failed to get marketplace stats:', error);
      return {
        totalListings: 0,
        totalAuctions: 0,
        totalOffers: 0,
        platformFeePercentage: 1.0,
        offerFeePercentage: 1.0,
        feeRecipient: '0x0000000000000000000000000000000000000000',
        averageSalePrice: '0.0',
        totalVolume: '0.0'
      };
    }
  }

  // ========== UTILITY FUNCTIONS ==========

  /**
   * Extract listing ID from transaction receipt
   */
  extractListingIdFromEvent(receipt) {
    const event = receipt.events?.find(e => e.event === 'ListingCreated');
    return event ? event.args.listingId.toNumber() : null;
  }

  /**
   * Extract multiple listing IDs from transaction receipt
   */
  extractListingIdsFromEvents(receipt) {
    const events = receipt.events?.filter(e => e.event === 'ListingCreated') || [];
    return events.map(event => event.args.listingId.toNumber());
  }

  /**
   * Extract auction ID from transaction receipt
   */
  extractAuctionIdFromEvent(receipt) {
    const event = receipt.events?.find(e => e.event === 'AuctionCreated');
    return event ? event.args.auctionId.toNumber() : null;
  }

  /**
   * Extract offer ID from transaction receipt
   */
  extractOfferIdFromEvent(receipt) {
    const event = receipt.events?.find(e => e.event === 'OfferMade');
    return event ? event.args.offerId.toNumber() : null;
  }

  /**
   * Get supported payment tokens
   */
  async getSupportedPaymentTokens() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

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

module.exports = new EnhancedMarketplaceService();
