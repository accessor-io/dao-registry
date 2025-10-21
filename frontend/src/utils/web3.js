/**
 * Web3 Utility Functions
 * Utility functions for address formatting, validation, and transaction handling
 */

import { ethers } from 'ethers';

/**
 * Format an Ethereum address for display
 * @param {string} address - The Ethereum address to format
 * @param {number} startLength - Number of characters to show at the start (default: 6)
 * @param {number} endLength - Number of characters to show at the end (default: 4)
 * @returns {string} Formatted address
 */
export const formatAddress = (address, startLength = 6, endLength = 4) => {
  if (!address || !ethers.utils.isAddress(address)) {
    return '';
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Validate if a string is a valid Ethereum address
 * @param {string} address - The address to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidAddress = (address) => {
  return ethers.utils.isAddress(address);
};

/**
 * Convert ETH to Wei
 * @param {string|number} eth - Amount in ETH
 * @returns {string} Amount in Wei
 */
export const ethToWei = (eth) => {
  return ethers.utils.parseEther(eth.toString());
};

/**
 * Convert Wei to ETH
 * @param {string|number} wei - Amount in Wei
 * @param {number} decimals - Number of decimal places (default: 4)
 * @returns {string} Amount in ETH
 */
export const weiToEth = (wei, decimals = 4) => {
  return parseFloat(ethers.utils.formatEther(wei)).toFixed(decimals);
};

/**
 * Get transaction hash from transaction object
 * @param {Object} tx - Transaction object
 * @returns {string} Transaction hash
 */
export const getTransactionHash = (tx) => {
  return tx?.hash || tx?.transactionHash || '';
};

/**
 * Get Etherscan URL for a transaction
 * @param {string} txHash - Transaction hash
 * @param {number} chainId - Chain ID (default: 1 for mainnet)
 * @returns {string} Etherscan URL
 */
export const getEtherscanUrl = (txHash, chainId = 1) => {
  const baseUrls = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    1337: 'http://localhost:3000', // Local development
  };
  
  const baseUrl = baseUrls[chainId] || baseUrls[1];
  return `${baseUrl}/tx/${txHash}`;
};

/**
 * Get Etherscan URL for an address
 * @param {string} address - Ethereum address
 * @param {number} chainId - Chain ID (default: 1 for mainnet)
 * @returns {string} Etherscan URL
 */
export const getEtherscanAddressUrl = (address, chainId = 1) => {
  const baseUrls = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    1337: 'http://localhost:3000', // Local development
  };
  
  const baseUrl = baseUrls[chainId] || baseUrls[1];
  return `${baseUrl}/address/${address}`;
};

/**
 * Wait for transaction confirmation
 * @param {Object} provider - Ethers provider
 * @param {string} txHash - Transaction hash
 * @param {number} confirmations - Number of confirmations to wait for (default: 1)
 * @returns {Promise<Object>} Transaction receipt
 */
export const waitForTransaction = async (provider, txHash, confirmations = 1) => {
  try {
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    return receipt;
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    throw error;
  }
};

/**
 * Estimate gas for a transaction
 * @param {Object} provider - Ethers provider
 * @param {Object} transaction - Transaction object
 * @returns {Promise<string>} Estimated gas limit
 */
export const estimateGas = async (provider, transaction) => {
  try {
    const gasEstimate = await provider.estimateGas(transaction);
    // Add 20% buffer to gas estimate
    return gasEstimate.mul(120).div(100);
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw error;
  }
};

/**
 * Get current gas price
 * @param {Object} provider - Ethers provider
 * @returns {Promise<string>} Current gas price in Wei
 */
export const getGasPrice = async (provider) => {
  try {
    const gasPrice = await provider.getGasPrice();
    return gasPrice;
  } catch (error) {
    console.error('Error getting gas price:', error);
    throw error;
  }
};

/**
 * Check if two addresses are equal (case-insensitive)
 * @param {string} address1 - First address
 * @param {string} address2 - Second address
 * @returns {boolean} True if addresses are equal
 */
export const addressesEqual = (address1, address2) => {
  if (!address1 || !address2) return false;
  return address1.toLowerCase() === address2.toLowerCase();
};

/**
 * Get network name from chain ID
 * @param {number} chainId - Chain ID
 * @returns {string} Network name
 */
export const getNetworkName = (chainId) => {
  const networks = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    1337: 'Localhost',
    137: 'Polygon',
    42161: 'Arbitrum',
    10: 'Optimism',
  };
  
  return networks[chainId] || `Unknown Network (${chainId})`;
};

/**
 * Check if the current network is supported
 * @param {number} chainId - Chain ID
 * @param {Array<number>} supportedChains - Array of supported chain IDs
 * @returns {boolean} True if network is supported
 */
export const isNetworkSupported = (chainId, supportedChains = [1, 5, 11155111, 1337]) => {
  return supportedChains.includes(chainId);
};

/**
 * Format error message for user display
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // MetaMask specific errors
  if (error.code === 4001) {
    return 'Transaction was rejected by user';
  }
  if (error.code === -32002) {
    return 'Transaction request already pending';
  }
  if (error.code === -32603) {
    return 'Internal JSON-RPC error';
  }
  
  // Network errors
  if (error.message?.includes('network')) {
    return 'Network error. Please check your connection';
  }
  
  // Gas errors
  if (error.message?.includes('gas')) {
    return 'Transaction failed due to gas issues';
  }
  
  // Insufficient funds
  if (error.message?.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  // Return the original message if no specific case matches
  return error.message || 'An unknown error occurred';
};

/**
 * Create a transaction object with proper gas settings
 * @param {Object} params - Transaction parameters
 * @param {string} params.to - Recipient address
 * @param {string} params.value - Value in Wei
 * @param {string} params.data - Transaction data
 * @param {Object} params.gasLimit - Gas limit (optional)
 * @param {Object} params.gasPrice - Gas price (optional)
 * @returns {Object} Transaction object
 */
export const createTransaction = (params) => {
  const { to, value, data, gasLimit, gasPrice } = params;
  
  const transaction = {
    to,
    value: value || '0',
  };
  
  if (data) {
    transaction.data = data;
  }
  
  if (gasLimit) {
    transaction.gasLimit = gasLimit;
  }
  
  if (gasPrice) {
    transaction.gasPrice = gasPrice;
  }
  
  return transaction;
};

export default {
  formatAddress,
  isValidAddress,
  ethToWei,
  weiToEth,
  getTransactionHash,
  getEtherscanUrl,
  getEtherscanAddressUrl,
  waitForTransaction,
  estimateGas,
  getGasPrice,
  addressesEqual,
  getNetworkName,
  isNetworkSupported,
  formatErrorMessage,
  createTransaction,
};


