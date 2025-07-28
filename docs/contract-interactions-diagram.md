# DAO Registry Contract Interactions Diagram

## System Architecture Overview

```mermaid
graph TB
    %% External Entities
    USER[End User/DAO Member]
    DEVELOPER[Developer/Integrator]
    WALLET[Web3 Wallet]
    
    %% Core Registry Contract
    REGISTRY[DAORegistry.sol]
    
    %% Mock Contracts for Testing
    MOCK_ERC20[MockERC20.sol]
    MOCK_GOV[MockGovernance.sol]
    MOCK_TREASURY[MockTreasury.sol]
    
    %% Schema Management
    SCHEMA[ReservedSubdomains.sol]
    
    %% Data Stores
    CHAIN[(Blockchain State)]
    IPFS[IPFS Storage]
    DB[(Database)]
    
    %% API Layer
    API[API Gateway]
    
    %% Relationships
    USER --> WALLET
    WALLET --> REGISTRY
    WALLET --> MOCK_ERC20
    WALLET --> MOCK_GOV
    WALLET --> MOCK_TREASURY
    
    REGISTRY --> MOCK_ERC20
    REGISTRY --> MOCK_GOV
    REGISTRY --> MOCK_TREASURY
    REGISTRY --> SCHEMA
    
    MOCK_GOV --> MOCK_ERC20
    MOCK_TREASURY --> MOCK_ERC20
    
    SCHEMA --> CHAIN
    REGISTRY --> CHAIN
    MOCK_ERC20 --> CHAIN
    MOCK_GOV --> CHAIN
    MOCK_TREASURY --> CHAIN
    
    API --> REGISTRY
    API --> SCHEMA
    API --> DB
    
    DEVELOPER --> API
```

## Contract Relationships and Dependencies

```mermaid
graph LR
    %% Core Contracts
    subgraph "Core Registry"
        REGISTRY[DAORegistry.sol]
    end
    
    subgraph "Schema Management"
        SCHEMA[ReservedSubdomains.sol]
    end
    
    subgraph "Mock Contracts"
        MOCK_ERC20[MockERC20.sol]
        MOCK_GOV[MockGovernance.sol]
        MOCK_TREASURY[MockTreasury.sol]
    end
    
    %% Dependencies
    REGISTRY -.->|references| MOCK_ERC20
    REGISTRY -.->|references| MOCK_GOV
    REGISTRY -.->|references| MOCK_TREASURY
    REGISTRY -.->|uses schemas| SCHEMA
    
    MOCK_GOV -.->|requires| MOCK_ERC20
    MOCK_TREASURY -.->|manages| MOCK_ERC20
    
    SCHEMA -.->|independent| REGISTRY
```

## Data Flow Between Contracts

```mermaid
sequenceDiagram
    participant U as User
    participant R as DAORegistry
    participant G as MockGovernance
    participant T as MockTreasury
    participant E as MockERC20
    participant S as ReservedSubdomains
    
    Note over U,S: DAO Registration Flow
    
    U->>R: registerDAO()
    R->>E: getTokenInfo()
    R->>G: getGovernanceInfo()
    R->>T: getTreasuryInfo()
    R->>S: validateSchema()
    R-->>U: DAO registered
    
    Note over U,S: Governance Flow
    
    U->>G: propose()
    G->>E: balanceOf()
    G-->>U: proposal created
    
    U->>G: castVote()
    G->>E: balanceOf()
    G-->>U: vote recorded
    
    Note over U,S: Treasury Flow
    
    U->>T: depositETH()
    T-->>U: ETH deposited
    
    U->>T: depositToken()
    T->>E: transferFrom()
    T-->>U: token deposited
    
    Note over U,S: Schema Validation Flow
    
    U->>S: storeCCIPData()
    S->>S: validateSchema()
    S-->>U: data stored
```

## Contract Responsibilities and Functions

```mermaid
graph TD
    subgraph "DAORegistry.sol - Main Registry"
        R1[DAO Registration]
        R2[Member Management]
        R3[Proposal Tracking]
        R4[Analytics Collection]
        R5[Fee Management]
        R6[Status Management]
    end
    
    subgraph "ReservedSubdomains.sol - Schema Management"
        S1[Schema Definition]
        S2[CCIP Data Storage]
        S3[Cross-chain Validation]
        S4[API Endpoint Management]
        S5[Data Provider Management]
        S6[Auto-update Configuration]
    end
    
    subgraph "MockERC20.sol - Token Management"
        E1[Token Minting]
        E2[Token Burning]
        E3[Balance Tracking]
        E4[Transfer Operations]
        E5[Batch Operations]
        E6[Emergency Recovery]
    end
    
    subgraph "MockGovernance.sol - Governance Logic"
        G1[Proposal Creation]
        G2[Voting Mechanism]
        G3[Proposal Execution]
        G4[Quorum Management]
        G5[Vote Weighting]
        G6[Status Tracking]
    end
    
    subgraph "MockTreasury.sol - Asset Management"
        T1[ETH Management]
        T2[Token Management]
        T3[NFT Management]
        T4[Balance Tracking]
        T5[Withdrawal Controls]
        T6[Value Calculation]
    end
```

## Cross-Contract Communication Patterns

```mermaid
graph LR
    subgraph "Direct Contract Calls"
        A[Contract A]
        B[Contract B]
        A -->|function call| B
    end
    
    subgraph "Event-Driven Communication"
        C[Contract C]
        D[Contract D]
        C -->|emit event| E[Event]
        E -->|listen| D
    end
    
    subgraph "State-Based Communication"
        F[Contract F]
        G[Contract G]
        F -->|update state| H[Shared State]
        G -->|read state| H
    end
    
    subgraph "Schema-Based Communication"
        I[Contract I]
        J[Contract J]
        I -->|validate against| K[Schema]
        J -->|read from| K
    end
```

## Contract Integration Points

```mermaid
graph TB
    subgraph "Integration Layer"
        API[API Gateway]
        ORACLE[Price Oracle]
        CCIP[CCIP Router]
    end
    
    subgraph "Core Contracts"
        REGISTRY[DAORegistry]
        SCHEMA[ReservedSubdomains]
    end
    
    subgraph "Mock Contracts"
        MOCK_ERC20[MockERC20]
        MOCK_GOV[MockGovernance]
        MOCK_TREASURY[MockTreasury]
    end
    
    subgraph "External Systems"
        ENS[ENS Registry]
        IPFS[IPFS Network]
        CHAIN[Other Chains]
    end
    
    %% Integration flows
    API --> REGISTRY
    API --> SCHEMA
    API --> MOCK_ERC20
    API --> MOCK_GOV
    API --> MOCK_TREASURY
    
    ORACLE --> MOCK_TREASURY
    ORACLE --> REGISTRY
    
    CCIP --> SCHEMA
    CCIP --> REGISTRY
    
    ENS --> REGISTRY
    IPFS --> SCHEMA
    CHAIN --> CCIP
```

## Contract State Management

```mermaid
graph LR
    subgraph "DAORegistry State"
        R_STATE[DAO Info<br/>Member Data<br/>Proposal Data<br/>Analytics]
    end
    
    subgraph "ReservedSubdomains State"
        S_STATE[Schema Definitions<br/>CCIP Data<br/>Provider Registry<br/>Statistics]
    end
    
    subgraph "Mock Contract States"
        E_STATE[Token Balances<br/>Total Supply<br/>Allowances]
        G_STATE[Proposals<br/>Votes<br/>Governance Params]
        T_STATE[Treasury Balances<br/>Asset Registry<br/>Value Tracking]
    end
    
    %% State interactions
    R_STATE -.->|references| E_STATE
    R_STATE -.->|references| G_STATE
    R_STATE -.->|references| T_STATE
    R_STATE -.->|validates against| S_STATE
    
    S_STATE -.->|independent| R_STATE
    S_STATE -.->|independent| E_STATE
    S_STATE -.->|independent| G_STATE
    S_STATE -.->|independent| T_STATE
```

## Security and Access Control

```mermaid
graph TD
    subgraph "Access Control Layers"
        OWNER[Contract Owner]
        ADMIN[Administrators]
        MODERATOR[Moderators]
        MEMBER[DAO Members]
        PROVIDER[Data Providers]
    end
    
    subgraph "Contract Permissions"
        REGISTRY[DAORegistry<br/>- onlyOwner<br/>- onlyDAOOwner<br/>- onlyVerifiedDAO]
        SCHEMA[ReservedSubdomains<br/>- onlyOwner<br/>- onlyAdministrator<br/>- onlyDataProvider]
        MOCK_ERC20[MockERC20<br/>- onlyOwner<br/>- public functions]
        MOCK_GOV[MockGovernance<br/>- token-based<br/>- proposal-based]
        MOCK_TREASURY[MockTreasury<br/>- onlyOwner<br/>- member-based]
    end
    
    %% Permission flows
    OWNER --> REGISTRY
    OWNER --> SCHEMA
    OWNER --> MOCK_ERC20
    OWNER --> MOCK_TREASURY
    
    ADMIN --> REGISTRY
    ADMIN --> SCHEMA
    
    MODERATOR --> REGISTRY
    
    MEMBER --> MOCK_GOV
    MEMBER --> MOCK_TREASURY
    
    PROVIDER --> SCHEMA
```

## Event Emission and Monitoring

```mermaid
graph LR
    subgraph "DAORegistry Events"
        R_EVENTS[DAORegistered<br/>DAOUpdated<br/>ProposalCreated<br/>MemberAdded]
    end
    
    subgraph "ReservedSubdomains Events"
        S_EVENTS[SchemaDefined<br/>CCIPDataStored<br/>RoleAdded<br/>SchemaUpdated]
    end
    
    subgraph "Mock Contract Events"
        E_EVENTS[Transfer<br/>TransferWithData<br/>Mint/Burn]
        G_EVENTS[ProposalCreated<br/>VoteCast<br/>ProposalExecuted]
        T_EVENTS[ETHDeposited<br/>TokenDeposited<br/>TreasuryUpdated]
    end
    
    subgraph "Event Consumers"
        API[API Gateway]
        INDEXER[Event Indexer]
        MONITOR[Monitoring System]
        FRONTEND[Frontend App]
    end
    
    %% Event flows
    R_EVENTS --> API
    R_EVENTS --> INDEXER
    R_EVENTS --> MONITOR
    
    S_EVENTS --> API
    S_EVENTS --> INDEXER
    S_EVENTS --> MONITOR
    
    E_EVENTS --> INDEXER
    G_EVENTS --> INDEXER
    T_EVENTS --> INDEXER
    
    INDEXER --> FRONTEND
    API --> FRONTEND
```

## Contract Deployment and Initialization

```mermaid
sequenceDiagram
    participant D as Deployer
    participant R as DAORegistry
    participant S as ReservedSubdomains
    participant E as MockERC20
    participant G as MockGovernance
    participant T as MockTreasury
    
    D->>R: deploy DAORegistry
    D->>S: deploy ReservedSubdomains
    D->>E: deploy MockERC20
    D->>G: deploy MockGovernance
    D->>T: deploy MockTreasury
    
    D->>S: initializeSchemas()
    D->>S: setAdministrators()
    D->>S: setDataProviders()
    
    D->>E: mint initial tokens
    D->>G: set governance token
    D->>G: set treasury address
    
    D->>T: set governance address
    D->>T: set token address
    
    D->>R: set schema contract
    D->>R: set fee structure
    D->>R: set limits
```

## Contract Testing and Validation

```mermaid
graph TD
    subgraph "Unit Tests"
        UT_R[DAORegistry Tests]
        UT_S[ReservedSubdomains Tests]
        UT_E[MockERC20 Tests]
        UT_G[MockGovernance Tests]
        UT_T[MockTreasury Tests]
    end
    
    subgraph "Integration Tests"
        IT_RS[Registry-Schema Integration]
        IT_RG[Registry-Governance Integration]
        IT_RT[Registry-Treasury Integration]
        IT_GE[Governance-ERC20 Integration]
        IT_TE[Treasury-ERC20 Integration]
    end
    
    subgraph "End-to-End Tests"
        E2E_DAO[Complete DAO Registration]
        E2E_GOV[Complete Governance Flow]
        E2E_TREASURY[Complete Treasury Flow]
        E2E_CCIP[Complete CCIP Flow]
    end
    
    %% Test relationships
    UT_R --> IT_RS
    UT_S --> IT_RS
    UT_R --> IT_RG
    UT_G --> IT_RG
    UT_R --> IT_RT
    UT_T --> IT_RT
    UT_G --> IT_GE
    UT_E --> IT_GE
    UT_T --> IT_TE
    UT_E --> IT_TE
    
    IT_RS --> E2E_DAO
    IT_RG --> E2E_GOV
    IT_RT --> E2E_TREASURY
    IT_RS --> E2E_CCIP
```

## Contract Upgrade and Migration Strategy

```mermaid
graph LR
    subgraph "Current Version"
        V1_R[DAORegistry v1]
        V1_S[ReservedSubdomains v1]
        V1_M[Mock Contracts v1]
    end
    
    subgraph "Upgrade Process"
        PROXY[Proxy Contract]
        IMPLEMENTATION[Implementation Contract]
        MIGRATION[Migration Contract]
    end
    
    subgraph "New Version"
        V2_R[DAORegistry v2]
        V2_S[ReservedSubdomains v2]
        V2_M[Mock Contracts v2]
    end
    
    %% Upgrade flow
    V1_R --> PROXY
    V1_S --> PROXY
    V1_M --> PROXY
    
    PROXY --> IMPLEMENTATION
    IMPLEMENTATION --> MIGRATION
    
    MIGRATION --> V2_R
    MIGRATION --> V2_S
    MIGRATION --> V2_M
    
    V2_R --> PROXY
    V2_S --> PROXY
    V2_M --> PROXY
```

## Summary of Contract Interactions

### **Core Contract Relationships:**

1. **DAORegistry.sol** - Central registry that:
   - References MockERC20 for token information
   - References MockGovernance for governance data
   - References MockTreasury for treasury information
   - Uses ReservedSubdomains for schema validation

2. **ReservedSubdomains.sol** - Independent schema manager that:
   - Provides standardized data schemas
   - Stores CCIP-compatible data
   - Manages cross-chain data validation
   - Operates independently of other contracts

3. **Mock Contracts** - Testing infrastructure:
   - **MockERC20**: Provides token functionality for governance
   - **MockGovernance**: Implements governance logic using tokens
   - **MockTreasury**: Manages assets and integrates with tokens

### **Key Interaction Patterns:**

- **Direct Function Calls**: Contracts call each other's functions directly
- **Event-Driven Communication**: Contracts emit events that others listen to
- **State-Based Communication**: Contracts read each other's state
- **Schema-Based Validation**: Contracts validate data against schemas

### **Security Model:**

- **Ownable**: Core contracts have owner controls
- **Role-Based**: Different access levels for different functions
- **Token-Based**: Governance requires token ownership
- **Provider-Based**: Data providers have specific permissions

### **Data Flow:**

1. **Registration**: User → DAORegistry → Validates against schemas
2. **Governance**: User → MockGovernance → Uses MockERC20 tokens
3. **Treasury**: User → MockTreasury → Manages MockERC20 tokens
4. **Schema**: User → ReservedSubdomains → Stores CCIP data

This architecture provides a  , testable, and extensible system for DAO management with cross-chain compatibility. 