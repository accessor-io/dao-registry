/**
 * Core DAO Entity Types
 * RFC-001: DAO Registry Specification - Core DAO Types
 */

export interface DAO {
  // Core Identification
  id: string;                    // Unique identifier (UUID)
  name: string;                  // DAO name
  symbol: string;                // DAO token symbol
  description: string;           // DAO description
  
  // ENS Information
  ensDomain: string;            // Primary ENS domain (e.g., "dao-name.eth")
  ensSubdomains: ENSSubdomains; // ENS subdomains for DAO components
  ensMetadata: ENSMetadata;     // ENS text records and metadata
  
  // Blockchain Information
  chainId: number;              // Blockchain network ID
  contractAddress: string;      // Main DAO contract address
  tokenAddress: string;         // Governance token address
  treasuryAddress: string;      // Treasury contract address
  
  // Governance Structure
  governanceType: GovernanceType; // Type of governance
  votingPeriod: number;         // Voting period in seconds
  quorum: number;               // Quorum percentage
  proposalThreshold: number;    // Minimum tokens to propose
  
  // Metadata
  logo: string;                 // Logo URL
  website: string;              // Website URL
  socialLinks: SocialLinks;     // Social media links
  tags: string[];              // Categorization tags
  
  // Timestamps
  createdAt: Date;             // Registration date
  updatedAt: Date;             // Last update date
  
  // Status
  status: DAOStatus;           // Current status
  verified: boolean;           // Verification status
}

export interface ENSSubdomains {
  governance: string;           // governance.dao-name.eth
  treasury: string;             // treasury.dao-name.eth
  token: string;                // token.dao-name.eth
  docs: string;                 // docs.dao-name.eth
  forum: string;                // forum.dao-name.eth
  analytics: string;            // analytics.dao-name.eth
}

export interface ENSMetadata {
  textRecords: Record<string, string>; // ENS text records
  contentHash?: string;         // ENS content hash
  reverseRecord?: string;       // Reverse ENS record
}

export interface SocialLinks {
  twitter?: string;
  discord?: string;
  telegram?: string;
  github?: string;
  medium?: string;
  reddit?: string;
}

export enum GovernanceType {
  TOKEN = "token",
  NFT = "nft",
  MULTISIG = "multisig",
  HYBRID = "hybrid"
}

export enum DAOStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending"
}

// Request/Response Types
export interface CreateDAORequest {
  name: string;
  symbol: string;
  description: string;
  chainId: number;
  contractAddress: string;
  tokenAddress: string;
  treasuryAddress: string;
  governanceType: GovernanceType;
  votingPeriod: number;
  quorum: number;
  proposalThreshold: number;
  logo?: string;
  website?: string;
  socialLinks?: SocialLinks;
  tags?: string[];
  ensDomain?: string;
}

export interface UpdateDAORequest {
  name?: string;
  symbol?: string;
  description?: string;
  logo?: string;
  website?: string;
  socialLinks?: SocialLinks;
  tags?: string[];
  status?: DAOStatus;
}

export interface DAOResponse {
  data: DAO;
  analytics?: DAOAnalytics;
  governance?: GovernanceInfo;
}

export interface DAOAnalytics {
  totalMembers: number;
  totalProposals: number;
  treasuryValue: number;
  participationRate: number;
  averageVotingPower: number;
}

export interface GovernanceInfo {
  activeProposals: number;
  executedProposals: number;
  totalVotingPower: number;
  quorumMet: number;
} 