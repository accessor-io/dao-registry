# Hardhat Configuration

## Overview

This is the Hardhat configuration file for the DAO Registry project. It sets up the development environment, network configurations, and deployment settings for Ethereum smart contracts.

## Configuration Structure

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  // Configuration sections...
}
```

## Solidity Compiler Settings

```javascript
solidity: {
  version: "0.8.19",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    evmVersion: "paris",
  },
}
```

### Compiler Configuration
- **Version**: Solidity 0.8.19
- **Optimizer**: Enabled with 200 runs
- **EVM Version**: Paris (latest stable)

## Network Configurations

### Local Development Networks

#### Hardhat Network
```javascript
hardhat: {
  chainId: 1337,
}
```

#### Localhost Network
```javascript
localhost: {
  url: "http://127.0.0.1:8545",
  chainId: 1337,
}
```

### Mainnet Networks

#### Ethereum Mainnet
```javascript
mainnet: {
  url: process.env.MAINNET_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/your-api-key",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 1,
  gasPrice: 20000000000, // 20 gwei
}
```

#### Polygon Mainnet
```javascript
polygon: {
  url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 137,
  gasPrice: 30000000000, // 30 gwei
}
```

#### Arbitrum One
```javascript
arbitrum: {
  url: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 42161,
  gasPrice: 100000000, // 0.1 gwei
}
```

#### Optimism
```javascript
optimism: {
  url: process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 10,
  gasPrice: 1000000, // 0.001 gwei
}
```

#### Base
```javascript
base: {
  url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 8453,
  gasPrice: 1000000000, // 1 gwei
}
```

### Testnet Networks

#### Sepolia (Ethereum Testnet)
```javascript
sepolia: {
  url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/your-api-key",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 11155111,
  gasPrice: 1000000000, // 1 gwei
}
```

#### Polygon Mumbai
```javascript
polygonMumbai: {
  url: process.env.POLYGON_MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 80001,
  gasPrice: 3000000000, // 3 gwei
}
```

#### Arbitrum Goerli
```javascript
arbitrumGoerli: {
  url: process.env.ARBITRUM_GOERLI_RPC_URL || "https://goerli-rollup.arbitrum.io/rpc",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 421613,
  gasPrice: 100000000, // 0.1 gwei
}
```

#### Optimism Goerli
```javascript
optimismGoerli: {
  url: process.env.OPTIMISM_GOERLI_RPC_URL || "https://goerli.optimism.io",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 420,
  gasPrice: 1000000, // 0.001 gwei
}
```

#### Base Goerli
```javascript
baseGoerli: {
  url: process.env.BASE_GOERLI_RPC_URL || "https://goerli.base.org",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 84531,
  gasPrice: 1000000000, // 1 gwei
}
```

## Etherscan API Configuration

```javascript
etherscan: {
  apiKey: {
    mainnet: process.env.ETHERSCAN_API_KEY || "",
    sepolia: process.env.ETHERSCAN_API_KEY || "",
    polygon: process.env.POLYGONSCAN_API_KEY || "",
    polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    arbitrumOne: process.env.ARBISCAN_API_KEY || "",
    arbitrumGoerli: process.env.ARBISCAN_API_KEY || "",
    optimisticEthereum: process.env.OPTIMISM_API_KEY || "",
    optimisticGoerli: process.env.OPTIMISM_API_KEY || "",
    base: process.env.BASESCAN_API_KEY || "",
    baseGoerli: process.env.BASESCAN_API_KEY || "",
  },
}
```

### Supported Block Explorers
- **Etherscan**: Ethereum mainnet and Sepolia
- **Polygonscan**: Polygon mainnet and Mumbai
- **Arbiscan**: Arbitrum One and Goerli
- **Optimism**: Optimism mainnet and Goerli
- **Basescan**: Base mainnet and Goerli

## Gas Reporter Configuration

```javascript
gasReporter: {
  enabled: process.env.REPORT_GAS !== undefined,
  currency: "USD",
  coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  token: "ETH",
  gasPrice: 20,
}
```

### Gas Reporter Settings
- **Enabled**: When `REPORT_GAS` environment variable is set
- **Currency**: USD
- **Token**: ETH
- **Gas Price**: 20 gwei
- **CoinMarketCap**: For price data (optional)

## Contract Sizer Configuration

```javascript
contractSizer: {
  alphaSort: true,
  disambiguatePaths: false,
  runOnCompile: true,
  strict: true,
}
```

### Contract Sizer Settings
- **Alpha Sort**: Sort contracts alphabetically
- **Run On Compile**: Analyze contracts during compilation
- **Strict Mode**: Enable strict size checking

## Mocha Test Configuration

```javascript
mocha: {
  timeout: 40000,
}
```

### Test Settings
- **Timeout**: 40 seconds for test execution

## Path Configuration

```javascript
paths: {
  sources: "./contracts",
  tests: "./test",
  cache: "./cache",
  artifacts: "./artifacts",
}
```

### Directory Structure
- **Sources**: `./contracts` - Smart contract source files
- **Tests**: `./test` - Test files
- **Cache**: `./cache` - Hardhat cache
- **Artifacts**: `./artifacts` - Compiled contract artifacts

## Plugins

```javascript
plugins: [
  "@nomicfoundation/hardhat-toolbox",
  "hardhat-contract-sizer",
]
```

### Installed Plugins
- **Hardhat Toolbox**:   development toolkit
- **Contract Sizer**: Analyze contract sizes

## Environment Variables

The configuration uses the following environment variables:

### Network RPC URLs
- `MAINNET_RPC_URL` - Ethereum mainnet RPC
- `SEPOLIA_RPC_URL` - Sepolia testnet RPC
- `POLYGON_RPC_URL` - Polygon mainnet RPC
- `POLYGON_MUMBAI_RPC_URL` - Polygon Mumbai testnet RPC
- `ARBITRUM_RPC_URL` - Arbitrum One RPC
- `ARBITRUM_GOERLI_RPC_URL` - Arbitrum Goerli testnet RPC
- `OPTIMISM_RPC_URL` - Optimism mainnet RPC
- `OPTIMISM_GOERLI_RPC_URL` - Optimism Goerli testnet RPC
- `BASE_RPC_URL` - Base mainnet RPC
- `BASE_GOERLI_RPC_URL` - Base Goerli testnet RPC

### API Keys
- `ETHERSCAN_API_KEY` - Etherscan API key
- `POLYGONSCAN_API_KEY` - Polygonscan API key
- `ARBISCAN_API_KEY` - Arbiscan API key
- `OPTIMISM_API_KEY` - Optimism API key
- `BASESCAN_API_KEY` - Basescan API key
- `COINMARKETCAP_API_KEY` - CoinMarketCap API key

### Deployment
- `PRIVATE_KEY` - Private key for contract deployment
- `REPORT_GAS` - Enable gas reporting

## Usage

### Local Development
```bash
npx hardhat compile
npx hardhat test
npx hardhat node
```

### Network Deployment
```bash
# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

### Gas Reporting
```bash
REPORT_GAS=true npx hardhat test
``` 