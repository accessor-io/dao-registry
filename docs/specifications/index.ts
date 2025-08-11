/**
 * DAO Registry Specifications Index
 * Main export file for all specification types
 */

// Core Types
export * from './core/dao.types';
export * from './core/proposal.types';
export * from './core/member.types';

// ENS Integration Types
export * from './ens/ens-integration.types';

// Analytics Types
export * from './analytics/analytics.types';

// API Types
export * from './api/api.types';

// Blockchain Types
export * from './blockchain/smart-contracts.types';

// Validation Types
export * from './validation/validation.types';

// Classification Types
export * from './classification/classifiers.types';

// Mapping Types
export * from './mapping/data-sources.types';
export * from './mapping/event-mappings.types';
export * from './mapping/registration-mappings.types';
export * from './mapping/processor.types';

// Re-export commonly used types for convenience
export type {
  DAO,
  Proposal,
  Member,
  ENSRegistration,
  DAOAnalytics,
  RESTEndpoints,
  GraphQLSchema,
  WebSocketAPI,
  IDAORegistry,
  ITreasury,
  IENSIntegration,
  BaseValidator,
  BaseClassifier,
  ValidationResult,
  ClassificationResult,
  DataSource,
  SmartContractEventSource,
  ManualRegistrationSource,
  StaticStateDataSource,
  EventMapping,
  ManualRegistrationMapping,
  BaseProcessor,
  SmartContractEventProcessor,
  ManualRegistrationProcessor,
  StaticStateDataProcessor,
  ProcessingResult
} from './core/dao.types'; 