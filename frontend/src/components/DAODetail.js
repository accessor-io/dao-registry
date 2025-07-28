import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Shield, Users, TrendingUp, Calendar, Vote } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading DAO details...</p>
        </div>
      </div>
    );
  }

  if (error || !dao) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Shield className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-secondary-900 mb-2">Error Loading DAO</h3>
        <p className="text-secondary-600">{error || 'DAO not found'}</p>
        <Link to="/" className="btn-primary mt-4 inline-block">
          Back to DAOs
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center text-secondary-600 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to DAOs
      </Link>

      {/* Header */}
      <div className="card mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-secondary-900">{dao.name}</h1>
              {dao.verified && (
                <Shield className="w-6 h-6 text-green-600" title="Verified DAO" />
              )}
            </div>
            <p className="text-lg text-secondary-600 mb-4">{dao.symbol}</p>
            <p className="text-secondary-700">{dao.description}</p>
          </div>
          {dao.website && (
            <a
              href={dao.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Website
            </a>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{getChainName(dao.chainId)}</div>
            <div className="text-sm text-secondary-500">Network</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{dao.status}</div>
            <div className="text-sm text-secondary-500">Status</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{dao.governanceType}</div>
            <div className="text-sm text-secondary-500">Governance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{dao.analytics?.totalMembers || 0}</div>
            <div className="text-sm text-secondary-500">Members</div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Governance Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
            <Vote className="w-5 h-5 mr-2" />
            Governance
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-secondary-600">Type:</span>
              <span className="font-medium">{dao.governanceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Voting Period:</span>
              <span className="font-medium">{dao.votingPeriod} blocks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Quorum:</span>
              <span className="font-medium">{dao.quorum} votes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Proposal Threshold:</span>
              <span className="font-medium">{dao.proposalThreshold} tokens</span>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Analytics
          </h2>
          {dao.analytics ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary-600">Total Proposals:</span>
                <span className="font-medium">{dao.analytics.totalProposals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Active Proposals:</span>
                <span className="font-medium">{dao.analytics.activeProposals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Total Members:</span>
                <span className="font-medium">{dao.analytics.totalMembers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Active Members:</span>
                <span className="font-medium">{dao.analytics.activeMembers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Treasury Value:</span>
                <span className="font-medium">{dao.analytics.treasuryValue} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Total Voting Power:</span>
                <span className="font-medium">{dao.analytics.totalVotingPower}</span>
              </div>
            </div>
          ) : (
            <p className="text-secondary-500">No analytics data available</p>
          )}
        </div>

        {/* Contract Addresses */}
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Contract Addresses</h2>
          <div className="space-y-3">
            <div>
              <span className="text-secondary-600 text-sm">Main Contract:</span>
              <div className="font-mono text-sm bg-secondary-100 p-2 rounded mt-1 break-all">
                {dao.contractAddress}
              </div>
            </div>
            <div>
              <span className="text-secondary-600 text-sm">Token Contract:</span>
              <div className="font-mono text-sm bg-secondary-100 p-2 rounded mt-1 break-all">
                {dao.tokenAddress}
              </div>
            </div>
            <div>
              <span className="text-secondary-600 text-sm">Treasury Contract:</span>
              <div className="font-mono text-sm bg-secondary-100 p-2 rounded mt-1 break-all">
                {dao.treasuryAddress}
              </div>
            </div>
            <div>
              <span className="text-secondary-600 text-sm">Governance Contract:</span>
              <div className="font-mono text-sm bg-secondary-100 p-2 rounded mt-1 break-all">
                {dao.governanceAddress}
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Social Links</h2>
          {dao.socialLinks ? (
            <div className="space-y-3">
              {dao.socialLinks.twitter && (
                <a
                  href={dao.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-secondary-600 hover:text-primary-600"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Twitter
                </a>
              )}
              {dao.socialLinks.discord && (
                <a
                  href={dao.socialLinks.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-secondary-600 hover:text-primary-600"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Discord
                </a>
              )}
              {dao.socialLinks.telegram && (
                <a
                  href={dao.socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-secondary-600 hover:text-primary-600"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Telegram
                </a>
              )}
              {dao.socialLinks.github && (
                <a
                  href={dao.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-secondary-600 hover:text-primary-600"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              )}
            </div>
          ) : (
            <p className="text-secondary-500">No social links available</p>
          )}
        </div>
      </div>

      {/* Tags */}
      {dao.tags && dao.tags.length > 0 && (
        <div className="card mt-8">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {dao.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DAODetail; 