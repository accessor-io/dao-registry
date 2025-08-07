/**
 * Proposal Entity Types
 * RFC-001: DAO Registry Specification - Proposal Types
 */

export interface Proposal {
  id: string;                   // Unique identifier
  daoId: string;               // Associated DAO ID
  proposer: string;            // Proposer address
  title: string;               // Proposal title
  description: string;         // Proposal description
  
  // Voting Information
  startTime: Date;             // Voting start time
  endTime: Date;               // Voting end time
  quorum: number;              // Required quorum
  forVotes: number;            // Votes in favor
  againstVotes: number;        // Votes against
  abstainVotes: number;        // Abstain votes
  
  // Execution
  executed: boolean;           // Execution status
  executedAt?: Date;           // Execution timestamp
  canceled: boolean;           // Cancellation status
  
  // Actions
  actions: ProposalAction[];   // Proposed actions
  
  // Metadata
  metadata: ProposalMetadata;  // Additional metadata
}

export interface ProposalAction {
  target: string;              // Target contract address
  value: number;               // ETH value to send
  signature: string;           // Function signature
  calldata: string;           // Function parameters
}

export interface ProposalMetadata {
  ipfsHash?: string;          // IPFS hash for additional data
  discussionUrl?: string;      // Discussion forum URL
  tags?: string[];            // Categorization tags
  attachments?: string[];      // Attached files
}

export enum ProposalStatus {
  PENDING = "pending",
  ACTIVE = "active",
  SUCCEEDED = "succeeded",
  DEFEATED = "defeated",
  EXECUTED = "executed",
  CANCELED = "canceled"
}

export enum VoteType {
  FOR = "for",
  AGAINST = "against",
  ABSTAIN = "abstain"
}

export interface Vote {
  id: string;                  // Unique identifier
  proposalId: string;          // Associated proposal ID
  voter: string;               // Voter address
  voteType: VoteType;          // Vote type
  votingPower: number;         // Voting power used
  reason?: string;             // Optional reason
  timestamp: Date;             // Vote timestamp
}

// Request/Response Types
export interface CreateProposalRequest {
  daoId: string;
  title: string;
  description: string;
  actions: ProposalAction[];
  startTime: Date;
  endTime: Date;
  metadata?: ProposalMetadata;
}

export interface VoteRequest {
  proposalId: string;
  voteType: VoteType;
  reason?: string;
}

export interface ProposalResponse {
  data: Proposal;
  votes: Vote[];
  analytics: ProposalAnalytics;
}

export interface ProposalAnalytics {
  totalVotes: number;
  participationRate: number;
  quorumMet: boolean;
  timeRemaining: number;
  executionEligible: boolean;
}

export interface ProposalListResponse {
  data: Proposal[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
} 