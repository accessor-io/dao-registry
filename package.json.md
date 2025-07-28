# Package.json

## Project Information

```json
{
  "name": "dao-registry",
  "version": "1.0.0",
  "description": "  DAO Registry system with URL encoding, reserved subdomains, ENS integration, and ISO metadata standards",
  "main": "src/index.js",
  "author": "DAO Registry Team",
  "license": "MIT"
}
```

## Scripts

### Development Scripts
- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run demo` - Run the demo script
- `npm run cli` - Run the CLI interface
- `npm run cli:dev` - Run CLI in development mode
- `npm run admin` - Run admin CLI interface

### Testing Scripts
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Build Scripts
- `npm run build` - Build TypeScript project
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Deployment Scripts
- `npm run deploy` - Deploy to mainnet
- `npm run deploy:testnet` - Deploy to testnet
- `npm run deploy:reserved` - Deploy reserved subdomains to mainnet
- `npm run deploy:reserved:testnet` - Deploy reserved subdomains to testnet

## Keywords

- dao
- blockchain
- governance
- ens
- ethereum
- metadata
- iso
- url-encoding
- subdomains
- registry

## Dependencies

### Core Dependencies
- `@ensdomains/ensjs` - ENS JavaScript SDK
- `@openzeppelin/contracts` - OpenZeppelin smart contracts
- `ethers` - Ethereum library
- `express` - Web framework
- `hardhat` - Ethereum development environment

### Web Framework Dependencies
- `compression` - Response compression
- `cors` - Cross-origin resource sharing
- `helmet` - Security headers
- `morgan` - HTTP request logger

### Validation Dependencies
- `joi` - Schema validation
- `zod` - TypeScript-first schema validation

### Utility Dependencies
- `dotenv` - Environment variables
- `punycode` - Unicode encoding
- `socket` - WebSocket support

### CLI Dependencies
- `commander` - Command-line interface
- `inquirer` - Interactive prompts
- `chalk` - Terminal styling
- `ora` - Terminal spinners
- `table` - Terminal tables
- `figlet` - ASCII art
- `boxen` - Terminal boxes

## Dev Dependencies

### TypeScript Support
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions
- `@types/express` - Express type definitions
- `@types/cors` - CORS type definitions

### Testing
- `jest` - Testing framework
- `ts-jest` - TypeScript Jest transformer
- `@types/jest` - Jest type definitions

### Development Tools
- `nodemon` - Development server
- `eslint` - Code linting
- `@typescript-eslint/eslint-plugin` - TypeScript ESLint plugin
- `@typescript-eslint/parser` - TypeScript ESLint parser

### CLI Type Definitions
- `@types/inquirer` - Inquirer type definitions
- `@types/figlet` - Figlet type definitions

## Engine Requirements

- Node.js >= 16.0.0
- npm >= 8.0.0

## Repository Information

- **Type**: Git
- **URL**: https://github.com/your-org/dao-registry.git
- **Bugs**: https://github.com/your-org/dao-registry/issues
- **Homepage**: https://github.com/your-org/dao-registry#readme 