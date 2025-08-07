/**
 * Data Source Mapping Types
 * RFC-001: DAO Registry Specification - Data Source Mapping Types
 */

// Base Data Source Interface
export interface DataSource<T> {
  id: string;
  type: DataSourceType;
  source: string;
  timestamp: Date;
  data: T;
  metadata: DataSourceMetadata;
}

export interface DataSourceMetadata {
  chainId: number;
  blockNumber: number;
  transactionHash?: string;
  eventIndex?: number;
  contractAddress?: string;
  verified: boolean;
  confidence: number;
}

export enum DataSourceType {
  SMART_CONTRACT_EVENT = "smart_contract_event",
  MANUAL_REGISTRATION = "manual_registration",
  STATIC_STATE_DATA = "static_state_data",
  API_UPDATE = "api_update",
  BATCH_IMPORT = "batch_import"
}

// Smart Contract Event Sources
export interface SmartContractEventSource<T> extends DataSource<T> {
  type: DataSourceType.SMART_CONTRACT_EVENT;
  eventName: string;
  eventSignature: string;
  eventParameters: EventParameter[];
  logIndex: number;
  removed: boolean;
}

export interface EventParameter {
  name: string;
  type: string;
  value: any;
  indexed: boolean;
}

export interface ContractEventMapping {
  eventName: string;
  contractAddress: string;
  chainId: number;
  mappingFunction: (event: SmartContractEventSource<any>) => any;
  validationRules: ValidationRule[];
  transformationRules: TransformationRule[];
}

// Manual Registration Sources
export interface ManualRegistrationSource<T> extends DataSource<T> {
  type: DataSourceType.MANUAL_REGISTRATION;
  registrant: string;
  registrationMethod: RegistrationMethod;
  validationStatus: ValidationStatus;
  approvalStatus: ApprovalStatus;
  submittedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export enum RegistrationMethod {
  WEB_FORM = "web_form",
  API_ENDPOINT = "api_endpoint",
  CLI_TOOL = "cli_tool",
  BATCH_UPLOAD = "batch_upload"
}

export enum ValidationStatus {
  PENDING = "pending",
  VALIDATED = "validated",
  FAILED = "failed",
  MANUAL_REVIEW = "manual_review"
}

export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  AUTO_APPROVED = "auto_approved"
}

// Static State Data Sources
export interface StaticStateDataSource<T> extends DataSource<T> {
  type: DataSourceType.STATIC_STATE_DATA;
  stateType: StateType;
  stateVersion: string;
  lastUpdated: Date;
  updateFrequency: UpdateFrequency;
  sourceUrl?: string;
  checksum: string;
}

export enum StateType {
  CONFIGURATION = "configuration",
  REFERENCE_DATA = "reference_data",
  TEMPLATE = "template",
  SCHEMA = "schema"
}

export enum UpdateFrequency {
  REAL_TIME = "real_time",
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  MANUAL = "manual"
}

// Data Source Registry
export interface DataSourceRegistry {
  sources: Map<string, DataSource<any>>;
  mappings: Map<string, ContractEventMapping>;
  validators: Map<string, DataSourceValidator<any>>;
  transformers: Map<string, DataSourceTransformer<any, any>>;
}

// Data Source Validators
export interface DataSourceValidator<T> {
  validate(source: DataSource<T>): ValidationResult;
  validateEvent(event: SmartContractEventSource<any>): EventValidationResult;
  validateRegistration(registration: ManualRegistrationSource<any>): RegistrationValidationResult;
  validateStaticData(staticData: StaticStateDataSource<any>): StaticDataValidationResult;
}

export interface EventValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  confidence: number;
  eventType: string;
  contractAddress: string;
}

export interface RegistrationValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  confidence: number;
  registrant: string;
  registrationMethod: RegistrationMethod;
}

export interface StaticDataValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  confidence: number;
  stateType: StateType;
  checksumValid: boolean;
}

// Data Source Transformers
export interface DataSourceTransformer<T, R> {
  transform(source: DataSource<T>): R;
  transformEvent(event: SmartContractEventSource<any>): any;
  transformRegistration(registration: ManualRegistrationSource<any>): any;
  transformStaticData(staticData: StaticStateDataSource<any>): any;
}

// Event Listeners
export interface EventListener {
  id: string;
  contractAddress: string;
  chainId: number;
  eventName: string;
  eventSignature: string;
  handler: EventHandler;
  filters: EventFilter[];
  enabled: boolean;
  lastProcessedBlock: number;
}

export interface EventHandler {
  (event: SmartContractEventSource<any>): Promise<void>;
}

export interface EventFilter {
  parameter: string;
  value: any;
  operator: FilterOperator;
}

export enum FilterOperator {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  CONTAINS = "contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with"
}

// Data Source Processors
export interface DataSourceProcessor<T, R> {
  process(source: DataSource<T>): Promise<ProcessingResult<R>>;
  validate(source: DataSource<T>): Promise<ValidationResult>;
  transform(source: DataSource<T>): Promise<R>;
  store(result: R): Promise<void>;
}

export interface ProcessingResult<T> {
  success: boolean;
  data?: T;
  errors: ProcessingError[];
  warnings: ProcessingWarning[];
  processingTime: number;
  sourceId: string;
}

export interface ProcessingError {
  code: string;
  message: string;
  field?: string;
  severity: ErrorSeverity;
}

export interface ProcessingWarning {
  code: string;
  message: string;
  field?: string;
  suggestion?: string;
}

export enum ErrorSeverity {
  CRITICAL = "critical",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info"
}

// Contract Event Mappings
export interface DAORegistryEventMapping {
  // DAO Registration Events
  DAORegistered: ContractEventMapping;
  DAOUpdated: ContractEventMapping;
  DAOVerified: ContractEventMapping;
  
  // ENS Registration Events
  DAOENSRegistered: ContractEventMapping;
  ENSSubdomainUpdated: ContractEventMapping;
  ENSRegistrationVerified: ContractEventMapping;
  
  // Governance Events
  ProposalCreated: ContractEventMapping;
  ProposalExecuted: ContractEventMapping;
  VoteCast: ContractEventMapping;
  
  // Treasury Events
  FundsReceived: ContractEventMapping;
  FundsWithdrawn: ContractEventMapping;
  
  // Member Events
  MemberAdded: ContractEventMapping;
  MemberRemoved: ContractEventMapping;
  RoleChanged: ContractEventMapping;
}

// Data Source Configuration
export interface DataSourceConfig {
  // Smart Contract Event Configuration
  smartContractEvents: {
    enabled: boolean;
    pollingInterval: number;
    maxBlockRange: number;
    retryAttempts: number;
    eventMappings: DAORegistryEventMapping;
  };
  
  // Manual Registration Configuration
  manualRegistration: {
    enabled: boolean;
    requireApproval: boolean;
    autoValidation: boolean;
    maxRegistrationPerHour: number;
    allowedRegistrationMethods: RegistrationMethod[];
  };
  
  // Static State Data Configuration
  staticStateData: {
    enabled: boolean;
    updateFrequency: UpdateFrequency;
    validationRequired: boolean;
    checksumValidation: boolean;
    allowedStateTypes: StateType[];
  };
  
  // Processing Configuration
  processing: {
    batchSize: number;
    maxConcurrentProcessors: number;
    timeoutSeconds: number;
    retryAttempts: number;
  };
}

// Data Source Monitoring
export interface DataSourceMonitor {
  getSourceStats(): DataSourceStats;
  getProcessingStats(): ProcessingStats;
  getErrorStats(): ErrorStats;
  getPerformanceMetrics(): PerformanceMetrics;
}

export interface DataSourceStats {
  totalSources: number;
  sourcesByType: Record<DataSourceType, number>;
  sourcesByChain: Record<number, number>;
  sourcesByStatus: Record<string, number>;
  lastUpdated: Date;
}

export interface ProcessingStats {
  totalProcessed: number;
  successful: number;
  failed: number;
  pending: number;
  averageProcessingTime: number;
  lastProcessed: Date;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  mostCommonErrors: string[];
  lastError: Date;
}

export interface PerformanceMetrics {
  throughput: number; // sources per second
  latency: number; // average processing time
  errorRate: number; // percentage of failed processing
  uptime: number; // percentage of time system is available
  lastUpdated: Date;
} 