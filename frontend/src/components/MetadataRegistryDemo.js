import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Edit, 
  BarChart3, 
  Globe, 
  Code, 
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import useMetadataRegistry from '../hooks/useMetadataRegistry';

const MetadataRegistryDemo = () => {
  const {
    loading,
    error,
    data,
    getSchemas,
    registerDAO,
    registerContract,
    registerENS,
    getStatistics,
    registerCompleteDAO,
    bulkSearch,
    validateMetadata,
    clearError
  } = useMetadataRegistry();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [registrationType, setRegistrationType] = useState('dao');
  const [formData, setFormData] = useState({});
  const [statistics] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          getSchemas(),
          getStatistics()
        ]);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };

    loadInitialData();
  }, [getSchemas, getStatistics]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await bulkSearch(searchQuery, { limit: 20 });
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // Handle registration
  const handleRegistration = async () => {
    try {
      const validation = validateMetadata(registrationType, formData);
      if (!validation.isValid) {
        alert(`Validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      let result;
      switch (registrationType) {
        case 'dao':
          result = await registerDAO(formData);
          break;
        case 'contract':
          result = await registerContract(formData);
          break;
        case 'ens':
          result = await registerENS(formData);
          break;
        default:
          throw new Error('Invalid registration type');
      }

      alert(`Registration successful: ${result.message}`);
      setShowRegistrationForm(false);
      setFormData({});
      
      // Refresh statistics
      await getStatistics();
    } catch (err) {
      alert(`Registration failed: ${err.message}`);
    }
  };

  // Handle complete DAO registration
  const handleCompleteDAORegistration = async () => {
    try {
      const completeDAOData = {
        dao: {
          name: formData.daoName,
          ens: formData.ens,
          description: formData.description,
          governance: formData.governance || {},
          treasury: formData.treasury || {}
        },
        ens: {
          domain: formData.ens,
          owner: formData.owner,
          textRecords: formData.textRecords || {}
        },
        contracts: formData.contracts || []
      };

      const result = await registerCompleteDAO(completeDAOData);
      alert(`Complete DAO registration: ${result.message}`);
      setShowRegistrationForm(false);
      setFormData({});
      
      // Refresh statistics
      await getStatistics();
    } catch (err) {
      alert(`Complete DAO registration failed: ${err.message}`);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'register', label: 'Register', icon: Plus },
    { id: 'manage', label: 'Manage', icon: Edit },
    { id: 'schemas', label: 'Schemas', icon: Database }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total DAOs</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics?.byType?.dao || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Code className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Contracts</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics?.byType?.contract || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Globe className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total ENS Domains</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics?.byType?.ens || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-sm text-gray-700">DAO "ExampleDAO" registered</span>
            </div>
            <span className="text-xs text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-sm text-gray-700">Contract "GovernanceV1" registered</span>
            </div>
            <span className="text-xs text-gray-500">5 minutes ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-sm text-gray-700">ENS "example.eth" registered</span>
            </div>
            <span className="text-xs text-gray-500">10 minutes ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Metadata Registry</h3>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search for DAOs, contracts, or ENS domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="dao">DAOs</option>
            <option value="contract">Contracts</option>
            <option value="ens">ENS Domains</option>
          </select>
        </div>
      </div>

      {searchResults && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Search Results ({searchResults.total} found)
          </h3>
          
          <div className="space-y-4">
            {searchResults.results.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {item.type === 'dao' && <Users className="h-5 w-5 text-blue-600 mr-3" />}
                    {item.type === 'contract' && <Code className="h-5 w-5 text-green-600 mr-3" />}
                    {item.type === 'ens' && <Globe className="h-5 w-5 text-purple-600 mr-3" />}
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        {item.type.toUpperCase()} • {item.ens || item.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Score: {(item.score * 100).toFixed(0)}%
                    </span>
                    <button className="text-blue-600 hover:text-blue-800">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderRegistration = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Register New Metadata</h3>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setRegistrationType('dao')}
            className={`px-4 py-2 rounded-md ${
              registrationType === 'dao' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            DAO
          </button>
          <button
            onClick={() => setRegistrationType('contract')}
            className={`px-4 py-2 rounded-md ${
              registrationType === 'contract' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Code className="h-4 w-4 inline mr-2" />
            Contract
          </button>
          <button
            onClick={() => setRegistrationType('ens')}
            className={`px-4 py-2 rounded-md ${
              registrationType === 'ens' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Globe className="h-4 w-4 inline mr-2" />
            ENS
          </button>
          <button
            onClick={() => setRegistrationType('complete')}
            className={`px-4 py-2 rounded-md ${
              registrationType === 'complete' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Database className="h-4 w-4 inline mr-2" />
            Complete DAO
          </button>
        </div>

        {registrationType === 'dao' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DAO Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter DAO name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ENS Domain</label>
              <input
                type="text"
                value={formData.ens || ''}
                onChange={(e) => setFormData({...formData, ens: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example.eth"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter DAO description"
              />
            </div>
          </div>
        )}

        {registrationType === 'contract' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter contract name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
              <select
                value={formData.type || ''}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                <option value="governance">Governance</option>
                <option value="treasury">Treasury</option>
                <option value="token">Token</option>
                <option value="voting">Voting</option>
                <option value="execution">Execution</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
              />
            </div>
          </div>
        )}

        {registrationType === 'ens' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ENS Domain</label>
              <input
                type="text"
                value={formData.domain || ''}
                onChange={(e) => setFormData({...formData, domain: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example.eth"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Address</label>
              <input
                type="text"
                value={formData.owner || ''}
                onChange={(e) => setFormData({...formData, owner: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
              />
            </div>
          </div>
        )}

        {registrationType === 'complete' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DAO Name</label>
                <input
                  type="text"
                  value={formData.daoName || ''}
                  onChange={(e) => setFormData({...formData, daoName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter DAO name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ENS Domain</label>
                <input
                  type="text"
                  value={formData.ens || ''}
                  onChange={(e) => setFormData({...formData, ens: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example.eth"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter DAO description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Address</label>
              <input
                type="text"
                value={formData.owner || ''}
                onChange={(e) => setFormData({...formData, owner: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
              />
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-6">
          <button
            onClick={registrationType === 'complete' ? handleCompleteDAORegistration : handleRegistration}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Register {registrationType === 'complete' ? 'Complete DAO' : registrationType.toUpperCase()}
          </button>
          <button
            onClick={() => setFormData({})}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Clear Form
          </button>
        </div>
      </div>
    </div>
  );

  const renderManage = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Metadata</h3>
        <p className="text-gray-600">Metadata management features will be available here.</p>
      </div>
    </div>
  );

  const renderSchemas = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata Schemas</h3>
        
        {data?.schemas && (
          <div className="space-y-4">
            {Object.entries(data.schemas.schemas).map(([type, schema]) => (
              <div key={type} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 capitalize">{type} Schema</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <pre className="text-sm text-gray-700 overflow-x-auto">
                    {JSON.stringify(schema, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Metadata Registry
        </h1>
        <p className="text-gray-600">
          Comprehensive metadata management for DAOs, contracts, and ENS domains
        </p>
      </div>

      {/* Status Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            {data?.health ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span className="text-sm font-medium">
              {data?.health ? 'Registry Online' : 'Registry Offline'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Total: {statistics?.total || 0} items
            </span>
            <button
              onClick={getStatistics}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'search' && renderSearch()}
        {activeTab === 'register' && renderRegistration()}
        {activeTab === 'manage' && renderManage()}
        {activeTab === 'schemas' && renderSchemas()}
      </div>
    </div>
  );
};

export default MetadataRegistryDemo;


