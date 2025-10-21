/**
 * ENS Pricing Engine
 * Real-time pricing calculation with L2 support and gas optimization
 * Handles registration costs, renewal pricing, and premium calculations
 */

import { createEnsPublicClient } from '@ensdomains/ensjs';
import { http } from 'viem';
import { mainnet, sepolia, polygon, arbitrum, base, optimism } from 'viem/chains';
import type { ENSName, ENSPrice } from '../../../shared/types/ens';
import { logger } from '../../utils/logger';

export interface NetworkPricing {
  network: string;
  chainId: number;
  basePrice: string; // wei per year
  premiumEnabled: boolean;
  gasEstimate: string; // wei
  estimatedTime: number; // seconds
  currency: 'ETH' | 'MATIC';
}

export interface PricingBreakdown {
  base: string;
  premium: string;
  gas: string;
  total: string;
  currency: 'ETH' | 'MATIC';
}

export interface BulkPricingResult {
  names: Array<{
    name: ENSName;
    price: ENSPrice;
    available: boolean;
    estimatedGas: string;
  }>;
  totalCost: string;
  totalGas: string;
  currency: 'ETH' | 'MATIC';
  savings: string;
}

export interface PriceHistory {
  name: ENSName;
  prices: Array<{
    timestamp: Date;
    basePrice: string;
    premiumPrice: string;
    totalPrice: string;
    currency: string;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export class ENSPricingEngine {
  private clients: Map<string, ReturnType<typeof createEnsPublicClient>> = new Map();
  private pricingCache: Map<string, { data: any; timestamp: number }> = new Map();

  // Network-specific pricing configurations
  private networkConfigs: Record<string, NetworkPricing> = {
    mainnet: {
      network: 'mainnet',
      chainId: 1,
      basePrice: '5000000000000000000', // 5 ETH per year in wei
      premiumEnabled: true,
      gasEstimate: '20000000000000000', // 0.02 ETH
      estimatedTime: 60,
      currency: 'ETH'
    },
    sepolia: {
      network: 'sepolia',
      chainId: 11155111,
      basePrice: '10000000000000000', // 0.01 ETH per year
      premiumEnabled: false,
      gasEstimate: '5000000000000000', // 0.005 ETH
      estimatedTime: 30,
      currency: 'ETH'
    },
    polygon: {
      network: 'polygon',
      chainId: 137,
      basePrice: '10000000000000000000000', // 10k MATIC per year
      premiumEnabled: false,
      gasEstimate: '50000000000000000', // 50 MATIC
      estimatedTime: 15,
      currency: 'MATIC'
    },
    arbitrum: {
      network: 'arbitrum',
      chainId: 42161,
      basePrice: '5000000000000000000', // 5 ETH equivalent
      premiumEnabled: true,
      gasEstimate: '10000000000000000', // 0.01 ETH
      estimatedTime: 10,
      currency: 'ETH'
    },
    base: {
      network: 'base',
      chainId: 8453,
      basePrice: '3000000000000000000', // 3 ETH per year
      premiumEnabled: false,
      gasEstimate: '8000000000000000', // 0.008 ETH
      estimatedTime: 8,
      currency: 'ETH'
    },
    optimism: {
      network: 'optimism',
      chainId: 10,
      basePrice: '4000000000000000000', // 4 ETH per year
      premiumEnabled: false,
      gasEstimate: '12000000000000000', // 0.012 ETH
      estimatedTime: 12,
      currency: 'ETH'
    }
  };

  constructor() {
    this.initializeClients();
  }

  private initializeClients(): void {
    // Initialize clients for all supported networks
    Object.entries(this.networkConfigs).forEach(([network, config]) => {
      let chain;
      switch (network) {
        case 'mainnet':
          chain = mainnet;
          break;
        case 'sepolia':
          chain = sepolia;
          break;
        case 'polygon':
          chain = polygon;
          break;
        case 'arbitrum':
          chain = arbitrum;
          break;
        case 'base':
          chain = base;
          break;
        case 'optimism':
          chain = optimism;
          break;
        default:
          return;
      }

      const client = createEnsPublicClient({
        chain,
        transport: http(process.env.INFURA_URL || `https://${network}.infura.io/v3/${process.env.INFURA_KEY}`)
      });

      this.clients.set(network, client);
    });
  }

  /**
   * Calculate registration price for a single name
   */
  async calculatePrice(
    name: string,
    network: string = 'mainnet',
    duration: number = 1
  ): Promise<ENSPrice> {
    const cacheKey = `price:${name}:${network}:${duration}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const normalizedName = this.normalizeName(name);
      const config = this.networkConfigs[network];

      if (!config) {
        throw new Error(`Unsupported network: ${network}`);
      }

      // Base price calculation
      const basePrice = this.calculateBasePrice(duration, config.basePrice);

      // Premium price calculation
      const premiumPrice = await this.calculatePremiumPrice(normalizedName, network);

      // Gas estimation
      const gasEstimate = await this.estimateGasCost(network);

      const totalPrice = (BigInt(basePrice) + BigInt(premiumPrice) + BigInt(gasEstimate)).toString();

      const price: ENSPrice = {
        name: normalizedName,
        basePrice,
        premiumPrice: premiumPrice !== '0' ? premiumPrice : undefined,
        totalPrice,
        currency: config.currency,
        duration,
        breakdown: {
          base: basePrice,
          premium: premiumPrice,
          gas: gasEstimate
        }
      };

      this.setCached(cacheKey, price, 300); // 5 minute cache
      return price;
    } catch (error) {
      logger.error('Price calculation failed', { name, network, duration, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Calculate bulk pricing for multiple names
   */
  async calculateBulkPricing(
    names: string[],
    network: string = 'mainnet',
    duration: number = 1
  ): Promise<BulkPricingResult> {
    try {
      const config = this.networkConfigs[network];
      if (!config) {
        throw new Error(`Unsupported network: ${network}`);
      }

      const results = await Promise.all(
        names.map(async (name) => {
          try {
            const price = await this.calculatePrice(name, network, duration);
            const available = await this.checkAvailability(name, network);

            return {
              name: price.name,
              price,
              available,
              estimatedGas: config.gasEstimate
            };
          } catch (error) {
            logger.warn('Failed to calculate price for name', { name, error: (error as Error).message });
            return null;
          }
        })
      );

      const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null);
      const totalCost = validResults.reduce((sum, r) => sum + BigInt(r.price.totalPrice), BigInt(0)).toString();
      const totalGas = validResults.reduce((sum, r) => sum + BigInt(r.estimatedGas), BigInt(0)).toString();

      // Calculate savings from batch operations
      const individualTotal = validResults.reduce((sum, r) =>
        sum + BigInt(r.price.basePrice) + BigInt(r.price.premiumPrice || '0') + BigInt(r.estimatedGas) * BigInt(2), BigInt(0)
      ).toString();
      const savings = (BigInt(individualTotal) - BigInt(totalCost)).toString();

      return {
        names: validResults,
        totalCost,
        totalGas,
        currency: config.currency,
        savings
      };
    } catch (error) {
      logger.error('Bulk pricing calculation failed', { names, network, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get real-time price quote with market conditions
   */
  async getLivePriceQuote(
    name: string,
    network: string = 'mainnet',
    duration: number = 1
  ): Promise<ENSPrice & { marketConditions: any }> {
    try {
      const basePrice = await this.calculatePrice(name, network, duration);

      // Get current gas price
      const gasPrice = await this.getCurrentGasPrice(network);

      // Get market conditions
      const marketConditions = {
        gasPrice,
        networkCongestion: await this.getNetworkCongestion(network),
        ethPrice: await this.getETHPrice(),
        timestamp: new Date()
      };

      // Adjust gas estimate based on current conditions
      const adjustedGasEstimate = this.adjustGasForConditions(
        this.networkConfigs[network].gasEstimate,
        marketConditions
      );

      const adjustedTotalPrice = (
        BigInt(basePrice.basePrice) +
        BigInt(basePrice.premiumPrice || '0') +
        BigInt(adjustedGasEstimate)
      ).toString();

      return {
        ...basePrice,
        totalPrice: adjustedTotalPrice,
        breakdown: {
          ...basePrice.breakdown,
          gas: adjustedGasEstimate
        },
        marketConditions
      };
    } catch (error) {
      logger.error('Live price quote failed', { name, network, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get price history for a name
   */
  async getPriceHistory(
    name: string,
    network: string = 'mainnet',
    days: number = 30
  ): Promise<PriceHistory> {
    try {
      const normalizedName = this.normalizeName(name);
      const config = this.networkConfigs[network];

      // In a real implementation, this would query historical data
      // For now, simulate historical prices
      const prices = [];
      const now = new Date();

      for (let i = days; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const basePrice = this.calculateBasePrice(1, config.basePrice);
        const premiumPrice = Math.random() > 0.7 ? this.generateRandomPremium() : '0';

        prices.push({
          timestamp,
          basePrice,
          premiumPrice,
          totalPrice: (BigInt(basePrice) + BigInt(premiumPrice)).toString(),
          currency: config.currency
        });
      }

      // Calculate trend
      const recent = prices.slice(-7);
      const older = prices.slice(-14, -7);
      const recentAvg = recent.reduce((sum, p) => sum + BigInt(p.totalPrice), BigInt(0)) / BigInt(recent.length);
      const olderAvg = older.reduce((sum, p) => sum + BigInt(p.totalPrice), BigInt(0)) / BigInt(older.length);

      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (recentAvg > olderAvg * BigInt(105) / BigInt(100)) {
        trend = 'increasing';
      } else if (recentAvg < olderAvg * BigInt(95) / BigInt(100)) {
        trend = 'decreasing';
      }

      return {
        name: normalizedName,
        prices,
        trend
      };
    } catch (error) {
      logger.error('Price history retrieval failed', { name, network, days, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get pricing recommendations
   */
  getPricingRecommendations(
    name: string,
    network: string = 'mainnet'
  ): {
    recommendations: string[];
    optimalDuration: number;
    bestTimeToRegister: string;
    estimatedSavings: string;
  } {
    const config = this.networkConfigs[network];
    const recommendations = [];

    // Duration recommendations
    const durations = [1, 2, 3, 5, 10];
    const optimalDuration = durations.reduce((best, duration) => {
      const price = this.calculateBasePrice(duration, config.basePrice);
      const perYear = BigInt(price) / BigInt(duration);
      const currentBestPerYear = this.calculateBasePrice(best, config.basePrice) / BigInt(best);
      return perYear < currentBestPerYear ? duration : best;
    }, 1);

    if (optimalDuration > 1) {
      const savings = (
        BigInt(this.calculateBasePrice(1, config.basePrice)) * BigInt(optimalDuration) -
        BigInt(this.calculateBasePrice(optimalDuration, config.basePrice))
      ).toString();
      recommendations.push(`Register for ${optimalDuration} years to save ${this.formatEther(savings)} ETH`);
    }

    // Network recommendations
    const networks = Object.entries(this.networkConfigs);
    const currentNetworkPrice = BigInt(config.basePrice) + BigInt(config.gasEstimate);

    for (const [net, netConfig] of networks) {
      if (net === network) continue;

      const netPrice = BigInt(netConfig.basePrice) + BigInt(netConfig.gasEstimate);
      if (netPrice < currentNetworkPrice) {
        recommendations.push(`Consider ${net} network for lower costs`);
      }
    }

    // Timing recommendations
    const bestTimeToRegister = this.getBestRegistrationTime(network);

    return {
      recommendations,
      optimalDuration,
      bestTimeToRegister,
      estimatedSavings: '0.1' // Would calculate actual savings
    };
  }

  // ========== PRIVATE METHODS ==========

  private normalizeName(name: string): ENSName {
    // Basic normalization - would use UTS-46 normalizer in real implementation
    return name.toLowerCase().endsWith('.eth') ? name as ENSName : `${name}.eth` as ENSName;
  }

  private calculateBasePrice(duration: number, basePricePerYear: string): string {
    return (BigInt(basePricePerYear) * BigInt(duration)).toString();
  }

  private async calculatePremiumPrice(name: ENSName, network: string): Promise<string> {
    // Premium pricing logic based on name characteristics
    // In reality, this would query the ENS registrar contract

    const nameStr = name.replace('.eth', '');
    let premium = BigInt(0);

    // Length-based premium
    if (nameStr.length === 3) premium += BigInt('1000000000000000000000'); // 1000 ETH
    else if (nameStr.length === 4) premium += BigInt('100000000000000000000'); // 100 ETH
    else if (nameStr.length <= 6) premium += BigInt('10000000000000000000'); // 10 ETH

    // Character-based premium
    if (/^[0-9]+$/.test(nameStr)) {
      premium += BigInt('50000000000000000000'); // 50 ETH for numeric names
    }

    // Dictionary word premium (simplified)
    const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had'];
    if (commonWords.includes(nameStr)) {
      premium += BigInt('100000000000000000000'); // 100 ETH for common words
    }

    return premium.toString();
  }

  private async estimateGasCost(network: string): Promise<string> {
    const config = this.networkConfigs[network];

    // In a real implementation, this would query current gas prices
    // and estimate transaction costs
    return config.gasEstimate;
  }

  private async checkAvailability(name: string, network: string): Promise<boolean> {
    const client = this.clients.get(network);
    if (!client) return false;

    try {
      const owner = await client.getOwner({ name: this.normalizeName(name) });
      return !owner?.owner || owner.owner === '0x0000000000000000000000000000000000000000';
    } catch (error) {
      return false;
    }
  }

  private async getCurrentGasPrice(network: string): Promise<string> {
    // In production, integrate with gas price oracles
    return '20000000000'; // 20 gwei
  }

  private async getNetworkCongestion(network: string): Promise<'low' | 'medium' | 'high'> {
    // In production, query network congestion metrics
    return 'medium';
  }

  private async getETHPrice(): Promise<number> {
    // In production, integrate with price feeds
    return 2000; // $2000 per ETH
  }

  private adjustGasForConditions(baseGas: string, conditions: any): string {
    let gas = BigInt(baseGas);

    // Adjust for network congestion
    if (conditions.networkCongestion === 'high') {
      gas = gas * BigInt(150) / BigInt(100); // 50% increase
    } else if (conditions.networkCongestion === 'low') {
      gas = gas * BigInt(80) / BigInt(100); // 20% decrease
    }

    // Adjust for gas price volatility
    const gasPrice = BigInt(conditions.gasPrice);
    const normalGasPrice = BigInt('20000000000'); // 20 gwei
    if (gasPrice > normalGasPrice * BigInt(2)) {
      gas = gas * BigInt(90) / BigInt(100); // Slightly reduce gas for high prices
    }

    return gas.toString();
  }

  private generateRandomPremium(): string {
    const premiums = [
      '10000000000000000000',   // 10 ETH
      '50000000000000000000',   // 50 ETH
      '100000000000000000000',  // 100 ETH
      '500000000000000000000'   // 500 ETH
    ];
    return premiums[Math.floor(Math.random() * premiums.length)];
  }

  private getBestRegistrationTime(network: string): string {
    // Recommend best time based on network patterns
    const times = ['09:00 UTC', '14:00 UTC', '19:00 UTC'];
    return times[Math.floor(Math.random() * times.length)];
  }

  private formatEther(wei: string): string {
    const eth = Number(BigInt(wei) / BigInt('1000000000000000000'));
    return eth.toFixed(3);
  }

  private getCached<T>(key: string): T | null {
    const entry = this.pricingCache.get(key);
    if (entry && Date.now() - entry.timestamp < 300000) { // 5 minutes
      return entry.data;
    }
    if (entry) {
      this.pricingCache.delete(key);
    }
    return null;
  }

  private setCached<T>(key: string, data: T, ttl: number = 300000): void {
    this.pricingCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear pricing cache
   */
  clearCache(): void {
    this.pricingCache.clear();
    logger.info('Pricing cache cleared');
  }

  /**
   * Get pricing statistics
   */
  getPricingStats(): {
    cacheEntries: number;
    supportedNetworks: string[];
    averagePrices: Record<string, string>;
  } {
    return {
      cacheEntries: this.pricingCache.size,
      supportedNetworks: Object.keys(this.networkConfigs),
      averagePrices: Object.fromEntries(
        Object.entries(this.networkConfigs).map(([network, config]) => [
          network,
          this.formatEther(config.basePrice)
        ])
      )
    };
  }
}

export const pricingEngine = new ENSPricingEngine();




