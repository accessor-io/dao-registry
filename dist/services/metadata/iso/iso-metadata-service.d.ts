import { ethers } from 'ethers';
type ValidationStatus = 'VALID' | 'INVALID' | 'PENDING';
type RelationshipType = 'PARENT_CHILD' | 'SIBLING' | 'DEPENDENCY' | 'ASSOCIATION';
type EntityReference = string;
type RecordType = 'DAO_RECORD' | 'GOVERNANCE_ACTION' | 'TREASURY_TRANSACTION' | 'ENS_RECORD';
type AgentType = 'DAO_MEMBER' | 'SMART_CONTRACT' | 'EXTERNAL_SERVICE' | 'REGULATORY_AUTHORITY';
type SecurityLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
type CreationMethod = 'AUTOMATIC' | 'MANUAL' | 'SYSTEM_GENERATED';
type EventType = 'CREATE' | 'UPDATE' | 'DELETE' | 'ACCESS' | 'ARCHIVE';
interface AccessEvent {
    eventId: string;
    eventType: string;
    timestamp: Date;
    userId: string;
    accessMethod: string;
}
interface EntityRelationship {
    relationshipId: string;
    sourceEntity: EntityReference;
    targetEntity: EntityReference;
    relationshipType: RelationshipType;
    metadata: any;
}
interface AccessRights {
    read: boolean;
    write: boolean;
    delete: boolean;
    admin: boolean;
}
interface AgentReference {
    agentId: string;
    agentType: AgentType;
    address: string;
}
interface TokenReference {
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
}
interface TokenBalance {
    tokenAddress: string;
    balance: string;
    decimals: number;
}
interface VotingMechanism {
    mechanismType: string;
    parameters: any;
}
interface MemberRole {
    roleId: string;
    roleName: string;
    permissions: string[];
}
interface ProposalProcess {
    processId: string;
    processSteps: any[];
}
interface VotingProcess {
    processId: string;
    votingMechanism: string;
    parameters: any;
}
interface ExecutionProcess {
    processId: string;
    executionSteps: any[];
}
interface GovernanceRule {
    ruleId: string;
    ruleType: string;
    ruleContent: string;
}
interface Bylaw {
    bylawId: string;
    bylawTitle: string;
    bylawContent: string;
}
interface ConstitutionalElement {
    elementId: string;
    elementType: string;
    elementContent: string;
}
interface GovernanceDecision {
    decisionId: string;
    decisionType: string;
    decisionContent: string;
}
interface DissentingOpinion {
    opinionId: string;
    dissenter: string;
    opinionContent: string;
}
interface TextRecord {
    key: string;
    value: string;
}
interface AddressRecord {
    coinType: number;
    address: string;
}
interface ENSIntegration {
    integrationType: string;
    integrationStatus: string;
}
interface MetadataService {
    serviceType: string;
    serviceEndpoint: string;
}
interface UsageRights {
    allowedUses: string[];
    restrictions: string[];
    expirationDate?: Date;
}
interface RetentionSchedule {
    retentionPeriod: number;
    dispositionAction: string;
    reviewDate: Date;
}
interface SystemEnvironment {
    platform: string;
    version: string;
    dependencies: string[];
}
interface EventRecord {
    eventId: string;
    eventType: string;
    eventTimestamp: Date;
    eventData: any;
}
interface ChangeRecord {
    changeId: string;
    changeType: string;
    changeTimestamp: Date;
    changeDescription: string;
}
interface VersionRecord {
    versionId: string;
    versionNumber: string;
    versionTimestamp: Date;
    versionChanges: string[];
}
interface AuditRecord {
    auditId: string;
    auditType: string;
    auditTimestamp: Date;
    auditDetails: any;
}
interface FunctionalRelationship {
    relationshipId: string;
    relationshipType: string;
    sourceEntity: EntityReference;
    targetEntity: EntityReference;
}
interface TemporalRelationship {
    relationshipId: string;
    relationshipType: string;
    sourceEntity: EntityReference;
    targetEntity: EntityReference;
    temporalOrder: string;
}
interface SpatialRelationship {
    relationshipId: string;
    relationshipType: string;
    sourceEntity: EntityReference;
    targetEntity: EntityReference;
    spatialContext: string;
}
interface SystemMetadata {
    captureTimestamp: Date;
    systemVersion: string;
    captureMethod: string;
    dataSource: string;
    qualityMetrics: QualityMetrics;
}
interface UserMetadata {
    captureTimestamp: Date;
    userAgent: string;
    sessionId: string;
    userId: string;
    captureMethod: string;
    dataSource: string;
    validationStatus: ValidationStatus;
}
interface BusinessMetadata {
    captureTimestamp: Date;
    businessFunction: string;
    businessProcess: string;
    businessActivity: string;
    businessRules: any[];
    complianceRequirements: any[];
    captureMethod: string;
    dataSource: string;
}
interface StorageResult {
    success: boolean;
    storageId?: string;
    centralizedId?: string;
    decentralizedId?: string;
    storageTimestamp: Date;
    storageLocation: string;
    metadataHash?: string;
    error?: string;
}
interface EntityLink {
    linkId: string;
    sourceEntity: EntityReference;
    targetEntity: EntityReference;
    relationshipType: RelationshipType;
    linkTimestamp: Date;
    linkMetadata: LinkMetadata;
}
interface LinkMetadata {
    linkStrength: string;
    linkDirection: string;
    linkContext: string;
}
interface RelationshipHistory {
    timestamp: Date;
    eventType: string;
    description: string;
    metadata: any;
}
interface RetentionValue {
    retentionValue: number;
    retentionFactors: any;
    retentionDecision: string;
    retentionPeriod: number;
}
interface ArchivalValue {
    archivalValue: number;
    archivalFactors: any;
    archivalDecision: string;
    archivalLocation: string;
}
interface MetadataSecurity {
    accessControl: AccessControl;
    dataProtection: DataProtection;
    auditLogging: AuditLogging;
}
interface AccessControl {
    authentication: string;
    authorization: string;
    encryption: string;
}
interface DataProtection {
    encryption: string;
    integrity: string;
    confidentiality: string;
}
interface AuditLogging {
    enabled: boolean;
    logLevel: string;
    retentionPeriod: number;
}
interface ComplianceValidation {
    compliant: boolean;
    complianceChecks: any;
    complianceScore: number;
    recommendations: string[];
}
interface QualityMetrics {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
}
/**
 * Identity Metadata - Unique identifiers and classification
 */
interface IdentityMetadata {
    recordId: string;
    systemId: string;
    externalId?: string;
    recordType: RecordType;
    securityClassification: SecurityLevel;
    accessRights: AccessRights;
    creator: AgentReference;
    creationDate: Date;
    creationMethod: CreationMethod;
}
/**
 * Description Metadata - Content description and technical characteristics
 */
interface DescriptionMetadata {
    title: string;
    subject: string[];
    abstract?: string;
    keywords: string[];
    language: string;
    format: string;
    encoding: string;
    fileSize: number;
    checksum: string;
    mimeType: string;
}
/**
 * Use Metadata - Access, usage, and business context
 */
interface UseMetadata {
    accessHistory: AccessEvent[];
    usageRights: UsageRights;
    retentionSchedule: RetentionSchedule;
    businessFunction: string;
    businessProcess: string;
    businessActivity: string;
    systemEnvironment: SystemEnvironment;
    applicationSoftware: string;
    hardwarePlatform: string;
}
/**
 * Event History Metadata - Event tracking and change history
 */
interface EventHistoryMetadata {
    events: EventRecord[];
    eventTypes: EventType[];
    eventTimestamps: Date[];
    changeHistory: ChangeRecord[];
    versionHistory: VersionRecord[];
    auditTrail: AuditRecord[];
}
/**
 * Relation Metadata - Entity relationships and hierarchies
 */
interface RelationMetadata {
    relationships: EntityRelationship[];
    relationshipTypes: RelationshipType[];
    parentRecords: EntityReference[];
    childRecords: EntityReference[];
    siblingRecords: EntityReference[];
    functionalRelationships: FunctionalRelationship[];
    temporalRelationships: TemporalRelationship[];
    spatialRelationships: SpatialRelationship[];
}
/**
 * DAO Context Metadata - DAO identification and governance structure
 */
interface DAOContextMetadata {
    daoName: string;
    daoSymbol: string;
    daoDescription: string;
    governanceToken: TokenReference;
    votingMechanism: VotingMechanism;
    proposalThreshold: number;
    quorumThreshold: number;
    treasuryAddress: string;
    treasuryBalance: TokenBalance[];
    memberCount: number;
    activeMembers: AgentReference[];
    memberRoles: MemberRole[];
}
/**
 * Governance Context Metadata - Governance processes and rules
 */
interface GovernanceContextMetadata {
    proposalProcess: ProposalProcess;
    votingProcess: VotingProcess;
    executionProcess: ExecutionProcess;
    governanceRules: GovernanceRule[];
    bylaws: Bylaw[];
    constitutionalElements: ConstitutionalElement[];
    decisions: GovernanceDecision[];
    decisionRationale: string;
    dissentingOpinions: DissentingOpinion[];
}
/**
 * Blockchain Context Metadata - Blockchain and smart contract information
 */
interface BlockchainContextMetadata {
    networkId: number;
    chainId: string;
    blockNumber: number;
    transactionHash: string;
    contractAddress: string;
    contractABI: string;
    contractVersion: string;
    gasUsed: number;
    gasPrice: number;
    totalFees: number;
    blockTimestamp: Date;
    blockHash: string;
    minerAddress: string;
}
/**
 * ENS Context Metadata - ENS domain and integration information
 */
interface ENSContextMetadata {
    domainName: string;
    domainHash: string;
    resolverAddress: string;
    textRecords: TextRecord[];
    addressRecords: AddressRecord[];
    contentHash: string;
    registrationDate: Date;
    expirationDate: Date;
    ownerAddress: string;
    ensIntegration: ENSIntegration;
    metadataService: MetadataService;
}
/**
 * Complete DAO Metadata Schema
 */
interface DAOMetadataSchema {
    identity: IdentityMetadata;
    description: DescriptionMetadata;
    use: UseMetadata;
    events: EventHistoryMetadata;
    relations: RelationMetadata;
    daoContext: DAOContextMetadata;
    governanceContext: GovernanceContextMetadata;
    blockchainContext: BlockchainContextMetadata;
    ensContext: ENSContextMetadata;
}
/**
 * ISO 23081-2:2021 Metadata Standards Service
 * Implements metadata management for DAO records according to ISO standards
 */
export declare class ISOMetadataService {
    private ens;
    private provider;
    constructor(provider: ethers.providers.Provider);
    /**
     * Metadata Schema Validation
     */
    private readonly metadataSchema;
    /**
     * Capture system-generated metadata
     */
    captureSystemMetadata(record: any): Promise<SystemMetadata>;
    /**
     * Capture user-provided metadata
     */
    captureUserMetadata(userInput: any): Promise<UserMetadata>;
    /**
     * Capture business context metadata
     */
    captureBusinessMetadata(businessContext: any): Promise<BusinessMetadata>;
    /**
     * Store metadata in centralized repository
     */
    storeCentralized(metadata: DAOMetadataSchema): Promise<StorageResult>;
    /**
     * Store metadata in decentralized storage (IPFS)
     */
    storeDecentralized(metadata: DAOMetadataSchema): Promise<StorageResult>;
    /**
     * Store metadata in hybrid storage (both centralized and decentralized)
     */
    storeHybrid(metadata: DAOMetadataSchema): Promise<StorageResult>;
    /**
     * Link entities through metadata relationships
     */
    linkEntities(sourceEntity: EntityReference, targetEntity: EntityReference, relationshipType: RelationshipType): Promise<EntityLink>;
    /**
     * Track relationship history
     */
    trackRelationshipHistory(relationshipId: string): Promise<RelationshipHistory[]>;
    /**
     * Evaluate retention value of metadata
     */
    evaluateRetentionValue(metadata: DAOMetadataSchema): Promise<RetentionValue>;
    /**
     * Evaluate archival value of metadata
     */
    evaluateArchivalValue(metadata: DAOMetadataSchema): Promise<ArchivalValue>;
    /**
     * Apply metadata security controls
     */
    applySecurityControls(metadata: DAOMetadataSchema): Promise<MetadataSecurity>;
    /**
     * Validate compliance requirements
     */
    validateCompliance(metadata: DAOMetadataSchema): Promise<ComplianceValidation>;
    /**
     * Calculate metadata hash for integrity verification
     */
    private calculateMetadataHash;
    /**
     * Generate unique link ID
     */
    private generateLinkId;
    /**
     * Calculate quality metrics for metadata
     */
    private calculateQualityMetrics;
    private storeInDatabase;
    private storeInIPFS;
    private storeEntityLink;
    private getRelationshipHistory;
    private calculateBusinessValue;
    private calculateRegulatoryValue;
    private calculateHistoricalValue;
    private calculateTechnicalValue;
    private calculateRetentionPeriod;
    private calculateHistoricalSignificance;
    private calculateResearchValue;
    private calculateCulturalValue;
    private calculateEducationalValue;
    private determineArchivalLocation;
    private checkISO23081Compliance;
    private checkGDPRCompliance;
    private checkBlockchainCompliance;
    private checkDAOCompliance;
    private calculateComplianceScore;
    private generateComplianceRecommendations;
    private validateUserMetadata;
    private calculateCompleteness;
    private calculateAccuracy;
    private calculateConsistency;
    private calculateTimeliness;
}
export default ISOMetadataService;
//# sourceMappingURL=iso-metadata-service.d.ts.map