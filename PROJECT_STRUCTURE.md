# DAO Registry Project Structure

## Overview
This document outlines the reorganized project structure for the DAO Registry system, which has been refactored to improve maintainability, scalability, and developer experience.

## Root Directory Structure

```
dao-registry/
├── backend/                    # Backend application
│   ├── src/                   # Backend source code
│   ├── config/                # Configuration files
│   ├── tests/                 # Test files
│   ├── scripts/               # Backend-specific scripts
│   ├── contracts/             # Smart contracts
│   ├── deployments/           # Deployment artifacts
│   ├── artifacts/             # Hardhat artifacts
│   ├── cache/                 # Hardhat cache
│   ├── cli/                   # CLI package
│   ├── hardhat.config.js      # Hardhat configuration
│   └── package.json           # Backend dependencies
├── frontend/                  # Frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/          # API services
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # TypeScript types
│   │   ├── constants/        # Application constants
│   │   └── ...
│   ├── packages/             # Frontend packages
│   │   └── react/           # React-specific utilities
│   └── package.json          # Frontend dependencies
├── docs/                     # Documentation
│   ├── scripts/              # Documentation generation scripts
│   ├── api/                  # API documentation
│   ├── contracts/            # Smart contract documentation
│   ├── deployment/           # Deployment guides
│   ├── architecture/         # Architecture documentation
│   ├── rfc/                  # RFC documents
│   ├── research/             # Research documents
│   └── ...
├── scripts/                  # Project-wide scripts
│   ├── deployment/           # Deployment scripts
│   ├── test/                 # Testing scripts
│   └── utils/                # Utility scripts
├── specification/            # Project specifications
├── package.json              # Root package.json
└── README.md                 # Project README
```

## Backend Structure (`backend/`)

### Source Code (`backend/src/`)
```
src/
├── index.js                  # Main application entry point
├── index.ts                  # TypeScript entry point
├── routes/                   # Express.js routes
│   ├── dao.js               # DAO-related routes
│   └── reserved-subdomains.js # Subdomain routes
├── services/                 # Business logic services
│   ├── dao.js               # DAO service
│   ├── mock-data.js         # Mock data service
│   ├── blockchain/          # Blockchain services
│   └── metadata/            # Metadata services
├── middleware/               # Express.js middleware
│   └── validation.js        # Request validation
├── utils/                    # Utility functions
│   └── logger.js            # Logging utility
└── cli/                     # CLI modules
    ├── index.js             # CLI entry point
    ├── modules/
    │   ├── dao.js          # DAO CLI commands
    │   └── metadata.js     # Metadata CLI commands
```

### Smart Contracts (`backend/contracts/`)
```
contracts/
├── DAORegistry.sol          # Main DAO registry contract
├── DataRegistry.sol         # Data registry contract
├── ReservedSubdomains.sol   # Reserved subdomains contract
├── MockERC20.sol           # Mock ERC20 token
├── MockGovernance.sol      # Mock governance contract
└── MockTreasury.sol        # Mock treasury contract
```

## Frontend Structure (`frontend/`)

### Source Code (`frontend/src/`)
```
src/
├── components/              # React components
│   ├── Documentation.js     # Documentation viewer
│   ├── DocumentationViewer.js # Markdown viewer
│   ├── DAORegistry.js      # DAO registry page
│   ├── DAORegistration.js  # DAO registration form
│   ├── DAODetail.js        # DAO detail view
│   ├── DAOList.js          # DAO list component
│   ├── SearchPage.js       # Search functionality
│   └── RegistryStats.js    # Statistics component
├── hooks/                   # Custom React hooks
│   └── useDAO.js           # DAO-related hooks
├── services/                # API services
│   └── api.js              # Centralized API client
├── utils/                   # Utility functions
│   └── constants.js        # Application constants
├── types/                   # TypeScript type definitions
├── constants/               # Application constants
├── App.js                   # Main application component
└── index.js                 # Application entry point
```

## Documentation Structure (`docs/`)

### Organization
```
docs/
├── scripts/                 # Documentation generation
│   ├── generate-docs.js     # Documentation generator
│   ├── parse-docs.js        # Documentation parser
│   └── generate-complete-docs.js # Complete doc generator
├── api/                     # API documentation
├── contracts/               # Smart contract documentation
├── deployment/              # Deployment guides
├── architecture/            # Architecture documentation
├── rfc/                     # RFC documents
├── research/                # Research documents
├── technical/               # Technical documentation
├── features/                # Feature documentation
├── getting-started/         # Getting started guides
├── integration/             # Integration guides
├── images/                  # Documentation images
├── appendices/              # Documentation appendices
├── developer-manual.md      # Developer manual
├── user-guide.md           # User guide
├── quick-reference.md      # Quick reference
├── SUMMARY.md              # Documentation navigation
└── book.json               # GitBook configuration
```

## Scripts Organization (`scripts/`)

### Categories
```
scripts/
├── deployment/              # Deployment scripts
│   ├── deploy.js           # Main deployment script
│   ├── deploy-simple.js    # Simple deployment
│   ├── deploy-realtime-data.js # Realtime data deployment
│   └── deploy-reserved-subdomains.js # Subdomain deployment
├── test/                    # Testing scripts
│   ├── test-blockchain-connection.js # Blockchain tests
│   ├── test-ccip-read.js   # CCIP tests
│   └── test-schema-management.js # Schema tests
└── utils/                   # Utility scripts
    ├── check-contract.js    # Contract verification
    ├── register-test-dao.js # Test DAO registration
    ├── start-demo.js        # Demo startup
    ├── render-workflow-diagram.js # Workflow diagrams
    ├── generate-schema-diagram.js # Schema diagrams
    └── convert-diagram-to-image.js # Diagram conversion
```

## Package Configuration

### Root Package.json
- **Main entry**: `backend/src/index.js`
- **Scripts**: Organized by category (docs, deploy, test, utils)
- **Dependencies**: Shared dependencies
- **Dev dependencies**: Development tools

### Backend Package.json (`backend/package.json`)
- **Main entry**: `src/index.js`
- **Scripts**: Backend-specific scripts including Hardhat commands
- **Dependencies**: Backend-specific dependencies
- **Dev dependencies**: Backend development tools

### Frontend Package.json (`frontend/package.json`)
- **Main entry**: React application
- **Scripts**: React development scripts
- **Dependencies**: Frontend-specific dependencies
- **Dev dependencies**: Frontend development tools

## Key Benefits of This Structure

### 1. Separation of Concerns
- **Backend**: All server-side code, smart contracts, and blockchain integration
- **Frontend**: All client-side code and user interface
- **Documentation**: Centralized documentation with generation tools
- **Scripts**: Categorized by purpose for easy maintenance

### 2. Scalability
- **Modular design**: Each component can be developed independently
- **Clear boundaries**: Backend and frontend are completely separated
- **Extensible structure**: Easy to add new features and components

### 3. Developer Experience
- **Clear organization**: Easy to find files and understand structure
- **Consistent patterns**: Standardized directory structure
- **Tool integration**: Proper configuration for development tools

### 4. Maintenance
- **Logical grouping**: Related files are grouped together
- **Reduced complexity**: Clear separation reduces cognitive load
- **Easy navigation**: Intuitive file organization

## Migration Notes

### What Was Moved
1. **`src/` → `backend/src/`**: All backend source code
2. **`contracts/` → `backend/contracts/`**: Smart contracts
3. **`deployments/` → `backend/deployments/`**: Deployment artifacts
4. **`artifacts/` → `backend/artifacts/`**: Hardhat artifacts
5. **`cache/` → `backend/cache/`**: Hardhat cache
6. **`hardhat.config.js` → `backend/hardhat.config.js`**: Hardhat configuration
7. **`packages/cli/` → `backend/cli/`**: CLI package
8. **`packages/react/` → `frontend/packages/react/`**: React utilities
9. **Scripts**: Categorized into deployment, test, and utils directories
10. **Documentation scripts**: Moved to `docs/scripts/`

### Updated References
1. **Package.json scripts**: Updated to reflect new paths
2. **Import statements**: Need to be updated in moved files
3. **Configuration files**: Updated to point to new locations
4. **Documentation**: Updated to reflect new structure

## Next Steps

### Immediate Tasks
1. **Update import paths**: Fix all import statements in moved files
2. **Test functionality**: Verify all components work after reorganization
3. **Update documentation**: Reflect new structure in documentation
4. **CI/CD updates**: Update deployment pipelines for new structure

### Future Enhancements
1. **TypeScript migration**: Add TypeScript support throughout
2. **Testing framework**: Implement comprehensive testing
3. **Performance optimization**: Optimize build and runtime performance
4. **Monitoring**: Add application monitoring and logging

## Conclusion

This reorganized structure provides a solid foundation for the DAO Registry project, with clear separation of concerns, improved maintainability, and enhanced developer experience. The modular design allows for independent development of backend and frontend components while maintaining clear integration points.