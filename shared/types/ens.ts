export type ENSName = string;

export interface ENSPrice {
  name: ENSName;
  basePrice: string;
  premiumPrice?: string;
  totalPrice: string;
  currency: 'ETH' | 'MATIC';
  duration: number;
  breakdown: {
    base: string;
    premium: string;
    gas: string;
  };
}

export interface ENSRegistration {
  name: ENSName;
  owner: string;
  resolver: string;
  ttl: number;
  registeredAt: Date;
  expiresAt: Date;
}

export interface ENSResolver {
  address: string;
  name: string;
  description: string;
  supportedInterfaces: string[];
  isActive: boolean;
}

export interface ENSNetwork {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  isTestnet: boolean;
}




