/**
 * Classification Types
 * RFC-002: Data Point Classifiers - Classification Types
 */

// Base Classifier Interface
export interface BaseClassifier<T, R> {
  classify(input: T): R;
  validate(input: T): boolean;
  sanitize(input: T): T;
  getClassificationRules(): ClassificationRules;
}

export interface ClassificationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedValues?: any[];
  customClassifier?: (value: any) => any;
}

export interface ClassificationResult<T> {
  input: T;
  classification: any;
  confidence: number;
  metadata?: Record<string, any>;
}

// ENS Domain Classifier
export interface ENSDomainClassifier extends BaseClassifier<string, ENSDomainClassification> {
  classifyDomain(domain: string): ENSDomainClassification;
  classifySubdomain(subdomain: string): ENSSubdomainClassification;
  classifyTLD(tld: string): TLDClassification;
}

export interface ENSDomainClassification {
  type: ENSDomainType;
  domain: string;
  normalizedDomain: string;
  tld: string;
  subdomains: string[];
  confidence: number;
}

export interface ENSSubdomainClassification {
  type: ENSSubdomainType;
  subdomain: string;
  fullDomain: string;
  target: string;
  confidence: number;
}

export interface TLDClassification {
  tld: string;
  isSupported: boolean;
  isReserved: boolean;
  confidence: number;
}

export enum ENSDomainType {
  PRIMARY = "primary",
  SUBDOMAIN = "subdomain",
  INVALID = "invalid"
}

export enum ENSSubdomainType {
  ADDRESS = "address",
  CONTENT_HASH = "content_hash",
  TEXT_RECORD = "text_record"
}

// Ethereum Address Classifier
export interface EthereumAddressClassifier extends BaseClassifier<string, EthereumAddressClassification> {
  classifyAddress(address: string): EthereumAddressClassification;
  classifyCategory(address: string): AddressCategoryClassification;
  classifyFormat(address: string): AddressFormatClassification;
}

export interface EthereumAddressClassification {
  type: EthereumAddressType;
  address: string;
  checksumAddress?: string;
  confidence: number;
}

export interface AddressCategoryClassification {
  category: AddressCategory;
  address: string;
  confidence: number;
}

export interface AddressFormatClassification {
  format: AddressFormat;
  address: string;
  isValid: boolean;
  confidence: number;
}

export enum EthereumAddressType {
  VALID = "valid",
  INVALID_FORMAT = "invalid_format",
  INVALID_CHECKSUM = "invalid_checksum",
  ZERO = "zero"
}

export enum AddressCategory {
  DAO_CONTRACT = "dao_contract",
  TOKEN_CONTRACT = "token_contract",
  TREASURY_CONTRACT = "treasury_contract",
  USER_ADDRESS = "user_address",
  UNKNOWN = "unknown"
}

export enum AddressFormat {
  CHECKSUM = "checksum",
  LOWERCASE = "lowercase",
  UPPERCASE = "uppercase",
  INVALID = "invalid"
}

// DAO Name Classifier
export interface DAONameClassifier extends BaseClassifier<string, DAONameClassification> {
  classifyName(name: string): DAONameClassification;
  classifyCategory(name: string): DAOCategoryClassification;
  classifyComplexity(name: string): ComplexityClassification;
}

export interface DAONameClassification {
  type: DAONameType;
  name: string;
  normalizedName: string;
  confidence: number;
}

export interface DAOCategoryClassification {
  category: DAOCategory;
  name: string;
  confidence: number;
}

export interface ComplexityClassification {
  complexity: ComplexityLevel;
  name: string;
  wordCount: number;
  characterCount: number;
  confidence: number;
}

export enum DAONameType {
  VALID = "valid",
  INVALID_LENGTH = "invalid_length",
  INVALID_CHARS = "invalid_chars",
  DUPLICATE = "duplicate",
  RESERVED = "reserved"
}

export enum DAOCategory {
  DEFI = "defi",
  GOVERNANCE = "governance",
  NFT = "nft",
  INFRASTRUCTURE = "infrastructure",
  SOCIAL = "social",
  OTHER = "other"
}

export enum ComplexityLevel {
  SIMPLE = "simple",
  MODERATE = "moderate",
  COMPLEX = "complex"
}

// Text Record Classifier
export interface TextRecordClassifier extends BaseClassifier<TextRecord, TextRecordClassification> {
  classifyKey(key: string): TextRecordKeyClassification;
  classifyValue(value: string): TextRecordValueClassification;
  classifyRecord(record: TextRecord): TextRecordClassification;
}

export interface TextRecord {
  key: string;
  value: string;
}

export interface TextRecordClassification {
  type: TextRecordType;
  key: string;
  value: string;
  sanitizedValue: string;
  confidence: number;
}

export interface TextRecordKeyClassification {
  type: TextRecordKeyType;
  key: string;
  normalizedKey: string;
  confidence: number;
}

export interface TextRecordValueClassification {
  type: TextRecordValueType;
  value: string;
  sanitizedValue: string;
  confidence: number;
}

export enum TextRecordType {
  VALID = "valid",
  INVALID_KEY = "invalid_key",
  INVALID_VALUE = "invalid_value",
  TOO_LONG = "too_long",
  XSS_RISK = "xss_risk"
}

export enum TextRecordKeyType {
  VALID = "valid",
  INVALID_FORMAT = "invalid_format",
  RESERVED = "reserved"
}

export enum TextRecordValueType {
  VALID = "valid",
  TOO_LONG = "too_long",
  INVALID_CHARS = "invalid_chars",
  XSS_RISK = "xss_risk"
}

// Content Hash Classifier
export interface ContentHashClassifier extends BaseClassifier<string, ContentHashClassification> {
  classifyHash(hash: string): ContentHashClassification;
  classifyProtocol(protocol: string): ProtocolClassification;
  classifyContent(content: string): ContentClassification;
}

export interface ContentHashClassification {
  type: ContentHashType;
  hash: string;
  protocol: string;
  content: string;
  confidence: number;
}

export interface ProtocolClassification {
  protocol: string;
  isSupported: boolean;
  confidence: number;
}

export interface ContentClassification {
  content: string;
  isValidContent: boolean;
  contentType?: string;
  confidence: number;
}

export enum ContentHashType {
  IPFS = "ipfs",
  SWARM = "swarm",
  HTTP = "http",
  INVALID = "invalid"
}

// Numeric Classifier
export interface NumericClassifier extends BaseClassifier<number, NumericClassification> {
  classifyInteger(value: number): IntegerClassification;
  classifyDecimal(value: number): DecimalClassification;
  classifyPercentage(value: number): PercentageClassification;
}

export interface NumericClassification {
  type: NumericType;
  value: number;
  minValue?: number;
  maxValue?: number;
  precision?: number;
  confidence: number;
}

export interface IntegerClassification extends NumericClassification {
  isInteger: boolean;
  range: string;
}

export interface DecimalClassification extends NumericClassification {
  isDecimal: boolean;
  scale: number;
}

export interface PercentageClassification extends NumericClassification {
  isPercentage: boolean;
  percentageValue: number;
}

export enum NumericType {
  INTEGER = "integer",
  DECIMAL = "decimal",
  PERCENTAGE = "percentage",
  INVALID = "invalid"
}

// Composite Classifier
export interface CompositeClassifier {
  classifyDAO(dao: any): DAOClassificationResult;
  classifyProposal(proposal: any): ProposalClassificationResult;
  classifyMember(member: any): MemberClassificationResult;
  classifyENS(ens: any): ENSClassificationResult;
}

export interface DAOClassificationResult {
  daoClassification: DAOClassification;
  nameClassification: DAONameClassification;
  addressClassification: EthereumAddressClassification;
  ensClassification: ENSDomainClassification;
  governanceClassification: GovernanceClassification;
}

export interface ProposalClassificationResult {
  proposalClassification: ProposalClassification;
  actionsClassification: ActionsClassification;
  votingClassification: VotingClassification;
  metadataClassification: MetadataClassification;
}

export interface MemberClassificationResult {
  memberClassification: MemberClassification;
  addressClassification: EthereumAddressClassification;
  rolesClassification: RolesClassification;
  permissionsClassification: PermissionsClassification;
}

export interface ENSClassificationResult {
  ensClassification: ENSClassification;
  domainClassification: ENSDomainClassification;
  subdomainsClassification: ENSSubdomainClassification[];
  metadataClassification: MetadataClassification;
}

// Additional Classifications
export interface DAOClassification {
  type: DAOType;
  category: DAOCategory;
  complexity: ComplexityLevel;
  confidence: number;
}

export interface GovernanceClassification {
  type: GovernanceType;
  votingMechanism: VotingMechanism;
  quorumType: QuorumType;
  confidence: number;
}

export interface ProposalClassification {
  type: ProposalType;
  category: ProposalCategory;
  complexity: ComplexityLevel;
  confidence: number;
}

export interface ActionsClassification {
  actionCount: number;
  actionTypes: ActionType[];
  totalValue: number;
  confidence: number;
}

export interface VotingClassification {
  votingPeriod: number;
  quorum: number;
  participationRate: number;
  confidence: number;
}

export interface MetadataClassification {
  type: MetadataType;
  completeness: CompletenessLevel;
  quality: QualityLevel;
  confidence: number;
}

export interface MemberClassification {
  type: MemberType;
  role: MemberRole;
  activityLevel: ActivityLevel;
  confidence: number;
}

export interface RolesClassification {
  roles: MemberRole[];
  primaryRole: MemberRole;
  confidence: number;
}

export interface PermissionsClassification {
  permissions: Permission[];
  permissionLevel: PermissionLevel;
  confidence: number;
}

export interface ENSClassification {
  type: ENSType;
  completeness: CompletenessLevel;
  quality: QualityLevel;
  confidence: number;
}

// Enums for Additional Classifications
export enum DAOType {
  TOKEN_BASED = "token_based",
  NFT_BASED = "nft_based",
  MULTISIG = "multisig",
  HYBRID = "hybrid"
}

export enum GovernanceType {
  TOKEN = "token",
  NFT = "nft",
  MULTISIG = "multisig",
  HYBRID = "hybrid"
}

export enum VotingMechanism {
  TOKEN_VOTING = "token_voting",
  NFT_VOTING = "nft_voting",
  MULTISIG_VOTING = "multisig_voting",
  DELEGATED_VOTING = "delegated_voting"
}

export enum QuorumType {
  PERCENTAGE = "percentage",
  ABSOLUTE = "absolute",
  MINIMUM = "minimum"
}

export enum ProposalType {
  GOVERNANCE = "governance",
  TREASURY = "treasury",
  PARAMETER = "parameter",
  EMERGENCY = "emergency"
}

export enum ProposalCategory {
  FUNDING = "funding",
  PARAMETER_CHANGE = "parameter_change",
  EMERGENCY = "emergency",
  GOVERNANCE = "governance"
}

export enum ActionType {
  TRANSFER = "transfer",
  CALL = "call",
  DEPLOY = "deploy",
  UPGRADE = "upgrade"
}

export enum MemberType {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ADMIN = "admin",
  MODERATOR = "moderator"
}

export enum ActivityLevel {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  INACTIVE = "inactive"
}

export enum PermissionLevel {
  ADMIN = "admin",
  MODERATOR = "moderator",
  MEMBER = "member",
  GUEST = "guest"
}

export enum ENSType {
  PRIMARY = "primary",
  SUBDOMAIN = "subdomain",
  MULTI_SUBDOMAIN = "multi_subdomain"
}

export enum MetadataType {
  COMPLETE = "complete",
  PARTIAL = "partial",
  MINIMAL = "minimal",
  MISSING = "missing"
}

export enum CompletenessLevel {
  COMPLETE = "complete",
  PARTIAL = "partial",
  MINIMAL = "minimal",
  MISSING = "missing"
}

export enum QualityLevel {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  POOR = "poor"
}

// Classification Service
export interface ClassificationService {
  classifiers: Map<string, BaseClassifier<any, any>>;
  
  registerClassifier(name: string, classifier: BaseClassifier<any, any>): void;
  getClassifier(name: string): BaseClassifier<any, any> | undefined;
  classify<T, R>(classifierName: string, input: T): R;
  validate(classifierName: string, input: any): boolean;
  sanitize(classifierName: string, input: any): any;
  getClassificationRules(classifierName: string): ClassificationRules;
}

// Classification Configuration
export interface ClassificationConfig {
  // ENS Classification
  ens: {
    allowedTLDs: string[];
    maxDomainLength: number;
    maxSubdomainLength: number;
    reservedNames: string[];
  };
  
  // Address Classification
  address: {
    requireChecksum: boolean;
    allowZeroAddress: boolean;
    maxLength: number;
  };
  
  // Name Classification
  name: {
    minLength: number;
    maxLength: number;
    allowedCharacters: RegExp;
    reservedNames: string[];
  };
  
  // Numeric Classification
  numeric: {
    maxIntegerValue: number;
    maxDecimalPlaces: number;
    maxPercentageValue: number;
  };
} 