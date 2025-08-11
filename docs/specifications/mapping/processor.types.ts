/**
 * Processor Types
 * RFC-001: DAO Registry Specification - Processor Types
 */

import { DataSource, SmartContractEventSource, ManualRegistrationSource, StaticStateDataSource } from './data-sources.types';
import { EventMapping } from './event-mappings.types';
import { ManualRegistrationMapping, StaticStateDataMapping } from './registration-mappings.types';

// Base Processor Interface
export interface BaseProcessor<T, R> {
  process(source: DataSource<T>): Promise<ProcessingResult<R>>;
  validate(source: DataSource<T>): Promise<ValidationResult>;
  transform(source: DataSource<T>): Promise<R>;
  store(result: R): Promise<void>;
}

// Smart Contract Event Processor
export interface SmartContractEventProcessor extends BaseProcessor<any, any> {
  processEvent(event: SmartContractEventSource<any>): Promise<ProcessingResult<any>>;
  validateEvent(event: SmartContractEventSource<any>): Promise<EventValidationResult>;
  transformEvent(event: SmartContractEventSource<any>): Promise<any>;
  storeEvent(result: any): Promise<void>;
  
  // Event-specific processing
  processDAORegistration(event: SmartContractEventSource<any>): Promise<ProcessingResult<any>>;
  processDAOUpdate(event: SmartContractEventSource<any>): Promise<ProcessingResult<any>>;
  processENSRegistration(event: SmartContractEventSource<any>): Promise<ProcessingResult<any>>;
  processProposalCreation(event: SmartContractEventSource<any>): Promise<ProcessingResult<any>>;
  processVoteCast(event: SmartContractEventSource<any>): Promise<ProcessingResult<any>>;
  processTreasuryTransaction(event: SmartContractEventSource<any>): Promise<ProcessingResult<any>>;
}

// Manual Registration Processor
export interface ManualRegistrationProcessor extends BaseProcessor<any, any> {
  processRegistration(registration: ManualRegistrationSource<any>): Promise<ProcessingResult<any>>;
  validateRegistration(registration: ManualRegistrationSource<any>): Promise<RegistrationValidationResult>;
  transformRegistration(registration: ManualRegistrationSource<any>): Promise<any>;
  storeRegistration(result: any): Promise<void>;
  
  // Registration-specific processing
  processDAORegistration(registration: ManualRegistrationSource<any>): Promise<ProcessingResult<any>>;
  processDAOUpdate(registration: ManualRegistrationSource<any>): Promise<ProcessingResult<any>>;
  processProposalRegistration(registration: ManualRegistrationSource<any>): Promise<ProcessingResult<any>>;
  processMemberRegistration(registration: ManualRegistrationSource<any>): Promise<ProcessingResult<any>>;
  processENSRegistration(registration: ManualRegistrationSource<any>): Promise<ProcessingResult<any>>;
}

// Static State Data Processor
export interface StaticStateDataProcessor extends BaseProcessor<any, any> {
  processStaticData(staticData: StaticStateDataSource<any>): Promise<ProcessingResult<any>>;
  validateStaticData(staticData: StaticStateDataSource<any>): Promise<StaticDataValidationResult>;
  transformStaticData(staticData: StaticStateDataSource<any>): Promise<any>;
  storeStaticData(result: any): Promise<void>;
  
  // Static data-specific processing
  processConfiguration(staticData: StaticStateDataSource<any>): Promise<ProcessingResult<any>>;
  processReferenceData(staticData: StaticStateDataSource<any>): Promise<ProcessingResult<any>>;
  processTemplate(staticData: StaticStateDataSource<any>): Promise<ProcessingResult<any>>;
  processSchema(staticData: StaticStateDataSource<any>): Promise<ProcessingResult<any>>;
}

// Processing Results
export interface ProcessingResult<T> {
  success: boolean;
  data?: T;
  errors: ProcessingError[];
  warnings: ProcessingWarning[];
  processingTime: number;
  sourceId: string;
  metadata: ProcessingMetadata;
}

export interface ProcessingMetadata {
  processorType: string;
  processorVersion: string;
  processingTimestamp: Date;
  sourceType: string;
  chainId?: number;
  blockNumber?: number;
  transactionHash?: string;
}

export interface ProcessingError {
  code: string;
  message: string;
  field?: string;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface ProcessingWarning {
  code: string;
  message: string;
  field?: string;
  suggestion?: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export enum ErrorSeverity {
  CRITICAL = "critical",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info"
}

// Validation Results
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  confidence: number;
  validationTime: number;
}

export interface EventValidationResult extends ValidationResult {
  eventType: string;
  contractAddress: string;
  blockNumber: number;
  logIndex: number;
}

export interface RegistrationValidationResult extends ValidationResult {
  registrant: string;
  registrationMethod: string;
  validationStatus: string;
  approvalStatus: string;
}

export interface StaticDataValidationResult extends ValidationResult {
  stateType: string;
  checksumValid: boolean;
  schemaValid: boolean;
  sourceUrl?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: ErrorSeverity;
  expectedValue?: any;
  actualValue?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

// Processor Registry
export interface ProcessorRegistry {
  processors: Map<string, BaseProcessor<any, any>>;
  eventProcessors: Map<string, SmartContractEventProcessor>;
  registrationProcessors: Map<string, ManualRegistrationProcessor>;
  staticDataProcessors: Map<string, StaticStateDataProcessor>;
  
  registerProcessor<T, R>(name: string, processor: BaseProcessor<T, R>): void;
  getProcessor(name: string): BaseProcessor<any, any> | undefined;
  getEventProcessor(eventName: string): SmartContractEventProcessor | undefined;
  getRegistrationProcessor(method: string): ManualRegistrationProcessor | undefined;
  getStaticDataProcessor(stateType: string): StaticStateDataProcessor | undefined;
  
  processDataSource<T, R>(source: DataSource<T>): Promise<ProcessingResult<R>>;
  validateDataSource<T>(source: DataSource<T>): Promise<ValidationResult>;
  transformDataSource<T, R>(source: DataSource<T>): Promise<R>;
  storeDataSourceResult<T>(result: T): Promise<void>;
}

// Processor Configuration
export interface ProcessorConfig {
  // Smart Contract Event Processing
  smartContractEvents: {
    enabled: boolean;
    pollingInterval: number;
    maxBlockRange: number;
    retryAttempts: number;
    batchSize: number;
    timeoutSeconds: number;
  };
  
  // Manual Registration Processing
  manualRegistration: {
    enabled: boolean;
    requireApproval: boolean;
    autoValidation: boolean;
    maxRegistrationPerHour: number;
    processingTimeout: number;
    retryAttempts: number;
  };
  
  // Static State Data Processing
  staticStateData: {
    enabled: boolean;
    updateFrequency: string;
    validationRequired: boolean;
    checksumValidation: boolean;
    processingTimeout: number;
    retryAttempts: number;
  };
  
  // General Processing
  processing: {
    maxConcurrentProcessors: number;
    defaultTimeout: number;
    defaultRetryAttempts: number;
    enableLogging: boolean;
    enableMetrics: boolean;
  };
}

// Processor Monitoring
export interface ProcessorMonitor {
  getProcessorStats(): ProcessorStats;
  getProcessingStats(): ProcessingStats;
  getErrorStats(): ErrorStats;
  getPerformanceMetrics(): PerformanceMetrics;
}

export interface ProcessorStats {
  totalProcessors: number;
  processorsByType: Record<string, number>;
  activeProcessors: number;
  inactiveProcessors: number;
  lastUpdated: Date;
}

export interface ProcessingStats {
  totalProcessed: number;
  successful: number;
  failed: number;
  pending: number;
  averageProcessingTime: number;
  lastProcessed: Date;
  throughput: number; // items per second
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  mostCommonErrors: string[];
  lastError: Date;
  errorRate: number; // percentage
}

export interface PerformanceMetrics {
  throughput: number; // items per second
  latency: number; // average processing time
  errorRate: number; // percentage of failed processing
  uptime: number; // percentage of time system is available
  lastUpdated: Date;
}

// Processor Examples
export const SmartContractEventProcessorExample: SmartContractEventProcessor = {
  async process(source: DataSource<any>): Promise<ProcessingResult<any>> {
    const startTime = Date.now();
    
    try {
      // Validate the event
      const validationResult = await this.validate(source);
      if (!validationResult.isValid) {
        return {
          success: false,
          errors: validationResult.errors.map(e => ({
            code: e.code,
            message: e.message,
            field: e.field,
            severity: e.severity,
            timestamp: new Date(),
            context: { validationResult }
          })),
          warnings: validationResult.warnings.map(w => ({
            code: w.code,
            message: w.message,
            field: w.field,
            suggestion: w.suggestion,
            timestamp: new Date(),
            context: { validationResult }
          })),
          processingTime: Date.now() - startTime,
          sourceId: source.id,
          metadata: {
            processorType: "SmartContractEventProcessor",
            processorVersion: "1.0.0",
            processingTimestamp: new Date(),
            sourceType: source.type,
            chainId: source.metadata.chainId,
            blockNumber: source.metadata.blockNumber,
            transactionHash: source.metadata.transactionHash
          }
        };
      }
      
      // Transform the event
      const transformedData = await this.transform(source);
      
      // Store the result
      await this.store(transformedData);
      
      return {
        success: true,
        data: transformedData,
        errors: [],
        warnings: [],
        processingTime: Date.now() - startTime,
        sourceId: source.id,
        metadata: {
          processorType: "SmartContractEventProcessor",
          processorVersion: "1.0.0",
          processingTimestamp: new Date(),
          sourceType: source.type,
          chainId: source.metadata.chainId,
          blockNumber: source.metadata.blockNumber,
          transactionHash: source.metadata.transactionHash
        }
      };
    } catch (error) {
      return {
        success: false,
        errors: [{
          code: "PROCESSING_ERROR",
          message: error.message,
          severity: ErrorSeverity.ERROR,
          timestamp: new Date(),
          context: { error }
        }],
        warnings: [],
        processingTime: Date.now() - startTime,
        sourceId: source.id,
        metadata: {
          processorType: "SmartContractEventProcessor",
          processorVersion: "1.0.0",
          processingTimestamp: new Date(),
          sourceType: source.type,
          chainId: source.metadata.chainId,
          blockNumber: source.metadata.blockNumber,
          transactionHash: source.metadata.transactionHash
        }
      };
    }
  },
  
  async validate(source: DataSource<any>): Promise<ValidationResult> {
    // Implementation for validation
    return {
      isValid: true,
      errors: [],
      warnings: [],
      confidence: 1.0,
      validationTime: 0
    };
  },
  
  async transform(source: DataSource<any>): Promise<any> {
    // Implementation for transformation
    return source.data;
  },
  
  async store(result: any): Promise<void> {
    // Implementation for storage
  },
  
  async processEvent(event: SmartContractEventSource<any>): Promise<ProcessingResult<any>> {
    return this.process(event);
  },
  
  async validateEvent(event: SmartContractEventSource<any>): Promise<EventValidationResult> {
    const validationResult = await this.validate(event);
    return {
      ...validationResult,
      eventType: event.eventName,
      contractAddress: event.metadata.contractAddress || "",
      blockNumber: event.metadata.blockNumber,
      logIndex: event.logIndex
    };
  },
  
  async transformEvent(event: SmartContractEventSource<any>): Promise<any> {
    return this.transform(event);
  },
  
  async storeEvent(result: any): Promise<void> {
    return this.store(result);
  },
  
  async processDAORegistration(event: SmartContractEventSource<any>): Promise<ProcessingResult<any>> {
    return this.processEvent(event);
  },
  
  async processDAOUpdate(event: SmartContractEventSource<any>): Promise<ProcessingResult<any>> {
    return this.processEvent(event);
  },
  
  async processENSRegistration(event: SmartContractEventSource<any>): Promise<ProcessingResult<any>> {
    return this.processEvent(event);
  },
  
  async processProposalCreation(event: SmartContractEventSource<any>): Promise<ProcessingResult<any>> {
    return this.processEvent(event);
  },
  
  async processVoteCast(event: SmartContractEventSource<any>): Promise<ProcessingResult<any>> {
    return this.processEvent(event);
  },
  
  async processTreasuryTransaction(event: SmartContractEventSource<any>): Promise<ProcessingResult<any>> {
    return this.processEvent(event);
  }
}; 