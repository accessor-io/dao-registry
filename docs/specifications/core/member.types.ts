/**
 * Member Entity Types
 * RFC-001: DAO Registry Specification - Member Types
 */

export interface Member {
  id: string;                   // Unique identifier
  daoId: string;               // Associated DAO ID
  address: string;             // Member wallet address
  tokenBalance: number;        // Governance token balance
  votingPower: number;         // Calculated voting power
  
  // Activity Tracking
  proposalsCreated: number;    // Number of proposals created
  proposalsVoted: number;      // Number of proposals voted on
  lastActivity: Date;          // Last activity timestamp
  
  // Roles
  roles: MemberRole[];         // Member roles
  permissions: Permission[];   // Member permissions
}

export enum MemberRole {
  ADMIN = "admin",
  MODERATOR = "moderator",
  MEMBER = "member",
  GUEST = "guest"
}

export enum Permission {
  CREATE_PROPOSAL = "create_proposal",
  VOTE = "vote",
  EXECUTE_PROPOSAL = "execute_proposal",
  MANAGE_MEMBERS = "manage_members",
  MANAGE_SETTINGS = "manage_settings",
  VIEW_ANALYTICS = "view_analytics"
}

export interface MemberActivity {
  id: string;                  // Unique identifier
  memberId: string;            // Associated member ID
  activityType: ActivityType;  // Type of activity
  description: string;         // Activity description
  timestamp: Date;             // Activity timestamp
  metadata?: Record<string, any>; // Additional metadata
}

export enum ActivityType {
  PROPOSAL_CREATED = "proposal_created",
  VOTE_CAST = "vote_cast",
  PROPOSAL_EXECUTED = "proposal_executed",
  MEMBER_JOINED = "member_joined",
  MEMBER_LEFT = "member_left",
  ROLE_CHANGED = "role_changed"
}

export interface MemberAnalytics {
  totalMembers: number;
  activeMembers: number;
  averageVotingPower: number;
  participationRate: number;
  topContributors: TopContributor[];
}

export interface TopContributor {
  address: string;
  votingPower: number;
  proposalsCreated: number;
  proposalsVoted: number;
  lastActivity: Date;
}

// Request/Response Types
export interface AddMemberRequest {
  daoId: string;
  address: string;
  roles?: MemberRole[];
  permissions?: Permission[];
}

export interface UpdateMemberRequest {
  memberId: string;
  roles?: MemberRole[];
  permissions?: Permission[];
}

export interface MemberResponse {
  data: Member;
  activity: MemberActivity[];
  analytics: MemberAnalytics;
}

export interface MemberListResponse {
  data: Member[];
  pagination: PaginationInfo;
  analytics: MemberAnalytics;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
} 