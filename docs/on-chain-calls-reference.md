# On-Chain Calls Reference

This document provides a comprehensive reference of all on-chain calls made during the development and testing of the DAO Registry system.

## Contract Deployments

### ReservedSubdomains Contract
- **Contract Address**: `0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6`
- **Network**: Local/Testnet
- **Deployment Script**: `scripts/deploy-reserved-subdomains.js`

### Deployment Commands
```bash
# Deploy to local network
npx hardhat run scripts/deploy-reserved-subdomains.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy-reserved-subdomains.js --network testnet
```

## Schema Management Calls

### 1. Schema Creation (addSchema)

**Function**: `addSchema(string subdomain, SchemaPriority priority, string category, string description, string version, string ccipInterface, SchemaField[] fields, string[] allowedRoles, string[] restrictions, string apiEndpoint, string documentationUrl)`

**Example Call**:
```javascript
// Analytics schema creation
const analyticsFields = [
    {
        fieldName: "totalUsers",
        dataType: 1, // UINT256
        required: true,
        description: "Total number of users",
        validationRule: ">= 0",
        defaultValue: "0"
    },
    {
        fieldName: "activeUsers",
        dataType: 1, // UINT256
        required: true,
        description: "Number of active users",
        validationRule: ">= 0",
        defaultValue: "0"
    },
    {
        fieldName: "revenue",
        dataType: 1, // UINT256
        required: true,
        description: "Total revenue in wei",
        validationRule: ">= 0",
        defaultValue: "0"
    },
    {
        fieldName: "platform",
        dataType: 0, // STRING
        required: true,
        description: "Platform name",
        validationRule: "non-empty string",
        defaultValue: ""
    }
];

const allowedRoles = ["admin", "analyst", "viewer"];
const restrictions = ["read-only", "no-modify"];

const tx = await contract.addSchema(
    "analytics",
    2, // MEDIUM priority
    "Analytics",
    "Analytics data schema for tracking user metrics",
    "1.0.0",
    "IAnalytics",
    analyticsFields,
    allowedRoles,
    restrictions,
    "/api/v1/analytics",
    "https://docs.dao-registry.com/schemas/analytics"
);
```

### 2. Schema Retrieval (getSchema)

**Function**: `getSchema(string subdomain)`

**Example Call**:
```javascript
const schema = await contract.getSchema("governance");
console.log("Schema Details:");
console.log("  Subdomain:", schema.subdomain);
console.log("  Priority:", schema.priority);
console.log("  Category:", schema.category);
console.log("  Version:", schema.version);
console.log("  Description:", schema.description);
console.log("  CCIP Interface:", schema.ccipInterface);
console.log("  Fields Count:", schema.fields.length);
console.log("  API Endpoint:", schema.apiEndpoint);
console.log("  Documentation:", schema.documentationUrl);
```

### 3. Schema Update (updateSchema)

**Function**: `updateSchema(string subdomain, SchemaPriority priority, string category, string description, string newVersion, string ccipInterface, SchemaField[] fields, string[] allowedRoles, string[] restrictions, string apiEndpoint, string documentationUrl)`

**Example Call**:
```javascript
const updatedAnalyticsFields = [
    // ... existing fields ...
    {
        fieldName: "growthRate",
        dataType: 1, // UINT256
        required: false,
        description: "Monthly growth rate in basis points",
        validationRule: ">= 0 && <= 10000",
        defaultValue: "0"
    }
];

const tx = await contract.updateSchema(
    "analytics",
    2, // MEDIUM priority
    "Analytics",
    "Updated analytics data schema for tracking user metrics",
    "1.1.0",
    "IAnalyticsV2",
    updatedAnalyticsFields,
    allowedRoles,
    restrictions,
    "/api/v1/analytics",
    "https://docs.dao-registry.com/schemas/analytics"
);
```

### 4. Schema Removal (removeSchema)

**Function**: `removeSchema(string subdomain)`

**Example Call**:
```javascript
const tx = await contract.removeSchema("test");
```

## CCIP Data Operations

### 1. Store CCIP Data (storeCCIPData)

**Function**: `storeCCIPData(string subdomain, string schemaVersion, string[] fieldNames, bytes[] fieldValues)`

**Example Call**:
```javascript
// Encode field values
const abiCoder = ethers.AbiCoder.defaultAbiCoder();
const fieldNames = ["totalUsers", "activeUsers", "revenue"];
const fieldValues = [
    abiCoder.encode(["uint256"], [1000]),
    abiCoder.encode(["uint256"], [750]),
    abiCoder.encode(["uint256"], [5000000000000000000n]) // 5 ETH in wei
];

const tx = await contract.storeCCIPData(
    "governance",
    "1.0.0",
    fieldNames,
    fieldValues
);
```

### 2. Retrieve CCIP Data (getCCIPData)

**Function**: `getCCIPData(string subdomain, bytes32 dataHash)`

**Example Call**:
```javascript
const dataHashes = await contract.getSubdomainDataHashes("governance");
if (dataHashes.length > 0) {
    const ccipData = await contract.getCCIPData("governance", dataHashes[0]);
    console.log("CCIP Data Retrieved:");
    console.log("  - Subdomain:", ccipData.subdomain);
    console.log("  - Schema Version:", ccipData.schemaVersion);
    console.log("  - Data Hash:", ccipData.dataHash);
    console.log("  - Timestamp:", new Date(Number(ccipData.timestamp) * 1000).toISOString());
    console.log("  - Data Provider:", ccipData.dataProvider);
    console.log("  - Valid:", ccipData.isValid);
    console.log("  - Field Names:", ccipData.fieldNames.join(", "));
    console.log("  - Field Values:", ccipData.fieldValues.length, "encoded values");
}
```

### 3. Get Data Hashes (getSubdomainDataHashes)

**Function**: `getSubdomainDataHashes(string subdomain)`

**Example Call**:
```javascript
const dataHashes = await contract.getSubdomainDataHashes("governance");
console.log(`Found ${dataHashes.length} CCIP data entries for governance`);
```

## Access Control Operations

### 1. Add Administrator (addAdministrator)

**Function**: `addAdministrator(address admin)`

**Example Call**:
```javascript
const [owner, admin] = await ethers.getSigners();
const tx = await contract.addAdministrator(admin.address);
await tx.wait();
console.log("Admin added:", admin.address);
```

### 2. Remove Administrator (removeAdministrator)

**Function**: `removeAdministrator(address admin)`

**Example Call**:
```javascript
const tx = await contract.removeAdministrator(admin.address);
await tx.wait();
console.log("Admin removed:", admin.address);
```

### 3. Add Moderator (addModerator)

**Function**: `addModerator(address moderator)`

**Example Call**:
```javascript
const [owner, moderator] = await ethers.getSigners();
const tx = await contract.addModerator(moderator.address);
await tx.wait();
console.log("Moderator added:", moderator.address);
```

### 4. Check Permissions (isAdministrator, isModerator)

**Functions**: `isAdministrator(address addr)`, `isModerator(address addr)`

**Example Call**:
```javascript
const isAdmin = await contract.isAdministrator(admin.address);
const isModerator = await contract.isModerator(moderator.address);
console.log("Is Administrator:", isAdmin);
console.log("Is Moderator:", isModerator);
```

## Statistics and Queries

### 1. Get Statistics (getStatistics)

**Function**: `getStatistics()`

**Example Call**:
```javascript
const stats = await contract.getStatistics();
console.log("CCIP Schema Statistics:");
console.log("  - Total Schemas:", stats.total.toString());
console.log("  - Critical Schemas:", stats.critical.toString());
console.log("  - High Priority:", stats.high.toString());
console.log("  - Medium Priority:", stats.medium.toString());
console.log("  - Low Priority:", stats.low.toString());
```

### 2. Check Schema Existence (hasSubdomainSchema)

**Function**: `hasSubdomainSchema(string subdomain)`

**Example Call**:
```javascript
const hasSchema = await contract.hasSubdomainSchema("governance");
console.log("Schema exists:", hasSchema);
```

## Event Monitoring

### Schema Events

**SchemaDefined Event**:
```javascript
contract.on("SchemaDefined", (subdomain, priority, category, version, definedBy) => {
    console.log("Schema Defined:");
    console.log("  - Subdomain:", subdomain);
    console.log("  - Priority:", priority);
    console.log("  - Category:", category);
    console.log("  - Version:", version);
    console.log("  - Defined By:", definedBy);
});
```

**SchemaUpdated Event**:
```javascript
contract.on("SchemaUpdated", (subdomain, oldVersion, newVersion, updatedBy) => {
    console.log("Schema Updated:");
    console.log("  - Subdomain:", subdomain);
    console.log("  - Old Version:", oldVersion);
    console.log("  - New Version:", newVersion);
    console.log("  - Updated By:", updatedBy);
});
```

**SchemaDeprecated Event**:
```javascript
contract.on("SchemaDeprecated", (subdomain, version, deprecatedBy) => {
    console.log("Schema Deprecated:");
    console.log("  - Subdomain:", subdomain);
    console.log("  - Version:", version);
    console.log("  - Deprecated By:", deprecatedBy);
});
```

### CCIP Data Events

**CCIPDataStored Event**:
```javascript
contract.on("CCIPDataStored", (subdomain, dataHash, dataProvider) => {
    console.log("CCIP Data Stored:");
    console.log("  - Subdomain:", subdomain);
    console.log("  - Data Hash:", dataHash);
    console.log("  - Data Provider:", dataProvider);
});
```

## Error Handling Examples

### 1. Schema Already Exists
```javascript
try {
    await contract.addSchema("governance", ...);
} catch (error) {
    if (error.message.includes("Schema already defined")) {
        console.log("Schema already exists");
    }
}
```

### 2. Insufficient Permissions
```javascript
try {
    await contract.connect(user).addSchema("unauthorized", ...);
} catch (error) {
    if (error.message.includes("Ownable: caller is not the owner")) {
        console.log("User not authorized");
    }
}
```

### 3. Schema Not Found
```javascript
try {
    await contract.getSchema("nonexistent");
} catch (error) {
    if (error.message.includes("Schema not defined")) {
        console.log("Schema not found");
    }
}
```

## Testing Scripts

### 1. Schema Management Testing
**Script**: `scripts/test-schema-management.js`
**Purpose**: Tests schema creation, retrieval, updates, and removal

### 2. CCIP Read Testing
**Script**: `scripts/test-ccip-read.js`
**Purpose**: Tests CCIP data storage, retrieval, and validation

### 3. Demo Script
**Script**: `scripts/start-demo.js`
**Purpose**: Demonstrates complete system functionality

## Gas Usage Estimates

### Schema Operations
- **addSchema**: ~150,000 - 200,000 gas
- **updateSchema**: ~200,000 - 250,000 gas
- **removeSchema**: ~50,000 - 100,000 gas
- **getSchema**: ~0 gas (view function)

### CCIP Data Operations
- **storeCCIPData**: ~100,000 - 150,000 gas
- **getCCIPData**: ~0 gas (view function)
- **getSubdomainDataHashes**: ~0 gas (view function)

### Access Control Operations
- **addAdministrator**: ~50,000 gas
- **removeAdministrator**: ~30,000 gas
- **addModerator**: ~50,000 gas
- **removeModerator**: ~30,000 gas

## Best Practices

1. **Always check permissions** before making administrative calls
2. **Validate input data** before storing CCIP data
3. **Monitor events** for real-time updates
4. **Use view functions** for read operations to save gas
5. **Handle errors gracefully** with try-catch blocks
6. **Test thoroughly** on testnets before mainnet deployment
7. **Document schema changes** for audit trails
8. **Monitor gas usage** for cost optimization

## Network-Specific Notes

### Local Development
- Use `--network localhost` for local testing
- Ensure Hardhat node is running
- Use test accounts for development

### Testnet Deployment
- Use `--network testnet` for testnet deployment
- Ensure sufficient testnet ETH for gas fees
- Verify contract addresses after deployment

### Mainnet Deployment
- Use `--network mainnet` for mainnet deployment
- Ensure sufficient mainnet ETH for gas fees
- Verify all parameters before deployment
- Consider using a multisig wallet for admin operations 