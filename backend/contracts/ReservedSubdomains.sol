// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IENS.sol";
import "./interfaces/IENSMetadata.sol";

/**
 * @title ReservedSubdomains
 * @dev Manages reserved subdomains for standardized data schemas
 * 
 * This contract provides:
 * - Reserved subdomain schemas for standardized data structures
 * - CCIP-compatible data formats for cross-chain interoperability
 * - API-queryable endpoints for on-chain data retrieval
 * - Schema validation and metadata management
 * 
 * Reserved subdomains are NOT blocked from registration but provide
 * standardized schemas that can be queried via API and CCIP on-chain reads
 */
contract ReservedSubdomains is Ownable, ReentrancyGuard, IERC173, IENSTextRecords {
    using Strings for string;

    /**
     * @dev Schema priority levels for data standardization
     */
    enum SchemaPriority {
        CRITICAL,   // Core system schemas (governance, treasury, etc.)
        HIGH,       // Important operational schemas
        MEDIUM,     // Standard feature schemas
        LOW         // Optional enhancement schemas
    }

    /**
     * @dev Data type definitions for CCIP compatibility
     */
    enum DataType {
        STRING,
        UINT256,
        ADDRESS,
        BOOL,
        BYTES32,
        ARRAY_STRING,
        ARRAY_UINT256,
        ARRAY_ADDRESS,
        STRUCT,
        MAPPING
    }

    /**
     * @dev Update trigger types for self-updating data
     */
    enum UpdateTrigger {
        MANUAL,         // Manual updates only
        TIME_BASED,     // Time-based automatic updates
        EVENT_BASED,    // Event-driven updates
        BLOCK_BASED,    // Block-based updates
        CONDITIONAL,    // Conditional updates based on data changes
        EXTERNAL_CALL   // External contract call triggers
    }

    /**
     * @dev Update frequency for time-based triggers
     */
    enum UpdateFrequency {
        NEVER,          // No automatic updates
        HOURLY,         // Every hour
        DAILY,          // Every day
        WEEKLY,         // Every week
        MONTHLY,        // Every month
        CUSTOM          // Custom interval in seconds
    }

    /**
     * @dev Auto-update configuration
     */
    struct AutoUpdateConfig {
        bool enabled;
        UpdateTrigger trigger;
        UpdateFrequency frequency;
        uint256 lastUpdateTime;
        uint256 nextUpdateTime;
        uint256 customInterval; // For CUSTOM frequency
        string[] updateFields;  // Fields to auto-update
        string[] triggerConditions; // Conditions for conditional updates
        address externalContract; // For EXTERNAL_CALL triggers
        bytes4 externalFunction; // Function selector for external calls
        bool requireDataChange; // Only update if data actually changed
        uint256 maxUpdateAge; // Maximum age before forcing update
    }

    /**
     * @dev Schema field definition
     */
    struct SchemaField {
        string fieldName;
        DataType dataType;
        bool required;
        string description;
        string validationRule;
        string defaultValue;
    }

    /**
     * @dev Reserved subdomain schema information
     */
    struct ReservedSubdomainSchema {
        string subdomain;
        SchemaPriority priority;
        string category;
        string description;
        string version;
        string ccipInterface;
        SchemaField[] fields;
        string[] allowedRoles;
        string[] restrictions;
        bool active;
        uint256 createdAt;
        uint256 updatedAt;
        string apiEndpoint;
        string documentationUrl;
        AutoUpdateConfig autoUpdateConfig;
        mapping(string => string) textRecords; // ENS text records
        address resolverAddress; // Custom resolver address
        bool ensEnabled; // Whether ENS integration is enabled
    }

    /**
     * @dev CCIP-compatible data structure
     */
    struct CCIPData {
        string subdomain;
        string schemaVersion;
        bytes32 dataHash;
        uint256 timestamp;
        address dataProvider;
        bool isValid;
        string[] fieldNames;
        bytes[] fieldValues;
    }

    /**
     * @dev Events
     */
    event SchemaDefined(
        string indexed subdomain,
        SchemaPriority priority,
        string category,
        string version,
        address indexed definedBy
    );

    event SchemaUpdated(
        string indexed subdomain,
        string oldVersion,
        string newVersion,
        address indexed updatedBy
    );

    event SchemaDeprecated(
        string indexed subdomain,
        string version,
        address indexed deprecatedBy
    );

    event CCIPDataStored(
        string indexed subdomain,
        bytes32 indexed dataHash,
        address indexed dataProvider
    );

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

    /**
     * @dev State variables
     */
    mapping(string => ReservedSubdomainSchema) public subdomainSchemas;
    mapping(string => bool) public hasSchema;
    mapping(string => SchemaPriority) public schemaPriority;
    mapping(string => string[]) public schemaCategories;
    
    // CCIP data storage
    mapping(string => mapping(bytes32 => CCIPData)) public ccipData;
    mapping(string => bytes32[]) public subdomainDataHashes;
    
    // Access control
    mapping(address => bool) public administrators;
    mapping(address => bool) public moderators;
    mapping(address => bool) public dataProviders;
    
    // Statistics
    uint256 public totalSchemas;
    mapping(SchemaPriority => uint256) public schemasByPriority;
    mapping(string => uint256) public schemasByCategory;

    /**
     * @dev Modifiers
     */
    modifier onlyAdministrator() {
        require(administrators[msg.sender] || owner() == msg.sender, "Not authorized");
        _;
    }

    modifier onlyModerator() {
        require(moderators[msg.sender] || administrators[msg.sender] || owner() == msg.sender, "Not authorized");
        _;
    }

    modifier onlyDataProvider() {
        require(dataProviders[msg.sender] || moderators[msg.sender] || administrators[msg.sender] || owner() == msg.sender, "Not authorized");
        _;
    }

    modifier schemaExists(string memory subdomain) {
        require(hasSchema[subdomain], "Schema not defined");
        _;
    }

    modifier schemaNotExists(string memory subdomain) {
        require(!hasSchema[subdomain], "Schema already defined");
        _;
    }

    /**
     * @dev Create default auto-update configuration
     */
    function _createDefaultAutoUpdateConfig() private pure returns (AutoUpdateConfig memory) {
        return AutoUpdateConfig({
            enabled: false,
            trigger: UpdateTrigger.MANUAL,
            frequency: UpdateFrequency.NEVER,
            lastUpdateTime: 0,
            nextUpdateTime: 0,
            customInterval: 0,
            updateFields: new string[](0),
            triggerConditions: new string[](0),
            externalContract: address(0),
            externalFunction: bytes4(0),
            requireDataChange: false,
            maxUpdateAge: 0
        });
    }

    /**
     * @dev Constructor
     */
    constructor() {
        _initializeCriticalSchemas();
        _initializeHighPrioritySchemas();
        _initializeMediumPrioritySchemas();
        
        // Set initial administrators
        administrators[msg.sender] = true;
    }

    /**
     * @dev Initialize critical schemas (Core DAO Components)
     */
    function _initializeCriticalSchemas() private {
        // Governance schema
        _defineSchema(
            "governance",
            SchemaPriority.CRITICAL,
            "Core DAO Components",
            "Governance system schema for DAO decision-making",
            "1.0.0",
            "IGovernance",
            _createGovernanceFields(),
            _createAllowedRoles(),
            _createRestrictions(),
            "/api/v1/governance",
            "https://docs.dao-registry.com/schemas/governance",
            _createDefaultAutoUpdateConfig()
        );

        // Treasury schema
        _defineSchema(
            "treasury",
            SchemaPriority.CRITICAL,
            "Core DAO Components",
            "Treasury management schema for DAO funds",
            "1.0.0",
            "ITreasury",
            _createTreasuryFields(),
            _createAllowedRoles(),
            _createRestrictions(),
            "/api/v1/treasury",
            "https://docs.dao-registry.com/schemas/treasury",
            _createDefaultAutoUpdateConfig()
        );

        // Token schema
        _defineSchema(
            "token",
            SchemaPriority.CRITICAL,
            "Core DAO Components",
            "Token management schema for DAO tokens",
            "1.0.0",
            "IToken",
            _createTokenFields(),
            _createAllowedRoles(),
            _createRestrictions(),
            "/api/v1/token",
            "https://docs.dao-registry.com/schemas/token",
            _createDefaultAutoUpdateConfig()
        );

        // API schema
        _defineSchema(
            "api",
            SchemaPriority.CRITICAL,
            "Core DAO Components",
            "API endpoints schema for DAO services",
            "1.0.0",
            "IAPI",
            _createAPIFields(),
            _createAllowedRoles(),
            _createRestrictions(),
            "/api/v1/api",
            "https://docs.dao-registry.com/schemas/api",
            _createDefaultAutoUpdateConfig()
        );
    }

    /**
     * @dev Create governance schema fields
     */
    function _createGovernanceFields() private pure returns (SchemaField[] memory) {
        SchemaField[] memory fields = new SchemaField[](8);
        
        fields[0] = SchemaField({
            fieldName: "proposalCount",
            dataType: DataType.UINT256,
            required: true,
            description: "Total number of proposals",
            validationRule: ">= 0",
            defaultValue: "0"
        });
        
        fields[1] = SchemaField({
            fieldName: "activeProposals",
            dataType: DataType.UINT256,
            required: true,
            description: "Number of active proposals",
            validationRule: ">= 0",
            defaultValue: "0"
        });
        
        fields[2] = SchemaField({
            fieldName: "votingPeriod",
            dataType: DataType.UINT256,
            required: true,
            description: "Voting period in seconds",
            validationRule: "> 0",
            defaultValue: "604800"
        });
        
        fields[3] = SchemaField({
            fieldName: "quorum",
            dataType: DataType.UINT256,
            required: true,
            description: "Minimum votes required for quorum",
            validationRule: "> 0",
            defaultValue: "1000"
        });
        
        fields[4] = SchemaField({
            fieldName: "proposalThreshold",
            dataType: DataType.UINT256,
            required: true,
            description: "Minimum tokens required to create proposal",
            validationRule: ">= 0",
            defaultValue: "100"
        });
        
        fields[5] = SchemaField({
            fieldName: "governanceToken",
            dataType: DataType.ADDRESS,
            required: true,
            description: "Governance token contract address",
            validationRule: "non-zero address",
            defaultValue: "0x0000000000000000000000000000000000000000"
        });
        
        fields[6] = SchemaField({
            fieldName: "executor",
            dataType: DataType.ADDRESS,
            required: true,
            description: "Proposal executor contract address",
            validationRule: "non-zero address",
            defaultValue: "0x0000000000000000000000000000000000000000"
        });
        
        fields[7] = SchemaField({
            fieldName: "timelock",
            dataType: DataType.ADDRESS,
            required: false,
            description: "Timelock contract address",
            validationRule: "optional address",
            defaultValue: "0x0000000000000000000000000000000000000000"
        });
        
        return fields;
    }

    /**
     * @dev Create treasury schema fields
     */
    function _createTreasuryFields() private pure returns (SchemaField[] memory) {
        SchemaField[] memory fields = new SchemaField[](6);
        
        fields[0] = SchemaField({
            fieldName: "totalBalance",
            dataType: DataType.UINT256,
            required: true,
            description: "Total treasury balance in wei",
            validationRule: ">= 0",
            defaultValue: "0"
        });
        
        fields[1] = SchemaField({
            fieldName: "ethBalance",
            dataType: DataType.UINT256,
            required: true,
            description: "ETH balance in wei",
            validationRule: ">= 0",
            defaultValue: "0"
        });
        
        fields[2] = SchemaField({
            fieldName: "tokenBalances",
            dataType: DataType.ARRAY_UINT256,
            required: true,
            description: "Array of token balances",
            validationRule: "array of uint256",
            defaultValue: "[]"
        });
        
        fields[3] = SchemaField({
            fieldName: "tokenAddresses",
            dataType: DataType.ARRAY_ADDRESS,
            required: true,
            description: "Array of token contract addresses",
            validationRule: "array of addresses",
            defaultValue: "[]"
        });
        
        fields[4] = SchemaField({
            fieldName: "treasuryManager",
            dataType: DataType.ADDRESS,
            required: true,
            description: "Treasury manager contract address",
            validationRule: "non-zero address",
            defaultValue: "0x0000000000000000000000000000000000000000"
        });
        
        fields[5] = SchemaField({
            fieldName: "multisig",
            dataType: DataType.ADDRESS,
            required: false,
            description: "Multisig wallet address",
            validationRule: "optional address",
            defaultValue: "0x0000000000000000000000000000000000000000"
        });
        
        return fields;
    }

    /**
     * @dev Create token schema fields
     */
    function _createTokenFields() private pure returns (SchemaField[] memory) {
        SchemaField[] memory fields = new SchemaField[](7);
        
        fields[0] = SchemaField({
            fieldName: "name",
            dataType: DataType.STRING,
            required: true,
            description: "Token name",
            validationRule: "non-empty string",
            defaultValue: ""
        });
        
        fields[1] = SchemaField({
            fieldName: "symbol",
            dataType: DataType.STRING,
            required: true,
            description: "Token symbol",
            validationRule: "non-empty string",
            defaultValue: ""
        });
        
        fields[2] = SchemaField({
            fieldName: "decimals",
            dataType: DataType.UINT256,
            required: true,
            description: "Token decimals",
            validationRule: ">= 0 && <= 18",
            defaultValue: "18"
        });
        
        fields[3] = SchemaField({
            fieldName: "totalSupply",
            dataType: DataType.UINT256,
            required: true,
            description: "Total token supply",
            validationRule: ">= 0",
            defaultValue: "0"
        });
        
        fields[4] = SchemaField({
            fieldName: "contractAddress",
            dataType: DataType.ADDRESS,
            required: true,
            description: "Token contract address",
            validationRule: "non-zero address",
            defaultValue: "0x0000000000000000000000000000000000000000"
        });
        
        fields[5] = SchemaField({
            fieldName: "isGovernanceToken",
            dataType: DataType.BOOL,
            required: true,
            description: "Whether this is the governance token",
            validationRule: "boolean",
            defaultValue: "false"
        });
        
        fields[6] = SchemaField({
            fieldName: "holders",
            dataType: DataType.UINT256,
            required: true,
            description: "Number of token holders",
            validationRule: ">= 0",
            defaultValue: "0"
        });
        
        return fields;
    }

    /**
     * @dev Create API schema fields
     */
    function _createAPIFields() private pure returns (SchemaField[] memory) {
        SchemaField[] memory fields = new SchemaField[](5);
        
        fields[0] = SchemaField({
            fieldName: "baseUrl",
            dataType: DataType.STRING,
            required: true,
            description: "Base API URL",
            validationRule: "valid URL format",
            defaultValue: ""
        });
        
        fields[1] = SchemaField({
            fieldName: "version",
            dataType: DataType.STRING,
            required: true,
            description: "API version",
            validationRule: "semantic version",
            defaultValue: "v1"
        });
        
        fields[2] = SchemaField({
            fieldName: "endpoints",
            dataType: DataType.ARRAY_STRING,
            required: true,
            description: "Available API endpoints",
            validationRule: "array of strings",
            defaultValue: "[]"
        });
        
        fields[3] = SchemaField({
            fieldName: "rateLimit",
            dataType: DataType.UINT256,
            required: true,
            description: "Rate limit per minute",
            validationRule: "> 0",
            defaultValue: "1000"
        });
        
        fields[4] = SchemaField({
            fieldName: "authentication",
            dataType: DataType.STRING,
            required: false,
            description: "Authentication method",
            validationRule: "optional string",
            defaultValue: "none"
        });
        
        return fields;
    }

    /**
     * @dev Create allowed roles
     */
    function _createAllowedRoles() private pure returns (string[] memory) {
        string[] memory roles = new string[](3);
        roles[0] = "DAO owners";
        roles[1] = "System administrators";
        roles[2] = "Data providers";
        return roles;
    }

    /**
     * @dev Create restrictions
     */
    function _createRestrictions() private pure returns (string[] memory) {
        string[] memory restrictions = new string[](1);
        restrictions[0] = "Standardized schema for CCIP compatibility";
        return restrictions;
    }

    /**
     * @dev Initialize high priority schemas
     */
    function _initializeHighPrioritySchemas() private {
        // Add high priority schemas here
        // This would include schemas for voting, proposals, executive, etc.
    }

    /**
     * @dev Initialize medium priority schemas
     */
    function _initializeMediumPrioritySchemas() private {
        // Add medium priority schemas here
        // This would include schemas for docs, forum, analytics, etc.
    }

    /**
     * @dev Define a new schema
     */
    function _defineSchema(
        string memory subdomain,
        SchemaPriority priority,
        string memory category,
        string memory description,
        string memory version,
        string memory ccipInterface,
        SchemaField[] memory fields,
        string[] memory allowedRoles,
        string[] memory restrictions,
        string memory apiEndpoint,
        string memory documentationUrl,
        AutoUpdateConfig memory autoUpdateConfig
    ) private {
        require(bytes(subdomain).length > 0, "Subdomain cannot be empty");
        require(!hasSchema[subdomain], "Schema already defined");

        ReservedSubdomainSchema memory schema = ReservedSubdomainSchema({
            subdomain: subdomain,
            priority: priority,
            category: category,
            description: description,
            version: version,
            ccipInterface: ccipInterface,
            fields: fields,
            allowedRoles: allowedRoles,
            restrictions: restrictions,
            active: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            apiEndpoint: apiEndpoint,
            documentationUrl: documentationUrl,
            autoUpdateConfig: autoUpdateConfig
        });

        subdomainSchemas[subdomain] = schema;
        hasSchema[subdomain] = true;
        schemaPriority[subdomain] = priority;
        
        // Update statistics
        totalSchemas++;
        schemasByPriority[priority]++;
        schemasByCategory[category]++;

        emit SchemaDefined(subdomain, priority, category, version, msg.sender);
    }

    /**
     * @dev Define a new schema (admin only)
     */
    function defineSchema(
        string memory subdomain,
        SchemaPriority priority,
        string memory category,
        string memory description,
        string memory version,
        string memory ccipInterface,
        SchemaField[] memory fields,
        string[] memory allowedRoles,
        string[] memory restrictions,
        string memory apiEndpoint,
        string memory documentationUrl
    ) external onlyAdministrator schemaNotExists(subdomain) {
        _defineSchema(
            subdomain,
            priority,
            category,
            description,
            version,
            ccipInterface,
            fields,
            allowedRoles,
            restrictions,
            apiEndpoint,
            documentationUrl,
            _createDefaultAutoUpdateConfig()
        );
    }

    /**
     * @dev Store CCIP-compatible data
     */
    function storeCCIPData(
        string memory subdomain,
        string memory schemaVersion,
        string[] memory fieldNames,
        bytes[] memory fieldValues
    ) external onlyDataProvider schemaExists(subdomain) {
        require(fieldNames.length == fieldValues.length, "Field names and values mismatch");
        
        // Create data hash - encode arrays properly
        bytes32 dataHash = keccak256(abi.encodePacked(
            subdomain,
            schemaVersion,
            abi.encode(fieldNames),
            abi.encode(fieldValues),
            block.timestamp
        ));

        CCIPData memory data = CCIPData({
            subdomain: subdomain,
            schemaVersion: schemaVersion,
            dataHash: dataHash,
            timestamp: block.timestamp,
            dataProvider: msg.sender,
            isValid: true,
            fieldNames: fieldNames,
            fieldValues: fieldValues
        });

        ccipData[subdomain][dataHash] = data;
        subdomainDataHashes[subdomain].push(dataHash);

        emit CCIPDataStored(subdomain, dataHash, msg.sender);
    }

    /**
     * @dev Get schema information
     */
    function getSchema(string memory subdomain) 
        external 
        view 
        returns (ReservedSubdomainSchema memory) 
    {
        require(hasSchema[subdomain], "Schema not defined");
        return subdomainSchemas[subdomain];
    }

    /**
     * @dev Get CCIP data for a subdomain
     */
    function getCCIPData(string memory subdomain, bytes32 dataHash) 
        external 
        view 
        returns (CCIPData memory) 
    {
        return ccipData[subdomain][dataHash];
    }

    /**
     * @dev Get all data hashes for a subdomain
     */
    function getSubdomainDataHashes(string memory subdomain) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return subdomainDataHashes[subdomain];
    }

    /**
     * @dev Check if subdomain has a schema
     */
    function hasSubdomainSchema(string memory subdomain) external view returns (bool) {
        return hasSchema[subdomain];
    }

    /**
     * @dev Get schema priority
     */
    function getSchemaPriority(string memory subdomain) external view returns (SchemaPriority) {
        return schemaPriority[subdomain];
    }

    /**
     * @dev Get statistics
     */
    function getStatistics() 
        external 
        view 
        returns (
            uint256 total,
            uint256 critical,
            uint256 high,
            uint256 medium,
            uint256 low
        ) 
    {
        return (
            totalSchemas,
            schemasByPriority[SchemaPriority.CRITICAL],
            schemasByPriority[SchemaPriority.HIGH],
            schemasByPriority[SchemaPriority.MEDIUM],
            schemasByPriority[SchemaPriority.LOW]
        );
    }

    /**
     * @dev Add data provider
     */
    function addDataProvider(address provider) external onlyAdministrator {
        dataProviders[provider] = true;
    }

    /**
     * @dev Remove data provider
     */
    function removeDataProvider(address provider) external onlyAdministrator {
        dataProviders[provider] = false;
    }

    /**
     * @dev Check if address is data provider
     */
    function isDataProvider(address addr) external view returns (bool) {
        return dataProviders[addr] || moderators[addr] || administrators[addr] || owner() == addr;
    }

    /**
     * @dev Add administrator
     */
    function addAdministrator(address admin) external onlyOwner {
        administrators[admin] = true;
    }

    /**
     * @dev Remove administrator
     */
    function removeAdministrator(address admin) external onlyOwner {
        require(admin != owner(), "Cannot remove owner");
        administrators[admin] = false;
    }

    /**
     * @dev Add moderator
     */
    function addModerator(address moderator) external onlyAdministrator {
        moderators[moderator] = true;
    }

    /**
     * @dev Remove moderator
     */
    function removeModerator(address moderator) external onlyAdministrator {
        moderators[moderator] = false;
    }

    /**
     * @dev Check if address is administrator
     */
    function isAdministrator(address addr) external view returns (bool) {
        return administrators[addr] || owner() == addr;
    }

    // =======================================================================
    // ENS TEXT RECORD MANAGEMENT
    // =======================================================================

    /**
     * @dev Sets text record for a schema
     * @param subdomain The subdomain
     * @param key The text record key
     * @param value The text record value
     */
    function setSchemaTextRecord(string memory subdomain, string memory key, string memory value) 
        external 
        onlyAdministrator 
        schemaExists(subdomain) 
    {
        require(bytes(key).length > 0, "Text record key cannot be empty");
        require(bytes(value).length > 0, "Text record value cannot be empty");
        require(bytes(value).length <= 1000, "Text record value too long");
        
        subdomainSchemas[subdomain].textRecords[key] = value;
        subdomainSchemas[subdomain].updatedAt = block.timestamp;
        
        emit TextRecordSet(address(this), key, value, msg.sender);
    }

    /**
     * @dev Gets text record for a schema
     * @param subdomain The subdomain
     * @param key The text record key
     * @return Text record value
     */
    function getSchemaTextRecord(string memory subdomain, string memory key) 
        external 
        view 
        schemaExists(subdomain) 
        returns (string memory) 
    {
        return subdomainSchemas[subdomain].textRecords[key];
    }

    /**
     * @dev Sets resolver for a schema
     * @param subdomain The subdomain
     * @param resolver The resolver address
     */
    function setSchemaResolver(string memory subdomain, address resolver) 
        external 
        onlyAdministrator 
        schemaExists(subdomain) 
    {
        require(resolver != address(0), "Invalid resolver address");
        subdomainSchemas[subdomain].resolverAddress = resolver;
        subdomainSchemas[subdomain].updatedAt = block.timestamp;
    }

    /**
     * @dev Enables or disables ENS integration for a schema
     * @param subdomain The subdomain
     * @param enabled Whether to enable ENS integration
     */
    function enableENSIntegration(string memory subdomain, bool enabled) 
        external 
        onlyAdministrator 
        schemaExists(subdomain) 
    {
        subdomainSchemas[subdomain].ensEnabled = enabled;
        subdomainSchemas[subdomain].updatedAt = block.timestamp;
    }

    /**
     * @dev Checks if ENS integration is enabled for a schema
     * @param subdomain The subdomain
     * @return True if ENS integration is enabled
     */
    function isENSIntegrationEnabled(string memory subdomain) 
        external 
        view 
        schemaExists(subdomain) 
        returns (bool) 
    {
        return subdomainSchemas[subdomain].ensEnabled;
    }

    /**
     * @dev Check if address is moderator
     */
    function isModerator(address addr) external view returns (bool) {
        return moderators[addr] || administrators[addr] || owner() == addr;
    }

    /**
     * @dev Add a new schema
     */
    function addSchema(
        string memory subdomain,
        SchemaPriority priority,
        string memory category,
        string memory description,
        string memory version,
        string memory ccipInterface,
        SchemaField[] memory fields,
        string[] memory allowedRoles,
        string[] memory restrictions,
        string memory apiEndpoint,
        string memory documentationUrl
    ) external onlyAdministrator schemaNotExists(subdomain) {
        require(bytes(subdomain).length > 0, "Subdomain cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(version).length > 0, "Version cannot be empty");
        require(fields.length > 0, "Schema must have at least one field");
        
        _defineSchema(
            subdomain,
            priority,
            category,
            description,
            version,
            ccipInterface,
            fields,
            allowedRoles,
            restrictions,
            apiEndpoint,
            documentationUrl,
            _createDefaultAutoUpdateConfig()
        );
    }

    /**
     * @dev Update an existing schema
     */
    function updateSchema(
        string memory subdomain,
        SchemaPriority priority,
        string memory category,
        string memory description,
        string memory newVersion,
        string memory ccipInterface,
        SchemaField[] memory fields,
        string[] memory allowedRoles,
        string[] memory restrictions,
        string memory apiEndpoint,
        string memory documentationUrl
    ) external onlyAdministrator schemaExists(subdomain) {
        require(bytes(newVersion).length > 0, "Version cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(fields.length > 0, "Schema must have at least one field");
        
        // Store old version for event
        string memory oldVersion = subdomainSchemas[subdomain].version;
        
        // Remove old schema
        _removeSchema(subdomain);
        
        // Add new schema
        _defineSchema(
            subdomain,
            priority,
            category,
            description,
            newVersion,
            ccipInterface,
            fields,
            allowedRoles,
            restrictions,
            apiEndpoint,
            documentationUrl,
            _createDefaultAutoUpdateConfig()
        );
        
        emit SchemaUpdated(subdomain, oldVersion, newVersion, msg.sender);
    }

    /**
     * @dev Remove a schema
     */
    function removeSchema(string memory subdomain) external onlyAdministrator schemaExists(subdomain) {
        _removeSchema(subdomain);
        
        emit SchemaDeprecated(subdomain, subdomainSchemas[subdomain].version, msg.sender);
    }

    /**
     * @dev Internal function to remove a schema
     */
    function _removeSchema(string memory subdomain) private {
        ReservedSubdomainSchema storage schema = subdomainSchemas[subdomain];
        
        // Update statistics
        totalSchemas--;
        schemasByPriority[schema.priority]--;
        schemasByCategory[schema.category]--;
        
        // Remove from mappings
        hasSchema[subdomain] = false;
        delete schemaPriority[subdomain];
        
        // Remove from categories array
        string[] storage categories = schemaCategories[schema.category];
        for (uint i = 0; i < categories.length; i++) {
            if (keccak256(bytes(categories[i])) == keccak256(bytes(subdomain))) {
                categories[i] = categories[categories.length - 1];
                categories.pop();
                break;
            }
        }
        
        // Clear schema data
        delete subdomainSchemas[subdomain];
    }

    /**
     * @dev Get all schemas by category
     */
    function getSchemasByCategory(string memory category) external view returns (string[] memory) {
        return schemaCategories[category];
    }

    /**
     * @dev Get all schemas by priority
     */
    function getSchemasByPriority(SchemaPriority priority) external view returns (string[] memory) {
        // This is a simplified implementation - in practice, you might want to maintain
        // a separate mapping for priority-based lookups
        // For now, we'll return an empty array as this would require iteration
        return new string[](0);
    }

    /**
     * @dev Get schema field by name
     */
    function getSchemaField(string memory subdomain, string memory fieldName) 
        external 
        view 
        schemaExists(subdomain) 
        returns (SchemaField memory) 
    {
        ReservedSubdomainSchema storage schema = subdomainSchemas[subdomain];
        
        for (uint i = 0; i < schema.fields.length; i++) {
            if (keccak256(bytes(schema.fields[i].fieldName)) == keccak256(bytes(fieldName))) {
                return schema.fields[i];
            }
        }
        
        revert("Field not found");
    }

    /**
     * @dev Check if schema has a specific field
     */
    function hasSchemaField(string memory subdomain, string memory fieldName) 
        external 
        view 
        schemaExists(subdomain) 
        returns (bool) 
    {
        ReservedSubdomainSchema storage schema = subdomainSchemas[subdomain];
        
        for (uint i = 0; i < schema.fields.length; i++) {
            if (keccak256(bytes(schema.fields[i].fieldName)) == keccak256(bytes(fieldName))) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * @dev Get schema validation rules
     */
    function getSchemaValidationRules(string memory subdomain) 
        external 
        view 
        schemaExists(subdomain) 
        returns (string[] memory fieldNames, string[] memory validationRules) 
    {
        ReservedSubdomainSchema storage schema = subdomainSchemas[subdomain];
        fieldNames = new string[](schema.fields.length);
        validationRules = new string[](schema.fields.length);
        
        for (uint i = 0; i < schema.fields.length; i++) {
            fieldNames[i] = schema.fields[i].fieldName;
            validationRules[i] = schema.fields[i].validationRule;
        }
    }

    /**
     * @dev Emergency pause (only owner)
     */
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause
        // This would pause all operations
    }

    /**
     * @dev Configure auto-update for a schema
     */
    function configureAutoUpdate(
        string memory subdomain,
        bool enabled,
        UpdateTrigger trigger,
        UpdateFrequency frequency,
        uint256 customInterval,
        string[] memory updateFields,
        string[] memory triggerConditions,
        address externalContract,
        bytes4 externalFunction,
        bool requireDataChange,
        uint256 maxUpdateAge
    ) external onlyAdministrator schemaExists(subdomain) {
        ReservedSubdomainSchema storage schema = subdomainSchemas[subdomain];
        
        schema.autoUpdateConfig.enabled = enabled;
        schema.autoUpdateConfig.trigger = trigger;
        schema.autoUpdateConfig.frequency = frequency;
        schema.autoUpdateConfig.customInterval = customInterval;
        schema.autoUpdateConfig.updateFields = updateFields;
        schema.autoUpdateConfig.triggerConditions = triggerConditions;
        schema.autoUpdateConfig.externalContract = externalContract;
        schema.autoUpdateConfig.externalFunction = externalFunction;
        schema.autoUpdateConfig.requireDataChange = requireDataChange;
        schema.autoUpdateConfig.maxUpdateAge = maxUpdateAge;
        
        // Set initial update times
        if (enabled) {
            schema.autoUpdateConfig.lastUpdateTime = block.timestamp;
            schema.autoUpdateConfig.nextUpdateTime = _calculateNextUpdateTime(
                block.timestamp,
                frequency,
                customInterval
            );
        }
        
        schema.updatedAt = block.timestamp;
    }

    /**
     * @dev Calculate next update time based on frequency
     */
    function _calculateNextUpdateTime(
        uint256 currentTime,
        UpdateFrequency frequency,
        uint256 customInterval
    ) private pure returns (uint256) {
        if (frequency == UpdateFrequency.NEVER) {
            return 0;
        } else if (frequency == UpdateFrequency.HOURLY) {
            return currentTime + 1 hours;
        } else if (frequency == UpdateFrequency.DAILY) {
            return currentTime + 1 days;
        } else if (frequency == UpdateFrequency.WEEKLY) {
            return currentTime + 7 days;
        } else if (frequency == UpdateFrequency.MONTHLY) {
            return currentTime + 30 days;
        } else if (frequency == UpdateFrequency.CUSTOM) {
            return currentTime + customInterval;
        }
        return 0;
    }

    /**
     * @dev Check if schema needs auto-update
     */
    function needsAutoUpdate(string memory subdomain) external view returns (bool) {
        ReservedSubdomainSchema storage schema = subdomainSchemas[subdomain];
        
        if (!schema.autoUpdateConfig.enabled) {
            return false;
        }
        
        if (schema.autoUpdateConfig.trigger == UpdateTrigger.TIME_BASED) {
            return block.timestamp >= schema.autoUpdateConfig.nextUpdateTime;
        }
        
        if (schema.autoUpdateConfig.trigger == UpdateTrigger.BLOCK_BASED) {
            return block.number % 100 == 0; // Update every 100 blocks
        }
        
        return false;
    }

    /**
     * @dev Trigger auto-update for a schema
     */
    function triggerAutoUpdate(string memory subdomain) external onlyDataProvider schemaExists(subdomain) {
        ReservedSubdomainSchema storage schema = subdomainSchemas[subdomain];
        
        require(schema.autoUpdateConfig.enabled, "Auto-update not enabled");
        require(needsAutoUpdate(subdomain), "Schema does not need update");
        
        // Update the schema data based on trigger type
        if (schema.autoUpdateConfig.trigger == UpdateTrigger.TIME_BASED) {
            _performTimeBasedUpdate(subdomain);
        } else if (schema.autoUpdateConfig.trigger == UpdateTrigger.EVENT_BASED) {
            _performEventBasedUpdate(subdomain);
        } else if (schema.autoUpdateConfig.trigger == UpdateTrigger.EXTERNAL_CALL) {
            _performExternalCallUpdate(subdomain);
        }
        
        // Update next update time
        schema.autoUpdateConfig.lastUpdateTime = block.timestamp;
        schema.autoUpdateConfig.nextUpdateTime = _calculateNextUpdateTime(
            block.timestamp,
            schema.autoUpdateConfig.frequency,
            schema.autoUpdateConfig.customInterval
        );
        
        schema.updatedAt = block.timestamp;
    }

    /**
     * @dev Perform time-based update
     */
    function _performTimeBasedUpdate(string memory subdomain) private {
        // Implementation for time-based updates
        // This would typically fetch data from external sources
        // and update the schema with new values
    }

    /**
     * @dev Perform event-based update
     */
    function _performEventBasedUpdate(string memory subdomain) private {
        // Implementation for event-based updates
        // This would respond to specific events and update data accordingly
    }

    /**
     * @dev Perform external call update
     */
    function _performExternalCallUpdate(string memory subdomain) private {
        ReservedSubdomainSchema storage schema = subdomainSchemas[subdomain];
        
        if (schema.autoUpdateConfig.externalContract != address(0)) {
            // Call external contract to get updated data
            // This is a simplified implementation
            // In practice, you'd make actual external calls
        }
    }

    /**
     * @dev Get auto-update configuration for a schema
     */
    function getAutoUpdateConfig(string memory subdomain) 
        external 
        view 
        schemaExists(subdomain) 
        returns (AutoUpdateConfig memory) 
    {
        return subdomainSchemas[subdomain].autoUpdateConfig;
    }

    /**
     * @dev Emergency pause (only owner)
     */
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause
        // This would pause all operations
    }

    /**
     * @dev Emergency unpause (only owner)
     */
    function emergencyUnpause() external onlyOwner {
        // Implementation for emergency unpause
        // This would resume all operations
    }
} 