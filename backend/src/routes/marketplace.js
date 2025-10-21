/**
 * Enhanced Marketplace API Routes
 * Provides comprehensive marketplace functionality including listings, auctions, offers, and offchain operations
 */

const express = require('express');
const router = express.Router();
const enhancedMarketplaceService = require('../services/marketplace/enhanced-marketplace-service');
const marketplaceFilters = require('../services/marketplace/marketplace-filters');
const { logger } = require('../utils/logger');

// ========== LISTING ROUTES ==========

/**
 * @route POST /api/marketplace/listings
 * @desc Create a new marketplace listing
 * @access Public
 */
router.post('/listings', async (req, res) => {
  try {
    const {
      tokenContract,
      tokenId,
      price,
      paymentToken,
      duration,
      metadata,
      listingName,
      sellerWallet
    } = req.body;

    // Validate required fields
    if (!tokenContract || !tokenId || !price || !duration || !sellerWallet) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tokenContract, tokenId, price, duration, sellerWallet'
      });
    }

    const result = await enhancedMarketplaceService.createListing({
      tokenContract,
      tokenId,
      price,
      paymentToken,
      duration,
      metadata,
      listingName,
      sellerWallet
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/marketplace/listings/bulk
 * @desc Create multiple marketplace listings in a single transaction
 * @access Public
 */
router.post('/listings/bulk', async (req, res) => {
  try {
    const {
      listingNames,
      tokenIds,
      durations,
      prices,
      tokenContract,
      paymentToken,
      sellerWallet
    } = req.body;

    // Validate required fields
    if (!listingNames || !tokenIds || !durations || !prices || !tokenContract || !sellerWallet) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for bulk listing'
      });
    }

    const result = await enhancedMarketplaceService.createBulkListing({
      listingNames,
      tokenIds,
      durations,
      prices,
      tokenContract,
      paymentToken,
      sellerWallet
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error creating bulk listing:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/marketplace/listings
 * @desc Get marketplace listings with filtering and pagination
 * @access Public
 */
router.get('/listings', async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      sortby = 'createdAt',
      sortdirection = 'DESC',
      ...filters
    } = req.query;

    const result = await enhancedMarketplaceService.getActiveListings(
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/marketplace/listings/:id
 * @desc Get a specific marketplace listing
 * @access Public
 */
router.get('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await enhancedMarketplaceService.getListing(parseInt(id));

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    logger.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/marketplace/listings/:id/buy
 * @desc Buy an item from a listing
 * @access Public
 */
router.post('/listings/:id/buy', async (req, res) => {
  try {
    const { id } = req.params;
    const { buyerWallet, paymentAmount } = req.body;

    if (!buyerWallet || !paymentAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: buyerWallet, paymentAmount'
      });
    }

    const result = await enhancedMarketplaceService.buyItem(
      parseInt(id),
      buyerWallet,
      paymentAmount
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error buying item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/marketplace/listings/:id
 * @desc Cancel a marketplace listing
 * @access Public
 */
router.delete('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sellerWallet } = req.body;

    if (!sellerWallet) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: sellerWallet'
      });
    }

    const result = await enhancedMarketplaceService.cancelListing(
      parseInt(id),
      sellerWallet
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error cancelling listing:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== OFFCHAIN ROUTES ==========

/**
 * @route POST /api/marketplace/offchain/signature
 * @desc Generate signature for offchain buy
 * @access Public
 */
router.post('/offchain/signature', async (req, res) => {
  try {
    const { seller, buyer, tokenId, price } = req.body;

    if (!seller || !buyer || !tokenId || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: seller, buyer, tokenId, price'
      });
    }

    const signature = await enhancedMarketplaceService.generateOffchainBuySignature(
      seller,
      buyer,
      tokenId,
      price
    );

    res.json({
      success: true,
      data: { signature }
    });
  } catch (error) {
    logger.error('Error generating signature:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/marketplace/offchain/buy
 * @desc Buy an item offchain with signature
 * @access Public
 */
router.post('/offchain/buy', async (req, res) => {
  try {
    const {
      tokenId,
      seller,
      paymentValue,
      signature,
      buyerWallet
    } = req.body;

    if (!tokenId || !seller || !paymentValue || !signature || !buyerWallet) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for offchain buy'
      });
    }

    const result = await enhancedMarketplaceService.offchainBuy({
      tokenId,
      seller,
      paymentValue,
      signature,
      buyerWallet
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error completing offchain buy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/marketplace/offchain/bulk-buy
 * @desc Buy multiple items offchain in a single transaction
 * @access Public
 */
router.post('/offchain/bulk-buy', async (req, res) => {
  try {
    const {
      tokenIds,
      sellers,
      paymentValues,
      signatures,
      buyerWallet
    } = req.body;

    if (!tokenIds || !sellers || !paymentValues || !signatures || !buyerWallet) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for bulk offchain buy'
      });
    }

    const result = await enhancedMarketplaceService.offchainBulkBuy({
      tokenIds,
      sellers,
      paymentValues,
      signatures,
      buyerWallet
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error completing bulk offchain buy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== OFFER ROUTES ==========

/**
 * @route POST /api/marketplace/offers
 * @desc Make an offer for a domain
 * @access Public
 */
router.post('/offers', async (req, res) => {
  try {
    const {
      domainOwner,
      offerName,
      tokenId,
      offerUntil,
      price,
      offerMakerWallet
    } = req.body;

    if (!domainOwner || !tokenId || !offerUntil || !price || !offerMakerWallet) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for making offer'
      });
    }

    const result = await enhancedMarketplaceService.makeOffer({
      domainOwner,
      offerName,
      tokenId,
      offerUntil,
      price,
      offerMakerWallet
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error making offer:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/marketplace/offers
 * @desc Get marketplace offers with filtering and pagination
 * @access Public
 */
router.get('/offers', async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      sortby = 'offeredAt',
      sortdirection = 'DESC',
      ...filters
    } = req.query;

    const result = await enhancedMarketplaceService.getActiveOffers(
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error fetching offers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/marketplace/offers/:id
 * @desc Get a specific marketplace offer
 * @access Public
 */
router.get('/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await enhancedMarketplaceService.getOffer(parseInt(id));

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found'
      });
    }

    res.json({
      success: true,
      data: offer
    });
  } catch (error) {
    logger.error('Error fetching offer:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/marketplace/offers/:id/accept
 * @desc Accept an offer
 * @access Public
 */
router.post('/offers/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelOfferIds, domainOwnerWallet } = req.body;

    if (!domainOwnerWallet) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: domainOwnerWallet'
      });
    }

    const result = await enhancedMarketplaceService.acceptOffer(
      parseInt(id),
      cancelOfferIds || [],
      domainOwnerWallet
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error accepting offer:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/marketplace/offers/reject
 * @desc Reject multiple offers
 * @access Public
 */
router.post('/offers/reject', async (req, res) => {
  try {
    const { offerIds, domainOwnerWallet } = req.body;

    if (!offerIds || !domainOwnerWallet) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: offerIds, domainOwnerWallet'
      });
    }

    const result = await enhancedMarketplaceService.rejectOffers(
      offerIds,
      domainOwnerWallet
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error rejecting offers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== AUCTION ROUTES ==========

/**
 * @route POST /api/marketplace/auctions
 * @desc Create a new auction
 * @access Public
 */
router.post('/auctions', async (req, res) => {
  try {
    const {
      tokenContract,
      tokenId,
      startingPrice,
      reservePrice,
      paymentToken,
      duration,
      metadata,
      auctionName,
      sellerWallet
    } = req.body;

    if (!tokenContract || !tokenId || !startingPrice || !reservePrice || !duration || !sellerWallet) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for creating auction'
      });
    }

    const result = await enhancedMarketplaceService.createAuction({
      tokenContract,
      tokenId,
      startingPrice,
      reservePrice,
      paymentToken,
      duration,
      metadata,
      auctionName,
      sellerWallet
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error creating auction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/marketplace/auctions
 * @desc Get marketplace auctions with filtering and pagination
 * @access Public
 */
router.get('/auctions', async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      sortby = 'startTime',
      sortdirection = 'DESC',
      ...filters
    } = req.query;

    const result = await enhancedMarketplaceService.getActiveAuctions(
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error fetching auctions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/marketplace/auctions/:id
 * @desc Get a specific marketplace auction
 * @access Public
 */
router.get('/auctions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await enhancedMarketplaceService.getAuction(parseInt(id));

    if (!auction) {
      return res.status(404).json({
        success: false,
        error: 'Auction not found'
      });
    }

    res.json({
      success: true,
      data: auction
    });
  } catch (error) {
    logger.error('Error fetching auction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/marketplace/auctions/:id/bid
 * @desc Place a bid on an auction
 * @access Public
 */
router.post('/auctions/:id/bid', async (req, res) => {
  try {
    const { id } = req.params;
    const { bidAmount, bidderWallet } = req.body;

    if (!bidAmount || !bidderWallet) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: bidAmount, bidderWallet'
      });
    }

    const result = await enhancedMarketplaceService.placeBid(
      parseInt(id),
      bidAmount,
      bidderWallet
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error placing bid:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/marketplace/auctions/:id/end
 * @desc End an auction
 * @access Public
 */
router.post('/auctions/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const { callerWallet } = req.body;

    if (!callerWallet) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: callerWallet'
      });
    }

    const result = await enhancedMarketplaceService.endAuction(
      parseInt(id),
      callerWallet
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error ending auction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== STATISTICS ROUTES ==========

/**
 * @route GET /api/marketplace/stats
 * @desc Get marketplace statistics
 * @access Public
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await enhancedMarketplaceService.getMarketplaceStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching marketplace stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/marketplace/supported-tokens
 * @desc Get supported payment tokens
 * @access Public
 */
router.get('/supported-tokens', async (req, res) => {
  try {
    const tokens = await enhancedMarketplaceService.getSupportedPaymentTokens();

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    logger.error('Error fetching supported tokens:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/marketplace/supported-contracts
 * @desc Get supported token contracts
 * @access Public
 */
router.get('/supported-contracts', async (req, res) => {
  try {
    const contracts = await enhancedMarketplaceService.getSupportedTokenContracts();

    res.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    logger.error('Error fetching supported contracts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== SEARCH AND FILTER ROUTES ==========

/**
 * @route POST /api/marketplace/search
 * @desc Search marketplace with advanced filters
 * @access Public
 */
router.post('/search', async (req, res) => {
  try {
    const { 
      type = 'all', // 'listings', 'auctions', 'offers', 'all'
      filters = {},
      sortby = 'createdAt',
      sortdirection = 'DESC',
      limit = 50, 
      offset = 0 
    } = req.body;

    let results = {};

    if (type === 'all' || type === 'listings') {
      results.listings = await enhancedMarketplaceService.getActiveListings(
        parseInt(limit),
        parseInt(offset)
      );
    }

    if (type === 'all' || type === 'auctions') {
      results.auctions = await enhancedMarketplaceService.getActiveAuctions(
        parseInt(limit),
        parseInt(offset)
      );
    }

    if (type === 'all' || type === 'offers') {
      results.offers = await enhancedMarketplaceService.getActiveOffers(
        parseInt(limit),
        parseInt(offset)
      );
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Error searching marketplace:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;