import { useState, useEffect, useCallback } from 'react';
import MetadataRegistryService from '../services/metadata-registry';

const useMetadataRegistry = () => {
  const [service] = useState(() => new MetadataRegistryService());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Health check
  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await service.getHealth();
      setData(prev => ({ ...prev, health }));
      return health;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get schemas
  const getSchemas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const schemas = await service.getSchemas();
      setData(prev => ({ ...prev, schemas }));
      return schemas;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Register DAO
  const registerDAO = useCallback(async (daoData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.registerDAO(daoData);
      setData(prev => ({ 
        ...prev, 
        lastRegisteredDAO: result.dao,
        registrationHistory: [...(prev.registrationHistory || []), result]
      }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Register contract
  const registerContract = useCallback(async (contractData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.registerContract(contractData);
      setData(prev => ({ 
        ...prev, 
        lastRegisteredContract: result.contract,
        registrationHistory: [...(prev.registrationHistory || []), result]
      }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Register ENS
  const registerENS = useCallback(async (ensData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.registerENS(ensData);
      setData(prev => ({ 
        ...prev, 
        lastRegisteredENS: result.ens,
        registrationHistory: [...(prev.registrationHistory || []), result]
      }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get metadata by ID
  const getMetadata = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getMetadata(id);
      setData(prev => ({ ...prev, currentMetadata: result.metadata }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Search metadata
  const searchMetadata = useCallback(async (query, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.searchMetadata(query, options);
      setData(prev => ({ ...prev, searchResults: result }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Update metadata
  const updateMetadata = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.updateMetadata(id, updates);
      setData(prev => ({ ...prev, currentMetadata: result.metadata }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Delete metadata
  const deleteMetadata = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.deleteMetadata(id);
      setData(prev => ({ 
        ...prev, 
        currentMetadata: null,
        searchResults: prev.searchResults ? {
          ...prev.searchResults,
          results: prev.searchResults.results.filter(item => item.id !== id)
        } : null
      }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get statistics
  const getStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getStatistics();
      setData(prev => ({ ...prev, statistics: result.statistics }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Register complete DAO
  const registerCompleteDAO = useCallback(async (daoData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.registerCompleteDAO(daoData);
      setData(prev => ({ 
        ...prev, 
        lastCompleteDAO: result.results,
        registrationHistory: [...(prev.registrationHistory || []), result]
      }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Bulk search
  const bulkSearch = useCallback(async (query, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.bulkSearch(query, options);
      setData(prev => ({ ...prev, bulkSearchResults: result }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get metadata by type
  const getMetadataByType = useCallback(async (type, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getMetadataByType(type, options);
      setData(prev => ({ ...prev, [`${type}Metadata`]: result }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Validate metadata
  const validateMetadata = useCallback((type, data) => {
    return service.validateMetadata(type, data);
  }, [service]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear data
  const clearData = useCallback(() => {
    setData(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    // State
    loading,
    error,
    data,
    
    // Actions
    checkHealth,
    getSchemas,
    registerDAO,
    registerContract,
    registerENS,
    getMetadata,
    searchMetadata,
    updateMetadata,
    deleteMetadata,
    getStatistics,
    registerCompleteDAO,
    bulkSearch,
    getMetadataByType,
    validateMetadata,
    
    // Utilities
    clearError,
    clearData,
    
    // Service instance
    service
  };
};

export default useMetadataRegistry;




