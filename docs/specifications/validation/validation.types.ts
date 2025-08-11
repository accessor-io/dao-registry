/**
 * Validation Types
 * RFC-003: Nomenclature and Classification System - Validation Types
 */

// Base Validation Interface
export interface BaseValidator<T> {
  validate(input: T): ValidationResult;
  sanitize(input: T): T;
  getValidationRules(): ValidationRules;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  sanitizedValue?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: ValidationSeverity;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

export enum ValidationSeverity {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info"
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  minValue?: number;
  maxValue?: number;
  allowedValues?: any[];
  customValidator?: (value: any) => ValidationResult;
}

// ENS Domain Validation
export interface ENSDomainValidator extends BaseValidator<string> {
  validateDomain(domain: string): ENSDomainValidationResult;
  validateSubdomain(subdomain: string): ENSSubdomainValidationResult;
  validateTLD(tld: string): TLDValidationResult;
}

export interface ENSDomainValidationResult extends ValidationResult {
  domainType: ENSDomainType;
  normalizedDomain: string;
  tld: string;
  subdomains: string[];
  confidence: number;
}

export interface ENSSubdomainValidationResult extends ValidationResult {
  subdomainType: ENSSubdomainType;
  fullDomain: string;
  target: string;
}

export interface TLDValidationResult extends ValidationResult {
  isSupported: boolean;
  isReserved: boolean;
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

// Ethereum Address Validation
export interface EthereumAddressValidator extends BaseValidator<string> {
  validateAddress(address: string): AddressValidationResult;
  validateChecksum(address: string): ChecksumValidationResult;
  validateFormat(address: string): FormatValidationResult;
}

export interface AddressValidationResult extends ValidationResult {
  addressType: EthereumAddressType;
  checksumAddress?: string;
  confidence: number;
}

export interface ChecksumValidationResult extends ValidationResult {
  isValidChecksum: boolean;
  checksumAddress?: string;
}

export interface FormatValidationResult extends ValidationResult {
  isValidFormat: boolean;
  length: number;
  hasPrefix: boolean;
}

export enum EthereumAddressType {
  VALID = "valid",
  INVALID_FORMAT = "invalid_format",
  INVALID_CHECKSUM = "invalid_checksum",
  ZERO = "zero"
}

// DAO Name Validation
export interface DAONameValidator extends BaseValidator<string> {
  validateName(name: string): DAONameValidationResult;
  checkDuplicates(name: string): DuplicateCheckResult;
  checkReserved(name: string): ReservedCheckResult;
}

export interface DAONameValidationResult extends ValidationResult {
  nameType: DAONameType;
  normalizedName: string;
  confidence: number;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingDAOId?: string;
  existingDAOAddress?: string;
}

export interface ReservedCheckResult {
  isReserved: boolean;
  reason?: string;
  alternative?: string;
}

export enum DAONameType {
  VALID = "valid",
  INVALID_LENGTH = "invalid_length",
  INVALID_CHARS = "invalid_chars",
  DUPLICATE = "duplicate",
  RESERVED = "reserved"
}

// Text Record Validation
export interface TextRecordValidator extends BaseValidator<TextRecord> {
  validateKey(key: string): TextRecordKeyValidationResult;
  validateValue(value: string): TextRecordValueValidationResult;
  validateRecord(record: TextRecord): TextRecordValidationResult;
}

export interface TextRecord {
  key: string;
  value: string;
}

export interface TextRecordKeyValidationResult extends ValidationResult {
  keyType: TextRecordKeyType;
  normalizedKey: string;
}

export interface TextRecordValueValidationResult extends ValidationResult {
  valueType: TextRecordValueType;
  sanitizedValue: string;
}

export interface TextRecordValidationResult extends ValidationResult {
  recordType: TextRecordType;
  sanitizedRecord: TextRecord;
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

export enum TextRecordType {
  VALID = "valid",
  INVALID_KEY = "invalid_key",
  INVALID_VALUE = "invalid_value",
  TOO_LONG = "too_long",
  XSS_RISK = "xss_risk"
}

// Content Hash Validation
export interface ContentHashValidator extends BaseValidator<string> {
  validateHash(hash: string): ContentHashValidationResult;
  validateProtocol(protocol: string): ProtocolValidationResult;
  validateContent(content: string): ContentValidationResult;
}

export interface ContentHashValidationResult extends ValidationResult {
  hashType: ContentHashType;
  protocol: string;
  content: string;
  confidence: number;
}

export interface ProtocolValidationResult extends ValidationResult {
  isSupported: boolean;
  protocol: string;
}

export interface ContentValidationResult extends ValidationResult {
  isValidContent: boolean;
  contentType?: string;
}

export enum ContentHashType {
  IPFS = "ipfs",
  SWARM = "swarm",
  HTTP = "http",
  INVALID = "invalid"
}

// Numeric Validation
export interface NumericValidator extends BaseValidator<number> {
  validateInteger(value: number): IntegerValidationResult;
  validateDecimal(value: number): DecimalValidationResult;
  validatePercentage(value: number): PercentageValidationResult;
}

export interface IntegerValidationResult extends ValidationResult {
  numericType: NumericType;
  value: number;
  minValue?: number;
  maxValue?: number;
}

export interface DecimalValidationResult extends ValidationResult {
  numericType: NumericType;
  value: number;
  precision: number;
  scale: number;
}

export interface PercentageValidationResult extends ValidationResult {
  numericType: NumericType;
  value: number;
  isPercentage: boolean;
}

export enum NumericType {
  INTEGER = "integer",
  DECIMAL = "decimal",
  PERCENTAGE = "percentage",
  INVALID = "invalid"
}

// Security Validation
export interface SecurityValidator {
  preventXSS(input: string): XSSValidationResult;
  preventSQLInjection(input: string): SQLInjectionValidationResult;
  preventPathTraversal(input: string): PathTraversalValidationResult;
  validateInput(input: string): SecurityValidationResult;
}

export interface XSSValidationResult extends ValidationResult {
  hasXSSRisk: boolean;
  sanitizedValue: string;
  detectedPatterns: string[];
}

export interface SQLInjectionValidationResult extends ValidationResult {
  hasSQLInjectionRisk: boolean;
  sanitizedValue: string;
  detectedKeywords: string[];
}

export interface PathTraversalValidationResult extends ValidationResult {
  hasPathTraversalRisk: boolean;
  sanitizedValue: string;
  detectedPatterns: string[];
}

export interface SecurityValidationResult extends ValidationResult {
  securityScore: number;
  risks: SecurityRisk[];
  recommendations: string[];
}

export interface SecurityRisk {
  type: string;
  severity: ValidationSeverity;
  description: string;
  mitigation: string;
}

// Composite Validation
export interface CompositeValidator {
  validateDAO(dao: any): DAOValidationResult;
  validateProposal(proposal: any): ProposalValidationResult;
  validateMember(member: any): MemberValidationResult;
  validateENS(ens: any): ENSValidationResult;
}

export interface DAOValidationResult extends ValidationResult {
  daoValid: boolean;
  nameValid: boolean;
  addressValid: boolean;
  ensValid: boolean;
  governanceValid: boolean;
}

export interface ProposalValidationResult extends ValidationResult {
  proposalValid: boolean;
  actionsValid: boolean;
  votingValid: boolean;
  metadataValid: boolean;
}

export interface MemberValidationResult extends ValidationResult {
  memberValid: boolean;
  addressValid: boolean;
  rolesValid: boolean;
  permissionsValid: boolean;
}

export interface ENSValidationResult extends ValidationResult {
  ensValid: boolean;
  domainValid: boolean;
  subdomainsValid: boolean;
  metadataValid: boolean;
}

// Validation Service
export interface ValidationService {
  validators: Map<string, BaseValidator<any>>;
  
  registerValidator(name: string, validator: BaseValidator<any>): void;
  getValidator(name: string): BaseValidator<any> | undefined;
  validate<T>(validatorName: string, input: T): ValidationResult;
  sanitize<T>(validatorName: string, input: T): T;
  getValidationRules(validatorName: string): ValidationRules;
}

// Validation Configuration
export interface ValidationConfig {
  // ENS Validation
  ens: {
    allowedTLDs: string[];
    maxDomainLength: number;
    maxSubdomainLength: number;
    reservedNames: string[];
  };
  
  // Address Validation
  address: {
    requireChecksum: boolean;
    allowZeroAddress: boolean;
    maxLength: number;
  };
  
  // Name Validation
  name: {
    minLength: number;
    maxLength: number;
    allowedCharacters: RegExp;
    reservedNames: string[];
  };
  
  // Security Validation
  security: {
    enableXSSProtection: boolean;
    enableSQLInjectionProtection: boolean;
    enablePathTraversalProtection: boolean;
    maxInputLength: number;
  };
  
  // Numeric Validation
  numeric: {
    maxIntegerValue: number;
    maxDecimalPlaces: number;
    maxPercentageValue: number;
  };
} 