/**
 * Event Mapping Types
 * RFC-001: DAO Registry Specification - Event Mapping Types
 */

import { DAO, Proposal, Member, ENSRegistration } from '../core/dao.types';
import { SmartContractEventSource, ContractEventMapping } from './data-sources.types';

// Event Mapping Interfaces
export interface EventMapping<T> {
  eventName: string;
  contractAddress: string;
  chainId: number;
  mappingFunction: (event: SmartContractEventSource<any>) => T;
  validationRules: EventValidationRule[];
  transformationRules: EventTransformationRule[];
  metadata: EventMappingMetadata;
}

export interface EventMappingMetadata {
  description: string;
  version: string;
  author: string;
  lastUpdated: Date;
  dependencies: string[];
  tags: string[];
}

export interface EventValidationRule {
  field: string;
  rule: ValidationRuleType;
  value?: any;
  message: string;
  severity: ValidationSeverity;
}

export interface EventTransformationRule {
  field: string;
  transformation: TransformationType;
  parameters?: Record<string, any>;
  description: string;
}

export enum ValidationRuleType {
  REQUIRED = "required",
  MIN_LENGTH = "min_length",
  MAX_LENGTH = "max_length",
  PATTERN = "pattern",
  MIN_VALUE = "min_value",
  MAX_VALUE = "max_value",
  ENUM = "enum",
  CUSTOM = "custom"
}

export enum TransformationType {
  TO_LOWERCASE = "to_lowercase",
  TO_UPPERCASE = "to_uppercase",
  TRIM = "trim",
  PARSE_INT = "parse_int",
  PARSE_FLOAT = "parse_float",
  PARSE_BOOLEAN = "parse_boolean",
  PARSE_DATE = "parse_date",
  HEX_TO_ADDRESS = "hex_to_address",
  ADDRESS_TO_CHECKSUM = "address_to_checksum",
  CUSTOM = "custom"
}

export enum ValidationSeverity {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info"
}

// DAO Registration Event Mappings
export interface DAORegisteredEventMapping extends EventMapping<DAO> {
  eventName: "DAORegistered";
  mappingFunction: (event: SmartContractEventSource<any>) => DAO;
}

export interface DAOUpdatedEventMapping extends EventMapping<Partial<DAO>> {
  eventName: "DAOUpdated";
  mappingFunction: (event: SmartContractEventSource<any>) => Partial<DAO>;
}

export interface DAOVerifiedEventMapping extends EventMapping<{ daoId: string; verified: boolean }> {
  eventName: "DAOVerified";
  mappingFunction: (event: SmartContractEventSource<any>) => { daoId: string; verified: boolean };
}

// ENS Registration Event Mappings
export interface DAOENSRegisteredEventMapping extends EventMapping<ENSRegistration> {
  eventName: "DAOENSRegistered";
  mappingFunction: (event: SmartContractEventSource<any>) => ENSRegistration;
}

export interface ENSSubdomainUpdatedEventMapping extends EventMapping<{ daoId: string; subdomain: string; newValue: string }> {
  eventName: "ENSSubdomainUpdated";
  mappingFunction: (event: SmartContractEventSource<any>) => { daoId: string; subdomain: string; newValue: string };
}

export interface ENSRegistrationVerifiedEventMapping extends EventMapping<{ daoId: string; verified: boolean }> {
  eventName: "ENSRegistrationVerified";
  mappingFunction: (event: SmartContractEventSource<any>) => { daoId: string; verified: boolean };
}

// Governance Event Mappings
export interface ProposalCreatedEventMapping extends EventMapping<Proposal> {
  eventName: "ProposalCreated";
  mappingFunction: (event: SmartContractEventSource<any>) => Proposal;
}

export interface ProposalExecutedEventMapping extends EventMapping<{ proposalId: string; executed: boolean }> {
  eventName: "ProposalExecuted";
  mappingFunction: (event: SmartContractEventSource<any>) => { proposalId: string; executed: boolean };
}

export interface VoteCastEventMapping extends EventMapping<{ proposalId: string; voter: string; voteType: string; votingPower: number }> {
  eventName: "VoteCast";
  mappingFunction: (event: SmartContractEventSource<any>) => { proposalId: string; voter: string; voteType: string; votingPower: number };
}

// Treasury Event Mappings
export interface FundsReceivedEventMapping extends EventMapping<{ daoId: string; from: string; amount: number; token: string }> {
  eventName: "FundsReceived";
  mappingFunction: (event: SmartContractEventSource<any>) => { daoId: string; from: string; amount: number; token: string };
}

export interface FundsWithdrawnEventMapping extends EventMapping<{ daoId: string; to: string; amount: number; token: string }> {
  eventName: "FundsWithdrawn";
  mappingFunction: (event: SmartContractEventSource<any>) => { daoId: string; to: string; amount: number; token: string };
}

// Member Event Mappings
export interface MemberAddedEventMapping extends EventMapping<Member> {
  eventName: "MemberAdded";
  mappingFunction: (event: SmartContractEventSource<any>) => Member;
}

export interface MemberRemovedEventMapping extends EventMapping<{ daoId: string; memberId: string; address: string }> {
  eventName: "MemberRemoved";
  mappingFunction: (event: SmartContractEventSource<any>) => { daoId: string; memberId: string; address: string };
}

export interface RoleChangedEventMapping extends EventMapping<{ daoId: string; memberId: string; oldRole: string; newRole: string }> {
  eventName: "RoleChanged";
  mappingFunction: (event: SmartContractEventSource<any>) => { daoId: string; memberId: string; oldRole: string; newRole: string };
}

// Event Mapping Registry
export interface EventMappingRegistry {
  mappings: Map<string, EventMapping<any>>;
  validators: Map<string, EventMappingValidator>;
  transformers: Map<string, EventMappingTransformer>;
  
  registerMapping<T>(mapping: EventMapping<T>): void;
  getMapping(eventName: string): EventMapping<any> | undefined;
  validateMapping(eventName: string, event: SmartContractEventSource<any>): EventValidationResult;
  transformMapping<T>(eventName: string, event: SmartContractEventSource<any>): T;
}

// Event Mapping Validators
export interface EventMappingValidator {
  validateEvent(event: SmartContractEventSource<any>): EventValidationResult;
  validateMapping(mapping: EventMapping<any>): MappingValidationResult;
  validateTransformation(transformation: EventTransformationRule): TransformationValidationResult;
}

export interface EventValidationResult {
  isValid: boolean;
  errors: EventValidationError[];
  warnings: EventValidationWarning[];
  confidence: number;
  eventType: string;
  contractAddress: string;
  blockNumber: number;
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
  transformationType: TransformationType;
  parameters: Record<string, any>;
}

export interface EventValidationError {
  field: string;
  message: string;
  code: string;
  severity: ValidationSeverity;
  expectedValue?: any;
  actualValue?: any;
}

export interface EventValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

export interface MappingValidationError {
  field: string;
  message: string;
  code: string;
  severity: ValidationSeverity;
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
  severity: ValidationSeverity;
}

export interface TransformationValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

// Event Mapping Transformers
export interface EventMappingTransformer {
  transformEvent(event: SmartContractEventSource<any>): any;
  transformParameter(parameter: EventParameter, transformation: EventTransformationRule): any;
  transformAddress(address: string): string;
  transformNumber(value: string): number;
  transformBoolean(value: string): boolean;
  transformDate(timestamp: number): Date;
  transformString(value: string): string;
}

// Event Mapping Configuration
export interface EventMappingConfig {
  // DAO Registration Mappings
  daoRegistration: {
    DAORegistered: DAORegisteredEventMapping;
    DAOUpdated: DAOUpdatedEventMapping;
    DAOVerified: DAOVerifiedEventMapping;
  };
  
  // ENS Registration Mappings
  ensRegistration: {
    DAOENSRegistered: DAOENSRegisteredEventMapping;
    ENSSubdomainUpdated: ENSSubdomainUpdatedEventMapping;
    ENSRegistrationVerified: ENSRegistrationVerifiedEventMapping;
  };
  
  // Governance Mappings
  governance: {
    ProposalCreated: ProposalCreatedEventMapping;
    ProposalExecuted: ProposalExecutedEventMapping;
    VoteCast: VoteCastEventMapping;
  };
  
  // Treasury Mappings
  treasury: {
    FundsReceived: FundsReceivedEventMapping;
    FundsWithdrawn: FundsWithdrawnEventMapping;
  };
  
  // Member Mappings
  members: {
    MemberAdded: MemberAddedEventMapping;
    MemberRemoved: MemberRemovedEventMapping;
    RoleChanged: RoleChangedEventMapping;
  };
  
  // Validation Configuration
  validation: {
    enabled: boolean;
    strictMode: boolean;
    allowUnknownEvents: boolean;
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

// Event Mapping Examples
export const DAORegisteredMappingExample: DAORegisteredEventMapping = {
  eventName: "DAORegistered",
  contractAddress: "0x1234567890abcdef",
  chainId: 1,
  mappingFunction: (event: SmartContractEventSource<any>) => {
    const daoAddress = event.eventParameters.find(p => p.name === "daoAddress")?.value;
    const name = event.eventParameters.find(p => p.name === "name")?.value;
    const chainId = event.eventParameters.find(p => p.name === "chainId")?.value;
    
    return {
      id: `dao-${daoAddress}`,
      name: name,
      symbol: "", // Will be filled from contract call
      description: "", // Will be filled from contract call
      ensDomain: "", // Will be filled from ENS lookup
      chainId: chainId,
      contractAddress: daoAddress,
      tokenAddress: "", // Will be filled from contract call
      treasuryAddress: "", // Will be filled from contract call
      governanceType: "token", // Default value
      votingPeriod: 86400, // Default value
      quorum: 50, // Default value
      proposalThreshold: 0, // Will be filled from contract call
      logo: "",
      website: "",
      socialLinks: {},
      tags: [],
      createdAt: new Date(event.timestamp),
      updatedAt: new Date(event.timestamp),
      status: "active",
      verified: false
    } as DAO;
  },
  validationRules: [
    {
      field: "daoAddress",
      rule: ValidationRuleType.REQUIRED,
      message: "DAO address is required",
      severity: ValidationSeverity.ERROR
    },
    {
      field: "name",
      rule: ValidationRuleType.REQUIRED,
      message: "DAO name is required",
      severity: ValidationSeverity.ERROR
    },
    {
      field: "chainId",
      rule: ValidationRuleType.REQUIRED,
      message: "Chain ID is required",
      severity: ValidationSeverity.ERROR
    }
  ],
  transformationRules: [
    {
      field: "daoAddress",
      transformation: TransformationType.ADDRESS_TO_CHECKSUM,
      description: "Convert address to checksum format"
    },
    {
      field: "name",
      transformation: TransformationType.TRIM,
      description: "Trim whitespace from name"
    }
  ],
  metadata: {
    description: "Maps DAORegistered events to DAO entities",
    version: "1.0.0",
    author: "DAO Registry Team",
    lastUpdated: new Date(),
    dependencies: ["@ethersproject/address"],
    tags: ["dao", "registration", "events"]
  }
}; 