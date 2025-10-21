// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IENSMetadata - ENS Metadata Interface Definitions
 * @dev Standard interfaces for ENS metadata management following ENS-METADATA-TOOLS-REPO standards
 */

/**
 * @title ITextRecordValidation - Text Record Validation Interface
 * @dev Interface for validating ENS text records
 */
interface ITextRecordValidation {
    /**
     * @dev Emitted when text record validation fails
     * @param key The text record key
     * @param value The text record value
     * @param reason The validation failure reason
     */
    event TextRecordValidationFailed(string indexed key, string value, string reason);

    /**
     * @dev Validates a text record
     * @param key The text record key
     * @param value The text record value
     * @return isValid True if the record is valid
     * @return reason The validation failure reason if invalid
     */
    function validateTextRecord(string calldata key, string calldata value) external pure returns (bool isValid, string memory reason);

    /**
     * @dev Gets the maximum length for a text record key
     * @param key The text record key
     * @return The maximum allowed length
     */
    function getMaxLength(string calldata key) external pure returns (uint256);

    /**
     * @dev Checks if a text record key is supported
     * @param key The text record key
     * @return True if the key is supported
     */
    function isSupportedKey(string calldata key) external pure returns (bool);
}

/**
 * @title IContractMetadata - Contract Metadata Interface
 * @dev Interface for managing contract metadata
 */
interface IContractMetadata {
    /**
     * @dev Emitted when contract metadata is updated
     * @param contractAddress The address of the contract
     * @param metadataHash The hash of the updated metadata
     * @param updatedBy The address that updated the metadata
     */
    event ContractMetadataUpdated(address indexed contractAddress, bytes32 indexed metadataHash, address indexed updatedBy);

    /**
     * @dev Structure for contract metadata
     */
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

    /**
     * @dev Structure for text record
     */
    struct TextRecord {
        string key;                     // Text record key
        string value;                   // Text record value
        uint256 updatedAt;              // Last update timestamp
        address updatedBy;              // Address that updated the record
    }

    /**
     * @dev Sets contract metadata
     * @param metadata The contract metadata
     */
    function setContractMetadata(ContractMetadata calldata metadata) external;

    /**
     * @dev Gets contract metadata
     * @return The contract metadata
     */
    function getContractMetadata() external view returns (ContractMetadata memory);

    /**
     * @dev Sets multiple text records
     * @param records Array of text records
     */
    function setTextRecords(TextRecord[] calldata records) external;

    /**
     * @dev Gets all text records
     * @return Array of text records
     */
    function getTextRecords() external view returns (TextRecord[] memory);

    /**
     * @dev Gets text record by key
     * @param key The text record key
     * @return The text record
     */
    function getTextRecord(string calldata key) external view returns (TextRecord memory);

    /**
     * @dev Gets metadata hash
     * @return The hash of the current metadata
     */
    function getMetadataHash() external view returns (bytes32);
}

/**
 * @title IENSStandardTextRecords - Standard ENS Text Records Interface
 * @dev Interface for standard ENS text record keys
 */
interface IENSStandardTextRecords {
    /**
     * @dev Standard ENS text record keys
     */
    string constant DESCRIPTION_KEY = "description";
    string constant URL_KEY = "url";
    string constant AVATAR_KEY = "avatar";
    string constant EMAIL_KEY = "email";
    string constant NOTICE_KEY = "notice";
    string constant KEYWORDS_KEY = "keywords";
    string constant TWITTER_KEY = "com.twitter";
    string constant GITHUB_KEY = "com.github";
    string constant DISCORD_KEY = "com.discord";
    string constant TELEGRAM_KEY = "org.telegram";
    string constant REDDIT_KEY = "com.reddit";
    string constant YOUTUBE_KEY = "com.youtube";
    string constant MEDIUM_KEY = "com.medium";

    /**
     * @dev Gets all standard text record keys
     * @return Array of standard text record keys
     */
    function getStandardTextRecordKeys() external pure returns (string[] memory);

    /**
     * @dev Checks if a key is a standard text record key
     * @param key The text record key
     * @return True if the key is standard
     */
    function isStandardTextRecordKey(string calldata key) external pure returns (bool);

    /**
     * @dev Gets the category of a standard text record key
     * @param key The text record key
     * @return The category (basic, social, custom)
     */
    function getTextRecordKeyCategory(string calldata key) external pure returns (string memory);
}

/**
 * @title IENSMetadataEvents - ENS Metadata Events Interface
 * @dev Interface for ENS metadata events
 */
interface IENSMetadataEvents {
    /**
     * @dev Emitted when ENS name is set
     * @param contractAddress The address of the contract
     * @param ensName The ENS name
     * @param setBy The address that set the name
     */
    event ENSNameSet(address indexed contractAddress, string ensName, address indexed setBy);

    /**
     * @dev Emitted when text record is updated
     * @param contractAddress The address of the contract
     * @param key The text record key
     * @param oldValue The old value
     * @param newValue The new value
     * @param updatedBy The address that updated the record
     */
    event TextRecordUpdated(address indexed contractAddress, string indexed key, string oldValue, string newValue, address indexed updatedBy);

    /**
     * @dev Emitted when metadata is validated
     * @param contractAddress The address of the contract
     * @param isValid Whether the metadata is valid
     * @param validationErrors Array of validation errors
     * @param validatedBy The address that validated the metadata
     */
    event MetadataValidated(address indexed contractAddress, bool isValid, string[] validationErrors, address indexed validatedBy);

    /**
     * @dev Emitted when metadata is synced with external resolver
     * @param contractAddress The address of the contract
     * @param resolverAddress The address of the resolver
     * @param syncedBy The address that synced the metadata
     */
    event MetadataSynced(address indexed contractAddress, address indexed resolverAddress, address indexed syncedBy);
}

/**
 * @title IENSMetadataManager - Complete ENS Metadata Management Interface
 * @dev Combines all ENS metadata interfaces for complete management
 */
interface IENSMetadataManager is 
    ITextRecordValidation, 
    IContractMetadata, 
    IENSStandardTextRecords, 
    IENSMetadataEvents 
{
    /**
     * @dev Emitted when ENS metadata integration is enabled/disabled
     * @param contractAddress The address of the contract
     * @param enabled Whether ENS metadata integration is enabled
     * @param setBy The address that changed the setting
     */
    event ENSMetadataIntegrationToggled(address indexed contractAddress, bool enabled, address indexed setBy);

    /**
     * @dev Enables or disables ENS metadata integration
     * @param enabled Whether to enable ENS metadata integration
     */
    function setENSMetadataIntegration(bool enabled) external;

    /**
     * @dev Checks if ENS metadata integration is enabled
     * @return True if ENS metadata integration is enabled
     */
    function isENSMetadataIntegrationEnabled() external view returns (bool);

    /**
     * @dev Validates all current metadata
     * @return isValid True if all metadata is valid
     * @return errors Array of validation errors
     */
    function validateAllMetadata() external view returns (bool isValid, string[] memory errors);

    /**
     * @dev Gets complete ENS metadata information
     * @return metadata The contract metadata
     * @return textRecords Array of text records
     * @return ensName The ENS name
     * @return reverseRecord The reverse record
     * @return resolverAddress The resolver address
     * @return metadataHash The metadata hash
     */
    function getCompleteENSMetadata() external view returns (
        ContractMetadata memory metadata,
        TextRecord[] memory textRecords,
        string memory ensName,
        string memory reverseRecord,
        address resolverAddress,
        bytes32 metadataHash
    );
}




