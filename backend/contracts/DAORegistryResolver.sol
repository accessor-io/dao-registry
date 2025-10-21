// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title DAORegistryResolver
 * @dev Custom ENS resolver specifically designed for DAO Registry contracts
 * 
 * Implements ENS resolver interfaces:
 * - IAddrResolver - Address resolution
 * - ITextResolver - Text record resolution
 * - IContentHashResolver - Content hash resolution
 * - IPubkeyResolver - Public key resolution
 * 
 * Integration points:
 * - Connects to DAORegistry for DAO-specific data
 * - Connects to ENSMetadataService for contract metadata
 * - Provides caching for gas optimization
 * - Emits events for off-chain syncing
 */

// ENS Resolver Interfaces
interface IAddrResolver {
    event AddrChanged(bytes32 indexed node, address a);
    function addr(bytes32 node) external view returns (address);
}

interface ITextResolver {
    event TextChanged(bytes32 indexed node, string indexed key, string value);
    function text(bytes32 node, string calldata key) external view returns (string memory);
}

interface IContentHashResolver {
    event ContenthashChanged(bytes32 indexed node, bytes hash);
    function contenthash(bytes32 node) external view returns (bytes memory);
}

interface IPubkeyResolver {
    event PubkeyChanged(bytes32 indexed node, bytes32 x, bytes32 y);
    function pubkey(bytes32 node) external view returns (bytes32 x, bytes32 y);
}

interface INameResolver {
    event NameChanged(bytes32 indexed node, string name);
    function name(bytes32 node) external view returns (string memory);
}

interface IInterfaceResolver {
    function supportsInterface(bytes4 interfaceID) external pure returns (bool);
}

interface IMulticallable {
    function multicall(bytes[] calldata data) external returns (bytes[] memory results);
}

contract DAORegistryResolver is 
    Ownable, 
    ReentrancyGuard, 
    Pausable,
    IAddrResolver,
    ITextResolver,
    IContentHashResolver,
    IPubkeyResolver,
    INameResolver,
    IInterfaceResolver,
    IMulticallable
{
    using Strings for string;

    // =======================================================================
    // STRUCTS
    // =======================================================================

    struct ResolverRecord {
        address addr;                   // Address record
        string name;                    // Name record
        bytes contenthash;              // Content hash record
        bytes32 pubkeyX;                // Public key X coordinate
        bytes32 pubkeyY;                // Public key Y coordinate
        mapping(string => string) textRecords; // Text records
        uint256 lastUpdated;            // Last update timestamp
        bool isActive;                  // Whether the record is active
    }

    struct CacheEntry {
        bytes32 data;                   // Cached data
        uint256 timestamp;              // Cache timestamp
        uint256 ttl;                    // Time to live
    }

    // =======================================================================
    // STATE VARIABLES
    // =======================================================================

    // ENS Registry address
    address public ensRegistry;
    
    // DAO Registry and Metadata Service addresses
    address public daoRegistry;
    address public metadataService;
    
    // Node to resolver record mapping
    mapping(bytes32 => ResolverRecord) public records;
    
    // Cache for gas optimization
    mapping(bytes32 => CacheEntry) public cache;
    
    // Authorized callers (for automated updates)
    mapping(address => bool) public authorizedCallers;
    
    // Statistics
    uint256 public totalRecords;
    uint256 public totalTextRecords;
    uint256 public cacheHits;
    uint256 public cacheMisses;
    
    // Cache configuration
    uint256 public defaultCacheTTL = 300; // 5 minutes
    uint256 public maxCacheTTL = 3600;    // 1 hour
    
    // =======================================================================
    // EVENTS
    // =======================================================================

    event AddrChanged(bytes32 indexed node, address a);
    event TextChanged(bytes32 indexed node, string indexed key, string value);
    event ContenthashChanged(bytes32 indexed node, bytes hash);
    event PubkeyChanged(bytes32 indexed node, bytes32 x, bytes32 y);
    event NameChanged(bytes32 indexed node, string name);
    event RecordCreated(bytes32 indexed node, address indexed creator);
    event RecordUpdated(bytes32 indexed node, address indexed updater);
    event CacheUpdated(bytes32 indexed node, bytes32 data, uint256 ttl);
    event AuthorizedCallerAdded(address indexed caller, address indexed addedBy);
    event AuthorizedCallerRemoved(address indexed caller, address indexed removedBy);

    // =======================================================================
    // MODIFIERS
    // =======================================================================

    modifier onlyAuthorized() {
        require(
            authorizedCallers[msg.sender] || 
            msg.sender == owner() || 
            msg.sender == ensRegistry,
            "Not authorized"
        );
        _;
    }

    modifier onlyValidNode(bytes32 node) {
        require(node != bytes32(0), "Invalid node");
        _;
    }

    modifier onlyValidTextRecord(string memory key, string memory value) {
        require(bytes(key).length > 0, "Text record key cannot be empty");
        require(bytes(value).length > 0, "Text record value cannot be empty");
        require(bytes(value).length <= 1000, "Text record value too long");
        _;
    }

    // =======================================================================
    // CONSTRUCTOR
    // =======================================================================

    constructor(
        address _ensRegistry,
        address _daoRegistry,
        address _metadataService
    ) {
        require(_ensRegistry != address(0), "Invalid ENS registry address");
        require(_daoRegistry != address(0), "Invalid DAO registry address");
        require(_metadataService != address(0), "Invalid metadata service address");

        ensRegistry = _ensRegistry;
        daoRegistry = _daoRegistry;
        metadataService = _metadataService;
        
        // Set owner as authorized caller
        authorizedCallers[msg.sender] = true;
    }

    // =======================================================================
    // ENS RESOLVER INTERFACES
    // =======================================================================

    /**
     * @dev Sets the address associated with an ENS node
     * @param node The ENS node to update
     * @param addr The address to set
     */
    function setAddr(bytes32 node, address addr) 
        external 
        onlyAuthorized 
        onlyValidNode(node) 
        nonReentrant 
        whenNotPaused 
    {
        ResolverRecord storage record = records[node];
        
        if (!record.isActive) {
            record.isActive = true;
            totalRecords++;
            emit RecordCreated(node, msg.sender);
        }
        
        record.addr = addr;
        record.lastUpdated = block.timestamp;
        
        // Update cache
        _updateCache(node, bytes32(uint256(uint160(addr))), defaultCacheTTL);
        
        emit AddrChanged(node, addr);
        emit RecordUpdated(node, msg.sender);
    }

    /**
     * @dev Returns the address associated with an ENS node
     * @param node The ENS node to query
     * @return The associated address
     */
    function addr(bytes32 node) external view override returns (address) {
        // Check cache first
        if (_isCacheValid(node)) {
            cacheHits++;
            return address(uint160(uint256(cache[node].data)));
        }
        
        cacheMisses++;
        return records[node].addr;
    }

    /**
     * @dev Sets the text record associated with an ENS node
     * @param node The ENS node to update
     * @param key The text record key
     * @param value The text record value
     */
    function setText(bytes32 node, string calldata key, string calldata value) 
        external 
        onlyAuthorized 
        onlyValidNode(node) 
        onlyValidTextRecord(key, value) 
        nonReentrant 
        whenNotPaused 
    {
        ResolverRecord storage record = records[node];
        
        if (!record.isActive) {
            record.isActive = true;
            totalRecords++;
            emit RecordCreated(node, msg.sender);
        }
        
        // Check if this is a new text record
        bool isNewRecord = bytes(record.textRecords[key]).length == 0;
        
        record.textRecords[key] = value;
        record.lastUpdated = block.timestamp;
        
        if (isNewRecord) {
            totalTextRecords++;
        }
        
        // Update cache
        _updateCache(node, keccak256(abi.encodePacked(key, value)), defaultCacheTTL);
        
        emit TextChanged(node, key, value);
        emit RecordUpdated(node, msg.sender);
    }

    /**
     * @dev Returns the text record associated with an ENS node
     * @param node The ENS node to query
     * @param key The text record key
     * @return The associated text record value
     */
    function text(bytes32 node, string calldata key) external view override returns (string memory) {
        return records[node].textRecords[key];
    }

    /**
     * @dev Sets the content hash associated with an ENS node
     * @param node The ENS node to update
     * @param hash The content hash to set
     */
    function setContenthash(bytes32 node, bytes calldata hash) 
        external 
        onlyAuthorized 
        onlyValidNode(node) 
        nonReentrant 
        whenNotPaused 
    {
        ResolverRecord storage record = records[node];
        
        if (!record.isActive) {
            record.isActive = true;
            totalRecords++;
            emit RecordCreated(node, msg.sender);
        }
        
        record.contenthash = hash;
        record.lastUpdated = block.timestamp;
        
        // Update cache
        _updateCache(node, keccak256(hash), defaultCacheTTL);
        
        emit ContenthashChanged(node, hash);
        emit RecordUpdated(node, msg.sender);
    }

    /**
     * @dev Returns the content hash associated with an ENS node
     * @param node The ENS node to query
     * @return The associated content hash
     */
    function contenthash(bytes32 node) external view override returns (bytes memory) {
        return records[node].contenthash;
    }

    /**
     * @dev Sets the public key associated with an ENS node
     * @param node The ENS node to update
     * @param x The X coordinate of the public key
     * @param y The Y coordinate of the public key
     */
    function setPubkey(bytes32 node, bytes32 x, bytes32 y) 
        external 
        onlyAuthorized 
        onlyValidNode(node) 
        nonReentrant 
        whenNotPaused 
    {
        ResolverRecord storage record = records[node];
        
        if (!record.isActive) {
            record.isActive = true;
            totalRecords++;
            emit RecordCreated(node, msg.sender);
        }
        
        record.pubkeyX = x;
        record.pubkeyY = y;
        record.lastUpdated = block.timestamp;
        
        // Update cache
        _updateCache(node, keccak256(abi.encodePacked(x, y)), defaultCacheTTL);
        
        emit PubkeyChanged(node, x, y);
        emit RecordUpdated(node, msg.sender);
    }

    /**
     * @dev Returns the public key associated with an ENS node
     * @param node The ENS node to query
     * @return x The X coordinate of the public key
     * @return y The Y coordinate of the public key
     */
    function pubkey(bytes32 node) external view override returns (bytes32 x, bytes32 y) {
        ResolverRecord storage record = records[node];
        return (record.pubkeyX, record.pubkeyY);
    }

    /**
     * @dev Sets the name associated with an ENS node
     * @param node The ENS node to update
     * @param name The name to set
     */
    function setName(bytes32 node, string calldata name) 
        external 
        onlyAuthorized 
        onlyValidNode(node) 
        nonReentrant 
        whenNotPaused 
    {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(name).length <= 255, "Name too long");

        ResolverRecord storage record = records[node];
        
        if (!record.isActive) {
            record.isActive = true;
            totalRecords++;
            emit RecordCreated(node, msg.sender);
        }
        
        record.name = name;
        record.lastUpdated = block.timestamp;
        
        // Update cache
        _updateCache(node, keccak256(bytes(name)), defaultCacheTTL);
        
        emit NameChanged(node, name);
        emit RecordUpdated(node, msg.sender);
    }

    /**
     * @dev Returns the name associated with an ENS node
     * @param node The ENS node to query
     * @return The associated name
     */
    function name(bytes32 node) external view override returns (string memory) {
        return records[node].name;
    }

    // =======================================================================
    // BATCH OPERATIONS
    // =======================================================================

    /**
     * @dev Sets multiple text records for an ENS node
     * @param node The ENS node to update
     * @param keys Array of text record keys
     * @param values Array of text record values
     */
    function setTextRecords(bytes32 node, string[] calldata keys, string[] calldata values) 
        external 
        onlyAuthorized 
        onlyValidNode(node) 
        nonReentrant 
        whenNotPaused 
    {
        require(keys.length == values.length, "Keys and values arrays must have the same length");
        require(keys.length > 0, "Arrays cannot be empty");

        ResolverRecord storage record = records[node];
        
        if (!record.isActive) {
            record.isActive = true;
            totalRecords++;
            emit RecordCreated(node, msg.sender);
        }

        for (uint256 i = 0; i < keys.length; i++) {
            require(bytes(keys[i]).length > 0, "Text record key cannot be empty");
            require(bytes(values[i]).length > 0, "Text record value cannot be empty");
            require(bytes(values[i]).length <= 1000, "Text record value too long");

            bool isNewRecord = bytes(record.textRecords[keys[i]]).length == 0;
            
            record.textRecords[keys[i]] = values[i];
            
            if (isNewRecord) {
                totalTextRecords++;
            }
            
            emit TextChanged(node, keys[i], values[i]);
        }

        record.lastUpdated = block.timestamp;
        emit RecordUpdated(node, msg.sender);
    }

    /**
     * @dev Gets multiple text records for an ENS node
     * @param node The ENS node to query
     * @param keys Array of text record keys
     * @return Array of text record values
     */
    function getTextRecords(bytes32 node, string[] calldata keys) 
        external 
        view 
        returns (string[] memory) 
    {
        string[] memory values = new string[](keys.length);
        ResolverRecord storage record = records[node];
        
        for (uint256 i = 0; i < keys.length; i++) {
            values[i] = record.textRecords[keys[i]];
        }
        
        return values;
    }

    // =======================================================================
    // DAO REGISTRY INTEGRATION
    // =======================================================================

    /**
     * @dev Syncs DAO data from DAO Registry to ENS resolver
     * @param node The ENS node to sync
     * @param daoId The DAO ID in the DAO Registry
     */
    function syncDAORecord(bytes32 node, uint256 daoId) 
        external 
        onlyAuthorized 
        onlyValidNode(node) 
        nonReentrant 
        whenNotPaused 
    {
        // In a real implementation, this would call the DAO Registry contract
        // to get DAO information and sync it to the resolver
        
        ResolverRecord storage record = records[node];
        
        if (!record.isActive) {
            record.isActive = true;
            totalRecords++;
            emit RecordCreated(node, msg.sender);
        }
        
        record.lastUpdated = block.timestamp;
        emit RecordUpdated(node, msg.sender);
    }

    /**
     * @dev Syncs contract metadata from Metadata Service to ENS resolver
     * @param node The ENS node to sync
     * @param contractAddress The contract address
     */
    function syncContractMetadata(bytes32 node, address contractAddress) 
        external 
        onlyAuthorized 
        onlyValidNode(node) 
        nonReentrant 
        whenNotPaused 
    {
        // In a real implementation, this would call the Metadata Service contract
        // to get contract metadata and sync it to the resolver
        
        ResolverRecord storage record = records[node];
        
        if (!record.isActive) {
            record.isActive = true;
            totalRecords++;
            emit RecordCreated(node, msg.sender);
        }
        
        record.lastUpdated = block.timestamp;
        emit RecordUpdated(node, msg.sender);
    }

    // =======================================================================
    // CACHE MANAGEMENT
    // =======================================================================

    /**
     * @dev Updates cache for a node
     * @param node The ENS node
     * @param data The data to cache
     * @param ttl The time to live for the cache
     */
    function _updateCache(bytes32 node, bytes32 data, uint256 ttl) internal {
        require(ttl <= maxCacheTTL, "TTL exceeds maximum");
        
        cache[node] = CacheEntry({
            data: data,
            timestamp: block.timestamp,
            ttl: ttl
        });
        
        emit CacheUpdated(node, data, ttl);
    }

    /**
     * @dev Checks if cache is valid for a node
     * @param node The ENS node
     * @return True if cache is valid
     */
    function _isCacheValid(bytes32 node) internal view returns (bool) {
        CacheEntry storage entry = cache[node];
        return entry.timestamp > 0 && 
               block.timestamp <= entry.timestamp + entry.ttl;
    }

    /**
     * @dev Clears cache for a node
     * @param node The ENS node
     */
    function clearCache(bytes32 node) external onlyAuthorized {
        delete cache[node];
    }

    /**
     * @dev Clears all cache
     */
    function clearAllCache() external onlyOwner {
        // In a real implementation, you might want to iterate through all nodes
        // For now, we'll just reset the cache hit/miss counters
        cacheHits = 0;
        cacheMisses = 0;
    }

    // =======================================================================
    // AUTHORIZATION MANAGEMENT
    // =======================================================================

    /**
     * @dev Adds an authorized caller
     * @param caller The address to authorize
     */
    function addAuthorizedCaller(address caller) external onlyOwner {
        require(caller != address(0), "Invalid caller address");
        authorizedCallers[caller] = true;
        emit AuthorizedCallerAdded(caller, msg.sender);
    }

    /**
     * @dev Removes an authorized caller
     * @param caller The address to deauthorize
     */
    function removeAuthorizedCaller(address caller) external onlyOwner {
        require(caller != address(0), "Invalid caller address");
        authorizedCallers[caller] = false;
        emit AuthorizedCallerRemoved(caller, msg.sender);
    }

    /**
     * @dev Checks if an address is authorized
     * @param caller The address to check
     * @return True if authorized
     */
    function isAuthorized(address caller) external view returns (bool) {
        return authorizedCallers[caller] || caller == owner();
    }

    // =======================================================================
    // INTERFACE SUPPORT
    // =======================================================================

    /**
     * @dev Checks if the contract supports an interface
     * @param interfaceID The interface ID to check
     * @return True if the interface is supported
     */
    function supportsInterface(bytes4 interfaceID) external pure override returns (bool) {
        return interfaceID == type(IAddrResolver).interfaceId ||
               interfaceID == type(ITextResolver).interfaceId ||
               interfaceID == type(IContentHashResolver).interfaceId ||
               interfaceID == type(IPubkeyResolver).interfaceId ||
               interfaceID == type(INameResolver).interfaceId ||
               interfaceID == type(IInterfaceResolver).interfaceId ||
               interfaceID == type(IMulticallable).interfaceId;
    }

    /**
     * @dev Executes multiple function calls in a single transaction
     * @param data Array of encoded function calls
     * @return results Array of return values
     */
    function multicall(bytes[] calldata data) external override returns (bytes[] memory results) {
        results = new bytes[](data.length);
        
        for (uint256 i = 0; i < data.length; i++) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            require(success, "Multicall failed");
            results[i] = result;
        }
    }

    // =======================================================================
    // ADMIN FUNCTIONS
    // =======================================================================

    /**
     * @dev Updates the DAO Registry address
     * @param newDAORegistry The new DAO Registry address
     */
    function updateDAORegistry(address newDAORegistry) external onlyOwner {
        require(newDAORegistry != address(0), "Invalid DAO registry address");
        daoRegistry = newDAORegistry;
    }

    /**
     * @dev Updates the Metadata Service address
     * @param newMetadataService The new Metadata Service address
     */
    function updateMetadataService(address newMetadataService) external onlyOwner {
        require(newMetadataService != address(0), "Invalid metadata service address");
        metadataService = newMetadataService;
    }

    /**
     * @dev Updates the default cache TTL
     * @param newTTL The new default TTL
     */
    function updateDefaultCacheTTL(uint256 newTTL) external onlyOwner {
        require(newTTL <= maxCacheTTL, "TTL exceeds maximum");
        defaultCacheTTL = newTTL;
    }

    /**
     * @dev Updates the maximum cache TTL
     * @param newMaxTTL The new maximum TTL
     */
    function updateMaxCacheTTL(uint256 newMaxTTL) external onlyOwner {
        require(newMaxTTL > 0, "Max TTL must be greater than 0");
        maxCacheTTL = newMaxTTL;
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
     * @dev Gets resolver statistics
     * @return totalRecords Total number of records
     * @return totalTextRecords Total number of text records
     * @return cacheHits Number of cache hits
     * @return cacheMisses Number of cache misses
     * @return cacheHitRate Cache hit rate (percentage)
     */
    function getStatistics() external view returns (
        uint256 totalRecords,
        uint256 totalTextRecords,
        uint256 cacheHits,
        uint256 cacheMisses,
        uint256 cacheHitRate
    ) {
        totalRecords = totalRecords;
        totalTextRecords = totalTextRecords;
        cacheHits = cacheHits;
        cacheMisses = cacheMisses;
        
        uint256 totalCacheAccess = cacheHits + cacheMisses;
        cacheHitRate = totalCacheAccess > 0 ? (cacheHits * 100) / totalCacheAccess : 0;
    }

    /**
     * @dev Gets record information for a node
     * @param node The ENS node
     * @return addr The address record
     * @return name The name record
     * @return contenthash The content hash record
     * @return pubkeyX The public key X coordinate
     * @return pubkeyY The public key Y coordinate
     * @return lastUpdated The last update timestamp
     * @return isActive Whether the record is active
     */
    function getRecordInfo(bytes32 node) external view returns (
        address addr,
        string memory name,
        bytes memory contenthash,
        bytes32 pubkeyX,
        bytes32 pubkeyY,
        uint256 lastUpdated,
        bool isActive
    ) {
        ResolverRecord storage record = records[node];
        return (
            record.addr,
            record.name,
            record.contenthash,
            record.pubkeyX,
            record.pubkeyY,
            record.lastUpdated,
            record.isActive
        );
    }

    /**
     * @dev Gets cache information for a node
     * @param node The ENS node
     * @return data The cached data
     * @return timestamp The cache timestamp
     * @return ttl The time to live
     * @return isValid Whether the cache is valid
     */
    function getCacheInfo(bytes32 node) external view returns (
        bytes32 data,
        uint256 timestamp,
        uint256 ttl,
        bool isValid
    ) {
        CacheEntry storage entry = cache[node];
        return (
            entry.data,
            entry.timestamp,
            entry.ttl,
            _isCacheValid(node)
        );
    }

    /**
     * @dev Checks if a record exists for a node
     * @param node The ENS node
     * @return True if the record exists
     */
    function hasRecord(bytes32 node) external view returns (bool) {
        return records[node].isActive;
    }
}




