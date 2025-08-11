import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Shield, Users, TrendingUp, Calendar, Vote, Globe, Database, Activity, Award } from 'lucide-react';
import axios from 'axios';

const DAODetail = () => {
  const { id } = useParams();
  const [dao, setDao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDAO();
  }, [id]);

  const fetchDAO = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/daos/${id}`);
      setDao(response.data);
    } catch (err) {
      setError('Failed to fetch DAO details');
      console.error('Error fetching DAO:', err);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { color: 'bg-green-100 text-green-800 border-green-200', icon: Shield },
      'Pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Shield },
      'Suspended': { color: 'bg-red-100 text-red-800 border-red-200', icon: Shield },
      'Inactive': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Shield }
    };
    
    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="w-4 h-4 mr-2" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading DAO details...</p>
        </div>
      </div>
    );
  }

  if (error || !dao) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading DAO</h3>
          <p className="text-gray-600 mb-6">{error || 'DAO not found'}</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Enhanced Back Button */}
      <Link 
        to="/" 
        className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Search
      </Link>

      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {dao.name}
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  {dao.symbol && `${dao.symbol} • `}{getChainName(dao.chainId)}
                </p>
              </div>
            </div>
            
            {dao.verified && (
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">Verified DAO</span>
              </div>
            )}
            
            {getStatusBadge(dao.status)}
          </div>
          
          <div className="flex flex-col items-end gap-3">
            {dao.website && (
              <a
                href={dao.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Globe className="w-4 h-4 mr-2" />
                Visit Website
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            )}
          </div>
        </div>

        {dao.description && (
          <div className="prose max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed">
              {dao.description}
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {dao.analytics?.totalMembers || dao.memberCount || 0}
          </h3>
          <p className="text-gray-600">Total Members</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Vote className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {dao.analytics?.totalProposals || 0}
          </h3>
          <p className="text-gray-600">Total Proposals</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {dao.analytics?.activeProposals || 0}
          </h3>
          <p className="text-gray-600">Active Proposals</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {dao.analytics?.participationRate || 0}%
          </h3>
          <p className="text-gray-600">Participation Rate</p>
        </div>
      </div>

      {/* Enhanced Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Governance Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Vote className="w-5 h-5 mr-2 text-blue-600" />
            Governance Details
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Governance Type</span>
              <span className="font-medium text-gray-900">{dao.governanceType || 'Unknown'}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Voting Power</span>
              <span className="font-medium text-gray-900">{dao.votingPower || 'Token-based'}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Quorum</span>
              <span className="font-medium text-gray-900">{dao.quorum || 'Not specified'}</span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Execution Delay</span>
              <span className="font-medium text-gray-900">{dao.executionDelay || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Technical Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-purple-600" />
            Technical Details
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Contract Address</span>
              <span className="font-mono text-sm text-gray-900 truncate max-w-xs">
                {dao.contractAddress || 'Not available'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Blockchain</span>
              <span className="font-medium text-gray-900">{getChainName(dao.chainId)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Registration Date</span>
              <span className="font-medium text-gray-900">
                {dao.registrationDate ? new Date(dao.registrationDate).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium text-gray-900">
                {dao.lastUpdated ? new Date(dao.lastUpdated).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tags Section */}
      {dao.tags && dao.tags.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags & Categories</h2>
          <div className="flex flex-wrap gap-2">
            {dao.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Recent Activity */}
      {dao.recentActivity && dao.recentActivity.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Recent Activity
          </h2>
          
          <div className="space-y-4">
            {dao.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center py-3 border-b border-gray-100 last:border-b-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                <div className="flex-1">
                  <p className="text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DAODetail; 