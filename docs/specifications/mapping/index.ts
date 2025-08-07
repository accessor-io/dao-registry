/**
 * DAO Registry Mapping Specifications Index
 * Main export file for all mapping specification types
 */

// Data Source Types
export * from './data-sources.types';

// Event Mapping Types
export * from './event-mappings.types';

// Registration Mapping Types
export * from './registration-mappings.types';

// Processor Types
export * from './processor.types';

// Re-export commonly used types for convenience
export type {
  DataSource,
  SmartContractEventSource,
  ManualRegistrationSource,
  StaticStateDataSource,
  DataSourceType,
  DataSourceMetadata,
  ContractEventMapping,
  EventMapping,
  ManualRegistrationMapping,
  StaticStateDataMapping,
  BaseProcessor,
  SmartContractEventProcessor,
  ManualRegistrationProcessor,
  StaticStateDataProcessor,
  ProcessingResult,
  ValidationResult,
  ProcessorRegistry
} from './data-sources.types'; 