/**
 * Naming Toolkit Demo Component
 * Demonstrates the integration of the naming convention toolkit with the frontend
 */

import React, { useState, useEffect } from 'react';
import { 
  useNamingToolkit, 
  useENSDomainValidation, 
  useContractNaming, 
  useDAOGeneration 
} from '../hooks/useNamingToolkit';
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
  ExternalLink
} from 'lucide-react';

const NamingToolkitDemo = () => {
  const [activeTab, setActiveTab] = useState('ens');
  const [daoName, setDaoName] = useState('TestDAO');
  const [domain, setDomain] = useState('testdao.eth');
  const [contractName, setContractName] = useState('TestDAOGovernance');
  const [results, setResults] = useState({});

  // Hooks
  const ensValidation = useENSDomainValidation();
  const contractNaming = useContractNaming();
  const daoGeneration = useDAOGeneration();
  const { clearCache, getCacheStats } = useNamingToolkit();

  // Cache stats
  const [cacheStats, setCacheStats] = useState(null);

  useEffect(() => {
    updateCacheStats();
  }, [updateCacheStats]);

  const updateCacheStats = () => {
    const stats = getCacheStats();
    setCacheStats(stats);
  };

  const handleENSDomainValidation = async () => {
    try {
      const result = await ensValidation.validateENSDomain(domain, 'primary');
      setResults(prev => ({ ...prev, ensValidation: result }));
    } catch (error) {
      console.error('ENS validation failed:', error);
    }
  };

  const handleDomainAvailability = async () => {
    try {
      const result = await ensValidation.checkDomainAvailability(domain, 'mainnet');
      setResults(prev => ({ ...prev, domainAvailability: result }));
    } catch (error) {
      console.error('Domain availability check failed:', error);
    }
  };

  const handleDomainSuggestions = async () => {
    try {
      const baseName = domain.replace('.eth', '');
      const result = await ensValidation.getDomainSuggestions(baseName, 'mainnet');
      setResults(prev => ({ ...prev, domainSuggestions: result }));
    } catch (error) {
      console.error('Domain suggestions failed:', error);
    }
  };

  const handleContractValidation = async () => {
    try {
      const result = await contractNaming.validateContractName(contractName);
      setResults(prev => ({ ...prev, contractValidation: result }));
    } catch (error) {
      console.error('Contract validation failed:', error);
    }
  };

  const handleContractGeneration = async () => {
    try {
      const result = await contractNaming.generateContractNames(daoName, {
        includeInterfaces: true,
        includeImplementations: true,
        includeVersions: true
      });
      setResults(prev => ({ ...prev, contractGeneration: result }));
    } catch (error) {
      console.error('Contract generation failed:', error);
    }
  };

  const handleDAOGeneration = async () => {
    try {
      const result = await daoGeneration.generateDAOStructure(daoName, {
        symbol: daoName.substring(0, 3).toUpperCase(),
        description: `${daoName} DAO`,
        tags: ['DAO', 'Governance']
      });
      setResults(prev => ({ ...prev, daoGeneration: result }));
    } catch (error) {
      console.error('DAO generation failed:', error);
    }
  };

  const handleClearCache = () => {
    clearCache();
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          DAO Registry Naming Convention Toolkit
        </h1>
        <p className="text-gray-600">
          Interactive demonstration of the naming convention toolkit integration with the frontend
        </p>
      </div>

      {/* Cache Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-500" />
            <span className="text-blue-800 font-medium">Cache Statistics</span>
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
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'ens', label: 'ENS Domain', icon: Globe },
            { id: 'contract', label: 'Contract Naming', icon: Code },
            { id: 'dao', label: 'DAO Generation', icon: Users }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
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
                disabled={ensValidation.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(ensValidation.loading)}
                <Search className="w-4 h-4" />
                <span>Validate Domain</span>
              </button>
              
              <button
                onClick={handleDomainAvailability}
                disabled={ensValidation.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(ensValidation.loading)}
                <CheckCircle className="w-4 h-4" />
                <span>Check Availability</span>
              </button>
              
              <button
                onClick={handleDomainSuggestions}
                disabled={ensValidation.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(ensValidation.loading)}
                <ExternalLink className="w-4 h-4" />
                <span>Get Suggestions</span>
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

            {results.domainAvailability && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Availability Result</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Available:</span> 
                    <span className={`ml-2 ${results.domainAvailability.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {results.domainAvailability.isAvailable ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Can Register:</span> 
                    <span className={`ml-2 ${results.domainAvailability.canRegister ? 'text-green-600' : 'text-red-600'}`}>
                      {results.domainAvailability.canRegister ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {results.domainSuggestions && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Domain Suggestions</h3>
                <div className="space-y-2">
                  {results.domainSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-mono">{suggestion.domain}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        suggestion.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {suggestion.isAvailable ? 'Available' : 'Registered'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                disabled={contractNaming.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(contractNaming.loading)}
                <Search className="w-4 h-4" />
                <span>Validate Contract</span>
              </button>
              
              <button
                onClick={handleContractGeneration}
                disabled={contractNaming.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(contractNaming.loading)}
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

      {/* DAO Generation Tab */}
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
                onClick={handleDAOGeneration}
                disabled={daoGeneration.loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {renderLoadingSpinner(daoGeneration.loading)}
                <Users className="w-4 h-4" />
                <span>Generate DAO Structure</span>
              </button>
            </div>

            {/* Results */}
            {results.daoGeneration && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Generated DAO Structure</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><strong>Name:</strong> {results.daoGeneration.basic.name}</div>
                      <div><strong>Symbol:</strong> {results.daoGeneration.basic.symbol}</div>
                      <div><strong>ENS Domain:</strong> {results.daoGeneration.basic.ensDomain}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">ENS Subdomains</h4>
                    <div className="space-y-1 text-sm">
                      {results.daoGeneration.ens.subdomains.map((subdomain, index) => (
                        <div key={index} className="font-mono text-blue-600">{subdomain}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Contract Names</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {Object.entries(results.daoGeneration.contracts).slice(0, 6).map(([type, name]) => (
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

      {/* Error Display */}
      {(ensValidation.error || contractNaming.error || daoGeneration.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            {ensValidation.error || contractNaming.error || daoGeneration.error}
          </p>
        </div>
      )}
    </div>
  );
};

export default NamingToolkitDemo;


