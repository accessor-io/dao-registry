# Mock ERC20 Token Contract

## Overview

The `MockERC20.sol` contract is a mock ERC20 token implementation for testing DAO Registry functionality. It extends OpenZeppelin's ERC20 contract with additional features for testing and development purposes.

## Contract Information

- **License**: MIT
- **Solidity Version**: ^0.8.19
- **Inheritance**: ERC20, Ownable
- **Dependencies**: OpenZeppelin Contracts

## Imports

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
```

## State Variables

```solidity
uint8 private _decimals;
```

## Constructor

```solidity
constructor(
    string memory name,
    string memory symbol,
    uint8 decimals_
) ERC20(name, symbol) {
    _decimals = decimals_;
}
```

### Parameters
- **name**: Token name
- **symbol**: Token symbol
- **decimals_**: Number of decimal places

## Core Functions

### Minting

#### Mint Tokens
```solidity
function mint(address to, uint256 amount) external onlyOwner
```

**Description**: Mints new tokens to a specific address (owner only)

**Parameters**:
- `to`: Recipient address
- `amount`: Amount to mint

**Access**: Owner only

### Burning

#### Burn Tokens
```solidity
function burn(uint256 amount) external
```

**Description**: Burns tokens from the caller's address

**Parameters**:
- `amount`: Amount to burn

**Access**: Public

### Token Information

#### Get Token Info
```solidity
function getTokenInfo()
    external
    view
    returns (
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint8 decimals
    )
```

**Description**: Returns comprehensive token information

**Returns**:
- `name`: Token name
- `symbol`: Token symbol
- `totalSupply`: Total token supply
- `decimals`: Number of decimal places

#### Check Sufficient Balance
```solidity
function hasSufficientBalance(address account, uint256 amount)
    external
    view
    returns (bool)
```

**Description**: Checks if an address has sufficient balance

**Parameters**:
- `account`: Address to check
- `amount`: Required amount

**Returns**: True if sufficient balance

#### Get Balance Percentage
```solidity
function getBalancePercentage(address account)
    external
    view
    returns (uint256 percentage)
```

**Description**: Calculates balance percentage of total supply

**Parameters**:
- `account`: Address to check

**Returns**: Balance percentage in basis points (0-10000)

### Advanced Transfer Functions

#### Transfer with Data
```solidity
function transferWithData(
    address to,
    uint256 amount,
    bytes calldata data
) external returns (bool)
```

**Description**: Transfers tokens with additional data

**Parameters**:
- `to`: Recipient address
- `amount`: Amount to transfer
- `data`: Additional data

**Returns**: Success status

**Events**: Emits `TransferWithData` event

#### Batch Transfer
```solidity
function batchTransfer(
    address[] calldata recipients,
    uint256[] calldata amounts
) external returns (bool)
```

**Description**: Transfers tokens to multiple addresses in a single transaction

**Parameters**:
- `recipients`: Array of recipient addresses
- `amounts`: Array of amounts to transfer

**Returns**: Success status

**Validation**: Requires equal array lengths

### Emergency Functions

#### Emergency Token Recovery
```solidity
function emergencyRecoverTokens(
    address tokenAddress,
    address to,
    uint256 amount
) external onlyOwner
```

**Description**: Recovers stuck tokens from the contract

**Parameters**:
- `tokenAddress`: Token contract address
- `to`: Recipient address
- `amount`: Amount to recover

**Access**: Owner only

## Override Functions

### Decimals
```solidity
function decimals() public view virtual override returns (uint8)
```

**Description**: Returns the number of decimal places

**Returns**: Token decimals

## Events

### Transfer with Data Event
```solidity
event TransferWithData(
    address indexed from,
    address indexed to,
    uint256 amount,
    bytes data
);
```

**Description**: Emitted when tokens are transferred with additional data

**Parameters**:
- `from`: Sender address
- `to`: Recipient address
- `amount`: Transfer amount
- `data`: Additional data

## Usage Examples

### Deploy Token
```solidity
// Deploy a mock token
MockERC20 token = new MockERC20(
    "Mock DAO Token",
    "MDAO",
    18
);
```

### Mint Tokens
```solidity
// Mint tokens to an address
token.mint(recipientAddress, 1000000 * 10**18);
```

### Check Token Info
```solidity
// Get comprehensive token information
(
    string memory name,
    string memory symbol,
    uint256 totalSupply,
    uint8 decimals
) = token.getTokenInfo();
```

### Batch Transfer
```solidity
// Transfer to multiple recipients
address[] memory recipients = new address[](3);
uint256[] memory amounts = new uint256[](3);

recipients[0] = address1;
recipients[1] = address2;
recipients[2] = address3;

amounts[0] = 100 * 10**18;
amounts[1] = 200 * 10**18;
amounts[2] = 300 * 10**18;

token.batchTransfer(recipients, amounts);
```

### Check Balance Percentage
```solidity
// Get balance percentage
uint256 percentage = token.getBalancePercentage(userAddress);
// percentage is in basis points (0-10000)
```

## Security Features

### Access Control
- **Owner**: Can mint tokens and recover stuck tokens
- **Public**: Can burn their own tokens and transfer

### Validation
- Array length validation for batch transfers
- Balance checks for transfers
- Zero division protection

### Emergency Functions
- Token recovery for stuck tokens
- Owner-only emergency functions

## Gas Optimization

### Efficient Operations
- Batch transfers reduce gas costs
- View functions for read operations
- Optimized balance calculations

### Storage Efficiency
- Minimal state variables
- Efficient event emission
- Packed data structures

## Testing Features

### Mock Functionality
- Easy token creation for testing
- Flexible decimal configuration
- Comprehensive token information

### Development Tools
- Balance percentage calculations
- Sufficient balance checks
- Batch operation support

## Integration Points

### DAO Registry Integration
- Token address tracking
- Balance verification
- Transfer validation

### Governance Integration
- Voting power calculation
- Token balance checks
- Transfer restrictions

## Deployment Considerations

### Initial Setup
1. Deploy with appropriate name, symbol, and decimals
2. Set initial owner address
3. Mint initial supply if needed
4. Configure for testing environment

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
- Test DAO Registry integration
- Test governance integration
- Test multi-user scenarios

### Gas Tests
- Measure gas costs for key operations
- Optimize expensive functions
- Monitor gas usage patterns

## Monitoring and Analytics

### Event Monitoring
- Monitor transfer events
- Track minting and burning
- Monitor batch transfer operations

### Performance Metrics
- Gas usage tracking
- Function call frequency
- Error rate monitoring

## Security Best Practices

### Code Review
- Comprehensive security review
- External audit recommendations
- Bug bounty program

### Access Control
- Multi-signature wallets for critical operations
- Time-locked functions for sensitive changes
- Emergency pause functionality

### Testing
- Comprehensive test coverage
- Fuzzing and property-based testing
- Formal verification where applicable

## Development Workflow

### Local Development
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy-mock-token.js --network localhost
```

### Testing Environment
```bash
# Deploy to testnet
npx hardhat run scripts/deploy-mock-token.js --network sepolia

# Verify contract
npx hardhat verify --network sepolia CONTRACT_ADDRESS "Token Name" "SYMBOL" 18
```

## Documentation Standards

### Code Comments
- Comprehensive function documentation
- Parameter descriptions
- Return value explanations

### Usage Examples
- Deployment examples
- Function call examples
- Integration examples

### Security Notes
- Access control documentation
- Emergency function descriptions
- Validation requirements 