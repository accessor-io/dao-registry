# DAO Registry Mapping Specifications

This directory contains TypeScript type definitions for mapping different data sources to DAO Registry data structures. The mapping system handles smart contract events, manual registrations, and static state data.

## Directory Structure

```
mapping/
├── data-sources.types.ts      # Base data source types
├── event-mappings.types.ts    # Smart contract event mappings
├── registration-mappings.types.ts # Manual registration mappings
├── processor.types.ts         # Data processing types
├── index.ts                   # Main export file
└── README.md                  # This file
```

## Data Source Types

### Base Data Source (`data-sources.types.ts`)

The foundation for all data sources in the DAO Registry system:

- **`DataSource<T>`** - Generic data source interface
- **`SmartContractEventSource<T>`** - Blockchain event data
- **`ManualRegistrationSource<T>`** - User-submitted registrations
- **`StaticStateDataSource<T>`** - Configuration and reference data

### Data Source Types

```typescript
enum DataSourceType {
  SMART_CONTRACT_EVENT = "smart_contract_event",
  MANUAL_REGISTRATION = "manual_registration", 
  STATIC_STATE_DATA = "static_state_data",
  API_UPDATE = "api_update",
  BATCH_IMPORT = "batch_import"
}
```

## Event Mappings (`event-mappings.types.ts`)

Maps smart contract events to DAO Registry entities:

### DAO Registration Events
- **`DAORegisteredEventMapping`** - Maps DAO registration events
- **`DAOUpdatedEventMapping`** - Maps DAO update events
- **`DAOVerifiedEventMapping`** - Maps DAO verification events

### ENS Registration Events
- **`DAOENSRegisteredEventMapping`** - Maps ENS registration events
- **`ENSSubdomainUpdatedEventMapping`** - Maps ENS subdomain updates
- **`ENSRegistrationVerifiedEventMapping`** - Maps ENS verification events

### Governance Events
- **`ProposalCreatedEventMapping`** - Maps proposal creation events
- **`ProposalExecutedEventMapping`** - Maps proposal execution events
- **`VoteCastEventMapping`** - Maps vote casting events

### Treasury Events
- **`FundsReceivedEventMapping`** - Maps treasury fund receipts
- **`FundsWithdrawnEventMapping`** - Maps treasury fund withdrawals

### Member Events
- **`MemberAddedEventMapping`** - Maps member addition events
- **`MemberRemovedEventMapping`** - Maps member removal events
- **`RoleChangedEventMapping`** - Maps role change events

## Registration Mappings (`registration-mappings.types.ts`)

Handles manual registrations and static state data:

### Manual Registration Mappings
- **`DAORegistrationMapping`** - Maps manual DAO registrations
- **`DAOUpdateMapping`** - Maps manual DAO updates
- **`ProposalRegistrationMapping`** - Maps manual proposal registrations
- **`MemberRegistrationMapping`** - Maps manual member registrations
- **`ENSRegistrationMapping`** - Maps manual ENS registrations

### Static State Data Mappings
- **`StaticStateDataMapping<T>`** - Maps configuration and reference data
- **Configuration mappings** - System configuration data
- **Reference data mappings** - Reference data and templates
- **Schema mappings** - Data schemas and validation rules

## Processors (`processor.types.ts`)

Data processing and transformation logic:

### Processor Types
- **`SmartContractEventProcessor`** - Processes blockchain events
- **`ManualRegistrationProcessor`** - Processes manual registrations
- **`StaticStateDataProcessor`** - Processes static state data

### Processing Flow
1. **Validation** - Validate incoming data
2. **Transformation** - Transform data to registry format
3. **Storage** - Store processed data
4. **Monitoring** - Track processing metrics

## Usage Examples

### Smart Contract Event Processing

```typescript
import { SmartContractEventSource, DAORegisteredEventMapping } from './mapping';

// Example DAO registration event
const daoRegistrationEvent: SmartContractEventSource<any> = {
  id: "event-123",
  type: DataSourceType.SMART_CONTRACT_EVENT,
  source: "blockchain",
  timestamp: new Date(),
  data: {
    daoAddress: "0x1234567890abcdef",
    name: "Uniswap DAO",
    chainId: 1
  },
  metadata: {
    chainId: 1,
    blockNumber: 15000000,
    transactionHash: "0xabc123...",
    eventIndex: 0,
    contractAddress: "0xregistry...",
    verified: true,
    confidence: 1.0
  },
  eventName: "DAORegistered",
  eventSignature: "DAORegistered(address,string,uint256)",
  eventParameters: [
    { name: "daoAddress", type: "address", value: "0x1234567890abcdef", indexed: true },
    { name: "name", type: "string", value: "Uniswap DAO", indexed: false },
    { name: "chainId", type: "uint256", value: 1, indexed: false }
  ],
  logIndex: 0,
  removed: false
};

// Process the event
const processor = new SmartContractEventProcessor();
const result = await processor.processEvent(daoRegistrationEvent);
```

### Manual Registration Processing

```typescript
import { ManualRegistrationSource, RegistrationMethod } from './mapping';

// Example manual DAO registration
const manualRegistration: ManualRegistrationSource<any> = {
  id: "reg-456",
  type: DataSourceType.MANUAL_REGISTRATION,
  source: "web_form",
  timestamp: new Date(),
  data: {
    name: "New DAO",
    contractAddress: "0x1234567890abcdef",
    chainId: 1,
    description: "A new DAO",
    symbol: "NEW"
  },
  metadata: {
    chainId: 1,
    blockNumber: 0,
    verified: false,
    confidence: 0.8
  },
  registrant: "0xuser123...",
  registrationMethod: RegistrationMethod.WEB_FORM,
  validationStatus: ValidationStatus.PENDING,
  approvalStatus: ApprovalStatus.PENDING,
  submittedAt: new Date()
};

// Process the registration
const processor = new ManualRegistrationProcessor();
const result = await processor.processRegistration(manualRegistration);
```

### Static State Data Processing

```typescript
import { StaticStateDataSource, StateType } from './mapping';

// Example static state data
const staticData: StaticStateDataSource<any> = {
  id: "config-789",
  type: DataSourceType.STATIC_STATE_DATA,
  source: "configuration",
  timestamp: new Date(),
  data: {
    maxProposalDuration: 604800,
    minQuorumPercentage: 10,
    supportedChains: [1, 137, 42161]
  },
  metadata: {
    chainId: 0,
    blockNumber: 0,
    verified: true,
    confidence: 1.0
  },
  stateType: StateType.CONFIGURATION,
  stateVersion: "1.0.0",
  lastUpdated: new Date(),
  updateFrequency: UpdateFrequency.MANUAL,
  checksum: "sha256:abc123..."
};

// Process the static data
const processor = new StaticStateDataProcessor();
const result = await processor.processStaticData(staticData);
```

## Validation and Transformation

### Validation Rules

```typescript
const validationRules = [
  {
    field: "contractAddress",
    rule: ValidationRuleType.REQUIRED,
    message: "Contract address is required",
    severity: ValidationSeverity.ERROR
  },
  {
    field: "name",
    rule: ValidationRuleType.MIN_LENGTH,
    value: 1,
    message: "Name must be at least 1 character",
    severity: ValidationSeverity.ERROR
  }
];
```

### Transformation Rules

```typescript
const transformationRules = [
  {
    field: "contractAddress",
    transformation: TransformationType.ADDRESS_TO_CHECKSUM,
    description: "Convert address to checksum format"
  },
  {
    field: "name",
    transformation: TransformationType.TRIM,
    description: "Trim whitespace from name"
  }
];
```

## Configuration

### Event Mapping Configuration

```typescript
const eventMappingConfig: EventMappingConfig = {
  daoRegistration: {
    DAORegistered: daoRegisteredMapping,
    DAOUpdated: daoUpdatedMapping,
    DAOVerified: daoVerifiedMapping
  },
  ensRegistration: {
    DAOENSRegistered: ensRegisteredMapping,
    ENSSubdomainUpdated: ensSubdomainUpdatedMapping,
    ENSRegistrationVerified: ensVerifiedMapping
  },
  governance: {
    ProposalCreated: proposalCreatedMapping,
    ProposalExecuted: proposalExecutedMapping,
    VoteCast: voteCastMapping
  },
  validation: {
    enabled: true,
    strictMode: true,
    allowUnknownEvents: false,
    maxValidationErrors: 10
  }
};
```

### Processor Configuration

```typescript
const processorConfig: ProcessorConfig = {
  smartContractEvents: {
    enabled: true,
    pollingInterval: 1000,
    maxBlockRange: 1000,
    retryAttempts: 3,
    batchSize: 100,
    timeoutSeconds: 30
  },
  manualRegistration: {
    enabled: true,
    requireApproval: true,
    autoValidation: false,
    maxRegistrationPerHour: 10,
    processingTimeout: 60,
    retryAttempts: 3
  },
  processing: {
    maxConcurrentProcessors: 5,
    defaultTimeout: 30,
    defaultRetryAttempts: 3,
    enableLogging: true,
    enableMetrics: true
  }
};
```

## Monitoring and Metrics

### Processing Statistics

```typescript
const monitor = new ProcessorMonitor();
const stats = monitor.getProcessingStats();

console.log(`Total processed: ${stats.totalProcessed}`);
console.log(`Success rate: ${(stats.successful / stats.totalProcessed) * 100}%`);
console.log(`Average processing time: ${stats.averageProcessingTime}ms`);
console.log(`Throughput: ${stats.throughput} items/second`);
```

### Error Tracking

```typescript
const errorStats = monitor.getErrorStats();
console.log(`Total errors: ${errorStats.totalErrors}`);
console.log(`Error rate: ${errorStats.errorRate}%`);
console.log(`Most common errors: ${errorStats.mostCommonErrors.join(', ')}`);
```

## Integration with Core Types

The mapping system integrates seamlessly with the core DAO Registry types:

```typescript
import { DAO, Proposal, Member } from '../core/dao.types';
import { SmartContractEventProcessor } from './processor.types';

// Process events into core types
const processor = new SmartContractEventProcessor();
const daoEvent = await processor.processDAORegistration(event);
const dao: DAO = daoEvent.data;

// Use the processed data
console.log(`Processed DAO: ${dao.name} at ${dao.contractAddress}`);
```

## Best Practices

1. **Validation First** - Always validate data before processing
2. **Error Handling** - Implement comprehensive error handling
3. **Monitoring** - Track processing metrics and errors
4. **Configuration** - Use configuration files for flexibility
5. **Testing** - Test all mapping functions thoroughly
6. **Documentation** - Document all mapping rules and transformations

## Performance Considerations

- **Batch Processing** - Process events in batches for efficiency
- **Caching** - Cache frequently accessed data
- **Parallel Processing** - Use parallel processing where possible
- **Resource Management** - Monitor memory and CPU usage
- **Optimization** - Optimize transformation functions for speed 