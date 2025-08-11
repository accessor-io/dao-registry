/**
 * API Types
 * RFC-001: DAO Registry Specification - API Types
 */

// Import types from other modules
import type { 
  CreateDAORequest, 
  UpdateDAORequest 
} from '../core/dao.types';

import type { 
  CreateProposalRequest, 
  VoteRequest 
} from '../core/proposal.types';

import type { 
  AddMemberRequest, 
  UpdateMemberRequest 
} from '../core/member.types';

import type { 
  ENSRegistrationRequest, 
  ENSUpdateRequest, 
  ENSOwnershipVerificationRequest 
} from '../ens/ens-integration.types';

import type { 
  AnalyticsRequest, 
  AnalyticsExportRequest 
} from '../analytics/analytics.types';

// REST API Endpoints
export interface RESTEndpoints {
  // DAO Management
  '/api/v1/daos': {
    GET: DAOListRequest;
    POST: CreateDAORequest;
  };
  '/api/v1/daos/{daoId}': {
    GET: DAORequest;
    PUT: UpdateDAORequest;
    DELETE: DeleteDAORequest;
  };
  
  // Proposal Management
  '/api/v1/daos/{daoId}/proposals': {
    GET: ProposalListRequest;
    POST: CreateProposalRequest;
  };
  '/api/v1/proposals/{proposalId}': {
    GET: ProposalRequest;
  };
  '/api/v1/proposals/{proposalId}/vote': {
    POST: VoteRequest;
  };
  
  // Member Management
  '/api/v1/daos/{daoId}/members': {
    GET: MemberListRequest;
    POST: AddMemberRequest;
  };
  '/api/v1/members/{memberId}': {
    GET: MemberRequest;
    PUT: UpdateMemberRequest;
  };
  
  // ENS Integration
  '/api/v1/daos/{daoId}/ens': {
    GET: ENSRequest;
    POST: ENSRegistrationRequest;
    PUT: ENSUpdateRequest;
  };
  '/api/v1/ens/resolve/{domain}': {
    GET: ENSResolveRequest;
  };
  '/api/v1/ens/verify-ownership': {
    POST: ENSOwnershipVerificationRequest;
  };
  
  // Analytics
  '/api/v1/daos/{daoId}/analytics': {
    GET: AnalyticsRequest;
  };
  '/api/v1/analytics/export': {
    POST: AnalyticsExportRequest;
  };
}

// Missing request types that are referenced but not imported
export interface DeleteDAORequest {
  daoId: string;
}



// WebSocket API
export interface WebSocketAPI {
  // Connection
  connection: {
    url: string;
    protocols: string[];
    headers: Record<string, string>;
  };
  
  // Message Types
  messages: {
    subscribe: SubscribeMessage;
    unsubscribe: UnsubscribeMessage;
    ping: PingMessage;
    pong: PongMessage;
  };
  
  // Event Types
  events: {
    daoUpdated: DAOUpdateEvent;
    proposalCreated: ProposalCreatedEvent;
    proposalUpdated: ProposalUpdatedEvent;
    voteCast: VoteCastEvent;
    memberJoined: MemberJoinedEvent;
    memberLeft: MemberLeftEvent;
  };
}

// Request/Response Types
export interface DAOListRequest {
  page?: number;
  limit?: number;
  chainId?: number;
  status?: string;
  verified?: boolean;
  tags?: string[];
}

export interface DAORequest {
  daoId: string;
}

export interface ProposalListRequest {
  daoId: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ProposalRequest {
  proposalId: string;
}

export interface MemberListRequest {
  daoId: string;
  page?: number;
  limit?: number;
  role?: string;
}

export interface MemberRequest {
  memberId: string;
}

export interface ENSRequest {
  daoId: string;
}

export interface ENSResolveRequest {
  domain: string;
}



// WebSocket Message Types
export interface SubscribeMessage {
  type: 'subscribe';
  channel: string;
  daoId?: string;
  proposalId?: string;
}

export interface UnsubscribeMessage {
  type: 'unsubscribe';
  channel: string;
  daoId?: string;
  proposalId?: string;
}

export interface PingMessage {
  type: 'ping';
  timestamp: number;
}

export interface PongMessage {
  type: 'pong';
  timestamp: number;
}

// WebSocket Event Types
export interface DAOUpdateEvent {
  type: 'dao_updated';
  daoId: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface ProposalCreatedEvent {
  type: 'proposal_created';
  proposalId: string;
  daoId: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface ProposalUpdatedEvent {
  type: 'proposal_updated';
  proposalId: string;
  daoId: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface VoteCastEvent {
  type: 'vote_cast';
  proposalId: string;
  daoId: string;
  voter: string;
  voteType: string;
  votingPower: number;
  timestamp: number;
}

export interface MemberJoinedEvent {
  type: 'member_joined';
  daoId: string;
  memberId: string;
  address: string;
  timestamp: number;
}

export interface MemberLeftEvent {
  type: 'member_left';
  daoId: string;
  memberId: string;
  address: string;
  timestamp: number;
} 