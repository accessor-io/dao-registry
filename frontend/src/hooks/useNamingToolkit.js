/**
 * React Hook for Naming Convention Toolkit
 * Provides easy access to naming toolkit functionality in React components
 */

import { useState, useCallback, useRef } from 'react';
import namingToolkitService from '../services/naming-toolkit';

export const useNamingToolkit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Generic API call wrapper
  const apiCall = useCallback(async (apiFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);

      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        console.error('Naming toolkit error:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ENS Domain Validation
  const validateENSDomain = useCallback(async (domain, type = 'primary') => {
    return apiCall(namingToolkitService.validateENSDomain, domain, type);
  }, [apiCall]);

  // Generate ENS Subdomains
  const generateENSSubdomains = useCallback(async (domain) => {
    return apiCall(namingToolkitService.generateENSSubdomains, domain);
  }, [apiCall]);

  // Contract Name Validation
  const validateContractName = useCallback(async (contractName) => {
    return apiCall(namingToolkitService.validateContractName, contractName);
  }, [apiCall]);

  // Generate Contract Names
  const generateContractNames = useCallback(async (daoName, options = {}) => {
    return apiCall(namingToolkitService.generateContractNames, daoName, options);
  }, [apiCall]);

  // Generate DAO Structure
  const generateDAOStructure = useCallback(async (daoName, options = {}) => {
    return apiCall(namingToolkitService.generateDAOStructure, daoName, options);
  }, [apiCall]);

  // Validate DAO Metadata
  const validateDAOMetadata = useCallback(async (daoData) => {
    return apiCall(namingToolkitService.validateDAOMetadata, daoData);
  }, [apiCall]);

  // ENS Metadata
  const getENSMetadata = useCallback(async (domain, network = 'mainnet', version = 'v2') => {
    return apiCall(namingToolkitService.getENSMetadata, domain, network, version);
  }, [apiCall]);

  // Domain Availability
  const checkDomainAvailability = useCallback(async (domain, network = 'mainnet') => {
    return apiCall(namingToolkitService.checkDomainAvailability, domain, network);
  }, [apiCall]);

  // Domain Suggestions
  const getDomainSuggestions = useCallback(async (baseName, network = 'mainnet') => {
    return apiCall(namingToolkitService.getDomainSuggestions, baseName, network);
  }, [apiCall]);

  // Domain History
  const getDomainHistory = useCallback(async (domain, network = 'mainnet') => {
    return apiCall(namingToolkitService.getDomainHistory, domain, network);
  }, [apiCall]);

  // Migrate DAO
  const migrateDAO = useCallback(async (existingDAO) => {
    return apiCall(namingToolkitService.migrateDAO, existingDAO);
  }, [apiCall]);

  // Cache Management
  const clearCache = useCallback((pattern = null) => {
    namingToolkitService.clearCache(pattern);
  }, []);

  const getCacheStats = useCallback(() => {
    return namingToolkitService.getCacheStats();
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    // State
    loading,
    error,
    
    // ENS Functions
    validateENSDomain,
    generateENSSubdomains,
    getENSMetadata,
    checkDomainAvailability,
    getDomainSuggestions,
    getDomainHistory,
    
    // Contract Functions
    validateContractName,
    generateContractNames,
    
    // DAO Functions
    generateDAOStructure,
    validateDAOMetadata,
    migrateDAO,
    
    // Utility Functions
    clearCache,
    getCacheStats,
    cleanup
  };
};

// Specialized hooks for specific use cases

export const useENSDomainValidation = () => {
  const { validateENSDomain, generateENSSubdomains, checkDomainAvailability, getDomainSuggestions, loading, error } = useNamingToolkit();
  
  return {
    validateENSDomain,
    generateENSSubdomains,
    checkDomainAvailability,
    getDomainSuggestions,
    loading,
    error
  };
};

export const useContractNaming = () => {
  const { validateContractName, generateContractNames, loading, error } = useNamingToolkit();
  
  return {
    validateContractName,
    generateContractNames,
    loading,
    error
  };
};

export const useDAOGeneration = () => {
  const { generateDAOStructure, validateDAOMetadata, migrateDAO, loading, error } = useNamingToolkit();
  
  return {
    generateDAOStructure,
    validateDAOMetadata,
    migrateDAO,
    loading,
    error
  };
};

export const useENSMetadata = () => {
  const { getENSMetadata, getDomainHistory, loading, error } = useNamingToolkit();
  
  return {
    getENSMetadata,
    getDomainHistory,
    loading,
    error
  };
};




