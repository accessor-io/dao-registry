import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Shield, Activity, BarChart3, Globe, Target } from 'lucide-react';
import axios from 'axios';

const RegistryStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/daos/stats');
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch registry statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <BarChart3 className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-secondary-900 mb-2">Error Loading Statistics</h3>
        <p className="text-secondary-600">{error || 'Statistics not available'}</p>
        <button 
          onClick={fetchStats}
          className="btn-primary mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-secondary-900 mb-4">Registry Statistics</h1>
        <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            analytics and insights about DAOs across the registry
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-secondary-900 mb-2">
            {stats.totalDAOs || 0}
          </h3>
          <p className="text-secondary-600">Total DAOs</p>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-secondary-900 mb-2">
            {stats.verifiedDAOs || 0}
          </h3>
          <p className="text-secondary-600">Verified DAOs</p>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-secondary-900 mb-2">
            {stats.activeDAOs || 0}
          </h3>
          <p className="text-secondary-600">Active DAOs</p>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
            <Globe className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-secondary-900 mb-2">
            {stats.supportedNetworks || 0}
          </h3>
          <p className="text-secondary-600">Supported Networks</p>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Network Distribution */}
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            DAOs by Network
          </h2>
          {stats.networkDistribution ? (
            <div className="space-y-4">
              {Object.entries(stats.networkDistribution).map(([chainId, count]) => (
                <div key={chainId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary-600 rounded-full mr-3"></div>
                    <span className="font-medium">{getChainName(parseInt(chainId))}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-secondary-900 mr-2">{count}</span>
                    <span className="text-sm text-secondary-500">
                      ({((count / stats.totalDAOs) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500">No network distribution data available</p>
          )}
        </div>

        {/* Governance Types */}
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Governance Types
          </h2>
          {stats.governanceTypes ? (
            <div className="space-y-4">
              {Object.entries(stats.governanceTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                    <span className="font-medium">{type}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-secondary-900 mr-2">{count}</span>
                    <span className="text-sm text-secondary-500">
                      ({((count / stats.totalDAOs) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500">No governance type data available</p>
          )}
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Status Distribution
          </h2>
          {stats.statusDistribution ? (
            <div className="space-y-4">
              {Object.entries(stats.statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      status === 'Active' ? 'bg-green-600' :
                      status === 'Pending' ? 'bg-yellow-600' :
                      status === 'Suspended' ? 'bg-red-600' :
                      'bg-gray-600'
                    }`}></div>
                    <span className="font-medium">{status}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-secondary-900 mr-2">{count}</span>
                    <span className="text-sm text-secondary-500">
                      ({((count / stats.totalDAOs) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500">No status distribution data available</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Recent Activity
          </h2>
          {stats.recentActivity ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">New DAOs (30 days):</span>
                <span className="font-semibold text-secondary-900">{stats.recentActivity.newDAOs || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Updated DAOs (30 days):</span>
                <span className="font-semibold text-secondary-900">{stats.recentActivity.updatedDAOs || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Total Proposals:</span>
                <span className="font-semibold text-secondary-900">{stats.recentActivity.totalProposals || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Active Proposals:</span>
                <span className="font-semibold text-secondary-900">{stats.recentActivity.activeProposals || 0}</span>
              </div>
            </div>
          ) : (
            <p className="text-secondary-500">No recent activity data available</p>
          )}
        </div>
      </div>

      {/* Additional Metrics */}
      {stats.additionalMetrics && (
        <div className="card mt-8">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">Additional Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-2">
                {stats.additionalMetrics.averageMembers || 0}
              </div>
              <div className="text-secondary-600">Average Members per DAO</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-2">
                {stats.additionalMetrics.averageProposals || 0}
              </div>
              <div className="text-secondary-600">Average Proposals per DAO</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-2">
                {stats.additionalMetrics.totalTreasuryValue || 0} ETH
              </div>
              <div className="text-secondary-600">Total Treasury Value</div>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center mt-8 text-secondary-500 text-sm">
        <p>Last updated: {new Date().toLocaleString()}</p>
        <p className="mt-2">
          Statistics are updated in real-time from blockchain data
        </p>
      </div>
    </div>
  );
};

export default RegistryStats; 