import axios from 'axios';

// API base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// DAO Registry API endpoints (standardized to backend params)
export const daoApi = {
  // Get all DAOs
  getAll: (params = {}) => api.get('/api/daos', { params }),
  
  // Get DAO by ID
  getById: (id) => api.get(`/api/daos/${id}`),
  
  // Create new DAO
  create: (daoData) => api.post('/api/daos', daoData),
  
  // Update DAO
  update: (id, daoData) => api.put(`/api/daos/${id}`, daoData),
  
  // Delete DAO
  delete: (id) => api.delete(`/api/daos/${id}`),
  
  // Search DAOs (maps to GET /api/daos?search=...)
  search: (query) => api.get('/api/daos', { params: { search: query } }),
  
  // Get DAO statistics
  getStats: () => api.get('/api/daos/stats'),
};

// ENS API endpoints
export const ensApi = {
  // Resolve ENS name
  resolve: (name) => api.get(`/api/ens/resolve/${name}`),
  
  // Get ENS records
  getRecords: (name) => api.get(`/api/ens/records/${name}`),
  
  // Check ENS availability
  checkAvailability: (name) => api.get(`/api/ens/availability/${name}`),
};

// Metadata API endpoints
export const metadataApi = {
  // Get metadata by ID
  getById: (id) => api.get(`/api/metadata/${id}`),
  
  // Create metadata
  create: (metadata) => api.post('/api/metadata', metadata),
  
  // Update metadata
  update: (id, metadata) => api.put(`/api/metadata/${id}`, metadata),
  
  // Validate metadata
  validate: (metadata) => api.post('/api/metadata/validate', metadata),
};

// Blockchain API endpoints
export const blockchainApi = {
  // Get contract info
  getContractInfo: (address) => api.get(`/api/blockchain/contract/${address}`),
  
  // Get transaction status
  getTransactionStatus: (txHash) => api.get(`/api/blockchain/transaction/${txHash}`),
  
  // Get network status
  getNetworkStatus: () => api.get('/api/blockchain/network'),
};

// Documentation API endpoints
export const docsApi = {
  // Get documentation index
  getIndex: () => api.get('/api/docs'),
  
  // Get documentation by path
  getByPath: (path) => api.get(`/api/docs/${path}`),
  
  // Search documentation
  search: (query) => api.get('/api/docs/search', { params: { q: query } }),
};

// Data Points API endpoints (comprehensive data management)
export const dataPointsApi = {
  // Get data categories and sources
  getCategories: () => api.get('/api/data-points/categories'),
  
  // On-chain data (from external contracts)
  getOnChainGovernance: (daoAddress) => api.get(`/api/data-points/on-chain/governance/${daoAddress}`),
  getOnChainTreasury: (daoAddress) => api.get(`/api/data-points/on-chain/treasury/${daoAddress}`),
  getOnChainVoting: (daoAddress) => api.get(`/api/data-points/on-chain/voting/${daoAddress}`),
  getOnChainAnalytics: (daoAddress) => api.get(`/api/data-points/on-chain/analytics/${daoAddress}`),
  getOnChainProposals: (daoAddress, status) => api.get(`/api/data-points/on-chain/proposals/${daoAddress}`, { params: { status } }),
  getOnChainMembers: (daoAddress) => api.get(`/api/data-points/on-chain/members/${daoAddress}`),
  getOnChainProposal: (proposalId) => api.get(`/api/data-points/on-chain/proposal/${proposalId}`),
  getOnChainMember: (memberId) => api.get(`/api/data-points/on-chain/member/${memberId}`),
  
  // Manual data (user-entered information)
  getManualDao: (daoId) => api.get(`/api/data-points/manual/dao/${daoId}`),
  updateManualDao: (daoId, data) => api.put(`/api/data-points/manual/dao/${daoId}`, data),
  
  // ENS data (ENS resolution and metadata)
  getEnsResolution: (domain) => api.get(`/api/data-points/ens/resolution/${domain}`),
  getEnsTextRecords: (domain) => api.get(`/api/data-points/ens/text-records/${domain}`),
  
  // External API data (third-party integrations)
  getExternalTokenPrice: (tokenAddress) => api.get(`/api/data-points/external/token-price/${tokenAddress}`),
  getExternalAnalytics: (daoAddress) => api.get(`/api/data-points/external/analytics/${daoAddress}`),
  
  // Combined data (aggregated from all sources)
  getCombinedDao: (daoAddress) => api.get(`/api/data-points/combined/dao/${daoAddress}`),
};

export default api;