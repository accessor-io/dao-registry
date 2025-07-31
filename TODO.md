# TODO - Project Organization & Refactoring

## Directory Structure Issues Found

### Root Level Organization
- [x] **Separate backend and frontend completely**
  - [x] Move `src/` to `backend/` directory
  - [x] Keep `frontend/` as is
  - [x] Update package.json scripts accordingly

### Backend Organization (`src/` → `backend/`)
- [x] **Reorganize backend structure**
  - [x] Create `backend/src/` for source code
  - [x] Create `backend/config/` for configuration files
  - [x] Create `backend/tests/` for test files
  - [x] Create `backend/scripts/` for backend-specific scripts
  - [x] Move `hardhat.config.js` to `backend/`
  - [x] Move `contracts/` to `backend/`
  - [x] Move `deployments/` to `backend/`
  - [x] Move `artifacts/` to `backend/`
  - [x] Move `cache/` to `backend/`

### Frontend Organization
- [x] **Improve frontend structure**
  - [x] Create `frontend/src/hooks/` for custom React hooks
  - [x] Create `frontend/src/utils/` for utility functions
  - [x] Create `frontend/src/services/` for API calls
  - [x] Create `frontend/src/types/` for TypeScript types
  - [x] Create `frontend/src/constants/` for constants

### Documentation Organization
- [x] **Reorganize docs structure**
  - [x] Move documentation scripts to `docs/scripts/`
  - [x] Create `docs/api/` for API documentation
  - [x] Create `docs/contracts/` for smart contract docs
  - [x] Create `docs/deployment/` for deployment guides

### Scripts Organization
- [x] **Categorize scripts**
  - [x] Move deployment scripts to `scripts/deployment/`
  - [x] Move documentation scripts to `scripts/docs/`
  - [x] Move testing scripts to `scripts/test/`
  - [x] Move utility scripts to `scripts/utils/`

### Package Structure
- [x] **Reorganize packages**
  - [x] Move `packages/cli/` to `backend/cli/`
  - [x] Move `packages/react/` to `frontend/packages/`
  - [x] Update package.json references

## Immediate Refactoring Tasks

### Phase 1: Backend Restructure ✅ COMPLETED
- [x] Create `backend/` directory
- [x] Move `src/` contents to `backend/src/`
- [x] Move `hardhat.config.js` to `backend/`
- [x] Update all import paths
- [x] Update package.json scripts

### Phase 2: Frontend Enhancement ✅ COMPLETED
- [x] Create missing frontend directories
- [x] Move components to appropriate directories
- [x] Create custom hooks for API calls
- [x] Add TypeScript support
- [x] Create proper service layer

### Phase 3: Documentation Cleanup ✅ COMPLETED
- [x] Move documentation scripts
- [x] Organize docs by category
- [x] Update documentation references
- [x] Create documentation build process

### Phase 4: Scripts Organization ✅ COMPLETED
- [x] Categorize and move scripts
- [x] Update script references
- [x] Create script documentation
- [x] Add script testing

## Remaining Tasks

### Import Path Updates
- [ ] **Update backend import paths**
  - [ ] Fix all require/import statements in `backend/src/`
  - [ ] Update relative paths for moved files
  - [ ] Test all imports work correctly

### Configuration Updates
- [ ] **Update configuration files**
  - [ ] Update `backend/hardhat.config.js` paths
  - [ ] Update any environment variable references
  - [ ] Update build scripts and deployment configs

### Testing & Validation
- [ ] **Test backend functionality**
  - [ ] Test all backend routes work
  - [ ] Test smart contract compilation
  - [ ] Test deployment scripts
  - [ ] Test documentation generation

- [ ] **Test frontend functionality**
  - [ ] Test all React components
  - [ ] Test API integration
  - [ ] Test routing works correctly
  - [ ] Test build process

### Documentation Updates
- [ ] **Update documentation references**
  - [ ] Update all documentation to reflect new structure
  - [ ] Update README files
  - [ ] Update deployment guides
  - [ ] Update development setup instructions

## Performance & Optimization

### Build Optimization
- [ ] **Optimize build scripts**
  - [ ] Test build performance with new structure
  - [ ] Optimize if needed
  - [ ] Add caching strategies

### Development Experience
- [ ] **Improve development workflow**
  - [ ] Test development scripts work correctly
  - [ ] Verify hot reloading works
  - [ ] Test error handling
  - [ ] Add development documentation

## Done ✅

### Completed Reorganization
- ✅ Backend and frontend completely separated
- ✅ Smart contracts moved to backend
- ✅ Documentation scripts organized
- ✅ Scripts categorized by purpose
- ✅ Frontend structure enhanced with proper directories
- ✅ Package.json scripts updated
- ✅ Backend package.json created
- ✅ Frontend services and hooks created
- ✅ Constants and utilities organized
- ✅ Project structure documented

### Current State
- Basic project structure exists
- Frontend and backend are functional
- Documentation system is in place
- Smart contracts are deployed
- Basic components are working

## Documentation Integration (Previous TODO)

### Immediate Tasks

#### Fix Documentation Integration
- [ ] Connect DocumentationViewer to load actual markdown files from docs/ directory
- [ ] Test DocumentationViewer with real content
- [ ] Fix any rendering issues with existing markdown files
- [ ] Add navigation between different documentation pages

#### Documentation Navigation
- [ ] Use SUMMARY.md to build navigation structure
- [ ] Add search across documentation files
- [ ] Test navigation with existing 48+ markdown files

#### Documentation Build
- [ ] Test existing documentation generation scripts
- [ ] Fix any build issues
- [ ] Ensure documentation loads properly in production

### Testing

#### Component Testing
- [ ] Test Documentation.js component
- [ ] Test DocumentationViewer.js component
- [ ] Test with real markdown files
- [ ] Fix any bugs found

### Performance

#### Optimization
- [ ] Test performance with large documentation files
- [ ] Optimize if needed
- [ ] Test search functionality

### What's Already Working
- Documentation.js component exists and works
- DocumentationViewer.js component exists and works
- Documentation generation scripts exist
- 48+ markdown files exist
- GitBook configuration exists