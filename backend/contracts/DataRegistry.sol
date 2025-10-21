// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IENS.sol";

/**
 * @title RealTimeDataRegistry
 * @dev Manages real-time data points that require constant monitoring and event emission
 * 
 * This contract is specifically designed for data points that:
 * - Change frequently (price feeds, market data, governance votes, etc.)
 * - Require real-time event emission for off-chain monitoring
 * - Need CCIP compatibility for cross-chain data access
 * - Require high-frequency updates with minimal gas costs
 */
contract RealTimeDataRegistry is Ownable, ReentrancyGuard, IERC173 {
    using Strings for string;

    /**
     * @dev Data point types for real-time monitoring
     */
    enum DataPointType {
        PRICE_FEED,      // Token prices, exchange rates
        MARKET_DATA,      // Trading volume, market cap
        GOVERNANCE_VOTE,  // Active proposal votes
        TREASURY_BALANCE, // Real-time treasury updates
        TOKEN_METRICS,    // Holder count, supply changes
        NETWORK_STATS,    // Gas prices, block times
        SOCIAL_METRICS,   // Social engagement, sentiment
        DEFI_METRICS      // TVL, APY, yield rates
    }

    /**
     * @dev Update frequency for real-time data
     */
    enum UpdateFrequency {
        CONTINUOUS,    // Update on every change
        PER_BLOCK,     // Update per block
        PER_MINUTE,    // Update every minute
        PER_HOUR,      // Update every hour
        ON_EVENT       // Update only on specific events
    }

    /**
     * @dev Real-time data point structure
     */
    struct RealTimeDataPoint {
        string dataKey;           // Unique identifier (e.g., "ETH_PRICE", "DAO_VOTES")
        DataPointType dataType;   // Type of data point
        UpdateFrequency frequency; // Update frequency
        uint256 lastUpdateTime;   // Last update timestamp
        uint256 lastUpdateBlock;  // Last update block number
        address dataProvider;     // Address providing the data
        bool active;              // Whether data point is active
        uint256 updateCount;      // Number of updates
        string[] fieldNames;      // Field names for structured data
        bytes[] fieldValues;      // Field values (encoded)
        bytes32 dataHash;         // Hash of current data
        string metadata;          // Additional metadata (JSON)
        mapping(string => string) textRecords; // ENS text records for data point
        string ensName; // Associated ENS name
    }

    /**
     * @dev Event emission for real-time updates
     */
    struct DataUpdateEvent {
        string dataKey;
        uint256 timestamp;
        uint256 blockNumber;
        address dataProvider;
        bytes32 oldDataHash;
        bytes32 newDataHash;
        string[] fieldNames;
        bytes[] fieldValues;
        string metadata;
    }

    /**
     * @dev Events
     */
    event DataPointRegistered(
        string indexed dataKey,
        DataPointType indexed dataType,
        UpdateFrequency frequency,
        address indexed registeredBy
    );

    event DataPointUpdated(
        string indexed dataKey,
        uint256 timestamp,
        uint256 blockNumber,
        address indexed dataProvider,
        bytes32 oldDataHash,
        bytes32 newDataHash
    );

    event DataPointDeactivated(
        string indexed dataKey,
        address indexed deactivatedBy
    );

    event DataProviderAdded(
        address indexed provider,
        string[] allowedDataKeys,
        address indexed addedBy
    );

    event DataProviderRemoved(
        address indexed provider,
        address indexed removedBy
    );

    event BatchUpdate(
        string[] dataKeys,
        uint256 timestamp,
        address indexed dataProvider
    );

    /**
     * @dev State variables
     */
    mapping(string => RealTimeDataPoint) public dataPoints;
    mapping(string => bool) public hasDataPoint;
    mapping(DataPointType => string[]) public dataPointsByType;
    mapping(address => bool) public dataProviders;
    mapping(address => string[]) public providerDataKeys;
    mapping(string => address[]) public dataKeyProviders;
    
    // Event storage for off-chain processing
    mapping(string => DataUpdateEvent[]) public updateHistory;
    mapping(string => uint256) public updateHistoryCount;
    
    // Statistics
    uint256 public totalDataPoints;
    mapping(DataPointType => uint256) public dataPointsByTypeCount;
    mapping(UpdateFrequency => uint256) public dataPointsByFrequencyCount;

    /**
     * @dev Modifiers
     */
    modifier onlyDataProvider() {
        require(dataProviders[msg.sender] || owner() == msg.sender, "Not authorized data provider");
        _;
    }

    modifier dataPointExists(string memory dataKey) {
        require(hasDataPoint[dataKey], "Data point not registered");
        _;
    }

    modifier dataPointNotExists(string memory dataKey) {
        require(!hasDataPoint[dataKey], "Data point already registered");
        _;
    }

    /**
     * @dev Constructor
     */
    constructor() {
        // Set initial data providers
        dataProviders[msg.sender] = true;
    }

    /**
     * @dev Register a new real-time data point
     */
    function registerDataPoint(
        string memory dataKey,
        DataPointType dataType,
        UpdateFrequency frequency,
        string[] memory fieldNames,
        bytes[] memory fieldValues,
        string memory metadata
    ) external onlyDataProvider dataPointNotExists(dataKey) {
        require(bytes(dataKey).length > 0, "Data key cannot be empty");
        require(fieldNames.length == fieldValues.length, "Field names and values mismatch");
        
        bytes32 dataHash = keccak256(abi.encodePacked(
            dataKey,
            abi.encode(fieldNames),
            abi.encode(fieldValues),
            block.timestamp
        ));

        RealTimeDataPoint memory dataPoint = RealTimeDataPoint({
            dataKey: dataKey,
            dataType: dataType,
            frequency: frequency,
            lastUpdateTime: block.timestamp,
            lastUpdateBlock: block.number,
            dataProvider: msg.sender,
            active: true,
            updateCount: 0,
            fieldNames: fieldNames,
            fieldValues: fieldValues,
            dataHash: dataHash,
            metadata: metadata
        });

        dataPoints[dataKey] = dataPoint;
        hasDataPoint[dataKey] = true;
        dataPointsByType[dataType].push(dataKey);
        
        // Update provider mappings
        providerDataKeys[msg.sender].push(dataKey);
        dataKeyProviders[dataKey].push(msg.sender);
        
        // Update statistics
        totalDataPoints++;
        dataPointsByTypeCount[dataType]++;
        dataPointsByFrequencyCount[frequency]++;

        emit DataPointRegistered(dataKey, dataType, frequency, msg.sender);
    }

    /**
     * @dev Check if data point should be updated based on frequency
     */
    function _shouldUpdate(RealTimeDataPoint storage dataPoint) private view returns (bool) {
        if (dataPoint.frequency == UpdateFrequency.CONTINUOUS) {
            return true;
        } else if (dataPoint.frequency == UpdateFrequency.PER_BLOCK) {
            return block.number > dataPoint.lastUpdateBlock;
        } else if (dataPoint.frequency == UpdateFrequency.PER_MINUTE) {
            return block.timestamp >= dataPoint.lastUpdateTime + 60;
        } else if (dataPoint.frequency == UpdateFrequency.PER_HOUR) {
            return block.timestamp >= dataPoint.lastUpdateTime + 3600;
        }
        return false;
    }

    /**
     * @dev Update a real-time data point
     */
    function updateDataPoint(
        string memory dataKey,
        string[] memory fieldNames,
        bytes[] memory fieldValues,
        string memory metadata
    ) external onlyDataProvider dataPointExists(dataKey) {
        require(fieldNames.length == fieldValues.length, "Field names and values mismatch");
        
        RealTimeDataPoint storage dataPoint = dataPoints[dataKey];
        require(dataPoint.active, "Data point is not active");
        
        // Check if update is needed based on frequency
        if (!_shouldUpdate(dataPoint)) {
            return;
        }

        bytes32 oldDataHash = dataPoint.dataHash;
        
        // Calculate new data hash
        bytes32 newDataHash = keccak256(abi.encodePacked(
            dataKey,
            abi.encode(fieldNames),
            abi.encode(fieldValues),
            block.timestamp
        ));

        // Only update if data has actually changed
        if (oldDataHash != newDataHash) {
            // Update data point
            dataPoint.lastUpdateTime = block.timestamp;
            dataPoint.lastUpdateBlock = block.number;
            dataPoint.dataProvider = msg.sender;
            dataPoint.updateCount++;
            dataPoint.fieldNames = fieldNames;
            dataPoint.fieldValues = fieldValues;
            dataPoint.dataHash = newDataHash;
            dataPoint.metadata = metadata;

            // Store update event
            DataUpdateEvent memory updateEvent = DataUpdateEvent({
                dataKey: dataKey,
                timestamp: block.timestamp,
                blockNumber: block.number,
                dataProvider: msg.sender,
                oldDataHash: oldDataHash,
                newDataHash: newDataHash,
                fieldNames: fieldNames,
                fieldValues: fieldValues,
                metadata: metadata
            });

            updateHistory[dataKey].push(updateEvent);
            updateHistoryCount[dataKey]++;

            emit DataPointUpdated(
                dataKey,
                block.timestamp,
                block.number,
                msg.sender,
                oldDataHash,
                newDataHash
            );
        }
    }





    /**
     * @dev Get real-time data point
     */
    function getDataPoint(string memory dataKey) 
        external 
        view 
        dataPointExists(dataKey) 
        returns (RealTimeDataPoint memory) 
    {
        return dataPoints[dataKey];
    }

    /**
     * @dev Get data point update history
     */
    function getUpdateHistory(string memory dataKey, uint256 limit) 
        external 
        view 
        dataPointExists(dataKey) 
        returns (DataUpdateEvent[] memory) 
    {
        uint256 count = updateHistoryCount[dataKey];
        uint256 resultCount = count > limit ? limit : count;
        
        DataUpdateEvent[] memory history = new DataUpdateEvent[](resultCount);
        DataUpdateEvent[] storage events = updateHistory[dataKey];
        
        for (uint i = 0; i < resultCount; i++) {
            history[i] = events[count - 1 - i]; // Return most recent first
        }
        
        return history;
    }

    /**
     * @dev Get data points by type
     */
    function getDataPointsByType(DataPointType dataType) 
        external 
        view 
        returns (string[] memory) 
    {
        return dataPointsByType[dataType];
    }

    /**
     * @dev Get data points by frequency
     */
    function getDataPointsByFrequency(UpdateFrequency frequency) 
        external 
        view 
        returns (string[] memory) 
    {
        // This would require additional storage for efficient lookup
        // For now, return empty array
        return new string[](0);
    }

    /**
     * @dev Deactivate a data point
     */
    function deactivateDataPoint(string memory dataKey) 
        external 
        onlyDataProvider 
        dataPointExists(dataKey) 
    {
        RealTimeDataPoint storage dataPoint = dataPoints[dataKey];
        dataPoint.active = false;
        
        emit DataPointDeactivated(dataKey, msg.sender);
    }

    /**
     * @dev Add data provider
     */
    function addDataProvider(address provider, string[] memory allowedDataKeys) 
        external 
        onlyOwner 
    {
        dataProviders[provider] = true;
        
        for (uint i = 0; i < allowedDataKeys.length; i++) {
            if (hasDataPoint[allowedDataKeys[i]]) {
                dataKeyProviders[allowedDataKeys[i]].push(provider);
            }
        }
        
        emit DataProviderAdded(provider, allowedDataKeys, msg.sender);
    }

    /**
     * @dev Remove data provider
     */
    function removeDataProvider(address provider) external onlyOwner {
        dataProviders[provider] = false;
        
        emit DataProviderRemoved(provider, msg.sender);
    }

    // =======================================================================
    // ENS MANAGEMENT FUNCTIONS
    // =======================================================================

    /**
     * @dev Sets ENS name for a data point
     * @param dataKey The data point key
     * @param ensName The ENS name
     */
    function setDataPointENSName(string memory dataKey, string memory ensName) 
        external 
        onlyDataProvider 
        dataPointExists(dataKey) 
    {
        require(bytes(ensName).length > 0, "ENS name cannot be empty");
        dataPoints[dataKey].ensName = ensName;
    }

    /**
     * @dev Sets text record for a data point
     * @param dataKey The data point key
     * @param key The text record key
     * @param value The text record value
     */
    function setDataPointTextRecord(string memory dataKey, string memory key, string memory value) 
        external 
        onlyDataProvider 
        dataPointExists(dataKey) 
    {
        require(bytes(key).length > 0, "Text record key cannot be empty");
        require(bytes(value).length > 0, "Text record value cannot be empty");
        require(bytes(value).length <= 1000, "Text record value too long");
        
        dataPoints[dataKey].textRecords[key] = value;
    }

    /**
     * @dev Gets text record for a data point
     * @param dataKey The data point key
     * @param key The text record key
     * @return Text record value
     */
    function getDataPointTextRecord(string memory dataKey, string memory key) 
        external 
        view 
        dataPointExists(dataKey) 
        returns (string memory) 
    {
        return dataPoints[dataKey].textRecords[key];
    }

    /**
     * @dev Gets ENS name for a data point
     * @param dataKey The data point key
     * @return ENS name
     */
    function getDataPointENSName(string memory dataKey) 
        external 
        view 
        dataPointExists(dataKey) 
        returns (string memory) 
    {
        return dataPoints[dataKey].ensName;
    }

    /**
     * @dev Get statistics
     */
    function getStatistics() 
        external 
        view 
        returns (
            uint256 total,
            uint256 priceFeeds,
            uint256 marketData,
            uint256 governanceVotes,
            uint256 treasuryBalances,
            uint256 tokenMetrics,
            uint256 networkStats,
            uint256 socialMetrics,
            uint256 defiMetrics
        ) 
    {
        return (
            totalDataPoints,
            dataPointsByTypeCount[DataPointType.PRICE_FEED],
            dataPointsByTypeCount[DataPointType.MARKET_DATA],
            dataPointsByTypeCount[DataPointType.GOVERNANCE_VOTE],
            dataPointsByTypeCount[DataPointType.TREASURY_BALANCE],
            dataPointsByTypeCount[DataPointType.TOKEN_METRICS],
            dataPointsByTypeCount[DataPointType.NETWORK_STATS],
            dataPointsByTypeCount[DataPointType.SOCIAL_METRICS],
            dataPointsByTypeCount[DataPointType.DEFI_METRICS]
        );
    }

    /**
     * @dev Check if address is data provider
     */
    function isDataProvider(address addr) external view returns (bool) {
        return dataProviders[addr] || owner() == addr;
    }

    /**
     * @dev Get data providers for a specific data key
     */
    function getDataProviders(string memory dataKey) 
        external 
        view 
        dataPointExists(dataKey) 
        returns (address[] memory) 
    {
        return dataKeyProviders[dataKey];
    }

    /**
     * @dev Get data keys for a specific provider
     */
    function getProviderDataKeys(address provider) 
        external 
        view 
        returns (string[] memory) 
    {
        return providerDataKeys[provider];
    }


} 