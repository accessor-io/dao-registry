# DAO Registry Workflow Diagram

## System Overview

```mermaid
graph TB
    %% External Entities
    DAO[DAO Organization]
    DEVELOPER[Developer/Integrator]
    USER[End User]
    WALLET[Web3 Wallet]
    
    %% Core Components
    REGISTRY[DAO Registry Contract]
    SCHEMA[Schema Management]
    CCIP[CCIP Integration]
    API[API Gateway]
    
    %% Data Stores
    DB[(Database)]
    IPFS[IPFS Storage]
    CHAIN[Blockchain]
    
    %% Workflow Processes
    subgraph "API Path"
        A1[API Request]
        A2[Authentication]
        A3[Data Processing]
        A4[Response]
    end
    
    subgraph "On-Chain Path"
        O1[Direct Contract Call]
        O2[Transaction Signing]
        O3[Blockchain Execution]
        O4[Event Emission]
    end
    
    subgraph "Data Management"
        D1[Schema Definition]
        D2[Data Validation]
        D3[Cross-chain Sync]
        D4[Query Processing]
    end
    
    %% API Path Connections
    USER --> A1
    DEVELOPER --> A1
    A1 --> A2
    A2 --> A3
    A3 --> API
    API --> A4
    A4 --> USER
    
    %% On-Chain Path Connections
    DAO --> O1
    WALLET --> O2
    O1 --> O2
    O2 --> O3
    O3 --> REGISTRY
    REGISTRY --> O4
    O4 --> CHAIN
    
    %% Data Management Connections
    D1 --> SCHEMA
    D2 --> CCIP
    D3 --> CHAIN
    D4 --> API
    
    %% Storage Connections
    REGISTRY --> CHAIN
    SCHEMA --> IPFS
    CCIP --> CHAIN
    API --> DB
```

## Dual Interaction Paths

### 1. API Call Path

```mermaid
sequenceDiagram
    participant USER as End User
    participant API as API Gateway
    participant AUTH as Auth Service
    participant DB as Database
    participant REG as Registry Contract
    
    USER->>API: HTTP Request
    API->>AUTH: Validate Token
    AUTH->>API: Auth Result
    
    alt Valid Request
        API->>DB: Query Data
        DB->>API: Return Data
        API->>REG: Read Contract State
        REG->>API: Contract Data
        API->>USER: JSON Response
    else Invalid Request
        API->>USER: Error Response
    end
```

### 2. On-Chain Call Path

```mermaid
sequenceDiagram
    participant USER as User
    participant WALLET as Web3 Wallet
    participant RPC as RPC Node
    participant REG as Registry Contract
    participant CHAIN as Blockchain
    
    USER->>WALLET: Sign Transaction
    WALLET->>RPC: Submit Transaction
    RPC->>CHAIN: Broadcast to Network
    CHAIN->>REG: Execute Contract Function
    REG->>CHAIN: Update State
    CHAIN->>RPC: Transaction Receipt
    RPC->>WALLET: Confirmation
    WALLET->>USER: Success Notification
```

## Detailed Process Flow

### 1. DAO Registration Process (Dual Paths)

```mermaid
flowchart TD
    START([DAO Registration]) --> CHOICE{Interaction Method?}
    
    CHOICE -->|API Path| API_PATH[API Gateway]
    CHOICE -->|On-Chain| CHAIN_PATH[Direct Contract Call]
    
    subgraph "API Registration Path"
        API_PATH --> API_AUTH[API Authentication]
        API_AUTH --> API_VALID[Validate Schema]
        API_VALID --> API_SUBMIT[Submit via API]
        API_SUBMIT --> REG_CONTRACT[Registry Contract]
    end
    
    subgraph "On-Chain Registration Path"
        CHAIN_PATH --> WALLET_SIGN[Wallet Signing]
        WALLET_SIGN --> TX_SUBMIT[Submit Transaction]
        TX_SUBMIT --> CHAIN_EXEC[Chain Execution]
        CHAIN_EXEC --> REG_CONTRACT
    end
    
    REG_CONTRACT --> STORE[Store on Chain]
    STORE --> METADATA[Generate Metadata]
    METADATA --> IPFS_STORE[Store on IPFS]
    IPFS_STORE --> EVENT[Emit Event]
    EVENT --> END([Registration Complete])
```

### 2. Data Query Process (Dual Paths)

```mermaid
flowchart TD
    QUERY([Data Query]) --> METHOD{Query Method?}
    
    METHOD -->|API Query| API_QUERY[API Request]
    METHOD -->|On-Chain Query| CHAIN_QUERY[Contract Call]
    
    subgraph "API Query Path"
        API_QUERY --> API_AUTH2[Authenticate]
        API_AUTH2 --> API_DB[Query Database]
        API_DB --> API_FORMAT[Format Response]
        API_FORMAT --> API_RESPONSE[HTTP Response]
    end
    
    subgraph "On-Chain Query Path"
        CHAIN_QUERY --> RPC_CALL[RPC Call]
        RPC_CALL --> CONTRACT_READ[Read Contract]
        CONTRACT_READ --> CHAIN_RESPONSE[Chain Response]
    end
    
    API_RESPONSE --> USER[User Receives Data]
    CHAIN_RESPONSE --> USER
```

### 3. Cross-Chain Data Flow

```mermaid
graph LR
    subgraph "Source Chain"
        SC[Source Contract]
        CCIP_S[CCIP Router]
        API_S[API Service]
    end
    
    subgraph "Target Chain"
        CCIP_T[CCIP Router]
        REG[Registry Contract]
        API_T[API Service]
    end
    
    subgraph "Data Flow Options"
        D1[API → API]
        D2[Contract → Contract]
        D3[API → Contract]
        D4[Contract → API]
    end
    
    SC --> CCIP_S
    CCIP_S --> CCIP_T
    CCIP_T --> REG
    REG --> API_T
    
    API_S --> D1
    SC --> D2
    API_S --> D3
    SC --> D4
```

### 4. API vs On-Chain Comparison

```mermaid
graph TB
    subgraph "API Path Characteristics"
        API_FAST[Fast Response]
        API_EASY[Easy Integration]
        API_CENTRAL[Centralized]
        API_RATE[Rate Limited]
    end
    
    subgraph "On-Chain Path Characteristics"
        CHAIN_DECENTRAL[Decentralized]
        CHAIN_TRUSTLESS[Trustless]
        CHAIN_SLOW[Slower]
        CHAIN_COST[Gas Costs]
    end
    
    subgraph "Use Cases"
        UC1[API: Quick Queries]
        UC2[API: Bulk Operations]
        UC3[On-Chain: Critical Updates]
        UC4[On-Chain: Trust Requirements]
    end
    
    API_FAST --> UC1
    API_EASY --> UC2
    CHAIN_DECENTRAL --> UC3
    CHAIN_TRUSTLESS --> UC4
```

## Key Components Interaction

### API Gateway Features
- **Authentication**: JWT token validation
- **Rate Limiting**: Request throttling
- **Caching**: Response optimization
- **Documentation**: OpenAPI specs
- **Error Handling**: Standardized responses

### On-Chain Contract Features
- **Gas Optimization**: Efficient function calls
- **Event Emission**: Real-time updates
- **Access Control**: Role-based permissions
- **Upgradeability**: Proxy pattern support
- **Verification**: Source code verification

### Dual Path Integration
- **Event Listening**: API listens to contract events
- **Data Sync**: Database mirrors chain state
- **Fallback**: API can query chain directly
- **Consistency**: Both paths return same data format

## Data Flow Summary

### API Path Flow
1. **Request**: HTTP/HTTPS call to API endpoint
2. **Authentication**: JWT token validation
3. **Processing**: Business logic and data formatting
4. **Response**: JSON response with status codes

### On-Chain Path Flow
1. **Transaction**: User signs transaction with wallet
2. **Submission**: Transaction broadcast to network
3. **Execution**: Smart contract function execution
4. **Confirmation**: Transaction confirmation and events

### Hybrid Approach
- **Read Operations**: Prefer API for speed
- **Write Operations**: Prefer on-chain for trust
- **Critical Data**: Always verify on-chain
- **User Experience**: API for UI, on-chain for security

## Security & Validation

### API Security
- **JWT Tokens**: Secure authentication
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize all inputs
- **HTTPS**: Encrypted communication

### On-Chain Security
- **Cryptographic Verification**: Digital signatures
- **Access Control**: Role-based permissions
- **Reentrancy Protection**: Secure contract patterns
- **Audit Trail**: Immutable transaction history

## Performance Optimizations

### API Optimizations
- **Caching**: Redis for frequent queries
- **CDN**: Global content delivery
- **Database Indexing**: Fast query performance
- **Connection Pooling**: Efficient database connections

### On-Chain Optimizations
- **Gas Optimization**: Efficient contract code
- **Batch Operations**: Multiple operations in single transaction
- **Event Filtering**: Efficient event processing
- **State Management**: Optimized storage patterns 