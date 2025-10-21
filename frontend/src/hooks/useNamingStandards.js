/**
 * React Hook for NIEM-Inspired Naming Standards
 * Provides easy access to naming standards functionality in React components
 */

import { useState, useCallback, useRef } from 'react';
import { 
  NamingStandards,
  ContractNamingUtils,
  ENSDomainUtils,
  DAOStructureUtils,
  SchemaNamingUtils,
  ServiceNamingUtils,
  RouteNamingUtils,
  ConfigNamingUtils,
  DatabaseNamingUtils,
  DocumentationNamingUtils
} from '../utils/naming-standards';

export const useNamingStandards = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Generic operation wrapper
  const executeOperation = useCallback(async (operation, ...args) => {
    try {
      setLoading(true);
      setError(null);

      // Cancel previous operation if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const result = await operation(...args);
      return result;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        console.error('Naming standards error:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Contract Naming Functions
  const generateContractName = useCallback(async (params) => {
    return executeOperation(() => ContractNamingUtils.generateContractName(params));
  }, [executeOperation]);

  const validateContractName = useCallback(async (contractName, expectedParams = {}) => {
    return executeOperation(() => ContractNamingUtils.validateContractName(contractName, expectedParams));
  }, [executeOperation]);

  const generateDAOContractNames = useCallback(async (daoName, options = {}) => {
    return executeOperation(() => ContractNamingUtils.generateDAOContractNames(daoName, options));
  }, [executeOperation]);

  // ENS Domain Functions
  const validateENSDomain = useCallback(async (domain, type = 'primary') => {
    return executeOperation(() => ENSDomainUtils.validateDomain(domain, type));
  }, [executeOperation]);

  const generateStandardSubdomains = useCallback(async (primaryDomain) => {
    return executeOperation(() => ENSDomainUtils.generateStandardSubdomains(primaryDomain));
  }, [executeOperation]);

  const validateMultipleDomains = useCallback(async (domains) => {
    return executeOperation(() => ENSDomainUtils.validateMultipleDomains(domains));
  }, [executeOperation]);

  const suggestDAOName = useCallback(async (input) => {
    return executeOperation(() => ENSDomainUtils.suggestDAOName(input));
  }, [executeOperation]);

  // DAO Structure Functions
  const generateDAOStructure = useCallback(async (daoName, options = {}) => {
    return executeOperation(() => DAOStructureUtils.generateDAOStructure(daoName, options));
  }, [executeOperation]);

  const validateDAOMetadata = useCallback(async (daoData) => {
    return executeOperation(() => DAOStructureUtils.validateDAOMetadata(daoData));
  }, [executeOperation]);

  // Schema Naming Functions
  const generateSchemaFileName = useCallback(async (domain, component, version = '1.0.0') => {
    return executeOperation(() => SchemaNamingUtils.generateSchemaFileName(domain, component, version));
  }, [executeOperation]);

  const generateSchemaId = useCallback(async (domain, component) => {
    return executeOperation(() => SchemaNamingUtils.generateSchemaId(domain, component));
  }, [executeOperation]);

  const generateSchemaInternalName = useCallback(async (domain, component) => {
    return executeOperation(() => SchemaNamingUtils.generateSchemaInternalName(domain, component));
  }, [executeOperation]);

  // Service Naming Functions
  const generateServiceFileName = useCallback(async (domain) => {
    return executeOperation(() => ServiceNamingUtils.generateServiceFileName(domain));
  }, [executeOperation]);

  const generateServiceClassName = useCallback(async (domain) => {
    return executeOperation(() => ServiceNamingUtils.generateServiceClassName(domain));
  }, [executeOperation]);

  // Route Naming Functions
  const generateRouteFileName = useCallback(async (domain) => {
    return executeOperation(() => RouteNamingUtils.generateRouteFileName(domain));
  }, [executeOperation]);

  const generateAPIEndpoint = useCallback(async (domain, component, action, version = 'v1') => {
    return executeOperation(() => RouteNamingUtils.generateAPIEndpoint(domain, component, action, version));
  }, [executeOperation]);

  // Configuration Naming Functions
  const generateEnvVarName = useCallback(async (domain, component, setting) => {
    return executeOperation(() => ConfigNamingUtils.generateEnvVarName(domain, component, setting));
  }, [executeOperation]);

  const generateConfigFileName = useCallback(async (domain) => {
    return executeOperation(() => ConfigNamingUtils.generateConfigFileName(domain));
  }, [executeOperation]);

  // Database Naming Functions
  const generateTableName = useCallback(async (domain, component) => {
    return executeOperation(() => DatabaseNamingUtils.generateTableName(domain, component));
  }, [executeOperation]);

  const generateColumnName = useCallback(async (component, attribute) => {
    return executeOperation(() => DatabaseNamingUtils.generateColumnName(component, attribute));
  }, [executeOperation]);

  // Documentation Naming Functions
  const generateDocFileName = useCallback(async (domain, type) => {
    return executeOperation(() => DocumentationNamingUtils.generateDocFileName(domain, type));
  }, [executeOperation]);

  const generateDocTag = useCallback(async (domain, component) => {
    return executeOperation(() => DocumentationNamingUtils.generateDocTag(domain, component));
  }, [executeOperation]);

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
    
    // Contract Functions
    generateContractName,
    validateContractName,
    generateDAOContractNames,
    
    // ENS Functions
    validateENSDomain,
    generateStandardSubdomains,
    validateMultipleDomains,
    suggestDAOName,
    
    // DAO Functions
    generateDAOStructure,
    validateDAOMetadata,
    
    // Schema Functions
    generateSchemaFileName,
    generateSchemaId,
    generateSchemaInternalName,
    
    // Service Functions
    generateServiceFileName,
    generateServiceClassName,
    
    // Route Functions
    generateRouteFileName,
    generateAPIEndpoint,
    
    // Config Functions
    generateEnvVarName,
    generateConfigFileName,
    
    // Database Functions
    generateTableName,
    generateColumnName,
    
    // Documentation Functions
    generateDocFileName,
    generateDocTag,
    
    // Utility Functions
    cleanup
  };
};

// Specialized hooks for specific use cases

export const useContractNaming = () => {
  const { 
    generateContractName, 
    validateContractName, 
    generateDAOContractNames, 
    loading, 
    error 
  } = useNamingStandards();
  
  return {
    generateContractName,
    validateContractName,
    generateDAOContractNames,
    loading,
    error
  };
};

export const useENSDomainNaming = () => {
  const { 
    validateENSDomain, 
    generateStandardSubdomains, 
    validateMultipleDomains, 
    suggestDAOName,
    loading, 
    error 
  } = useNamingStandards();
  
  return {
    validateENSDomain,
    generateStandardSubdomains,
    validateMultipleDomains,
    suggestDAOName,
    loading,
    error
  };
};

export const useDAOStructureNaming = () => {
  const { 
    generateDAOStructure, 
    validateDAOMetadata, 
    loading, 
    error 
  } = useNamingStandards();
  
  return {
    generateDAOStructure,
    validateDAOMetadata,
    loading,
    error
  };
};

export const useSchemaNaming = () => {
  const { 
    generateSchemaFileName, 
    generateSchemaId, 
    generateSchemaInternalName,
    loading, 
    error 
  } = useNamingStandards();
  
  return {
    generateSchemaFileName,
    generateSchemaId,
    generateSchemaInternalName,
    loading,
    error
  };
};

export const useServiceNaming = () => {
  const { 
    generateServiceFileName, 
    generateServiceClassName,
    loading, 
    error 
  } = useNamingStandards();
  
  return {
    generateServiceFileName,
    generateServiceClassName,
    loading,
    error
  };
};

export const useRouteNaming = () => {
  const { 
    generateRouteFileName, 
    generateAPIEndpoint,
    loading, 
    error 
  } = useNamingStandards();
  
  return {
    generateRouteFileName,
    generateAPIEndpoint,
    loading,
    error
  };
};

export const useConfigNaming = () => {
  const { 
    generateEnvVarName, 
    generateConfigFileName,
    loading, 
    error 
  } = useNamingStandards();
  
  return {
    generateEnvVarName,
    generateConfigFileName,
    loading,
    error
  };
};

export const useDatabaseNaming = () => {
  const { 
    generateTableName, 
    generateColumnName,
    loading, 
    error 
  } = useNamingStandards();
  
  return {
    generateTableName,
    generateColumnName,
    loading,
    error
  };
};

export const useDocumentationNaming = () => {
  const { 
    generateDocFileName, 
    generateDocTag,
    loading, 
    error 
  } = useNamingStandards();
  
  return {
    generateDocFileName,
    generateDocTag,
    loading,
    error
  };
};

// Hook for getting naming standards constants
export const useNamingConstants = () => {
  return {
    CONTRACT_TYPES: NamingStandards.CONTRACT_TYPES,
    NAMING_PATTERNS: NamingStandards.NAMING_PATTERNS,
    RESERVED_SUBDOMAINS: NamingStandards.RESERVED_SUBDOMAINS,
    STANDARD_SUBDOMAIN_TYPES: NamingStandards.STANDARD_SUBDOMAIN_TYPES
  };
};

// Hook for comprehensive naming operations
export const useComprehensiveNaming = () => {
  const contractNaming = useContractNaming();
  const ensNaming = useENSDomainNaming();
  const daoNames = useDAOStructureNaming();
  const schemaNaming = useSchemaNaming();
  const serviceNaming = useServiceNaming();
  const routeNaming = useRouteNaming();
  const configNaming = useConfigNaming();
  const databaseNaming = useDatabaseNaming();
  const documentationNaming = useDocumentationNaming();
  const constants = useNamingConstants();

  return {
    contract: contractNaming,
    ens: ensNaming,
    dao: daoNames,
    schema: schemaNaming,
    service: serviceNaming,
    route: routeNaming,
    config: configNaming,
    database: databaseNaming,
    documentation: documentationNaming,
    constants
  };
};
