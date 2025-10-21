/**
 * Enhanced Marketplace API Service
 * Frontend service for interacting with the enhanced marketplace backend
 */

import api from './api';

// Enhanced Marketplace API endpoints
export const marketplaceApi = {
  // ========== LISTING ENDPOINTS ==========
  
  // Create a new listing
  createListing: (listingData) => api.post('/api/marketplace/listings', listingData),
  
  // Create multiple listings in bulk
  createBulkListing: (bulkData) => api.post('/api/marketplace/listings/bulk', bulkData),
  
  // Get listings with filtering and pagination
  getListings: (params = {}) => api.get('/api/marketplace/listings', { params }),
  
  // Get a specific listing
  getListing: (id) => api.get(`/api/marketplace/listings/${id}`),
  
  // Buy an item from a listing
  buyListing: (id, buyData) => api.post(`/api/marketplace/listings/${id}/buy`, buyData),
  
  // Cancel a listing
  cancelListing: (id, cancelData) => api.delete(`/api/marketplace/listings/${id}`, { data: cancelData }),

  // ========== OFFCHAIN ENDPOINTS ==========
  
  // Generate signature for offchain buy
  generateOffchainSignature: (signatureData) => api.post('/api/marketplace/offchain/signature', signatureData),
  
  // Buy an item offchain with signature
  offchainBuy: (buyData) => api.post('/api/marketplace/offchain/buy', buyData),
  
  // Buy multiple items offchain in bulk
  offchainBulkBuy: (bulkBuyData) => api.post('/api/marketplace/offchain/bulk-buy', bulkBuyData),

  // ========== OFFER ENDPOINTS ==========
  
  // Make an offer for a domain
  makeOffer: (offerData) => api.post('/api/marketplace/offers', offerData),
  
  // Get offers with filtering and pagination
  getOffers: (params = {}) => api.get('/api/marketplace/offers', { params }),
  
  // Get a specific offer
  getOffer: (id) => api.get(`/api/marketplace/offers/${id}`),
  
  // Accept an offer
  acceptOffer: (id, acceptData) => api.post(`/api/marketplace/offers/${id}/accept`, acceptData),
  
  // Reject multiple offers
  rejectOffers: (rejectData) => api.post('/api/marketplace/offers/reject', rejectData),

  // ========== AUCTION ENDPOINTS ==========
  
  // Create a new auction
  createAuction: (auctionData) => api.post('/api/marketplace/auctions', auctionData),
  
  // Get auctions with filtering and pagination
  getAuctions: (params = {}) => api.get('/api/marketplace/auctions', { params }),
  
  // Get a specific auction
  getAuction: (id) => api.get(`/api/marketplace/auctions/${id}`),
  
  // Place a bid on an auction
  placeBid: (id, bidData) => api.post(`/api/marketplace/auctions/${id}/bid`, bidData),
  
  // End an auction
  endAuction: (id, endData) => api.post(`/api/marketplace/auctions/${id}/end`, endData),

  // ========== UTILITY ENDPOINTS ==========
  
  // Get marketplace statistics
  getStats: () => api.get('/api/marketplace/stats'),
  
  // Get supported payment tokens
  getSupportedTokens: () => api.get('/api/marketplace/supported-tokens'),
  
  // Get supported token contracts
  getSupportedContracts: () => api.get('/api/marketplace/supported-contracts'),
  
  // Advanced search across all marketplace items
  search: (searchData) => api.post('/api/marketplace/search', searchData),
};

// Helper functions for common operations
export const marketplaceHelpers = {
  // Format price for display
  formatPrice: (price, decimals = 18) => {
    const numPrice = parseFloat(price);
    if (numPrice >= 1) {
      return numPrice.toFixed(2);
    } else if (numPrice >= 0.01) {
      return numPrice.toFixed(4);
    } else {
      return numPrice.toFixed(6);
    }
  },

  // Format time remaining
  formatTimeRemaining: (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const timeLeft = end - now;
    
    if (timeLeft <= 0) return 'Ended';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  },

  // Check if item is active
  isActive: (item) => {
    if (!item.isActive) return false;
    if (item.expiresAt && new Date(item.expiresAt) < new Date()) return false;
    if (item.endTime && new Date(item.endTime) < new Date()) return false;
    if (item.offerUntil && new Date(item.offerUntil) < new Date()) return false;
    return true;
  },

  // Get item status
  getStatus: (item) => {
    if (!item.isActive) return 'Inactive';
    if (item.cancelled) return 'Cancelled';
    if (item.selectedAt || item.buyer) return 'Sold';
    if (item.expiresAt && new Date(item.expiresAt) < new Date()) return 'Expired';
    if (item.endTime && new Date(item.endTime) < new Date()) return 'Ended';
    if (item.offerUntil && new Date(item.offerUntil) < new Date()) return 'Expired';
    return 'Active';
  },

  // Validate wallet address
  isValidAddress: (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  // Validate token ID
  isValidTokenId: (tokenId) => {
    return /^[0-9]+$/.test(tokenId);
  },

  // Validate price
  isValidPrice: (price) => {
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice > 0;
  },

  // Validate duration
  isValidDuration: (duration) => {
    const numDuration = parseInt(duration);
    return !isNaN(numDuration) && numDuration >= 3600 && numDuration <= 31536000;
  },

  // Build search filters
  buildSearchFilters: (filters) => {
    const searchFilters = {};
    
    if (filters.searchQuery) {
      searchFilters.search = filters.searchQuery;
    }
    
    if (filters.priceMin) {
      searchFilters.price_min = filters.priceMin;
    }
    
    if (filters.priceMax) {
      searchFilters.price_max = filters.priceMax;
    }
    
    if (filters.tokenContract) {
      searchFilters.token_contract = filters.tokenContract;
    }
    
    if (filters.seller) {
      searchFilters.seller = filters.seller;
    }
    
    if (filters.startsWith) {
      searchFilters.starts_with = filters.startsWith;
    }
    
    if (filters.endsWith) {
      searchFilters.ends_with = filters.endsWith;
    }
    
    if (filters.letters !== undefined) {
      searchFilters.letters = filters.letters;
    }
    
    if (filters.numbers !== undefined) {
      searchFilters.numbers = filters.numbers;
    }
    
    if (filters.unicode !== undefined) {
      searchFilters.unicode = filters.unicode;
    }
    
    if (filters.emojis !== undefined) {
      searchFilters.emojis = filters.emojis;
    }
    
    return searchFilters;
  },

  // Build pagination params
  buildPaginationParams: (page = 1, limit = 50) => {
    return {
      limit,
      offset: (page - 1) * limit
    };
  },

  // Build sorting params
  buildSortingParams: (sortBy = 'createdAt', sortDirection = 'DESC') => {
    return {
      sortby: sortBy,
      sortdirection: sortDirection
    };
  }
};

// Error handling utilities
export const marketplaceErrors = {
  // Common error messages
  messages: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    INVALID_ADDRESS: 'Invalid Ethereum address.',
    INVALID_TOKEN_ID: 'Invalid token ID.',
    INVALID_PRICE: 'Invalid price value.',
    INVALID_DURATION: 'Invalid duration value.',
    INSUFFICIENT_BALANCE: 'Insufficient balance.',
    LISTING_NOT_FOUND: 'Listing not found.',
    AUCTION_NOT_FOUND: 'Auction not found.',
    OFFER_NOT_FOUND: 'Offer not found.',
    LISTING_EXPIRED: 'Listing has expired.',
    AUCTION_ENDED: 'Auction has ended.',
    OFFER_EXPIRED: 'Offer has expired.',
    NOT_OWNER: 'Not the owner of this item.',
    ALREADY_SOLD: 'Item has already been sold.',
    ALREADY_CANCELLED: 'Item has already been cancelled.',
    INVALID_SIGNATURE: 'Invalid signature.',
    SIGNER_NOT_CONFIGURED: 'Marketplace signer not configured.',
    TRANSACTION_FAILED: 'Transaction failed.',
    USER_REJECTED: 'User rejected the transaction.',
    UNKNOWN_ERROR: 'An unknown error occurred.'
  },

  // Extract error message from API response
  extractErrorMessage: (error) => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return marketplaceErrors.messages.UNKNOWN_ERROR;
  },

  // Check if error is network related
  isNetworkError: (error) => {
    return !error.response || error.code === 'NETWORK_ERROR';
  },

  // Check if error is validation related
  isValidationError: (error) => {
    return error.response?.status === 400;
  },

  // Check if error is authorization related
  isAuthError: (error) => {
    return error.response?.status === 401 || error.response?.status === 403;
  }
};

export default marketplaceApi;


