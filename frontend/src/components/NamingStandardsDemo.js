/**
 * NIEM-Inspired Naming Standards Demo Component
 * Demonstrates the comprehensive naming standards implementation in the frontend
 */

import React, { useState, useEffect } from 'react';
import { 
  useNamingStandards,
  useContractNaming,
  useENSDomainNaming,
  useDAOStructureNaming,
  useSchemaNaming,
  useServiceNaming,
  useRouteNaming,
  useConfigNaming,
  useDatabaseNaming,
  useDocumentationNaming,
  useNamingConstants,
  useComprehensiveNaming
} from '../hooks/useNamingStandards';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Globe, 
  Code, 
  Users, 
  Search,
  RefreshCw,
  Info,
  ExternalLink,
  FileText,
  Settings,
  Database,
  BookOpen,
  Layers,
  Server,
  Route
} from 'lucide-react';

const NamingStandardsDemo = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [daoName, setDaoName] = useState('TestDAO');
  const [domain, setDomain] = useState('testdao.eth');
  const [contractName, setContractName] = useState('TestDAOGovernance');
  const [domainInput, setDomainInput] = useState('example-dao');
  const [componentInput, setComponentInput] = useState('core');
  const [results, setResults] = useState({});

  // Comprehensive naming hook
  const comprehensiveNaming = useComprehensiveNaming();
  const constants = useNamingConstants();

  // Cache stats
  const [cacheStats, setCacheStats] = useState(null);

  useEffect(() => {
    updateCacheStats();
  }, []);

  const updateCacheStats = () => {
    // Simulate cache stats for demo
    setCacheStats({
      size: Math.floor(Math.random() * 50) + 10,
      keys: ['contract-names', 'ens-domains', 'dao-structures', 'schemas']
    });
  };

  const handleContractValidation = async () => {
    try {
      const result = await comprehensiveNaming.contract.validateContractName(contractName);
      setResults(prev => ({ ...prev, contractValidation: result }));
    } catch (error) {
      console.error('Contract validation failed:', error);
    }
  };

  const handleContractGeneration = async () => {
    try {
      const result = await comprehensiveNaming.contract.generateDAOContractNames(daoName, {
        includeInterfaces: true,
        includeImplementations: true,
        includeVersions: true
      });
      setResults(prev => ({ ...prev, contractGeneration: result }));
    } catch (error) {
      console.error('Contract generation failed:', error);
    }
  };

  const handleENSDomainValidation = async () => {
    try {
      const result = await comprehensiveNaming.ens.validateENSDomain(domain, 'primary');
      setResults(prev => ({ ...prev, ensValidation: result }));
    } catch (error) {
      console.error('ENS validation failed:', error);
    }
  };

  const handleSubdomainGeneration = async () => {
    try {
      const result = await comprehensiveNaming.ens.generateStandardSubdomains(domain);
      setResults(prev => ({ ...prev, subdomainGeneration: result }));
    } catch (error) {
      console.error('Subdomain generation failed:', error);
    }
  };

  const handleDAOStructureGeneration = async () => {
    try {
      const result = await comprehensiveNaming.dao.generateDAOStructure(daoName, {
        symbol: daoName.substring(0, 3).toUpperCase(),
        description: `${daoName} DAO`,
        tags: ['DAO', 'Governance']
      });
      setResults(prev => ({ ...prev, daoStructure: result }));
    } catch (error) {
      console.error('DAO structure generation failed:', error);
    }
  };

  const handleSchemaGeneration = async () => {
    try {
      const fileName = await comprehensiveNaming.schema.generateSchemaFileName(domainInput, componentInput);
      const schemaId = await comprehensiveNaming.schema.generateSchemaId(domainInput, componentInput);
      const internalName = await comprehensiveNaming.schema.generateSchemaInternalName(domainInput, componentInput);
      
      setResults(prev => ({ 
        ...prev, 
        schemaGeneration: { fileName, schemaId, internalName } 
      }));
    } catch (error) {
      console.error('Schema generation failed:', error);
    }
  };

  const handleServiceGeneration = async () => {
    try {
      const fileName = await comprehensiveNaming.service.generateServiceFileName(domainInput);
      const className = await comprehensiveNaming.service.generateServiceClassName(domainInput);
      
      setResults(prev => ({ 
        ...prev, 
        serviceGeneration: { fileName, className } 
      }));
    } catch (error) {
      console.error('Service generation failed:', error);
    }
  };

  const handleRouteGeneration = async () => {
    try {
      const fileName = await comprehensiveNaming.route.generateRouteFileName(domainInput);
      const endpoint = await comprehensiveNaming.route.generateAPIEndpoint(domainInput, componentInput, 'list');
      
      setResults(prev => ({ 
        ...prev, 
        routeGeneration: { fileName, endpoint } 
      }));
    } catch (error) {
      console.error('Route generation failed:', error);
    }
  };

  const handleConfigGeneration = async () => {
    try {
      const envVar = await comprehensiveNaming.config.generateEnvVarName(domainInput, componentInput, 'enabled');
      const configFile = await comprehensiveNaming.config.generateConfigFileName(domainInput);
      
      setResults(prev => ({ 
        ...prev, 
        configGeneration: { envVar, configFile } 
      }));
    } catch (error) {
      console.error('Config generation failed:', error);
    }
  };

  const handleDatabaseGeneration = async () => {
    try {
      const tableName = await comprehensiveNaming.database.generateTableName(domainInput, componentInput);
      const columnName = await comprehensiveNaming.database.generateColumnName(componentInput, 'name');
      
      setResults(prev => ({ 
        ...prev, 
        databaseGeneration: { tableName, columnName } 
      }));
    } catch (error) {
      console.error('Database generation failed:', error);
    }
  };

  const handleDocumentationGeneration = async () => {
    try {
      const docFile = await comprehensiveNaming.documentation.generateDocFileName(domainInput, 'guide');
      const docTag = await comprehensiveNaming.documentation.generateDocTag(domainInput, componentInput);
      
      setResults(prev => ({ 
        ...prev, 
        documentationGeneration: { docFile, docTag } 
      }));
    } catch (error) {
      console.error('Documentation generation failed:', error);
    }
  };

  const handleClearCache = () => {
    // Simulate cache clear
    setResults({});
    updateCacheStats();
  };

  const renderStatusIcon = (isValid, hasWarnings = false) => {
    if (isValid === null || isValid === undefined) return null;
    if (isValid) {
      return hasWarnings ? (
        <AlertCircle className="w-5 h-5 text-yellow-500" />
      ) : (
        <CheckCircle className="w-5 h-5 text-green-500" />
      );
    }
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const renderLoadingSpinner = (isLoading) => {
    if (!isLoading) return null;
    return <Loader2 className="w-4 h-4 animate-spin" />;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'contract', label: 'Contract Naming', icon: Code },
    { id: 'ens', label: 'ENS Domain', icon: Globe },
    { id: 'dao', label: 'DAO Structure', icon: Users },
    { id: 'schema', label: 'Schema Naming', icon: FileText },
    { id: 'service', label: 'Service Naming', icon: Server },
    { id: 'route', label: 'Route Naming', icon: Route },
    { id: 'config', label: 'Config Naming', icon: Settings },
    { id: 'database', label: 'Database Naming', icon: Database },
    { id: 'documentation', label: 'Documentation', icon: BookOpen }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          NIEM-Inspired DAO Registry Naming Standards
        </h1>
        <p className="text-gray-600">
          Comprehensive implementation of standardized naming conventions across all system components
        </p>
      </div>

      {/* Cache Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-500" />
            <span className="text-blue-800 font-medium">Naming Standards Cache</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-blue-600">
              Size: {cacheStats?.size || 0} | Keys: {cacheStats?.keys?.length || 0}
            </span>
            <button
              onClick={handleClearCache}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear Cache</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Naming Standards Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Contract Types</h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(constants.CONTRACT_TYPES).slice(0, 5).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Standard Subdomains</h3>
                <div className="space-y-1 text-sm">
                  {constants.STANDARD_SUBDOMAIN_TYPES.slice(0, 5).map((type, index) => (
                    <div key={index} className="text-gray-600">{type}</div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Naming Patterns</h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(constants.NAMING_PATTERNS).slice(0, 5).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key}:</span>
                      <span className="text-gray-600 font-mono text-xs">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Core Principles</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Hierarchical Structure: Follow NIEM domain-based organization</li>
                <li>• Semantic Clarity: Names should be self-documenting</li>
                <li>• Consistency: Uniform patterns across all components</li>
                <li>• Extensibility: Support for future additions and modifications</li>
                <li>• Interoperability: Compatible with industry standards</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Contract Naming Tab */}
      {activeTab === 'contract' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contract Naming</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Name
                </label>
                <input
                  type="text"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ExampleDAOGovernance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DAO Name (for generation)
                </label>
                <input
                  type="text"
                  value={daoName}
                  onChange={(e) => setDaoName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ExampleDAO"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleContractValidation}
                disabled={comprehensiveNaming.contract.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(comprehensiveNaming.contract.loading)}
                <Search className="w-4 h-4" />
                <span>Validate Contract</span>
              </button>
              
              <button
                onClick={handleContractGeneration}
                disabled={comprehensiveNaming.contract.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(comprehensiveNaming.contract.loading)}
                <Code className="w-4 h-4" />
                <span>Generate Contracts</span>
              </button>
            </div>

            {/* Results */}
            {results.contractValidation && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Contract Validation Result</h3>
                <div className="flex items-center space-x-2 mb-2">
                  {renderStatusIcon(results.contractValidation.isValid, results.contractValidation.warnings?.length > 0)}
                  <span className="text-sm">
                    {results.contractValidation.isValid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                {results.contractValidation.detectedType && (
                  <div className="text-sm text-gray-600">
                    <strong>Detected Type:</strong> {results.contractValidation.detectedType}
                  </div>
                )}
                {results.contractValidation.errors?.length > 0 && (
                  <div className="text-sm text-red-600 mt-2">
                    <strong>Errors:</strong> {results.contractValidation.errors.join(', ')}
                  </div>
                )}
                {results.contractValidation.warnings?.length > 0 && (
                  <div className="text-sm text-yellow-600 mt-2">
                    <strong>Warnings:</strong> {results.contractValidation.warnings.join(', ')}
                  </div>
                )}
              </div>
            )}

            {results.contractGeneration && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Generated Contract Names</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(results.contractGeneration).map(([type, name]) => (
                    <div key={type} className="flex justify-between">
                      <span className="font-medium capitalize">{type}:</span>
                      <span className="font-mono text-blue-600">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ENS Domain Tab */}
      {activeTab === 'ens' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ENS Domain Validation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example.eth"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleENSDomainValidation}
                disabled={comprehensiveNaming.ens.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(comprehensiveNaming.ens.loading)}
                <Search className="w-4 h-4" />
                <span>Validate Domain</span>
              </button>
              
              <button
                onClick={handleSubdomainGeneration}
                disabled={comprehensiveNaming.ens.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(comprehensiveNaming.ens.loading)}
                <Globe className="w-4 h-4" />
                <span>Generate Subdomains</span>
              </button>
            </div>

            {/* Results */}
            {results.ensValidation && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Validation Result</h3>
                <div className="flex items-center space-x-2 mb-2">
                  {renderStatusIcon(results.ensValidation.isValid, results.ensValidation.warnings?.length > 0)}
                  <span className="text-sm">
                    {results.ensValidation.isValid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                {results.ensValidation.errors?.length > 0 && (
                  <div className="text-sm text-red-600">
                    <strong>Errors:</strong> {results.ensValidation.errors.join(', ')}
                  </div>
                )}
                {results.ensValidation.warnings?.length > 0 && (
                  <div className="text-sm text-yellow-600">
                    <strong>Warnings:</strong> {results.ensValidation.warnings.join(', ')}
                  </div>
                )}
              </div>
            )}

            {results.subdomainGeneration && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Generated Subdomains</h3>
                <div className="space-y-1 text-sm">
                  {results.subdomainGeneration.map((subdomain, index) => (
                    <div key={index} className="font-mono text-blue-600">{subdomain}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DAO Structure Tab */}
      {activeTab === 'dao' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">DAO Structure Generation</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DAO Name
              </label>
              <input
                type="text"
                value={daoName}
                onChange={(e) => setDaoName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ExampleDAO"
              />
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleDAOStructureGeneration}
                disabled={comprehensiveNaming.dao.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(comprehensiveNaming.dao.loading)}
                <Users className="w-4 h-4" />
                <span>Generate DAO Structure</span>
              </button>
            </div>

            {/* Results */}
            {results.daoStructure && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Generated DAO Structure</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><strong>Name:</strong> {results.daoStructure.basic.name}</div>
                      <div><strong>Symbol:</strong> {results.daoStructure.basic.symbol}</div>
                      <div><strong>ENS Domain:</strong> {results.daoStructure.basic.ensDomain}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">ENS Subdomains</h4>
                    <div className="space-y-1 text-sm">
                      {results.daoStructure.ens.subdomains.map((subdomain, index) => (
                        <div key={index} className="font-mono text-blue-600">{subdomain}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Contract Names</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {Object.entries(results.daoStructure.contracts).slice(0, 6).map(([type, name]) => (
                        <div key={type} className="flex justify-between">
                          <span className="font-medium capitalize">{type}:</span>
                          <span className="font-mono text-blue-600">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schema Naming Tab */}
      {activeTab === 'schema' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schema Naming</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain
                </label>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="dao"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Component
                </label>
                <input
                  type="text"
                  value={componentInput}
                  onChange={(e) => setComponentInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="core"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleSchemaGeneration}
                disabled={comprehensiveNaming.schema.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(comprehensiveNaming.schema.loading)}
                <FileText className="w-4 h-4" />
                <span>Generate Schema Names</span>
              </button>
            </div>

            {/* Results */}
            {results.schemaGeneration && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Generated Schema Names</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>File Name:</strong> <span className="font-mono text-blue-600">{results.schemaGeneration.fileName}</span></div>
                  <div><strong>Schema ID:</strong> <span className="font-mono text-blue-600">{results.schemaGeneration.schemaId}</span></div>
                  <div><strong>Internal Name:</strong> <span className="font-mono text-blue-600">{results.schemaGeneration.internalName}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Service Naming Tab */}
      {activeTab === 'service' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Naming</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="core"
              />
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleServiceGeneration}
                disabled={comprehensiveNaming.service.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(comprehensiveNaming.service.loading)}
                <Server className="w-4 h-4" />
                <span>Generate Service Names</span>
              </button>
            </div>

            {/* Results */}
            {results.serviceGeneration && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Generated Service Names</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>File Name:</strong> <span className="font-mono text-blue-600">{results.serviceGeneration.fileName}</span></div>
                  <div><strong>Class Name:</strong> <span className="font-mono text-blue-600">{results.serviceGeneration.className}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Route Naming Tab */}
      {activeTab === 'route' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Route Naming</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain
                </label>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="core"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Component
                </label>
                <input
                  type="text"
                  value={componentInput}
                  onChange={(e) => setComponentInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="schemas"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleRouteGeneration}
                disabled={comprehensiveNaming.route.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(comprehensiveNaming.route.loading)}
                <Route className="w-4 h-4" />
                <span>Generate Route Names</span>
              </button>
            </div>

            {/* Results */}
            {results.routeGeneration && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Generated Route Names</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>File Name:</strong> <span className="font-mono text-blue-600">{results.routeGeneration.fileName}</span></div>
                  <div><strong>API Endpoint:</strong> <span className="font-mono text-blue-600">{results.routeGeneration.endpoint}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Config Naming Tab */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration Naming</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain
                </label>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="core"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Component
                </label>
                <input
                  type="text"
                  value={componentInput}
                  onChange={(e) => setComponentInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="validation"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleConfigGeneration}
                disabled={comprehensiveNaming.config.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(comprehensiveNaming.config.loading)}
                <Settings className="w-4 h-4" />
                <span>Generate Config Names</span>
              </button>
            </div>

            {/* Results */}
            {results.configGeneration && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Generated Config Names</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Environment Variable:</strong> <span className="font-mono text-blue-600">{results.configGeneration.envVar}</span></div>
                  <div><strong>Config File:</strong> <span className="font-mono text-blue-600">{results.configGeneration.configFile}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Database Naming Tab */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Naming</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain
                </label>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="core"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Component
                </label>
                <input
                  type="text"
                  value={componentInput}
                  onChange={(e) => setComponentInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="daos"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleDatabaseGeneration}
                disabled={comprehensiveNaming.database.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(comprehensiveNaming.database.loading)}
                <Database className="w-4 h-4" />
                <span>Generate Database Names</span>
              </button>
            </div>

            {/* Results */}
            {results.databaseGeneration && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Generated Database Names</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Table Name:</strong> <span className="font-mono text-blue-600">{results.databaseGeneration.tableName}</span></div>
                  <div><strong>Column Name:</strong> <span className="font-mono text-blue-600">{results.databaseGeneration.columnName}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documentation Naming Tab */}
      {activeTab === 'documentation' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Documentation Naming</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain
                </label>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="core"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Component
                </label>
                <input
                  type="text"
                  value={componentInput}
                  onChange={(e) => setComponentInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="schema"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleDocumentationGeneration}
                disabled={comprehensiveNaming.documentation.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(comprehensiveNaming.documentation.loading)}
                <BookOpen className="w-4 h-4" />
                <span>Generate Documentation Names</span>
              </button>
            </div>

            {/* Results */}
            {results.documentationGeneration && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Generated Documentation Names</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Documentation File:</strong> <span className="font-mono text-blue-600">{results.documentationGeneration.docFile}</span></div>
                  <div><strong>Documentation Tag:</strong> <span className="font-mono text-blue-600">{results.documentationGeneration.docTag}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {Object.values(comprehensiveNaming).some(module => module.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            {Object.values(comprehensiveNaming).find(module => module.error)?.error}
          </p>
        </div>
      )}
    </div>
  );
};

export default NamingStandardsDemo;
