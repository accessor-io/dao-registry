// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IENS - ENS Interface Definitions
 * @dev Standard interfaces for ENS integration following ENS-METADATA-TOOLS-REPO standards
 */

/**
 * @title IERC173 - Ownership Standard Interface
 * @dev Interface for ownership management in contracts
 */
interface IERC173 {
    /**
     * @dev Emitted when ownership of a contract changes
     * @param previousOwner The address of the previous owner
     * @param newOwner The address of the new owner
     */
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Returns the address of the current owner
     * @return The address of the current owner
     */
    function owner() external view returns (address);

    /**
     * @dev Transfers ownership of the contract to a new account
     * @param newOwner The address to transfer ownership to
     */
    function transferOwnership(address newOwner) external;
}

/**
 * @title IReverseClaimer - Reverse Record Claiming Interface
 * @dev Interface for claiming reverse ENS records
 */
interface IReverseClaimer {
    /**
     * @dev Emitted when a reverse record is claimed
     * @param contractAddress The address of the contract claiming the reverse record
     * @param ensName The ENS name being claimed
     * @param claimedBy The address that claimed the reverse record
     */
    event ReverseRecordClaimed(address indexed contractAddress, string ensName, address indexed claimedBy);

    /**
     * @dev Claims a reverse ENS record for this contract
     * @param ensName The ENS name to claim as reverse record
     */
    function claimReverse(string calldata ensName) external;

    /**
     * @dev Sets a reverse ENS record for this contract
     * @param ensName The ENS name to set as reverse record
     */
    function setReverseRecord(string calldata ensName) external;

    /**
     * @dev Gets the current reverse ENS record for this contract
     * @return The current reverse ENS name
     */
    function getReverseRecord() external view returns (string memory);
}

/**
 * @title IENSTextRecords - ENS Text Records Interface
 * @dev Interface for managing ENS text records
 */
interface IENSTextRecords {
    /**
     * @dev Emitted when a text record is set
     * @param contractAddress The address of the contract
     * @param key The text record key
     * @param value The text record value
     * @param setBy The address that set the record
     */
    event TextRecordSet(address indexed contractAddress, string indexed key, string value, address indexed setBy);

    /**
     * @dev Emitted when text records are batch set
     * @param contractAddress The address of the contract
     * @param keys Array of text record keys
     * @param values Array of text record values
     * @param setBy The address that set the records
     */
    event TextRecordsBatchSet(address indexed contractAddress, string[] keys, string[] values, address indexed setBy);

    /**
     * @dev Sets a text record for this contract
     * @param key The text record key
     * @param value The text record value
     */
    function setTextRecord(string calldata key, string calldata value) external;

    /**
     * @dev Gets a text record for this contract
     * @param key The text record key
     * @return The text record value
     */
    function getTextRecord(string calldata key) external view returns (string memory);

    /**
     * @dev Sets multiple text records for this contract
     * @param keys Array of text record keys
     * @param values Array of text record values
     */
    function batchSetTextRecords(string[] calldata keys, string[] calldata values) external;

    /**
     * @dev Gets multiple text records for this contract
     * @param keys Array of text record keys
     * @return Array of text record values
     */
    function batchGetTextRecords(string[] calldata keys) external view returns (string[] memory);

    /**
     * @dev Checks if a text record exists for this contract
     * @param key The text record key
     * @return True if the record exists
     */
    function hasTextRecord(string calldata key) external view returns (bool);
}

/**
 * @title IENSResolver - ENS Resolver Interface
 * @dev Interface for ENS resolver integration
 */
interface IENSResolver {
    /**
     * @dev Emitted when resolver is set for a contract
     * @param contractAddress The address of the contract
     * @param resolverAddress The address of the resolver
     * @param setBy The address that set the resolver
     */
    event ResolverSet(address indexed contractAddress, address indexed resolverAddress, address indexed setBy);

    /**
     * @dev Sets the resolver for this contract
     * @param resolverAddress The address of the resolver
     */
    function setResolver(address resolverAddress) external;

    /**
     * @dev Gets the resolver for this contract
     * @return The address of the resolver
     */
    function getResolver() external view returns (address);

    /**
     * @dev Syncs contract data with ENS resolver
     */
    function syncWithResolver() external;

    /**
     * @dev Checks if contract is synced with resolver
     * @return True if synced
     */
    function isSyncedWithResolver() external view returns (bool);
}

/**
 * @title IENSIntegration - Complete ENS Integration Interface
 * @dev Combines all ENS interfaces for complete integration
 */
interface IENSIntegration is IERC173, IReverseClaimer, IENSTextRecords, IENSResolver {
    /**
     * @dev Emitted when ENS integration is enabled/disabled
     * @param contractAddress The address of the contract
     * @param enabled Whether ENS integration is enabled
     * @param setBy The address that changed the setting
     */
    event ENSIntegrationToggled(address indexed contractAddress, bool enabled, address indexed setBy);

    /**
     * @dev Enables or disables ENS integration for this contract
     * @param enabled Whether to enable ENS integration
     */
    function setENSIntegration(bool enabled) external;

    /**
     * @dev Checks if ENS integration is enabled for this contract
     * @return True if ENS integration is enabled
     */
    function isENSIntegrationEnabled() external view returns (bool);

    /**
     * @dev Gets all ENS-related information for this contract
     * @return ensName The ENS name
     * @return reverseRecord The reverse record
     * @return resolverAddress The resolver address
     * @return textRecordCount The number of text records
     */
    function getENSInfo() external view returns (
        string memory ensName,
        string memory reverseRecord,
        address resolverAddress,
        uint256 textRecordCount
    );
}




