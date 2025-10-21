/**
 * Web3 Context Provider
 * Provides wallet connection, account management, and network handling throughout the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  }, []);

  // Get current account and chain info
  const getAccountInfo = useCallback(async (ethereum) => {
    try {
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      
      if (accounts.length > 0) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        setChainId(parseInt(chainId, 16));
        setIsConnected(true);
        setError(null);
      } else {
        setIsConnected(false);
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setChainId(null);
      }
    } catch (err) {
      console.error('Error getting account info:', err);
      setError('Failed to get account information');
    }
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ethereum = window.ethereum;
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        await getAccountInfo(ethereum);
        return true;
      } else {
        setError('No accounts found');
        return false;
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      if (err.code === 4001) {
        setError('User rejected the connection request');
      } else if (err.code === -32002) {
        setError('Connection request already pending');
      } else {
        setError('Failed to connect wallet');
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled, getAccountInfo]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
    setError(null);
  }, []);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId) => {
    if (!isConnected || !window.ethereum) {
      setError('Wallet not connected');
      return false;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      return true;
    } catch (err) {
      console.error('Error switching network:', err);
      if (err.code === 4902) {
        setError('Network not found. Please add it to MetaMask.');
      } else {
        setError('Failed to switch network');
      }
      return false;
    }
  }, [isConnected]);

  // Get formatted address
  const getFormattedAddress = useCallback((address = account) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [account]);

  // Check if address is valid
  const isValidAddress = useCallback((address) => {
    return ethers.utils.isAddress(address);
  }, []);

  // Get ENS name if available
  const getENSName = useCallback(async (address = account) => {
    if (!provider || !address) return null;
    
    try {
      const ensName = await provider.lookupAddress(address);
      return ensName;
    } catch (err) {
      console.error('Error getting ENS name:', err);
      return null;
    }
  }, [provider, account]);

  // Sign message
  const signMessage = useCallback(async (message) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const signature = await signer.signMessage(message);
      return signature;
    } catch (err) {
      console.error('Error signing message:', err);
      throw new Error('Failed to sign message');
    }
  }, [signer]);

  // Send transaction
  const sendTransaction = useCallback(async (transaction) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await signer.sendTransaction(transaction);
      return tx;
    } catch (err) {
      console.error('Error sending transaction:', err);
      throw new Error('Failed to send transaction');
    }
  }, [signer]);

  // Initialize on mount
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      getAccountInfo(window.ethereum);
    }
  }, [isMetaMaskInstalled, getAccountInfo]);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        getAccountInfo(window.ethereum);
      }
    };

    const handleChainChanged = (chainId) => {
      setChainId(parseInt(chainId, 16));
      // Optionally refresh the page or update state
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [isMetaMaskInstalled, getAccountInfo, disconnectWallet]);

  const value = {
    // State
    account,
    provider,
    signer,
    chainId,
    isConnected,
    isConnecting,
    error,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    
    // Utilities
    getFormattedAddress,
    isValidAddress,
    getENSName,
    signMessage,
    sendTransaction,
    
    // MetaMask check
    isMetaMaskInstalled,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;


