import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Users, 
  TrendingUp, 
  Shield, 
  Globe,
  Star,
  Calendar,
  MapPin,
  Activity,
  BarChart3,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BookOpen,
  Settings,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Zap,
  Award,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Database,
  Network,
  Lock,
  Unlock
} from 'lucide-react';

const DAORegistry = () => {
  const [daos, setDaos] = useState([]);
  const [filteredDaos, setFilteredDaos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChain, setSelectedChain] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedGovernance, setSelectedGovernance] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalDAOs: 0,
    activeDAOs: 0,
    totalMembers: 0,
    totalProposals: 0,
    totalTreasury: 0
  });

  // Mock data for demonstration
  const mockDAOs = [
    {
      id: 1,
      name: "Uniswap DAO",
      symbol: "UNI",
      description: "Decentralized exchange governance token",
      logo: "https://cryptologos.cc/logos/uniswap-uni-logo.png",
      website: "https://uniswap.org",
      contractAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      tokenAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      treasuryAddress: "0x4750c43867EF5F8986914e3B9d4C19d9C8C1dF1a",
      governanceAddress: "0x5e4be8Bc9637f0EAA1A755019e06A68dE081F58F",
      chainId: 1,
      verified: true,
      active: true,
      status: "Active",
      governanceType: "TokenWeighted",
      memberCount: 45000,
      proposalCount: 156,
      activeProposals: 3,
      treasuryValue: 2500000,
      participationRate: 78.5,
      createdAt: "2020-09-17",
      tags: ["DeFi", "DEX", "Governance"],
      socialLinks: {
        twitter: "https://twitter.com/Uniswap",
        discord: "https://discord.gg/uniswap",
        github: "https://github.com/Uniswap"
      }
    },
    {
      id: 2,
      name: "Compound DAO",
      symbol: "COMP",
      description: "Decentralized lending protocol governance",
      logo: "https://cryptologos.cc/logos/compound-comp-logo.png",
      website: "https://compound.finance",
      contractAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
      tokenAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
      treasuryAddress: "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B",
      governanceAddress: "0x6d903f6003cca6255D85CcA4D3B5E5146dC33925",
      chainId: 1,
      verified: true,
      active: true,
      status: "Active",
      governanceType: "TokenWeighted",
      memberCount: 32000,
      proposalCount: 89,
      activeProposals: 1,
      treasuryValue: 1800000,
      participationRate: 82.3,
      createdAt: "2020-06-15",
      tags: ["DeFi", "Lending", "Governance"],
      socialLinks: {
        twitter: "https://twitter.com/compoundfinance",
        discord: "https://discord.gg/compound",
        github: "https://github.com/compound-finance"
      }
    },
    {
      id: 3,
      name: "Aave DAO",
      symbol: "AAVE",
      description: "Decentralized lending and borrowing protocol",
      logo: "https://cryptologos.cc/logos/aave-aave-logo.png",
      website: "https://aave.com",
      contractAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      tokenAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      treasuryAddress: "0x464C71f6c2F760A0dE4F8E9B4Bc3B3c3c3c3c3c3c",
      governanceAddress: "0xEC568fffba86c094cf6b6D9A1A8c9078C4C4C4C4C",
      chainId: 1,
      verified: true,
      active: true,
      status: "Active",
      governanceType: "TokenWeighted",
      memberCount: 28000,
      proposalCount: 67,
      activeProposals: 2,
      treasuryValue: 3200000,
      participationRate: 75.8,
      createdAt: "2020-10-03",
      tags: ["DeFi", "Lending", "Borrowing"],
      socialLinks: {
        twitter: "https://twitter.com/AaveAave",
        discord: "https://discord.gg/aave",
        github: "https://github.com/aave"
      }
    },
    {
      id: 4,
      name: "Maker DAO",
      symbol: "MKR",
      description: "Decentralized autonomous organization for DAI stablecoin",
      logo: "https://cryptologos.cc/logos/maker-mkr-logo.png",
      website: "https://makerdao.com",
      contractAddress: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
      tokenAddress: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
      treasuryAddress: "0x3A3A3A3A3A3A3A3A3A3A3A3A3A3A3A3A3A3A3A3A",
      governanceAddress: "0x4A4A4A4A4A4A4A4A4A4A4A4A4A4A4A4A4A4A4A4A",
      chainId: 1,
      verified: true,
      active: true,
      status: "Active",
      governanceType: "TokenWeighted",
      memberCount: 15000,
      proposalCount: 234,
      activeProposals: 5,
      treasuryValue: 8500000,
      participationRate: 88.2,
      createdAt: "2017-12-18",
      tags: ["DeFi", "Stablecoin", "Governance"],
      socialLinks: {
        twitter: "https://twitter.com/MakerDAO",
        discord: "https://discord.gg/makerdao",
        github: "https://github.com/makerdao"
      }
    },
    {
      id: 5,
      name: "Curve DAO",
      symbol: "CRV",
      description: "Decentralized exchange for stablecoins",
      logo: "https://cryptologos.cc/logos/curve-dao-token-crv-logo.png",
      website: "https://curve.fi",
      contractAddress: "0xD533a949740bb3306d119CC777fa900bA034cd52",
      tokenAddress: "0xD533a949740bb3306d119CC777fa900bA034cd52",
      treasuryAddress: "0x5B5B5B5B5B5B5B5B5B5B5B5B5B5B5B5B5B5B5B5B5B",
      governanceAddress: "0x6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B",
      chainId: 1,
      verified: true,
      active: true,
      status: "Active",
      governanceType: "TokenWeighted",
      memberCount: 22000,
      proposalCount: 123,
      activeProposals: 1,
      treasuryValue: 4100000,
      participationRate: 71.4,
      createdAt: "2020-08-14",
      tags: ["DeFi", "DEX", "Stablecoins"],
      socialLinks: {
        twitter: "https://twitter.com/curvefinance",
        discord: "https://discord.gg/curve",
        github: "https://github.com/curvefi"
      }
    }
  ];

  const chains = [
    { id: 'all', name: 'All Chains', icon: Globe },
    { id: '1', name: 'Ethereum', icon: Network },
    { id: '137', name: 'Polygon', icon: Network },
    { id: '42161', name: 'Arbitrum', icon: Network },
    { id: '10', name: 'Optimism', icon: Network },
    { id: '56', name: 'BSC', icon: Network }
  ];

  const governanceTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'TokenWeighted', name: 'Token Weighted' },
    { id: 'Quadratic', name: 'Quadratic' },
    { id: 'Reputation', name: 'Reputation Based' },
    { id: 'Liquid', name: 'Liquid Democracy' },
    { id: 'Hybrid', name: 'Hybrid' }
  ];

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'Active', name: 'Active' },
    { id: 'Pending', name: 'Pending' },
    { id: 'Suspended', name: 'Suspended' },
    { id: 'Inactive', name: 'Inactive' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDaos(mockDAOs);
      setFilteredDaos(mockDAOs);
      setStats({
        totalDAOs: mockDAOs.length,
        activeDAOs: mockDAOs.filter(dao => dao.active).length,
        totalMembers: mockDAOs.reduce((sum, dao) => sum + dao.memberCount, 0),
        totalProposals: mockDAOs.reduce((sum, dao) => sum + dao.proposalCount, 0),
        totalTreasury: mockDAOs.reduce((sum, dao) => sum + dao.treasuryValue, 0)
      });
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAndSortDAOs();
  }, [daos, searchTerm, selectedChain, selectedStatus, selectedGovernance, sortBy, sortOrder]);

  const filterAndSortDAOs = () => {
    let filtered = daos.filter(dao => {
      const matchesSearch = dao.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dao.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dao.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesChain = selectedChain === 'all' || dao.chainId.toString() === selectedChain;
      const matchesStatus = selectedStatus === 'all' || dao.status === selectedStatus;
      const matchesGovernance = selectedGovernance === 'all' || dao.governanceType === selectedGovernance;
      
      return matchesSearch && matchesChain && matchesStatus && matchesGovernance;
    });

    // Sort DAOs
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'members':
          aValue = a.memberCount;
          bValue = b.memberCount;
          break;
        case 'proposals':
          aValue = a.proposalCount;
          bValue = b.proposalCount;
          break;
        case 'treasury':
          aValue = a.treasuryValue;
          bValue = b.treasuryValue;
          break;
        case 'participation':
          aValue = a.participationRate;
          bValue = b.participationRate;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDaos(filtered);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getChainName = (chainId) => {
    const chain = chains.find(c => c.id === chainId.toString());
    return chain ? chain.name : 'Unknown';
  };

  const getGovernanceTypeName = (type) => {
    const govType = governanceTypes.find(t => t.id === type);
    return govType ? govType.name : type;
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading DAO Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Database className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">DAO Registry</h1>
                <p className="text-gray-600">Discover and analyze Decentralized Autonomous Organizations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/register" className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Register DAO</span>
              </Link>
              <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total DAOs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDAOs}</p>
                </div>
                <Database className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active DAOs</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeDAOs}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalMembers)}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Proposals</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalProposals)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Treasury</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalTreasury)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search DAOs by name, description, or symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Chain Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chain</label>
                  <select
                    value={selectedChain}
                    onChange={(e) => setSelectedChain(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {chains.map(chain => (
                      <option key={chain.id} value={chain.id}>{chain.name}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>

                {/* Governance Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Governance Type</label>
                  <select
                    value={selectedGovernance}
                    onChange={(e) => setSelectedGovernance(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {governanceTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="name">Name</option>
                    <option value="members">Members</option>
                    <option value="proposals">Proposals</option>
                    <option value="treasury">Treasury</option>
                    <option value="participation">Participation</option>
                    <option value="created">Created Date</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              Showing {filteredDaos.length} of {daos.length} DAOs
            </p>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* DAO Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDaos.map((dao) => (
            <div key={dao.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={dao.logo} 
                      alt={dao.name}
                      className="w-12 h-12 rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/48x48/6366f1/ffffff?text=' + dao.symbol.charAt(0);
                      }}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{dao.name}</h3>
                      <p className="text-sm text-gray-600">{dao.symbol}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {dao.verified ? (
                      <CheckCircle className="w-5 h-5 text-green-600" title="Verified" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" title="Unverified" />
                    )}
                    {dao.active ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{dao.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {dao.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(dao.memberCount)}</p>
                    <p className="text-xs text-gray-600">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{dao.proposalCount}</p>
                    <p className="text-xs text-gray-600">Proposals</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Chain:</span>
                    <span className="font-medium">{getChainName(dao.chainId)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Governance:</span>
                    <span className="font-medium">{getGovernanceTypeName(dao.governanceType)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Treasury:</span>
                    <span className="font-medium">{formatCurrency(dao.treasuryValue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Participation:</span>
                    <span className="font-medium">{dao.participationRate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active Proposals:</span>
                    <span className="font-medium">{dao.activeProposals}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">Follow</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={dao.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm">Website</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDaos.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No DAOs found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DAORegistry;