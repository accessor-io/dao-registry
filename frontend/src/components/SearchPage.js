import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Shield, Users, TrendingUp } from 'lucide-react';
import axios from 'axios';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    chainId: '',
    status: '',
    verified: null,
    governanceType: '',
    tags: []
  });

  useEffect(() => {
    if (searchQuery.length >= 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, filters]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: searchQuery,
        ...filters
      };
      
      const response = await axios.get('/api/v1/daos', { params });
      setSearchResults(response.data.daos || []);
    } catch (err) {
      setError('Failed to perform search');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      chainId: '',
      status: '',
      verified: null,
      governanceType: '',
      tags: []
    });
  };

  const getChainName = (chainId) => {
    const chains = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      8453: 'Base',
      1337: 'Local'
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { color: 'bg-green-100 text-green-800', icon: Shield },
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: Shield },
      'Suspended': { color: 'bg-red-100 text-red-800', icon: Shield },
      'Inactive': { color: 'bg-gray-100 text-gray-800', icon: Shield }
    };
    
    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">Search DAOs</h1>
        <p className="text-lg text-secondary-600">
          Find specific DAOs using advanced search and filtering options
        </p>
      </div>

      {/* Search Bar */}
      <div className="card mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 text-lg"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h2>
          <button
            onClick={clearFilters}
            className="text-sm text-secondary-600 hover:text-primary-600"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Blockchain Network
            </label>
            <select
              value={filters.chainId}
              onChange={(e) => handleFilterChange('chainId', e.target.value)}
              className="input-field"
            >
              <option value="">All Networks</option>
              <option value="1">Ethereum</option>
              <option value="137">Polygon</option>
              <option value="42161">Arbitrum</option>
              <option value="10">Optimism</option>
              <option value="8453">Base</option>
              <option value="1337">Local</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Verification
            </label>
            <select
              value={filters.verified === null ? '' : filters.verified.toString()}
              onChange={(e) => handleFilterChange('verified', e.target.value === '' ? null : e.target.value === 'true')}
              className="input-field"
            >
              <option value="">All DAOs</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Governance Type
            </label>
            <select
              value={filters.governanceType}
              onChange={(e) => handleFilterChange('governanceType', e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="Token-based">Token-based</option>
              <option value="Reputation-based">Reputation-based</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Quadratic">Quadratic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-secondary-900">
            Search Results
          </h2>
          {searchResults.length > 0 && (
            <p className="text-secondary-600">
              Found {searchResults.length} DAO{searchResults.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Searching...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">Search Error</h3>
          <p className="text-secondary-600">{error}</p>
          <button 
            onClick={performSearch}
            className="btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && searchQuery.length >= 2 && searchResults.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No Results Found</h3>
          <p className="text-secondary-600">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}

      {/* Search Results Grid */}
      {!loading && !error && searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((dao) => (
            <Link 
              key={dao.id} 
              to={`/dao/${dao.id}`}
              className="card hover:shadow-lg transition-shadow duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                    {dao.name}
                  </h3>
                  <p className="text-sm text-secondary-500">{dao.symbol}</p>
                </div>
                {dao.verified && (
                  <Shield className="w-5 h-5 text-green-600" />
                )}
              </div>
              
              <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                {dao.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-500">Chain:</span>
                  <span className="font-medium">{getChainName(dao.chainId)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-500">Status:</span>
                  {getStatusBadge(dao.status)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-500">Governance:</span>
                  <span className="font-medium">{dao.governanceType}</span>
                </div>
              </div>
              
              {dao.analytics && (
                <div className="border-t border-secondary-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-secondary-900">{dao.analytics.totalMembers}</div>
                      <div className="text-secondary-500">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-secondary-900">{dao.analytics.totalProposals}</div>
                      <div className="text-secondary-500">Proposals</div>
                    </div>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Search Tips */}
      {searchQuery.length < 2 && (
        <div className="card mt-8">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Search Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-secondary-600">
            <div>
              <h4 className="font-medium text-secondary-900 mb-2">Search by:</h4>
              <ul className="space-y-1">
                <li>• DAO name or symbol</li>
                <li>• Description keywords</li>
                <li>• Governance type</li>
                <li>• Tags or categories</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-secondary-900 mb-2">Use filters to:</h4>
              <ul className="space-y-1">
                <li>• Filter by blockchain network</li>
                <li>• Show only verified DAOs</li>
                <li>• Filter by status</li>
                <li>• Find specific governance types</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage; 