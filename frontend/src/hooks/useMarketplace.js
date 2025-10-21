/**
 * Enhanced Marketplace Hook
 * Custom React hook for marketplace functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { marketplaceApi, marketplaceHelpers, marketplaceErrors } from '../services/marketplace';

export const useMarketplace = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [supportedContracts, setSupportedContracts] = useState([]);

  // Load marketplace data
  const loadMarketplaceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsResponse, tokensResponse, contractsResponse] = await Promise.all([
        marketplaceApi.getStats(),
        marketplaceApi.getSupportedTokens(),
        marketplaceApi.getSupportedContracts()
      ]);

      setStats(statsResponse.data.data);
      setSupportedTokens(tokensResponse.data.data);
      setSupportedContracts(contractsResponse.data.data);
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketplaceData();
  }, [loadMarketplaceData]);

  return {
    loading,
    error,
    stats,
    supportedTokens,
    supportedContracts,
    loadMarketplaceData
  };
};

export const useListings = (filters = {}, pagination = { page: 1, limit: 50 }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const searchFilters = marketplaceHelpers.buildSearchFilters(filters);
      const paginationParams = marketplaceHelpers.buildPaginationParams(pagination.page, pagination.limit);
      const sortingParams = marketplaceHelpers.buildSortingParams(filters.sortBy, filters.sortDirection);
      
      const params = {
        ...searchFilters,
        ...paginationParams,
        ...sortingParams
      };

      const response = await marketplaceApi.getListings(params);
      setListings(response.data.data.listings);
      setTotal(response.data.data.total);
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  const createListing = useCallback(async (listingData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await marketplaceApi.createListing(listingData);
      await loadListings(); // Refresh listings
      return response.data;
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadListings]);

  const buyListing = useCallback(async (listingId, buyData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await marketplaceApi.buyListing(listingId, buyData);
      await loadListings(); // Refresh listings
      return response.data;
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadListings]);

  const cancelListing = useCallback(async (listingId, cancelData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await marketplaceApi.cancelListing(listingId, cancelData);
      await loadListings(); // Refresh listings
      return response.data;
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadListings]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  return {
    listings,
    loading,
    error,
    total,
    loadListings,
    createListing,
    buyListing,
    cancelListing
  };
};

export const useAuctions = (filters = {}, pagination = { page: 1, limit: 50 }) => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const loadAuctions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const searchFilters = marketplaceHelpers.buildSearchFilters(filters);
      const paginationParams = marketplaceHelpers.buildPaginationParams(pagination.page, pagination.limit);
      const sortingParams = marketplaceHelpers.buildSortingParams(filters.sortBy, filters.sortDirection);
      
      const params = {
        ...searchFilters,
        ...paginationParams,
        ...sortingParams
      };

      const response = await marketplaceApi.getAuctions(params);
      setAuctions(response.data.data.auctions);
      setTotal(response.data.data.total);
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  const createAuction = useCallback(async (auctionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await marketplaceApi.createAuction(auctionData);
      await loadAuctions(); // Refresh auctions
      return response.data;
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadAuctions]);

  const placeBid = useCallback(async (auctionId, bidData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await marketplaceApi.placeBid(auctionId, bidData);
      await loadAuctions(); // Refresh auctions
      return response.data;
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadAuctions]);

  const endAuction = useCallback(async (auctionId, endData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await marketplaceApi.endAuction(auctionId, endData);
      await loadAuctions(); // Refresh auctions
      return response.data;
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadAuctions]);

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  return {
    auctions,
    loading,
    error,
    total,
    loadAuctions,
    createAuction,
    placeBid,
    endAuction
  };
};

export const useOffers = (filters = {}, pagination = { page: 1, limit: 50 }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const searchFilters = marketplaceHelpers.buildSearchFilters(filters);
      const paginationParams = marketplaceHelpers.buildPaginationParams(pagination.page, pagination.limit);
      const sortingParams = marketplaceHelpers.buildSortingParams(filters.sortBy, filters.sortDirection);
      
      const params = {
        ...searchFilters,
        ...paginationParams,
        ...sortingParams
      };

      const response = await marketplaceApi.getOffers(params);
      setOffers(response.data.data.offers);
      setTotal(response.data.data.total);
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  const makeOffer = useCallback(async (offerData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await marketplaceApi.makeOffer(offerData);
      await loadOffers(); // Refresh offers
      return response.data;
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadOffers]);

  const acceptOffer = useCallback(async (offerId, acceptData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await marketplaceApi.acceptOffer(offerId, acceptData);
      await loadOffers(); // Refresh offers
      return response.data;
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadOffers]);

  const rejectOffers = useCallback(async (rejectData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await marketplaceApi.rejectOffers(rejectData);
      await loadOffers(); // Refresh offers
      return response.data;
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadOffers]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  return {
    offers,
    loading,
    error,
    total,
    loadOffers,
    makeOffer,
    acceptOffer,
    rejectOffers
  };
};

export const useOffchainBuying = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateSignature = useCallback(async (signatureData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await marketplaceApi.generateOffchainSignature(signatureData);
      return response.data.data.signature;
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const offchainBuy = useCallback(async (buyData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await marketplaceApi.offchainBuy(buyData);
      return response.data;
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const offchainBulkBuy = useCallback(async (bulkBuyData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await marketplaceApi.offchainBulkBuy(bulkBuyData);
      return response.data;
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    generateSignature,
    offchainBuy,
    offchainBulkBuy
  };
};

export const useAdvancedSearch = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (searchData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await marketplaceApi.search(searchData);
      setResults(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(marketplaceErrors.extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    search
  };
};

export default {
  useMarketplace,
  useListings,
  useAuctions,
  useOffers,
  useOffchainBuying,
  useAdvancedSearch
};


