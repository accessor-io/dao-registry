// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IENS.sol";
import "./interfaces/IENSMetadata.sol";

/**
 * @title ENSMetadataService
 * @dev Dedicated contract for managing comprehensive ENS metadata across the entire system
 * 
 * Key features:
 * - Centralized metadata storage for all contracts
 * - Standard text record validation
 * - Batch metadata operations
 * - Integration with ENS public resolver
 * - CCIP-compatible data structures
 * - Event emission for off-chain indexing
 */
contract ENSMetadataService is Ownable, ReentrancyGuard, Pausable, IENSMetadataManager {
    using Strings for string;

    // =======================================================================
    // STRUCTS
    // =======================================================================

    struct ContractMetadata {
        string name;                    // Contract name
        string description;             // Contract description
        string version;                 // Contract version
        string url;                     // Documentation URL
        string avatar;                  // Avatar/logo URL
        string email;                   // Contact email
        string notice;                  // Important notices
        string[] keywords;              // Keywords
        string[] socialLinks;           // Social media links
        address author;                 // Contract author
        uint256 createdAt;              // Creation timestamp
        uint256 updatedAt;              // Last update timestamp
        bool verified;                  // Verification status
        string[] implementedInterfaces; // Implemented interfaces
    }

    struct TextRecord {
        string key;                     // Text record key
        string value;                   // Text record value
        uint256 updatedAt;              // Last update timestamp
        address updatedBy;              // Address that updated the record
    }

    struct CCIPCompatibleData {
        string contractAddress;         // Contract address as string
        string ensName;                 // ENS name
        string schemaVersion;           // Schema version
        bytes32 dataHash;               // Hash of current data
        uint256 timestamp;              // Timestamp
        address dataProvider;           // Data provider address
        bool isValid;                   // Validation status
        string[] fieldNames;            // Field names for structured data
        bytes[] fieldValues;            // Field values (encoded)
    }

    // =======================================================================
    // STATE VARIABLES
    // =======================================================================

    // Contract metadata storage
    mapping(address => ContractMetadata) public contractMetadata;
    mapping(address => mapping(string => TextRecord)) public contractTextRecords;
    mapping(address => bool) public hasContractMetadata;
    
    // Text record validation rules
    mapping(string => uint256) public maxTextRecordLengths;
    mapping(string => bool) public supportedTextRecordKeys;
    mapping(string => string) public textRecordValidationRules;
    
    // CCIP data storage
    mapping(address => CCIPCompatibleData) public ccipData;
    mapping(address => bytes32[]) public contractDataHashes;
    
    // Statistics
    uint256 public totalContracts;
    uint256 public totalTextRecords;
    mapping(string => uint256) public textRecordCountsByKey;
    
    // ENS Registry and Resolver addresses
    address public ensRegistry;
    address public defaultResolver;
    
    // =======================================================================
    // EVENTS
    // =======================================================================

    event ContractMetadataRegistered(address indexed contractAddress, string name, address indexed registeredBy);
    event ContractMetadataUpdated(address indexed contractAddress, bytes32 indexed metadataHash, address indexed updatedBy);
    event TextRecordSet(address indexed contractAddress, string indexed key, string value, address indexed setBy);
    event TextRecordsBatchSet(address indexed contractAddress, string[] keys, string[] values, address indexed setBy);
    event TextRecordValidationFailed(string indexed key, string value, string reason);
    event MetadataValidated(address indexed contractAddress, bool isValid, string[] validationErrors, address indexed validatedBy);
    event MetadataSynced(address indexed contractAddress, address indexed resolverAddress, address indexed syncedBy);
    event CCIPDataStored(address indexed contractAddress, bytes32 indexed dataHash, address indexed dataProvider);

    // =======================================================================
    // CONSTRUCTOR
    // =======================================================================

    constructor(address _ensRegistry, address _defaultResolver) {
        ensRegistry = _ensRegistry;
        defaultResolver = _defaultResolver;
        
        _initializeStandardTextRecordKeys();
        _initializeTextRecordLengths();
        _initializeValidationRules();
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

    function _initializeValidationRules() private {
        textRecordValidationRules["description"] = "UTF-8 text, max 1000 characters";
        textRecordValidationRules["url"] = "Valid URL format (http/https)";
        textRecordValidationRules["avatar"] = "Valid URL format (http/https/ipfs)";
        textRecordValidationRules["email"] = "Valid email format";
        textRecordValidationRules["notice"] = "UTF-8 text, max 500 characters";
        textRecordValidationRules["keywords"] = "Comma-separated keywords, max 10 keywords";
        textRecordValidationRules["com.twitter"] = "Valid Twitter username or URL";
        textRecordValidationRules["com.github"] = "Valid GitHub username or URL";
        textRecordValidationRules["com.discord"] = "Valid Discord username or invite";
        textRecordValidationRules["org.telegram"] = "Valid Telegram username or invite";
        textRecordValidationRules["com.reddit"] = "Valid Reddit username or URL";
        textRecordValidationRules["com.youtube"] = "Valid YouTube channel or URL";
        textRecordValidationRules["com.medium"] = "Valid Medium username or URL";
    }

    // =======================================================================
    // CONTRACT METADATA MANAGEMENT
    // =======================================================================

    /**
     * @dev Registers contract metadata
     * @param contractAddress The address of the contract
     * @param metadata The contract metadata
     */
    function registerContractMetadata(address contractAddress, ContractMetadata calldata metadata) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
    {
        require(contractAddress != address(0), "Invalid contract address");
        require(bytes(metadata.name).length > 0, "Contract name cannot be empty");
        require(!hasContractMetadata[contractAddress], "Contract metadata already registered");

        // Validate metadata
        (bool isValid, string[] memory errors) = _validateContractMetadata(metadata);
        require(isValid, string(abi.encodePacked("Invalid metadata: ", _joinStrings(errors))));

        contractMetadata[contractAddress] = metadata;
        hasContractMetadata[contractAddress] = true;
        totalContracts++;

        emit ContractMetadataRegistered(contractAddress, metadata.name, msg.sender);
    }

    /**
     * @dev Updates contract metadata
     * @param contractAddress The address of the contract
     * @param metadata The updated contract metadata
     */
    function updateContractMetadata(address contractAddress, ContractMetadata calldata metadata) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
    {
        require(contractAddress != address(0), "Invalid contract address");
        require(hasContractMetadata[contractAddress], "Contract metadata not registered");
        require(bytes(metadata.name).length > 0, "Contract name cannot be empty");

        // Validate metadata
        (bool isValid, string[] memory errors) = _validateContractMetadata(metadata);
        require(isValid, string(abi.encodePacked("Invalid metadata: ", _joinStrings(errors))));

        ContractMetadata storage existing = contractMetadata[contractAddress];
        existing.name = metadata.name;
        existing.description = metadata.description;
        existing.version = metadata.version;
        existing.url = metadata.url;
        existing.avatar = metadata.avatar;
        existing.email = metadata.email;
        existing.notice = metadata.notice;
        existing.keywords = metadata.keywords;
        existing.socialLinks = metadata.socialLinks;
        existing.author = metadata.author;
        existing.updatedAt = block.timestamp;
        existing.verified = metadata.verified;
        existing.implementedInterfaces = metadata.implementedInterfaces;

        bytes32 metadataHash = keccak256(abi.encode(metadata));
        emit ContractMetadataUpdated(contractAddress, metadataHash, msg.sender);
    }

    /**
     * @dev Gets contract metadata
     * @param contractAddress The address of the contract
     * @return The contract metadata
     */
    function getContractMetadata(address contractAddress) 
        external 
        view 
        returns (ContractMetadata memory) 
    {
        require(hasContractMetadata[contractAddress], "Contract metadata not registered");
        return contractMetadata[contractAddress];
    }

    /**
     * @dev Gets metadata hash
     * @param contractAddress The address of the contract
     * @return The hash of the current metadata
     */
    function getMetadataHash(address contractAddress) 
        external 
        view 
        returns (bytes32) 
    {
        require(hasContractMetadata[contractAddress], "Contract metadata not registered");
        ContractMetadata memory metadata = contractMetadata[contractAddress];
        return keccak256(abi.encode(metadata));
    }

    // =======================================================================
    // TEXT RECORD MANAGEMENT
    // =======================================================================

    /**
     * @dev Sets multiple text records for a contract
     * @param contractAddress The address of the contract
     * @param records Array of text records
     */
    function setTextRecords(address contractAddress, TextRecord[] calldata records) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
    {
        require(contractAddress != address(0), "Invalid contract address");
        require(hasContractMetadata[contractAddress], "Contract metadata not registered");
        require(records.length > 0, "Records array cannot be empty");

        for (uint256 i = 0; i < records.length; i++) {
            _setTextRecord(contractAddress, records[i]);
        }

        string[] memory keys = new string[](records.length);
        string[] memory values = new string[](records.length);
        
        for (uint256 i = 0; i < records.length; i++) {
            keys[i] = records[i].key;
            values[i] = records[i].value;
        }

        emit TextRecordsBatchSet(contractAddress, keys, values, msg.sender);
    }

    /**
     * @dev Sets a single text record for a contract
     * @param contractAddress The address of the contract
     * @param key The text record key
     * @param value The text record value
     */
    function setTextRecord(address contractAddress, string memory key, string memory value) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
    {
        require(contractAddress != address(0), "Invalid contract address");
        require(hasContractMetadata[contractAddress], "Contract metadata not registered");

        TextRecord memory record = TextRecord({
            key: key,
            value: value,
            updatedAt: block.timestamp,
            updatedBy: msg.sender
        });

        _setTextRecord(contractAddress, record);
        emit TextRecordSet(contractAddress, key, value, msg.sender);
    }

    /**
     * @dev Internal function to set a text record
     * @param contractAddress The address of the contract
     * @param record The text record to set
     */
    function _setTextRecord(address contractAddress, TextRecord memory record) internal {
        require(bytes(record.key).length > 0, "Text record key cannot be empty");
        require(bytes(record.value).length > 0, "Text record value cannot be empty");
        require(supportedTextRecordKeys[record.key], "Unsupported text record key");
        require(bytes(record.value).length <= maxTextRecordLengths[record.key], "Text record value too long");

        // Validate the text record
        (bool isValid, string memory reason) = _validateTextRecord(record.key, record.value);
        if (!isValid) {
            emit TextRecordValidationFailed(record.key, record.value, reason);
            revert(string(abi.encodePacked("Text record validation failed: ", reason)));
        }

        // Check if this is a new text record
        bool isNewRecord = bytes(contractTextRecords[contractAddress][record.key].key).length == 0;

        contractTextRecords[contractAddress][record.key] = record;

        if (isNewRecord) {
            totalTextRecords++;
            textRecordCountsByKey[record.key]++;
        }
    }

    /**
     * @dev Gets all text records for a contract
     * @param contractAddress The address of the contract
     * @return Array of text records
     */
    function getTextRecords(address contractAddress) 
        external 
        view 
        returns (TextRecord[] memory) 
    {
        require(hasContractMetadata[contractAddress], "Contract metadata not registered");

        string[] memory keys = this.getStandardTextRecordKeys();
        uint256 recordCount = 0;

        // Count existing records
        for (uint256 i = 0; i < keys.length; i++) {
            if (bytes(contractTextRecords[contractAddress][keys[i]].key).length > 0) {
                recordCount++;
            }
        }

        TextRecord[] memory records = new TextRecord[](recordCount);
        uint256 index = 0;

        for (uint256 i = 0; i < keys.length; i++) {
            if (bytes(contractTextRecords[contractAddress][keys[i]].key).length > 0) {
                records[index] = contractTextRecords[contractAddress][keys[i]];
                index++;
            }
        }

        return records;
    }

    /**
     * @dev Gets text record by key for a contract
     * @param contractAddress The address of the contract
     * @param key The text record key
     * @return The text record
     */
    function getTextRecord(address contractAddress, string memory key) 
        external 
        view 
        returns (TextRecord memory) 
    {
        require(hasContractMetadata[contractAddress], "Contract metadata not registered");
        return contractTextRecords[contractAddress][key];
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

        // Additional validation based on key type
        if (keccak256(bytes(key)) == keccak256(bytes("email"))) {
            if (!_isValidEmail(value)) {
                return (false, "Invalid email format");
            }
        } else if (keccak256(bytes(key)) == keccak256(bytes("url")) || 
                   keccak256(bytes(key)) == keccak256(bytes("avatar"))) {
            if (!_isValidURL(value)) {
                return (false, "Invalid URL format");
            }
        } else if (keccak256(bytes(key)) == keccak256(bytes("keywords"))) {
            if (!_isValidKeywords(value)) {
                return (false, "Invalid keywords format");
            }
        }

        return (true, "");
    }

    /**
     * @dev Internal function to validate a text record
     * @param key The text record key
     * @param value The text record value
     * @return isValid True if the record is valid
     * @return reason The validation failure reason if invalid
     */
    function _validateTextRecord(string memory key, string memory value) 
        internal 
        pure 
        returns (bool isValid, string memory reason) 
    {
        if (bytes(key).length == 0) {
            return (false, "Key cannot be empty");
        }
        
        if (bytes(value).length == 0) {
            return (false, "Value cannot be empty");
        }

        // Additional validation based on key type
        if (keccak256(bytes(key)) == keccak256(bytes("email"))) {
            if (!_isValidEmail(value)) {
                return (false, "Invalid email format");
            }
        } else if (keccak256(bytes(key)) == keccak256(bytes("url")) || 
                   keccak256(bytes(key)) == keccak256(bytes("avatar"))) {
            if (!_isValidURL(value)) {
                return (false, "Invalid URL format");
            }
        } else if (keccak256(bytes(key)) == keccak256(bytes("keywords"))) {
            if (!_isValidKeywords(value)) {
                return (false, "Invalid keywords format");
            }
        }

        return (true, "");
    }

    /**
     * @dev Validates all current metadata for a contract
     * @param contractAddress The address of the contract
     * @return isValid True if all metadata is valid
     * @return errors Array of validation errors
     */
    function validateAllMetadata(address contractAddress) 
        external 
        view 
        returns (bool isValid, string[] memory errors) 
    {
        require(hasContractMetadata[contractAddress], "Contract metadata not registered");

        ContractMetadata memory metadata = contractMetadata[contractAddress];
        (bool metadataValid, string[] memory metadataErrors) = _validateContractMetadata(metadata);
        
        // Validate text records
        string[] memory textRecordErrors = new string[](0);
        string[] memory keys = this.getStandardTextRecordKeys();
        
        for (uint256 i = 0; i < keys.length; i++) {
            if (bytes(contractTextRecords[contractAddress][keys[i]].key).length > 0) {
                (bool recordValid, string memory reason) = _validateTextRecord(
                    keys[i], 
                    contractTextRecords[contractAddress][keys[i]].value
                );
                if (!recordValid) {
                    // Add error to array
                    string[] memory newErrors = new string[](textRecordErrors.length + 1);
                    for (uint256 j = 0; j < textRecordErrors.length; j++) {
                        newErrors[j] = textRecordErrors[j];
                    }
                    newErrors[textRecordErrors.length] = string(abi.encodePacked("Text record '", keys[i], "': ", reason));
                    textRecordErrors = newErrors;
                }
            }
        }

        // Combine all errors
        uint256 totalErrors = metadataErrors.length + textRecordErrors.length;
        errors = new string[](totalErrors);
        
        for (uint256 i = 0; i < metadataErrors.length; i++) {
            errors[i] = metadataErrors[i];
        }
        
        for (uint256 i = 0; i < textRecordErrors.length; i++) {
            errors[metadataErrors.length + i] = textRecordErrors[i];
        }

        isValid = metadataValid && textRecordErrors.length == 0;
        
        emit MetadataValidated(contractAddress, isValid, errors, msg.sender);
    }

    /**
     * @dev Internal function to validate contract metadata
     * @param metadata The contract metadata to validate
     * @return isValid True if the metadata is valid
     * @return errors Array of validation errors
     */
    function _validateContractMetadata(ContractMetadata memory metadata) 
        internal 
        pure 
        returns (bool isValid, string[] memory errors) 
    {
        string[] memory validationErrors = new string[](0);

        if (bytes(metadata.name).length == 0) {
            validationErrors = _addStringToArray(validationErrors, "Contract name cannot be empty");
        }

        if (bytes(metadata.description).length > 1000) {
            validationErrors = _addStringToArray(validationErrors, "Description too long (max 1000 characters)");
        }

        if (bytes(metadata.url).length > 0 && !_isValidURL(metadata.url)) {
            validationErrors = _addStringToArray(validationErrors, "Invalid URL format");
        }

        if (bytes(metadata.avatar).length > 0 && !_isValidURL(metadata.avatar)) {
            validationErrors = _addStringToArray(validationErrors, "Invalid avatar URL format");
        }

        if (bytes(metadata.email).length > 0 && !_isValidEmail(metadata.email)) {
            validationErrors = _addStringToArray(validationErrors, "Invalid email format");
        }

        if (bytes(metadata.notice).length > 500) {
            validationErrors = _addStringToArray(validationErrors, "Notice too long (max 500 characters)");
        }

        if (metadata.keywords.length > 10) {
            validationErrors = _addStringToArray(validationErrors, "Too many keywords (max 10)");
        }

        return (validationErrors.length == 0, validationErrors);
    }

    // =======================================================================
    // VALIDATION HELPER FUNCTIONS
    // =======================================================================

    function _isValidEmail(string memory email) internal pure returns (bool) {
        bytes memory emailBytes = bytes(email);
        if (emailBytes.length == 0) return false;
        
        bool hasAt = false;
        bool hasDot = false;
        
        for (uint256 i = 0; i < emailBytes.length; i++) {
            if (emailBytes[i] == '@') {
                if (hasAt) return false; // Multiple @ symbols
                hasAt = true;
            } else if (emailBytes[i] == '.') {
                hasDot = true;
            }
        }
        
        return hasAt && hasDot;
    }

    function _isValidURL(string memory url) internal pure returns (bool) {
        bytes memory urlBytes = bytes(url);
        if (urlBytes.length == 0) return false;
        
        // Check for http:// or https:// or ipfs://
        if (urlBytes.length >= 7) {
            if (keccak256(abi.encodePacked(_substring(url, 0, 7))) == keccak256("http://")) {
                return true;
            }
        }
        
        if (urlBytes.length >= 8) {
            if (keccak256(abi.encodePacked(_substring(url, 0, 8))) == keccak256("https://")) {
                return true;
            }
        }
        
        if (urlBytes.length >= 7) {
            if (keccak256(abi.encodePacked(_substring(url, 0, 7))) == keccak256("ipfs://")) {
                return true;
            }
        }
        
        return false;
    }

    function _isValidKeywords(string memory keywords) internal pure returns (bool) {
        bytes memory keywordsBytes = bytes(keywords);
        if (keywordsBytes.length == 0) return true; // Empty keywords are valid
        
        // Count commas to check for max 10 keywords
        uint256 commaCount = 0;
        for (uint256 i = 0; i < keywordsBytes.length; i++) {
            if (keywordsBytes[i] == ',') {
                commaCount++;
            }
        }
        
        return commaCount <= 9; // 10 keywords = 9 commas
    }

    function _substring(string memory str, uint256 start, uint256 end) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(end - start);
        
        for (uint256 i = start; i < end; i++) {
            result[i - start] = strBytes[i];
        }
        
        return string(result);
    }

    function _addStringToArray(string[] memory array, string memory newString) internal pure returns (string[] memory) {
        string[] memory newArray = new string[](array.length + 1);
        
        for (uint256 i = 0; i < array.length; i++) {
            newArray[i] = array[i];
        }
        
        newArray[array.length] = newString;
        return newArray;
    }

    function _joinStrings(string[] memory strings) internal pure returns (string memory) {
        if (strings.length == 0) return "";
        
        string memory result = strings[0];
        for (uint256 i = 1; i < strings.length; i++) {
            result = string(abi.encodePacked(result, "; ", strings[i]));
        }
        
        return result;
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
    // CCIP COMPATIBILITY
    // =======================================================================

    /**
     * @dev Stores CCIP-compatible data for a contract
     * @param contractAddress The address of the contract
     * @param ensName The ENS name
     * @param fieldNames Array of field names
     * @param fieldValues Array of field values
     */
    function storeCCIPData(
        address contractAddress,
        string memory ensName,
        string[] memory fieldNames,
        bytes[] memory fieldValues
    ) external onlyOwner nonReentrant whenNotPaused {
        require(contractAddress != address(0), "Invalid contract address");
        require(fieldNames.length == fieldValues.length, "Field names and values mismatch");

        bytes32 dataHash = keccak256(abi.encodePacked(
            contractAddress,
            ensName,
            abi.encode(fieldNames),
            abi.encode(fieldValues),
            block.timestamp
        ));

        CCIPCompatibleData memory data = CCIPCompatibleData({
            contractAddress: _addressToString(contractAddress),
            ensName: ensName,
            schemaVersion: "1.0.0",
            dataHash: dataHash,
            timestamp: block.timestamp,
            dataProvider: msg.sender,
            isValid: true,
            fieldNames: fieldNames,
            fieldValues: fieldValues
        });

        ccipData[contractAddress] = data;
        contractDataHashes[contractAddress].push(dataHash);

        emit CCIPDataStored(contractAddress, dataHash, msg.sender);
    }

    /**
     * @dev Gets CCIP-compatible data for a contract
     * @param contractAddress The address of the contract
     * @return The CCIP-compatible data
     */
    function getCCIPData(address contractAddress) external view returns (CCIPCompatibleData memory) {
        return ccipData[contractAddress];
    }

    /**
     * @dev Gets all data hashes for a contract
     * @param contractAddress The address of the contract
     * @return Array of data hashes
     */
    function getContractDataHashes(address contractAddress) external view returns (bytes32[] memory) {
        return contractDataHashes[contractAddress];
    }

    // =======================================================================
    // RESOLVER INTEGRATION
    // =======================================================================

    /**
     * @dev Syncs contract metadata with ENS resolver
     * @param contractAddress The address of the contract
     * @param resolverAddress The address of the resolver
     */
    function syncWithENSResolver(address contractAddress, address resolverAddress) 
        external 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
    {
        require(contractAddress != address(0), "Invalid contract address");
        require(resolverAddress != address(0), "Invalid resolver address");
        require(hasContractMetadata[contractAddress], "Contract metadata not registered");

        // In a real implementation, this would sync with the actual ENS resolver
        // For now, we just emit an event
        emit MetadataSynced(contractAddress, resolverAddress, msg.sender);
    }

    // =======================================================================
    // ADMIN FUNCTIONS
    // =======================================================================

    /**
     * @dev Adds a new supported text record key
     * @param key The text record key
     * @param maxLength The maximum length for the key
     * @param validationRule The validation rule for the key
     */
    function addSupportedTextRecordKey(string memory key, uint256 maxLength, string memory validationRule) external onlyOwner {
        require(bytes(key).length > 0, "Key cannot be empty");
        require(maxLength > 0, "Max length must be greater than 0");
        
        supportedTextRecordKeys[key] = true;
        maxTextRecordLengths[key] = maxLength;
        textRecordValidationRules[key] = validationRule;
    }

    /**
     * @dev Removes a supported text record key
     * @param key The text record key
     */
    function removeSupportedTextRecordKey(string memory key) external onlyOwner {
        supportedTextRecordKeys[key] = false;
        maxTextRecordLengths[key] = 0;
        textRecordValidationRules[key] = "";
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
     * @return totalContracts Total contracts with metadata
     * @return totalRecords Total text records
     * @return supportedKeys Number of supported text record keys
     */
    function getStatistics() external view returns (
        uint256 totalContracts,
        uint256 totalRecords,
        uint256 supportedKeys
    ) {
        totalContracts = totalContracts;
        totalRecords = totalTextRecords;
        
        string[] memory keys = this.getStandardTextRecordKeys();
        supportedKeys = keys.length;
    }

    /**
     * @dev Checks if a contract has metadata registered
     * @param contractAddress The address of the contract
     * @return True if the contract has metadata registered
     */
    function hasContractMetadataRegistered(address contractAddress) external view returns (bool) {
        return hasContractMetadata[contractAddress];
    }

    /**
     * @dev Gets text record count by key
     * @param key The text record key
     * @return The count of records with this key
     */
    function getTextRecordCountByKey(string memory key) external view returns (uint256) {
        return textRecordCountsByKey[key];
    }

    // =======================================================================
    // HELPER FUNCTIONS
    // =======================================================================

    /**
     * @dev Converts address to string
     * @param addr The address to convert
     * @return The string representation of the address
     */
    function _addressToString(address addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}




