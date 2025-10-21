// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IENS.sol";
import "./interfaces/IENSMetadata.sol";

/**
 * @title ENSRegistry
 * @dev Centralized ENS integration contract for DAO Registry system
 * 
 * This contract manages ENS integration for all DAO Registry contracts:
 * - Stores text records on-chain for contracts
 * - Maps contract addresses to ENS names
 * - Provides reverse record management
 * - Emits events for all ENS-related changes
 * - Integrates with ENS resolver contracts
 */
contract ENSRegistry is Ownable, ReentrancyGuard, Pausable, IENSIntegration, IENSMetadataManager {
    using Strings for string;

    // =======================================================================
    // STRUCTS
    // =======================================================================

    struct ContractENSInfo {
        string ensName;                 // ENS name for the contract
        string reverseRecord;           // Reverse ENS record
        address resolverAddress;        // Custom resolver address
        bool ensEnabled;                // Whether ENS integration is enabled
        uint256 createdAt;              // Creation timestamp
        uint256 updatedAt;              // Last update timestamp
        mapping(string => string) textRecords; // Text records storage
        mapping(string => uint256) textRecordTimestamps; // Text record update timestamps
        mapping(string => address) textRecordUpdaters; // Text record updater addresses
    }

    struct TextRecordInfo {
        string key;                     // Text record key
        string value;                   // Text record value
        uint256 updatedAt;              // Last update timestamp
        address updatedBy;              // Address that updated the record
    }

    // =======================================================================
    // STATE VARIABLES
    // =======================================================================

    // Contract ENS information mapping
    mapping(address => ContractENSInfo) public contractENSInfo;
    
    // Contract addresses that have ENS integration enabled
    mapping(address => bool) public hasENSIntegration;
    
    // Text record validation rules
    mapping(string => uint256) public maxTextRecordLengths;
    mapping(string => bool) public supportedTextRecordKeys;
    
    // Statistics
    uint256 public totalContractsWithENS;
    uint256 public totalTextRecords;
    
    // ENS Registry and Resolver addresses
    address public ensRegistry;
    address public defaultResolver;
    
    // =======================================================================
    // EVENTS
    // =======================================================================

    event ContractENSRegistered(address indexed contractAddress, string ensName, address indexed registeredBy);
    event ContractENSUpdated(address indexed contractAddress, string oldENSName, string newENSName, address indexed updatedBy);
    event TextRecordSet(address indexed contractAddress, string indexed key, string value, address indexed setBy);
    event TextRecordsBatchSet(address indexed contractAddress, string[] keys, string[] values, address indexed setBy);
    event ReverseRecordClaimed(address indexed contractAddress, string ensName, address indexed claimedBy);
    event ResolverSet(address indexed contractAddress, address indexed resolverAddress, address indexed setBy);
    event ENSIntegrationToggled(address indexed contractAddress, bool enabled, address indexed setBy);
    event TextRecordValidationFailed(string indexed key, string value, string reason);
    event ContractMetadataUpdated(address indexed contractAddress, bytes32 indexed metadataHash, address indexed updatedBy);
    event MetadataValidated(address indexed contractAddress, bool isValid, string[] validationErrors, address indexed validatedBy);
    event MetadataSynced(address indexed contractAddress, address indexed resolverAddress, address indexed syncedBy);

    // =======================================================================
    // MODIFIERS
    // =======================================================================

    modifier onlyContractOwner(address contractAddress) {
        require(hasENSIntegration[contractAddress], "Contract not registered for ENS integration");
        _;
    }

    modifier onlyValidContract(address contractAddress) {
        require(contractAddress != address(0), "Invalid contract address");
        _;
    }

    modifier onlyValidTextRecord(string memory key, string memory value) {
        require(bytes(key).length > 0, "Text record key cannot be empty");
        require(bytes(value).length > 0, "Text record value cannot be empty");
        require(supportedTextRecordKeys[key], "Unsupported text record key");
        require(bytes(value).length <= maxTextRecordLengths[key], "Text record value too long");
        _;
    }

    // =======================================================================
    // CONSTRUCTOR
    // =======================================================================

    constructor(address _ensRegistry, address _defaultResolver) {
        ensRegistry = _ensRegistry;
        defaultResolver = _defaultResolver;
        
        _initializeStandardTextRecordKeys();
        _initializeTextRecordLengths();
    }

    // =======================================================================
    // INITIALIZATION
    // =======================================================================

    function _initializeStandardTextRecordKeys() private {
        supportedTextRecordKeys["description"] = true;
        supportedTextRecordKeys["url"] = true;
        supportedTextRecordKeys["avatar"] = true;
        supportedTextRecordKeys["email"] = true;
        supportedTextRecordKeys["notice"] = true;
        supportedTextRecordKeys["keywords"] = true;
        supportedTextRecordKeys["com.twitter"] = true;
        supportedTextRecordKeys["com.github"] = true;
        supportedTextRecordKeys["com.discord"] = true;
        supportedTextRecordKeys["org.telegram"] = true;
        supportedTextRecordKeys["com.reddit"] = true;
        supportedTextRecordKeys["com.youtube"] = true;
        supportedTextRecordKeys["com.medium"] = true;
    }

    function _initializeTextRecordLengths() private {
        maxTextRecordLengths["description"] = 1000;
        maxTextRecordLengths["url"] = 500;
        maxTextRecordLengths["avatar"] = 500;
        maxTextRecordLengths["email"] = 100;
        maxTextRecordLengths["notice"] = 500;
        maxTextRecordLengths["keywords"] = 200;
        maxTextRecordLengths["com.twitter"] = 100;
        maxTextRecordLengths["com.github"] = 100;
        maxTextRecordLengths["com.discord"] = 100;
        maxTextRecordLengths["org.telegram"] = 100;
        maxTextRecordLengths["com.reddit"] = 100;
        maxTextRecordLengths["com.youtube"] = 100;
        maxTextRecordLengths["com.medium"] = 100;
    }

    // =======================================================================
    // ENS INTEGRATION MANAGEMENT
    // =======================================================================

    /**
     * @dev Registers a contract for ENS integration
     * @param contractAddress The address of the contract to register
     * @param ensName The ENS name for the contract
     */
    function registerContractForENS(address contractAddress, string memory ensName) 
        external 
        onlyOwner 
        onlyValidContract(contractAddress) 
        nonReentrant 
        whenNotPaused 
    {
        require(!hasENSIntegration[contractAddress], "Contract already registered for ENS integration");
        require(bytes(ensName).length > 0, "ENS name cannot be empty");

        ContractENSInfo storage info = contractENSInfo[contractAddress];
        info.ensName = ensName;
        info.resolverAddress = defaultResolver;
        info.ensEnabled = true;
        info.createdAt = block.timestamp;
        info.updatedAt = block.timestamp;

        hasENSIntegration[contractAddress] = true;
        totalContractsWithENS++;

        emit ContractENSRegistered(contractAddress, ensName, msg.sender);
    }

    /**
     * @dev Updates ENS name for a contract
     * @param contractAddress The address of the contract
     * @param newENSName The new ENS name
     */
    function updateContractENSName(address contractAddress, string memory newENSName) 
        external 
        onlyOwner 
        onlyContractOwner(contractAddress) 
        nonReentrant 
        whenNotPaused 
    {
        require(bytes(newENSName).length > 0, "ENS name cannot be empty");

        ContractENSInfo storage info = contractENSInfo[contractAddress];
        string memory oldENSName = info.ensName;
        
        info.ensName = newENSName;
        info.updatedAt = block.timestamp;

        emit ContractENSUpdated(contractAddress, oldENSName, newENSName, msg.sender);
    }

    /**
     * @dev Enables or disables ENS integration for a contract
     * @param contractAddress The address of the contract
     * @param enabled Whether to enable ENS integration
     */
    function setENSIntegration(address contractAddress, bool enabled) 
        external 
        onlyOwner 
        onlyContractOwner(contractAddress) 
        nonReentrant 
        whenNotPaused 
    {
        ContractENSInfo storage info = contractENSInfo[contractAddress];
        info.ensEnabled = enabled;
        info.updatedAt = block.timestamp;

        emit ENSIntegrationToggled(contractAddress, enabled, msg.sender);
    }

    /**
     * @dev Checks if ENS integration is enabled for a contract
     * @param contractAddress The address of the contract
     * @return True if ENS integration is enabled
     */
    function isENSIntegrationEnabled(address contractAddress) external view returns (bool) {
        return hasENSIntegration[contractAddress] && contractENSInfo[contractAddress].ensEnabled;
    }

    // =======================================================================
    // TEXT RECORD MANAGEMENT
    // =======================================================================

    /**
     * @dev Sets a text record for a contract
     * @param contractAddress The address of the contract
     * @param key The text record key
     * @param value The text record value
     */
    function setTextRecord(address contractAddress, string memory key, string memory value) 
        external 
        onlyOwner 
        onlyContractOwner(contractAddress) 
        onlyValidTextRecord(key, value) 
        nonReentrant 
        whenNotPaused 
    {
        ContractENSInfo storage info = contractENSInfo[contractAddress];
        
        // Check if this is a new text record
        bool isNewRecord = bytes(info.textRecords[key]).length == 0;
        
        info.textRecords[key] = value;
        info.textRecordTimestamps[key] = block.timestamp;
        info.textRecordUpdaters[key] = msg.sender;
        info.updatedAt = block.timestamp;

        if (isNewRecord) {
            totalTextRecords++;
        }

        emit TextRecordSet(contractAddress, key, value, msg.sender);
    }

    /**
     * @dev Gets a text record for a contract
     * @param contractAddress The address of the contract
     * @param key The text record key
     * @return The text record value
     */
    function getTextRecord(address contractAddress, string memory key) 
        external 
        view 
        onlyContractOwner(contractAddress) 
        returns (string memory) 
    {
        return contractENSInfo[contractAddress].textRecords[key];
    }

    /**
     * @dev Sets multiple text records for a contract
     * @param contractAddress The address of the contract
     * @param keys Array of text record keys
     * @param values Array of text record values
     */
    function batchSetTextRecords(address contractAddress, string[] memory keys, string[] memory values) 
        external 
        onlyOwner 
        onlyContractOwner(contractAddress) 
        nonReentrant 
        whenNotPaused 
    {
        require(keys.length == values.length, "Keys and values arrays must have the same length");
        require(keys.length > 0, "Arrays cannot be empty");

        ContractENSInfo storage info = contractENSInfo[contractAddress];
        
        for (uint256 i = 0; i < keys.length; i++) {
            require(bytes(keys[i]).length > 0, "Text record key cannot be empty");
            require(bytes(values[i]).length > 0, "Text record value cannot be empty");
            require(supportedTextRecordKeys[keys[i]], "Unsupported text record key");
            require(bytes(values[i]).length <= maxTextRecordLengths[keys[i]], "Text record value too long");

            bool isNewRecord = bytes(info.textRecords[keys[i]]).length == 0;
            
            info.textRecords[keys[i]] = values[i];
            info.textRecordTimestamps[keys[i]] = block.timestamp;
            info.textRecordUpdaters[keys[i]] = msg.sender;

            if (isNewRecord) {
                totalTextRecords++;
            }
        }

        info.updatedAt = block.timestamp;

        emit TextRecordsBatchSet(contractAddress, keys, values, msg.sender);
    }

    /**
     * @dev Gets multiple text records for a contract
     * @param contractAddress The address of the contract
     * @param keys Array of text record keys
     * @return Array of text record values
     */
    function batchGetTextRecords(address contractAddress, string[] memory keys) 
        external 
        view 
        onlyContractOwner(contractAddress) 
        returns (string[] memory) 
    {
        string[] memory values = new string[](keys.length);
        ContractENSInfo storage info = contractENSInfo[contractAddress];
        
        for (uint256 i = 0; i < keys.length; i++) {
            values[i] = info.textRecords[keys[i]];
        }
        
        return values;
    }

    /**
     * @dev Checks if a text record exists for a contract
     * @param contractAddress The address of the contract
     * @param key The text record key
     * @return True if the record exists
     */
    function hasTextRecord(address contractAddress, string memory key) 
        external 
        view 
        onlyContractOwner(contractAddress) 
        returns (bool) 
    {
        return bytes(contractENSInfo[contractAddress].textRecords[key]).length > 0;
    }

    // =======================================================================
    // REVERSE RECORD MANAGEMENT
    // =======================================================================

    /**
     * @dev Claims a reverse ENS record for a contract
     * @param contractAddress The address of the contract
     * @param ensName The ENS name to claim as reverse record
     */
    function claimReverse(address contractAddress, string memory ensName) 
        external 
        onlyOwner 
        onlyContractOwner(contractAddress) 
        nonReentrant 
        whenNotPaused 
    {
        require(bytes(ensName).length > 0, "ENS name cannot be empty");

        ContractENSInfo storage info = contractENSInfo[contractAddress];
        info.reverseRecord = ensName;
        info.updatedAt = block.timestamp;

        emit ReverseRecordClaimed(contractAddress, ensName, msg.sender);
    }

    /**
     * @dev Sets a reverse ENS record for a contract
     * @param contractAddress The address of the contract
     * @param ensName The ENS name to set as reverse record
     */
    function setReverseRecord(address contractAddress, string memory ensName) 
        external 
        onlyOwner 
        onlyContractOwner(contractAddress) 
        nonReentrant 
        whenNotPaused 
    {
        require(bytes(ensName).length > 0, "ENS name cannot be empty");

        ContractENSInfo storage info = contractENSInfo[contractAddress];
        info.reverseRecord = ensName;
        info.updatedAt = block.timestamp;

        emit ReverseRecordClaimed(contractAddress, ensName, msg.sender);
    }

    /**
     * @dev Gets the current reverse ENS record for a contract
     * @param contractAddress The address of the contract
     * @return The current reverse ENS name
     */
    function getReverseRecord(address contractAddress) 
        external 
        view 
        onlyContractOwner(contractAddress) 
        returns (string memory) 
    {
        return contractENSInfo[contractAddress].reverseRecord;
    }

    // =======================================================================
    // RESOLVER MANAGEMENT
    // =======================================================================

    /**
     * @dev Sets the resolver for a contract
     * @param contractAddress The address of the contract
     * @param resolverAddress The address of the resolver
     */
    function setResolver(address contractAddress, address resolverAddress) 
        external 
        onlyOwner 
        onlyContractOwner(contractAddress) 
        nonReentrant 
        whenNotPaused 
    {
        require(resolverAddress != address(0), "Invalid resolver address");

        ContractENSInfo storage info = contractENSInfo[contractAddress];
        info.resolverAddress = resolverAddress;
        info.updatedAt = block.timestamp;

        emit ResolverSet(contractAddress, resolverAddress, msg.sender);
    }

    /**
     * @dev Gets the resolver for a contract
     * @param contractAddress The address of the contract
     * @return The address of the resolver
     */
    function getResolver(address contractAddress) 
        external 
        view 
        onlyContractOwner(contractAddress) 
        returns (address) 
    {
        return contractENSInfo[contractAddress].resolverAddress;
    }

    /**
     * @dev Syncs contract data with ENS resolver
     * @param contractAddress The address of the contract
     */
    function syncWithResolver(address contractAddress) 
        external 
        onlyOwner 
        onlyContractOwner(contractAddress) 
        nonReentrant 
        whenNotPaused 
    {
        ContractENSInfo storage info = contractENSInfo[contractAddress];
        require(info.resolverAddress != address(0), "No resolver set");

        // In a real implementation, this would sync with the actual ENS resolver
        // For now, we just emit an event
        emit MetadataSynced(contractAddress, info.resolverAddress, msg.sender);
    }

    /**
     * @dev Checks if contract is synced with resolver
     * @param contractAddress The address of the contract
     * @return True if synced
     */
    function isSyncedWithResolver(address contractAddress) 
        external 
        view 
        onlyContractOwner(contractAddress) 
        returns (bool) 
    {
        // In a real implementation, this would check actual sync status
        return true;
    }

    // =======================================================================
    // TEXT RECORD VALIDATION
    // =======================================================================

    /**
     * @dev Validates a text record
     * @param key The text record key
     * @param value The text record value
     * @return isValid True if the record is valid
     * @return reason The validation failure reason if invalid
     */
    function validateTextRecord(string calldata key, string calldata value) 
        external 
        pure 
        returns (bool isValid, string memory reason) 
    {
        if (bytes(key).length == 0) {
            return (false, "Key cannot be empty");
        }
        
        if (bytes(value).length == 0) {
            return (false, "Value cannot be empty");
        }

        // Additional validation logic would go here
        return (true, "");
    }

    /**
     * @dev Gets the maximum length for a text record key
     * @param key The text record key
     * @return The maximum allowed length
     */
    function getMaxLength(string calldata key) external view returns (uint256) {
        return maxTextRecordLengths[key];
    }

    /**
     * @dev Checks if a text record key is supported
     * @param key The text record key
     * @return True if the key is supported
     */
    function isSupportedKey(string calldata key) external view returns (bool) {
        return supportedTextRecordKeys[key];
    }

    // =======================================================================
    // STANDARD TEXT RECORD KEYS
    // =======================================================================

    /**
     * @dev Gets all standard text record keys
     * @return Array of standard text record keys
     */
    function getStandardTextRecordKeys() external pure returns (string[] memory) {
        string[] memory keys = new string[](13);
        keys[0] = "description";
        keys[1] = "url";
        keys[2] = "avatar";
        keys[3] = "email";
        keys[4] = "notice";
        keys[5] = "keywords";
        keys[6] = "com.twitter";
        keys[7] = "com.github";
        keys[8] = "com.discord";
        keys[9] = "org.telegram";
        keys[10] = "com.reddit";
        keys[11] = "com.youtube";
        keys[12] = "com.medium";
        return keys;
    }

    /**
     * @dev Checks if a key is a standard text record key
     * @param key The text record key
     * @return True if the key is standard
     */
    function isStandardTextRecordKey(string calldata key) external view returns (bool) {
        return supportedTextRecordKeys[key];
    }

    /**
     * @dev Gets the category of a standard text record key
     * @param key The text record key
     * @return The category (basic, social, custom)
     */
    function getTextRecordKeyCategory(string calldata key) external pure returns (string memory) {
        if (keccak256(bytes(key)) == keccak256(bytes("description")) ||
            keccak256(bytes(key)) == keccak256(bytes("url")) ||
            keccak256(bytes(key)) == keccak256(bytes("avatar")) ||
            keccak256(bytes(key)) == keccak256(bytes("email")) ||
            keccak256(bytes(key)) == keccak256(bytes("notice")) ||
            keccak256(bytes(key)) == keccak256(bytes("keywords"))) {
            return "basic";
        } else if (keccak256(bytes(key)) == keccak256(bytes("com.twitter")) ||
                   keccak256(bytes(key)) == keccak256(bytes("com.github")) ||
                   keccak256(bytes(key)) == keccak256(bytes("com.discord")) ||
                   keccak256(bytes(key)) == keccak256(bytes("org.telegram")) ||
                   keccak256(bytes(key)) == keccak256(bytes("com.reddit")) ||
                   keccak256(bytes(key)) == keccak256(bytes("com.youtube")) ||
                   keccak256(bytes(key)) == keccak256(bytes("com.medium"))) {
            return "social";
        } else {
            return "custom";
        }
    }

    // =======================================================================
    // COMPLETE ENS INFORMATION
    // =======================================================================

    /**
     * @dev Gets all ENS-related information for a contract
     * @param contractAddress The address of the contract
     * @return ensName The ENS name
     * @return reverseRecord The reverse record
     * @return resolverAddress The resolver address
     * @return textRecordCount The number of text records
     */
    function getENSInfo(address contractAddress) 
        external 
        view 
        onlyContractOwner(contractAddress) 
        returns (
            string memory ensName,
            string memory reverseRecord,
            address resolverAddress,
            uint256 textRecordCount
        ) 
    {
        ContractENSInfo storage info = contractENSInfo[contractAddress];
        ensName = info.ensName;
        reverseRecord = info.reverseRecord;
        resolverAddress = info.resolverAddress;
        
        // Count text records
        string[] memory keys = this.getStandardTextRecordKeys();
        textRecordCount = 0;
        for (uint256 i = 0; i < keys.length; i++) {
            if (bytes(info.textRecords[keys[i]]).length > 0) {
                textRecordCount++;
            }
        }
    }

    /**
     * @dev Gets complete ENS metadata information for a contract
     * @param contractAddress The address of the contract
     * @return metadata The contract metadata
     * @return textRecords Array of text records
     * @return ensName The ENS name
     * @return reverseRecord The reverse record
     * @return resolverAddress The resolver address
     * @return metadataHash The metadata hash
     */
    function getCompleteENSMetadata(address contractAddress) 
        external 
        view 
        onlyContractOwner(contractAddress) 
        returns (
            IContractMetadata.ContractMetadata memory metadata,
            TextRecordInfo[] memory textRecords,
            string memory ensName,
            string memory reverseRecord,
            address resolverAddress,
            bytes32 metadataHash
        ) 
    {
        ContractENSInfo storage info = contractENSInfo[contractAddress];
        ensName = info.ensName;
        reverseRecord = info.reverseRecord;
        resolverAddress = info.resolverAddress;
        
        // Build text records array
        string[] memory keys = this.getStandardTextRecordKeys();
        uint256 recordCount = 0;
        
        // Count existing records
        for (uint256 i = 0; i < keys.length; i++) {
            if (bytes(info.textRecords[keys[i]]).length > 0) {
                recordCount++;
            }
        }
        
        textRecords = new TextRecordInfo[](recordCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < keys.length; i++) {
            if (bytes(info.textRecords[keys[i]]).length > 0) {
                textRecords[index] = TextRecordInfo({
                    key: keys[i],
                    value: info.textRecords[keys[i]],
                    updatedAt: info.textRecordTimestamps[keys[i]],
                    updatedBy: info.textRecordUpdaters[keys[i]]
                });
                index++;
            }
        }
        
        // Create metadata hash
        metadataHash = keccak256(abi.encodePacked(
            ensName,
            reverseRecord,
            resolverAddress,
            info.createdAt,
            info.updatedAt
        ));
    }

    // =======================================================================
    // ADMIN FUNCTIONS
    // =======================================================================

    /**
     * @dev Adds a new supported text record key
     * @param key The text record key
     * @param maxLength The maximum length for the key
     */
    function addSupportedTextRecordKey(string memory key, uint256 maxLength) external onlyOwner {
        require(bytes(key).length > 0, "Key cannot be empty");
        require(maxLength > 0, "Max length must be greater than 0");
        
        supportedTextRecordKeys[key] = true;
        maxTextRecordLengths[key] = maxLength;
    }

    /**
     * @dev Removes a supported text record key
     * @param key The text record key
     */
    function removeSupportedTextRecordKey(string memory key) external onlyOwner {
        supportedTextRecordKeys[key] = false;
        maxTextRecordLengths[key] = 0;
    }

    /**
     * @dev Updates the ENS registry address
     * @param newENSRegistry The new ENS registry address
     */
    function updateENSRegistry(address newENSRegistry) external onlyOwner {
        require(newENSRegistry != address(0), "Invalid ENS registry address");
        ensRegistry = newENSRegistry;
    }

    /**
     * @dev Updates the default resolver address
     * @param newDefaultResolver The new default resolver address
     */
    function updateDefaultResolver(address newDefaultResolver) external onlyOwner {
        require(newDefaultResolver != address(0), "Invalid default resolver address");
        defaultResolver = newDefaultResolver;
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // =======================================================================
    // VIEW FUNCTIONS
    // =======================================================================

    /**
     * @dev Gets contract statistics
     * @return totalContracts Total contracts with ENS integration
     * @return totalRecords Total text records
     * @return supportedKeys Number of supported text record keys
     */
    function getStatistics() external view returns (
        uint256 totalContracts,
        uint256 totalRecords,
        uint256 supportedKeys
    ) {
        totalContracts = totalContractsWithENS;
        totalRecords = totalTextRecords;
        
        string[] memory keys = this.getStandardTextRecordKeys();
        supportedKeys = keys.length;
    }

    /**
     * @dev Checks if a contract is registered for ENS integration
     * @param contractAddress The address of the contract
     * @return True if the contract is registered
     */
    function isContractRegistered(address contractAddress) external view returns (bool) {
        return hasENSIntegration[contractAddress];
    }
}




