// Application constants
export const APP_CONFIG = {
  NAME: 'DAO Registry',
  VERSION: '1.0.0',
  DESCRIPTION: 'Decentralized Autonomous Organization Registry System',
};

// API endpoints
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  DAOS: '/api/daos',
  ENS: '/api/ens',
  METADATA: '/api/metadata',
  BLOCKCHAIN: '/api/blockchain',
  DOCS: '/api/docs',
};

// DAO Governance Types
export const GOVERNANCE_TYPES = {
  TOKEN_WEIGHTED: 'token-weighted',
  QUADRATIC: 'quadratic',
  REPUTATION: 'reputation',
  LIQUID: 'liquid',
  HYBRID: 'hybrid',
};

// DAO Status
export const DAO_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
};

// ENS Configuration
export const ENS_CONFIG = {
  DOMAIN: '.dao',
  REGISTRY_ADDRESS: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  RESOLVER_ADDRESS: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
};

// Blockchain Networks
export const NETWORKS = {
  MAINNET: {
    id: 1,
    name: 'Ethereum Mainnet',
    rpc: 'https://mainnet.infura.io/v3/',
    explorer: 'https://etherscan.io',
  },
  GOERLI: {
    id: 5,
    name: 'Goerli Testnet',
    rpc: 'https://goerli.infura.io/v3/',
    explorer: 'https://goerli.etherscan.io',
  },
  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia Testnet',
    rpc: 'https://sepolia.infura.io/v3/',
    explorer: 'https://sepolia.etherscan.io',
  },
  LOCALHOST: {
    id: 1337,
    name: 'Localhost',
    rpc: 'http://localhost:8545',
    explorer: 'http://localhost:3000',
  },
};

// Form validation rules
export const VALIDATION_RULES = {
  DAO_NAME: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_]+$/,
  },
  ENS_NAME: {
    minLength: 3,
    maxLength: 63,
    pattern: /^[a-z0-9\-]+$/,
  },
  DESCRIPTION: {
    minLength: 10,
    maxLength: 1000,
  },
  WEBSITE: {
    pattern: /^https?:\/\/.+/,
  },
};

// UI Constants
export const UI_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    DEBOUNCE_DELAY: 300,
  },
  NOTIFICATIONS: {
    AUTO_HIDE_DURATION: 5000,
  },
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  DAO_NOT_FOUND: 'DAO not found.',
  ENS_UNAVAILABLE: 'ENS name is not available.',
  INVALID_ADDRESS: 'Invalid Ethereum address.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  DAO_CREATED: 'DAO created successfully!',
  DAO_UPDATED: 'DAO updated successfully!',
  DAO_DELETED: 'DAO deleted successfully!',
  ENS_REGISTERED: 'ENS name registered successfully!',
  TRANSACTION_CONFIRMED: 'Transaction confirmed!',
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Theme configuration
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Language options
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  ZH: 'zh',
};

// Feature flags
export const FEATURE_FLAGS = {
  ENS_INTEGRATION: true,
  BLOCKCHAIN_INTEGRATION: true,
  DOCUMENTATION_SEARCH: true,
  ADVANCED_FILTERS: true,
  EXPORT_FUNCTIONALITY: true,
};

export default {
  APP_CONFIG,
  API_ENDPOINTS,
  GOVERNANCE_TYPES,
  DAO_STATUS,
  ENS_CONFIG,
  NETWORKS,
  VALIDATION_RULES,
  UI_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  THEMES,
  LANGUAGES,
  FEATURE_FLAGS,
};