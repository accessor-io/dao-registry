/**
 * Analytics Types
 * RFC-001: DAO Registry Specification - Analytics Types
 */

export interface DAOAnalytics {
  // Basic Metrics
  totalMembers: number;
  totalProposals: number;
  treasuryValue: number;
  participationRate: number;
  averageVotingPower: number;
  
  // Governance Metrics
  activeProposals: number;
  executedProposals: number;
  totalVotingPower: number;
  quorumMet: number;
  
  // Time-based Metrics
  proposalsThisMonth: number;
  proposalsThisYear: number;
  averageProposalDuration: number;
  
  // Financial Metrics
  treasuryGrowth: number;
  averageProposalValue: number;
  totalExecutedValue: number;
}

export interface ProposalAnalytics {
  totalVotes: number;
  participationRate: number;
  quorumMet: boolean;
  timeRemaining: number;
  executionEligible: boolean;
  
  // Vote Distribution
  forVotesPercentage: number;
  againstVotesPercentage: number;
  abstainVotesPercentage: number;
  
  // Time Analytics
  votingDuration: number;
  timeUntilExecution: number;
  averageVoteTime: number;
}

export interface MemberAnalytics {
  totalMembers: number;
  activeMembers: number;
  averageVotingPower: number;
  participationRate: number;
  topContributors: TopContributor[];
  
  // Activity Metrics
  newMembersThisMonth: number;
  activeMembersThisMonth: number;
  averageActivityPerMember: number;
  
  // Engagement Metrics
  votingParticipationRate: number;
  proposalCreationRate: number;
  averageMemberTenure: number;
}

export interface TopContributor {
  address: string;
  votingPower: number;
  proposalsCreated: number;
  proposalsVoted: number;
  lastActivity: Date;
  contributionScore: number;
}

export interface TreasuryAnalytics {
  totalValue: number;
  valueChange24h: number;
  valueChange7d: number;
  valueChange30d: number;
  
  // Asset Distribution
  assetBreakdown: AssetBreakdown[];
  topAssets: AssetInfo[];
  
  // Transaction Analytics
  totalTransactions: number;
  averageTransactionValue: number;
  largestTransaction: number;
}

export interface AssetBreakdown {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  percentage: number;
  price: number;
  priceChange24h: number;
}

export interface AssetInfo {
  symbol: string;
  name: string;
  value: number;
  balance: number;
  price: number;
}

export interface RiskMetrics {
  // Governance Risk
  governanceRisk: number;
  quorumRisk: number;
  participationRisk: number;
  
  // Financial Risk
  treasuryRisk: number;
  concentrationRisk: number;
  volatilityRisk: number;
  
  // Operational Risk
  executionRisk: number;
  proposalRisk: number;
  memberRisk: number;
}

export interface ComparativeAnalytics {
  // Peer Comparison
  peerComparison: PeerComparison[];
  industryBenchmarks: IndustryBenchmark[];
  
  // Historical Comparison
  historicalTrends: HistoricalTrend[];
  performanceMetrics: PerformanceMetric[];
}

export interface PeerComparison {
  daoId: string;
  daoName: string;
  metric: string;
  value: number;
  rank: number;
  percentile: number;
}

export interface IndustryBenchmark {
  metric: string;
  average: number;
  median: number;
  top25: number;
  top10: number;
}

export interface HistoricalTrend {
  date: Date;
  value: number;
  change: number;
  changePercentage: number;
}

export interface PerformanceMetric {
  metric: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: TrendDirection;
}

export enum TrendDirection {
  UP = "up",
  DOWN = "down",
  STABLE = "stable"
}

// Request/Response Types
export interface AnalyticsRequest {
  daoId: string;
  timeRange: TimeRange;
  metrics: string[];
  includeComparative?: boolean;
  includeRisk?: boolean;
}

export enum TimeRange {
  DAY = "1d",
  WEEK = "7d",
  MONTH = "30d",
  QUARTER = "90d",
  YEAR = "365d",
  ALL = "all"
}

export interface AnalyticsResponse {
  daoAnalytics: DAOAnalytics;
  proposalAnalytics?: ProposalAnalytics;
  memberAnalytics?: MemberAnalytics;
  treasuryAnalytics?: TreasuryAnalytics;
  riskMetrics?: RiskMetrics;
  comparativeAnalytics?: ComparativeAnalytics;
}

export interface AnalyticsExportRequest {
  daoId: string;
  format: ExportFormat;
  timeRange: TimeRange;
  metrics: string[];
}

export enum ExportFormat {
  CSV = "csv",
  JSON = "json",
  EXCEL = "excel",
  PDF = "pdf"
}

export interface AnalyticsExportResponse {
  downloadUrl: string;
  expiresAt: Date;
  format: ExportFormat;
  size: number;
} 