/**
 * Registration Mapping Types
 * RFC-001: DAO Registry Specification - Registration Mapping Types
 */

import { DAO, Proposal, Member, ENSRegistration } from '../core/dao.types';
import { ManualRegistrationSource, StaticStateDataSource, RegistrationMethod, ValidationStatus, ApprovalStatus } from './data-sources.types';

// Manual Registration Mapping Interfaces
export interface ManualRegistrationMapping<T> {
  registrationMethod: RegistrationMethod;
  mappingFunction: (registration: ManualRegistrationSource<any>) => T;
  validationRules: RegistrationValidationRule[];
  transformationRules: RegistrationTransformationRule[];
  metadata: RegistrationMappingMetadata;
}

export interface RegistrationMappingMetadata {
  description: string;
  version: string;
  author: string;
  lastUpdated: Date;
  supportedMethods: RegistrationMethod[];
  requiredFields: string[];
  optionalFields: string[];
}

export interface RegistrationValidationRule {
  field: string;
  rule: RegistrationValidationRuleType;
  value?: any;
  message: string;
  severity: RegistrationValidationSeverity;
}

export interface RegistrationTransformationRule {
  field: string;
  transformation: RegistrationTransformationType;
  parameters?: Record<string, any>;
  description: string;
}

export enum RegistrationValidationRuleType {
  REQUIRED = "required",
  MIN_LENGTH = "min_length",
  MAX_LENGTH = "max_length",
  PATTERN = "pattern",
  MIN_VALUE = "min_value",
  MAX_VALUE = "max_value",
  ENUM = "enum",
  UNIQUE = "unique",
  EXISTS = "exists",
  CUSTOM = "custom"
}

export enum RegistrationTransformationType {
  TO_LOWERCASE = "to_lowercase",
  TO_UPPERCASE = "to_uppercase",
  TRIM = "trim",
  PARSE_INT = "parse_int",
  PARSE_FLOAT = "parse_float",
  PARSE_BOOLEAN = "parse_boolean",
  PARSE_DATE = "parse_date",
  HEX_TO_ADDRESS = "hex_to_address",
  ADDRESS_TO_CHECKSUM = "address_to_checksum",
  VALIDATE_ENS = "validate_ens",
  VALIDATE_ADDRESS = "validate_address",
  CUSTOM = "custom"
}

export enum RegistrationValidationSeverity {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info"
}

// DAO Registration Mappings
export interface DAORegistrationMapping extends ManualRegistrationMapping<DAO> {
  registrationMethod: RegistrationMethod;
  mappingFunction: (registration: ManualRegistrationSource<any>) => DAO;
}

export interface DAOUpdateMapping extends ManualRegistrationMapping<Partial<DAO>> {
  registrationMethod: RegistrationMethod;
  mappingFunction: (registration: ManualRegistrationSource<any>) => Partial<DAO>;
}

// Proposal Registration Mappings
export interface ProposalRegistrationMapping extends ManualRegistrationMapping<Proposal> {
  registrationMethod: RegistrationMethod;
  mappingFunction: (registration: ManualRegistrationSource<any>) => Proposal;
}

// Member Registration Mappings
export interface MemberRegistrationMapping extends ManualRegistrationMapping<Member> {
  registrationMethod: RegistrationMethod;
  mappingFunction: (registration: ManualRegistrationSource<any>) => Member;
}

// ENS Registration Mappings
export interface ENSRegistrationMapping extends ManualRegistrationMapping<ENSRegistration> {
  registrationMethod: RegistrationMethod;
  mappingFunction: (registration: ManualRegistrationSource<any>) => ENSRegistration;
}

// Static State Data Mapping Interfaces
export interface StaticStateDataMapping<T> {
  stateType: string;
  mappingFunction: (staticData: StaticStateDataSource<any>) => T;
  validationRules: StaticDataValidationRule[];
  transformationRules: StaticDataTransformationRule[];
  metadata: StaticDataMappingMetadata;
}

export interface StaticDataMappingMetadata {
  description: string;
  version: string;
  author: string;
  lastUpdated: Date;
  stateType: string;
  updateFrequency: string;
  sourceUrl?: string;
  checksum: string;
}

export interface StaticDataValidationRule {
  field: string;
  rule: StaticDataValidationRuleType;
  value?: any;
  message: string;
  severity: StaticDataValidationSeverity;
}

export interface StaticDataTransformationRule {
  field: string;
  transformation: StaticDataTransformationType;
  parameters?: Record<string, any>;
  description: string;
}

export enum StaticDataValidationRuleType {
  REQUIRED = "required",
  MIN_LENGTH = "min_length",
  MAX_LENGTH = "max_length",
  PATTERN = "pattern",
  MIN_VALUE = "min_value",
  MAX_VALUE = "max_value",
  ENUM = "enum",
  CHECKSUM = "checksum",
  SCHEMA = "schema",
  CUSTOM = "custom"
}

export enum StaticDataTransformationType {
  TO_LOWERCASE = "to_lowercase",
  TO_UPPERCASE = "to_uppercase",
  TRIM = "trim",
  PARSE_INT = "parse_int",
  PARSE_FLOAT = "parse_float",
  PARSE_BOOLEAN = "parse_boolean",
  PARSE_DATE = "parse_date",
  PARSE_JSON = "parse_json",
  VALIDATE_SCHEMA = "validate_schema",
  CUSTOM = "custom"
}

export enum StaticDataValidationSeverity {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info"
}

// Registration Mapping Registry
export interface RegistrationMappingRegistry {
  manualMappings: Map<string, ManualRegistrationMapping<any>>;
  staticDataMappings: Map<string, StaticStateDataMapping<any>>;
  validators: Map<string, RegistrationMappingValidator>;
  transformers: Map<string, RegistrationMappingTransformer>;
  
  registerManualMapping<T>(mapping: ManualRegistrationMapping<T>): void;
  registerStaticDataMapping<T>(mapping: StaticStateDataMapping<T>): void;
  getManualMapping(method: RegistrationMethod): ManualRegistrationMapping<any> | undefined;
  getStaticDataMapping(stateType: string): StaticStateDataMapping<any> | undefined;
  validateManualRegistration(registration: ManualRegistrationSource<any>): ManualRegistrationValidationResult;
  validateStaticData(staticData: StaticStateDataSource<any>): StaticDataValidationResult;
  transformManualRegistration<T>(registration: ManualRegistrationSource<any>): T;
  transformStaticData<T>(staticData: StaticStateDataSource<any>): T;
}

// Registration Mapping Validators
export interface RegistrationMappingValidator {
  validateManualRegistration(registration: ManualRegistrationSource<any>): ManualRegistrationValidationResult;
  validateStaticData(staticData: StaticStateDataSource<any>): StaticDataValidationResult;
  validateMapping(mapping: ManualRegistrationMapping<any>): MappingValidationResult;
  validateTransformation(transformation: RegistrationTransformationRule): TransformationValidationResult;
}

export interface ManualRegistrationValidationResult {
  isValid: boolean;
  errors: ManualRegistrationValidationError[];
  warnings: ManualRegistrationValidationWarning[];
  confidence: number;
  registrant: string;
  registrationMethod: RegistrationMethod;
  validationStatus: ValidationStatus;
  approvalStatus: ApprovalStatus;
}

export interface StaticDataValidationResult {
  isValid: boolean;
  errors: StaticDataValidationError[];
  warnings: StaticDataValidationWarning[];
  confidence: number;
  stateType: string;
  checksumValid: boolean;
  schemaValid: boolean;
}

export interface MappingValidationResult {
  isValid: boolean;
  errors: MappingValidationError[];
  warnings: MappingValidationWarning[];
  mappingName: string;
  version: string;
}

export interface TransformationValidationResult {
  isValid: boolean;
  errors: TransformationValidationError[];
  warnings: TransformationValidationWarning[];
  transformationType: RegistrationTransformationType;
  parameters: Record<string, any>;
}

export interface ManualRegistrationValidationError {
  field: string;
  message: string;
  code: string;
  severity: RegistrationValidationSeverity;
  expectedValue?: any;
  actualValue?: any;
}

export interface ManualRegistrationValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

export interface StaticDataValidationError {
  field: string;
  message: string;
  code: string;
  severity: StaticDataValidationSeverity;
  expectedValue?: any;
  actualValue?: any;
}

export interface StaticDataValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

export interface MappingValidationError {
  field: string;
  message: string;
  code: string;
  severity: RegistrationValidationSeverity;
}

export interface MappingValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

export interface TransformationValidationError {
  field: string;
  message: string;
  code: string;
  severity: RegistrationValidationSeverity;
}

export interface TransformationValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

// Registration Mapping Transformers
export interface RegistrationMappingTransformer {
  transformManualRegistration(registration: ManualRegistrationSource<any>): any;
  transformStaticData(staticData: StaticStateDataSource<any>): any;
  transformParameter(parameter: any, transformation: RegistrationTransformationRule): any;
  transformAddress(address: string): string;
  transformNumber(value: string): number;
  transformBoolean(value: string): boolean;
  transformDate(timestamp: number): Date;
  transformString(value: string): string;
  transformENS(domain: string): string;
}

// Registration Mapping Configuration
export interface RegistrationMappingConfig {
  // Manual Registration Mappings
  manualRegistration: {
    daoRegistration: DAORegistrationMapping;
    daoUpdate: DAOUpdateMapping;
    proposalRegistration: ProposalRegistrationMapping;
    memberRegistration: MemberRegistrationMapping;
    ensRegistration: ENSRegistrationMapping;
  };
  
  // Static State Data Mappings
  staticStateData: {
    configuration: StaticStateDataMapping<any>;
    referenceData: StaticStateDataMapping<any>;
    template: StaticStateDataMapping<any>;
    schema: StaticStateDataMapping<any>;
  };
  
  // Validation Configuration
  validation: {
    enabled: boolean;
    strictMode: boolean;
    requireApproval: boolean;
    autoValidation: boolean;
    maxValidationErrors: number;
  };
  
  // Transformation Configuration
  transformation: {
    enabled: boolean;
    preserveOriginalData: boolean;
    addMetadata: boolean;
    addTimestamps: boolean;
  };
}

// Registration Mapping Examples
export const DAORegistrationMappingExample: DAORegistrationMapping = {
  registrationMethod: RegistrationMethod.WEB_FORM,
  mappingFunction: (registration: ManualRegistrationSource<any>) => {
    const data = registration.data;
    
    return {
      id: `dao-${data.contractAddress}`,
      name: data.name,
      symbol: data.symbol,
      description: data.description,
      ensDomain: data.ensDomain || "",
      chainId: data.chainId,
      contractAddress: data.contractAddress,
      tokenAddress: data.tokenAddress,
      treasuryAddress: data.treasuryAddress,
      governanceType: data.governanceType || "token",
      votingPeriod: data.votingPeriod || 86400,
      quorum: data.quorum || 50,
      proposalThreshold: data.proposalThreshold || 0,
      logo: data.logo || "",
      website: data.website || "",
      socialLinks: data.socialLinks || {},
      tags: data.tags || [],
      createdAt: new Date(registration.submittedAt),
      updatedAt: new Date(registration.submittedAt),
      status: "pending",
      verified: false
    } as DAO;
  },
  validationRules: [
    {
      field: "name",
      rule: RegistrationValidationRuleType.REQUIRED,
      message: "DAO name is required",
      severity: RegistrationValidationSeverity.ERROR
    },
    {
      field: "contractAddress",
      rule: RegistrationValidationRuleType.REQUIRED,
      message: "Contract address is required",
      severity: RegistrationValidationSeverity.ERROR
    },
    {
      field: "chainId",
      rule: RegistrationValidationRuleType.REQUIRED,
      message: "Chain ID is required",
      severity: RegistrationValidationSeverity.ERROR
    },
    {
      field: "name",
      rule: RegistrationValidationRuleType.MIN_LENGTH,
      value: 1,
      message: "DAO name must be at least 1 character",
      severity: RegistrationValidationSeverity.ERROR
    },
    {
      field: "name",
      rule: RegistrationValidationRuleType.MAX_LENGTH,
      value: 100,
      message: "DAO name must be at most 100 characters",
      severity: RegistrationValidationSeverity.ERROR
    }
  ],
  transformationRules: [
    {
      field: "contractAddress",
      transformation: RegistrationTransformationType.ADDRESS_TO_CHECKSUM,
      description: "Convert address to checksum format"
    },
    {
      field: "name",
      transformation: RegistrationTransformationType.TRIM,
      description: "Trim whitespace from name"
    },
    {
      field: "ensDomain",
      transformation: RegistrationTransformationType.VALIDATE_ENS,
      description: "Validate ENS domain format"
    }
  ],
  metadata: {
    description: "Maps manual DAO registrations to DAO entities",
    version: "1.0.0",
    author: "DAO Registry Team",
    lastUpdated: new Date(),
    supportedMethods: [RegistrationMethod.WEB_FORM, RegistrationMethod.API_ENDPOINT],
    requiredFields: ["name", "contractAddress", "chainId"],
    optionalFields: ["symbol", "description", "ensDomain", "logo", "website", "socialLinks", "tags"]
  }
}; 