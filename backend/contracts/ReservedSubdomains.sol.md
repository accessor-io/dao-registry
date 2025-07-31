# Reserved Subdomains Smart Contract

## Overview

The `ReservedSubdomains.sol` contract manages reserved subdomains for the DAO Registry system. It provides a   system for managing subdomain reservations with priority levels, access control, and ENS integration.

## Contract Information

- **License**: MIT
- **Solidity Version**: ^0.8.19
- **Inheritance**: Ownable, ReentrancyGuard
- **Dependencies**: OpenZeppelin Contracts

## Imports

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
```

## Data Structures

### Priority Enum

```solidity
enum Priority {
    CRITICAL,   // Never available
    HIGH,       // Requires special permission
    MEDIUM,     // Available with registration
    LOW         // Available with approval
}
```

### ReservedSubdomainInfo

```solidity
struct ReservedSubdomainInfo {
    string subdomain;
    Priority priority;
    string category;
    string description;
    string[] allowedRoles;
    string[] restrictions;
    bool active;
    uint256 createdAt;
    uint256 updatedAt;
}
```

## Events

### Subdomain Management Events
```solidity
event SubdomainReserved(
    string indexed subdomain,
    Priority priority,
    string category,
    address indexed reservedBy
);

event SubdomainReleased(
    string indexed subdomain,
    address indexed releasedBy
);

event SubdomainUpdated(
    string indexed subdomain,
    Priority oldPriority,
    Priority newPriority,
    address indexed updatedBy
);
```

### Role Management Events
```solidity
event RoleAdded(
    string indexed subdomain,
    string role,
    address indexed addedBy
);

event RoleRemoved(
    string indexed subdomain,
    string role,
    address indexed removedBy
);
```

## State Variables

### Core Mappings
```solidity
mapping(string => ReservedSubdomainInfo) public reservedSubdomains;
mapping(string => bool) public isReserved;
mapping(string => Priority) public subdomainPriority;
mapping(string => string[]) public subdomainCategories;
```

### Access Control
```solidity
mapping(address => bool) public administrators;
mapping(address => bool) public moderators;
```

### Statistics
```solidity
uint256 public totalReservedSubdomains;
mapping(Priority => uint256) public subdomainsByPriority;
mapping(string => uint256) public subdomainsByCategory;
```

## Modifiers

### Access Control Modifiers
```solidity
modifier onlyAdministrator() {
    require(administrators[msg.sender] || owner() == msg.sender, "Not authorized");
    _;
}

modifier onlyModerator() {
    require(moderators[msg.sender] || administrators[msg.sender] || owner() == msg.sender, "Not authorized");
    _;
}
```

### Subdomain Validation Modifiers
```solidity
modifier subdomainExists(string memory subdomain) {
    require(isReserved[subdomain], "Subdomain not reserved");
    _;
}

modifier subdomainNotExists(string memory subdomain) {
    require(!isReserved[subdomain], "Subdomain already reserved");
    _;
}
```

## Initialization

### Constructor
```solidity
constructor() {
    _initializeCriticalReserved();
    _initializeHighPriorityReserved();
    _initializeMediumPriorityReserved();
    
    // Set initial administrators
    administrators[msg.sender] = true;
}
```

### Critical Reserved Subdomains
The contract initializes with the following critical subdomains:

- **governance** - Core governance functionality
- **treasury** - Treasury management
- **token** - Token management
- **docs** - Documentation
- **forum** - Community forum
- **analytics** - Analytics and metrics
- **admin** - Administrative functions
- **system** - System operations
- **root** - Root domain operations
- **www** - World Wide Web
- **api** - API endpoints

### High Priority Reserved Subdomains
Includes 35 high-priority subdomains such as:

- **voting** - Voting mechanisms
- **proposals** - Proposal management
- **executive** - Executive functions
- **council** - Council operations
- **vault** - Vault management
- **rewards** - Reward systems
- **staking** - Staking mechanisms
- **liquidity** - Liquidity management
- **erc20** - ERC20 token operations
- **nft** - NFT operations
- **vesting** - Token vesting
- **airdrop** - Airdrop operations
- **wiki** - Documentation wiki
- **guide** - User guides
- **spec** - Specifications
- **chat** - Chat functionality
- **discord** - Discord integration
- **telegram** - Telegram integration
- **reddit** - Reddit integration
- **stats** - Statistics
- **metrics** - Metrics and analytics
- **dashboard** - Dashboard interface
- **reports** - Reporting tools
- **dev** - Development tools
- **github** - GitHub integration
- **code** - Code repository
- **test** - Testing environment
- **staging** - Staging environment

## Core Functions

### Subdomain Management

#### Reserve Subdomain
```solidity
function reserveSubdomain(
    string memory subdomain,
    Priority priority,
    string memory category,
    string memory description,
    string[] memory allowedRoles,
    string[] memory restrictions
) external onlyAdministrator subdomainNotExists(subdomain)
```

#### Release Subdomain
```solidity
function releaseSubdomain(string memory subdomain) 
    external 
    onlyAdministrator 
    subdomainExists(subdomain)
```

#### Update Subdomain
```solidity
function updateSubdomain(
    string memory subdomain,
    Priority newPriority,
    string memory newCategory,
    string memory newDescription
) external onlyAdministrator subdomainExists(subdomain)
```

### Access Control

#### Add Administrator
```solidity
function addAdministrator(address admin) external onlyOwner
```

#### Remove Administrator
```solidity
function removeAdministrator(address admin) external onlyOwner
```

#### Add Moderator
```solidity
function addModerator(address moderator) external onlyAdministrator
```

#### Remove Moderator
```solidity
function removeModerator(address moderator) external onlyAdministrator
```

### Role Management

#### Add Role to Subdomain
```solidity
function addRoleToSubdomain(
    string memory subdomain,
    string memory role
) external onlyModerator subdomainExists(subdomain)
```

#### Remove Role from Subdomain
```solidity
function removeRoleFromSubdomain(
    string memory subdomain,
    string memory role
) external onlyModerator subdomainExists(subdomain)
```

## View Functions

### Subdomain Queries

#### Get Subdomain Info
```solidity
function getSubdomainInfo(string memory subdomain) 
    external 
    view 
    returns (ReservedSubdomainInfo memory)
```

#### Check if Subdomain is Reserved
```solidity
function isSubdomainReserved(string memory subdomain) 
    external 
    view 
    returns (bool)
```

#### Get Subdomain Priority
```solidity
function getSubdomainPriority(string memory subdomain) 
    external 
    view 
    returns (Priority)
```

### Batch Queries

#### Get All Reserved Subdomains
```solidity
function getAllReservedSubdomains() 
    external 
    view 
    returns (string[] memory)
```

#### Get Subdomains by Priority
```solidity
function getSubdomainsByPriority(Priority priority) 
    external 
    view 
    returns (string[] memory)
```

#### Get Subdomains by Category
```solidity
function getSubdomainsByCategory(string memory category) 
    external 
    view 
    returns (string[] memory)
```

### Statistics

#### Get Statistics
```solidity
function getStatistics() 
    external 
    view 
    returns (
        uint256 totalReserved,
        uint256 criticalCount,
        uint256 highCount,
        uint256 mediumCount,
        uint256 lowCount
    )
```

#### Get Category Statistics
```solidity
function getCategoryStatistics(string memory category) 
    external 
    view 
    returns (uint256 count)
```

## Priority Levels

### CRITICAL (Priority 0)
- **Description**: Never available for public registration
- **Use Case**: Core system components
- **Access**: DAO owners and system administrators only
- **Examples**: governance, treasury, token, docs

### HIGH (Priority 1)
- **Description**: Requires special permission
- **Use Case**: Important DAO functions
- **Access**: Requires approval process
- **Examples**: voting, proposals, executive, council

### MEDIUM (Priority 2)
- **Description**: Available with registration
- **Use Case**: Standard DAO features
- **Access**: Available to registered DAOs
- **Examples**: forum, chat, stats, metrics

### LOW (Priority 3)
- **Description**: Available with approval
- **Use Case**: Optional features
- **Access**: Available with moderator approval
- **Examples**: custom features, experimental tools

## Categories

### Core DAO Components
- Critical system subdomains
- Essential governance functions
- Treasury and token management

### Governance Tools
- Voting mechanisms
- Proposal management
- Executive functions

### Community Features
- Forums and chat
- Documentation
- Social media integration

### Analytics and Metrics
- Statistics and reporting
- Dashboard interfaces
- Performance metrics

### Development Tools
- Code repositories
- Testing environments
- Development utilities

## Security Features

### Access Control
- **Owner**: Full administrative access
- **Administrators**: Can manage subdomains and moderators
- **Moderators**: Can manage roles and basic operations

### Validation
- Subdomain format validation
- Duplicate prevention
- Priority level validation

### Reentrancy Protection
- Uses OpenZeppelin's `ReentrancyGuard`
- Protected critical functions

## Gas Optimization

### Storage Efficiency
- Efficient mapping structures
- Packed data where possible
- Optimized string handling

### Function Optimization
- View functions for read operations
- Batch operations for multiple queries
- Efficient event emission

## Integration Points

### ENS Integration
- Domain validation
- Subdomain resolution
- ENS record management

### DAO Registry Integration
- Subdomain availability checking
- Registration workflow
- Access control coordination

## Usage Examples

### Reserve a New Subdomain
```solidity
// Reserve a high-priority subdomain
reservedSubdomains.reserveSubdomain(
    "voting",
    Priority.HIGH,
    "Governance Tools",
    "Voting mechanism for DAO proposals",
    ["DAO owners", "Governance admins"],
    ["Requires special permission"]
);
```

### Check Subdomain Availability
```solidity
// Check if a subdomain is available
bool isAvailable = !reservedSubdomains.isSubdomainReserved("myapp");
```

### Get Subdomain Information
```solidity
// Get detailed information about a reserved subdomain
ReservedSubdomainInfo memory info = reservedSubdomains.getSubdomainInfo("governance");
```

## Deployment Considerations

### Initial Setup
1. Deploy contract with owner address
2. Initialize critical reserved subdomains
3. Set up initial administrators
4. Configure ENS integration

### Network-Specific Configuration
- Adjust gas limits for different networks
- Configure appropriate block confirmations
- Set up monitoring and alerts

## Testing Strategy

### Unit Tests
- Test all public functions
- Verify access control
- Test edge cases and error conditions

### Integration Tests
- Test ENS integration
- Test DAO Registry integration
- Test multi-user scenarios

### Gas Tests
- Measure gas costs for key operations
- Optimize expensive functions
- Monitor gas usage patterns

## Monitoring and Analytics

### Event Monitoring
- Monitor subdomain reservation events
- Track access control changes
- Monitor priority level updates

### Performance Metrics
- Gas usage tracking
- Function call frequency
- Error rate monitoring

## Security Best Practices

### Code Review
-   security review
- External audit recommendations
- Bug bounty program

### Access Control
- Multi-signature wallets for critical operations
- Time-locked functions for sensitive changes
- Emergency pause functionality

### Testing
-   test coverage
- Fuzzing and property-based testing
- Formal verification where applicable 