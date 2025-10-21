import { useState, useEffect, useCallback } from 'react';
import ENSIPXService from '../services/ensip-x';

const useENSIPX = () => {
  const [service] = useState(() => new ENSIPXService());
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

  // Get standards
  const getStandards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const standards = await service.getStandards();
      setData(prev => ({ ...prev, standards }));
      return standards;
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

  // Generate contracts
  const generateContracts = useCallback(async (daoName, contractTypes = []) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.generateContracts(daoName, contractTypes);
      setData(prev => ({ ...prev, generatedContracts: result }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Generate ENS domains
  const generateENS = useCallback(async (daoName, customDomain = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.generateENS(daoName, customDomain);
      setData(prev => ({ ...prev, generatedENS: result }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Create contract metadata
  const createContractMetadata = useCallback(async (daoData, contractNames) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.createContractMetadata(daoData, contractNames);
      setData(prev => ({ ...prev, contractMetadata: result }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Create ENS metadata
  const createENSMetadata = useCallback(async (daoData, ensDomains) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.createENSMetadata(daoData, ensDomains);
      setData(prev => ({ ...prev, ensMetadata: result }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Create signature
  const createSignature = useCallback(async (daoData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.createSignature(daoData);
      setData(prev => ({ ...prev, signature: result }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Validate compliance
  const validateCompliance = useCallback(async (metadata) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.validateCompliance(metadata);
      setData(prev => ({ ...prev, compliance: result }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get naming patterns
  const getNamingPatterns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getNamingPatterns();
      setData(prev => ({ ...prev, namingPatterns: result }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get ENS patterns
  const getENSPatterns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getENSPatterns();
      setData(prev => ({ ...prev, ensPatterns: result }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Validate DAO
  const validateDAO = useCallback(async (daoData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.validateDAO(daoData);
      setData(prev => ({ ...prev, validation: result }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get complete structure
  const getCompleteStructure = useCallback(async (daoData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getCompleteStructure(daoData);
      setData(prev => ({ ...prev, completeStructure: result }));
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
        lastCompleteDAO: result.result,
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

  // Generate and validate structure
  const generateAndValidateStructure = useCallback(async (daoData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.generateAndValidateStructure(daoData);
      setData(prev => ({ ...prev, validatedStructure: result }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Get all patterns
  const getAllPatterns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getAllPatterns();
      setData(prev => ({ ...prev, allPatterns: result }));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Validate input
  const validateInput = useCallback((type, data) => {
    return service.validateInput(type, data);
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
    const initialize = async () => {
      try {
        await Promise.all([
          checkHealth(),
          getStandards(),
          getAllPatterns()
        ]);
      } catch (err) {
        console.error('Failed to initialize ENSIP-X:', err);
      }
    };

    initialize();
  }, [checkHealth, getStandards, getAllPatterns]);

  return {
    // State
    loading,
    error,
    data,
    
    // Actions
    checkHealth,
    getStandards,
    registerDAO,
    generateContracts,
    generateENS,
    createContractMetadata,
    createENSMetadata,
    createSignature,
    validateCompliance,
    getNamingPatterns,
    getENSPatterns,
    validateDAO,
    getCompleteStructure,
    registerCompleteDAO,
    generateAndValidateStructure,
    getAllPatterns,
    validateInput,
    
    // Utilities
    clearError,
    clearData,
    
    // Service instance
    service
  };
};

export default useENSIPX;




