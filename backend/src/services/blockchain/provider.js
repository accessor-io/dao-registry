const { ethers } = require('ethers');
const { logger } = require('../../utils/logger');

// Map of chainId to environment variable names and default RPC URLs
const NETWORK_CONFIG = {
  1: { env: 'MAINNET_RPC_URL', fallback: 'https://cloudflare-eth.com' },
  11155111: { env: 'SEPOLIA_RPC_URL', fallback: 'https://rpc.sepolia.org' },
  137: { env: 'POLYGON_RPC_URL', fallback: 'https://polygon-rpc.com' },
  80001: { env: 'POLYGON_MUMBAI_RPC_URL', fallback: 'https://rpc-mumbai.maticvigil.com' },
  42161: { env: 'ARBITRUM_RPC_URL', fallback: 'https://arb1.arbitrum.io/rpc' },
  10: { env: 'OPTIMISM_RPC_URL', fallback: 'https://mainnet.optimism.io' },
  8453: { env: 'BASE_RPC_URL', fallback: 'https://mainnet.base.org' },
  1337: { env: 'LOCAL_RPC_URL', fallback: 'http://127.0.0.1:8545' },
  31337: { env: 'LOCAL_RPC_URL', fallback: 'http://127.0.0.1:8545' }
};

const providerCache = new Map();

function buildProviderUrl(chainId) {
  const cfg = NETWORK_CONFIG[chainId];
  if (!cfg) return null;
  const urlFromEnv = process.env[cfg.env];
  return urlFromEnv && urlFromEnv.trim().length > 0 ? urlFromEnv : cfg.fallback;
}

function getProvider(chainId = 1) {
  const key = Number(chainId);
  if (providerCache.has(key)) return providerCache.get(key);

  const url = buildProviderUrl(key);
  if (!url) {
    throw new Error(`Unsupported chainId ${key}: no provider configuration`);
  }

  try {
    const provider = new ethers.JsonRpcProvider(url);
    providerCache.set(key, provider);
    logger.info(`Initialized provider for chain ${key}`, { urlUsed: url.includes('http') ? url.split('://')[0] : 'custom' });
    return provider;
  } catch (error) {
    logger.error(`Failed to initialize provider for chain ${key}`, { message: error.message });
    throw error;
  }
}

function getEnsProvider() {
  // ENS is canonical on mainnet; allow override via MAINNET_RPC_URL
  return getProvider(1);
}

module.exports = {
  getProvider,
  getEnsProvider
};
