import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ExternalLink, Shield, Users, TrendingUp } from 'lucide-react';
import axios from 'axios';

const DAOList = () => {
  const [daos, setDaos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    chainId: '',
    status: '',
    verified: null
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchDAOs();
  }, [filters, pagination.page]);

  const fetchDAOs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await axios.get('/api/v1/daos', { params });
      setDaos(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }));
    } catch (err) {
      setError('Failed to fetch DAOs');
      console.error('Error fetching DAOs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
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

  if (loading && daos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading DAOs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Shield className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-secondary-900 mb-2">Error Loading DAOs</h3>
        <p className="text-secondary-600">{error}</p>
        <button 
          onClick={fetchDAOs}
          className="btn-primary mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-secondary-900 mb-4">
          Discover DAOs
        </h1>
        <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
          Explore decentralized autonomous organizations across multiple blockchain networks. 
          Find governance structures, voting mechanisms, and community initiatives.
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search DAOs..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filters.chainId}
              onChange={(e) => handleFilterChange('chainId', e.target.value)}
              className="input-field"
            >
              <option value="">All Chains</option>
              <option value="1">Ethereum</option>
              <option value="137">Polygon</option>
              <option value="42161">Arbitrum</option>
              <option value="10">Optimism</option>
              <option value="8453">Base</option>
              <option value="1337">Local</option>
            </select>
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
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-secondary-600">
          Showing {daos.length} of {pagination.total} DAOs
        </p>
        {pagination.total > 0 && (
          <div className="text-sm text-secondary-500">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        )}
      </div>

      {/* DAO Grid */}
      {daos.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No DAOs Found</h3>
          <p className="text-secondary-600">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {daos.map((dao) => (
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-secondary-500 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === pagination.page
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-500 bg-white border border-secondary-300 hover:bg-secondary-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-secondary-500 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default DAOList; 