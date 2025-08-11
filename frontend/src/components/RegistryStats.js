import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Shield, Database, Activity, Globe, Award, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RegistryStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/stats?timeRange=${timeRange}`);
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch registry statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
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
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registry statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <BarChart3 className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Statistics</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Registry Statistics
          </h1>
          <BarChart3 className="w-8 h-8 text-purple-600 ml-3" />
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
          Comprehensive analytics and insights about the DAO registry ecosystem
        </p>
        
        {/* Help Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Understanding Statistics?</h3>
                <p className="text-sm text-green-700">Learn how to interpret metrics and analyze trends</p>
              </div>
            </div>
            <Link 
              to="/docs" 
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Time Range</h2>
            <div className="flex space-x-2">
              {[
                { value: '24h', label: '24 Hours' },
                { value: '7d', label: '7 Days' },
                { value: '30d', label: '30 Days' },
                { value: '90d', label: '90 Days' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    timeRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Overview Stats */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {formatNumber(stats?.totalDAOs || 0)}
            </h3>
            <p className="text-gray-600">Total DAOs</p>
            <div className="mt-2 text-sm text-green-600">
              +{stats?.newDAOsThisPeriod || 0} this period
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {formatNumber(stats?.totalMembers || 0)}
            </h3>
            <p className="text-gray-600">Total Members</p>
            <div className="mt-2 text-sm text-green-600">
              +{stats?.newMembersThisPeriod || 0} this period
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {formatNumber(stats?.totalProposals || 0)}
            </h3>
            <p className="text-gray-600">Total Proposals</p>
            <div className="mt-2 text-sm text-green-600">
              +{stats?.newProposalsThisPeriod || 0} this period
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {formatNumber(stats?.verifiedDAOs || 0)}
            </h3>
            <p className="text-gray-600">Verified DAOs</p>
            <div className="mt-2 text-sm text-blue-600">
              {((stats?.verifiedDAOs / stats?.totalDAOs) * 100 || 0).toFixed(1)}% of total
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Detailed Stats */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chain Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-blue-600" />
              Chain Distribution
            </h2>
            
            <div className="space-y-4">
              {stats?.chainDistribution?.map((chain) => (
                <div key={chain.chainId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">{getChainName(chain.chainId)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(chain.count / stats.totalDAOs) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {chain.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              Status Distribution
            </h2>
            
            <div className="space-y-4">
              {stats?.statusDistribution?.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      status.status === 'Active' ? 'bg-green-600' :
                      status.status === 'Pending' ? 'bg-yellow-600' :
                      status.status === 'Suspended' ? 'bg-red-600' : 'bg-gray-600'
                    }`}></div>
                    <span className="text-gray-700">{status.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          status.status === 'Active' ? 'bg-green-600' :
                          status.status === 'Pending' ? 'bg-yellow-600' :
                          status.status === 'Suspended' ? 'bg-red-600' : 'bg-gray-600'
                        }`}
                        style={{ width: `${(status.count / stats.totalDAOs) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {status.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Growth Metrics */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Growth Metrics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats?.growthRate?.daoGrowth || 0}%
              </div>
              <p className="text-gray-600">DAO Growth Rate</p>
              <div className="mt-2 text-sm text-green-600">
                +{stats?.growthRate?.newDAOs || 0} new DAOs
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats?.growthRate?.memberGrowth || 0}%
              </div>
              <p className="text-gray-600">Member Growth Rate</p>
              <div className="mt-2 text-sm text-green-600">
                +{stats?.growthRate?.newMembers || 0} new members
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats?.growthRate?.proposalGrowth || 0}%
              </div>
              <p className="text-gray-600">Proposal Growth Rate</p>
              <div className="mt-2 text-sm text-green-600">
                +{stats?.growthRate?.newProposals || 0} new proposals
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Top DAOs */}
      {stats?.topDAOs && stats.topDAOs.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Top DAOs by Activity</h2>
            
            <div className="space-y-4">
              {stats.topDAOs.map((dao, index) => (
                <div key={dao.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center mr-4 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{dao.name}</h3>
                      <p className="text-sm text-gray-600">{getChainName(dao.chainId)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{dao.activityScore}</div>
                    <div className="text-sm text-gray-600">Activity Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistryStats; 