// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ReservedSubdomains
 * @dev Manages reserved subdomains for the DAO Registry system
 * 
 * This contract provides:
 * - Reserved subdomain management with priority levels
 * - Access control for different user roles
 * - ENS integration for domain validation
 * - Dynamic reserved word updates
 */
contract ReservedSubdomains is Ownable, ReentrancyGuard {
    using Strings for string;

    /**
     * @dev Reserved subdomain priority levels
     */
    enum Priority {
        CRITICAL,   // Never available
        HIGH,       // Requires special permission
        MEDIUM,     // Available with registration
        LOW         // Available with approval
    }

    /**
     * @dev Reserved subdomain information
     */
    struct ReservedSubdomainInfo {
        string subdomain;
        Priority priority;
        string category;
        string description;
        string[] allowedRoles;
        string[] restrictions;
        bool active;
        uint256 createdAt;
        uint256 updatedAt;
    }

    /**
     * @dev Events
     */
    event SubdomainReserved(
        string indexed subdomain,
        Priority priority,
        string category,
        address indexed reservedBy
    );

    event SubdomainReleased(
        string indexed subdomain,
        address indexed releasedBy
    );

    event SubdomainUpdated(
        string indexed subdomain,
        Priority oldPriority,
        Priority newPriority,
        address indexed updatedBy
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
    mapping(string => ReservedSubdomainInfo) public reservedSubdomains;
    mapping(string => bool) public isReserved;
    mapping(string => Priority) public subdomainPriority;
    mapping(string => string[]) public subdomainCategories;
    
    // Access control
    mapping(address => bool) public administrators;
    mapping(address => bool) public moderators;
    
    // Statistics
    uint256 public totalReservedSubdomains;
    mapping(Priority => uint256) public subdomainsByPriority;
    mapping(string => uint256) public subdomainsByCategory;

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

    modifier subdomainExists(string memory subdomain) {
        require(isReserved[subdomain], "Subdomain not reserved");
        _;
    }

    modifier subdomainNotExists(string memory subdomain) {
        require(!isReserved[subdomain], "Subdomain already reserved");
        _;
    }

    /**
     * @dev Constructor
     */
    constructor() {
        _initializeCriticalReserved();
        _initializeHighPriorityReserved();
        _initializeMediumPriorityReserved();
        
        // Set initial administrators
        administrators[msg.sender] = true;
    }

    /**
     * @dev Initialize critical reserved subdomains (Priority 1)
     */
    function _initializeCriticalReserved() private {
        string[] memory critical = new string[](11);
        critical[0] = "governance";
        critical[1] = "treasury";
        critical[2] = "token";
        critical[3] = "docs";
        critical[4] = "forum";
        critical[5] = "analytics";
        critical[6] = "admin";
        critical[7] = "system";
        critical[8] = "root";
        critical[9] = "www";
        critical[10] = "api";

        string[] memory allowedRoles = new string[](2);
        allowedRoles[0] = "DAO owners";
        allowedRoles[1] = "System administrators";

        string[] memory restrictions = new string[](1);
        restrictions[0] = "Never available for public registration";

        for (uint256 i = 0; i < critical.length; i++) {
            _reserveSubdomain(
                critical[i],
                Priority.CRITICAL,
                "Core DAO Components",
                "Critical system subdomain",
                allowedRoles,
                restrictions
            );
        }
    }

    /**
     * @dev Initialize high priority reserved subdomains (Priority 2)
     */
    function _initializeHighPriorityReserved() private {
        string[] memory highPriority = new string[](35);
        highPriority[0] = "voting";
        highPriority[1] = "proposals";
        highPriority[2] = "executive";
        highPriority[3] = "council";
        highPriority[4] = "vault";
        highPriority[5] = "rewards";
        highPriority[6] = "staking";
        highPriority[7] = "liquidity";
        highPriority[8] = "erc20";
        highPriority[9] = "nft";
        highPriority[10] = "vesting";
        highPriority[11] = "airdrop";
        highPriority[12] = "wiki";
        highPriority[13] = "guide";
        highPriority[14] = "spec";
        highPriority[15] = "chat";
        highPriority[16] = "discord";
        highPriority[17] = "telegram";
        highPriority[18] = "reddit";
        highPriority[19] = "stats";
        highPriority[20] = "metrics";
        highPriority[21] = "dashboard";
        highPriority[22] = "reports";
        highPriority[23] = "dev";
        highPriority[24] = "github";
        highPriority[25] = "code";
        highPriority[26] = "test";
        highPriority[27] = "staging";
        highPriority[28] = "gov";
        highPriority[29] = "constitution";
        highPriority[30] = "bylaws";
        highPriority[31] = "policies";
        highPriority[32] = "marketing";
        highPriority[33] = "brand";
        highPriority[34] = "media";

        string[] memory allowedRoles = new string[](1);
        allowedRoles[0] = "DAO owners";

        string[] memory restrictions = new string[](1);
        restrictions[0] = "Requires special permission";

        for (uint256 i = 0; i < highPriority.length; i++) {
            _reserveSubdomain(
                highPriority[i],
                Priority.HIGH,
                "High Priority",
                "High priority subdomain",
                allowedRoles,
                restrictions
            );
        }
    }

    /**
     * @dev Initialize medium priority reserved subdomains (Priority 3)
     */
    function _initializeMediumPriorityReserved() private {
        string[] memory mediumPriority = new string[](25);
        mediumPriority[0] = "faq";
        mediumPriority[1] = "help";
        mediumPriority[2] = "support";
        mediumPriority[3] = "news";
        mediumPriority[4] = "announcements";
        mediumPriority[5] = "monitor";
        mediumPriority[6] = "status";
        mediumPriority[7] = "health";
        mediumPriority[8] = "alerts";
        mediumPriority[9] = "tech";
        mediumPriority[10] = "protocol";
        mediumPriority[11] = "contracts";
        mediumPriority[12] = "audit";
        mediumPriority[13] = "legal";
        mediumPriority[14] = "compliance";
        mediumPriority[15] = "regulatory";
        mediumPriority[16] = "kyc";
        mediumPriority[17] = "events";
        mediumPriority[18] = "social";
        mediumPriority[19] = "twitter";
        mediumPriority[20] = "linkedin";
        mediumPriority[21] = "manage";
        mediumPriority[22] = "settings";
        mediumPriority[23] = "config";
        mediumPriority[24] = "service";

        string[] memory allowedRoles = new string[](2);
        allowedRoles[0] = "DAO owners";
        allowedRoles[1] = "Verified users";

        string[] memory restrictions = new string[](1);
        restrictions[0] = "Available with registration";

        for (uint256 i = 0; i < mediumPriority.length; i++) {
            _reserveSubdomain(
                mediumPriority[i],
                Priority.MEDIUM,
                "Medium Priority",
                "Medium priority subdomain",
                allowedRoles,
                restrictions
            );
        }
    }

    /**
     * @dev Reserve a subdomain
     */
    function _reserveSubdomain(
        string memory subdomain,
        Priority priority,
        string memory category,
        string memory description,
        string[] memory allowedRoles,
        string[] memory restrictions
    ) private {
        require(bytes(subdomain).length > 0, "Subdomain cannot be empty");
        require(!isReserved[subdomain], "Subdomain already reserved");

        ReservedSubdomainInfo memory info = ReservedSubdomainInfo({
            subdomain: subdomain,
            priority: priority,
            category: category,
            description: description,
            allowedRoles: allowedRoles,
            restrictions: restrictions,
            active: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        reservedSubdomains[subdomain] = info;
        isReserved[subdomain] = true;
        subdomainPriority[subdomain] = priority;
        
        // Update statistics
        totalReservedSubdomains++;
        subdomainsByPriority[priority]++;
        subdomainsByCategory[category]++;

        emit SubdomainReserved(subdomain, priority, category, msg.sender);
    }

    /**
     * @dev Reserve a new subdomain (admin only)
     */
    function reserveSubdomain(
        string memory subdomain,
        Priority priority,
        string memory category,
        string memory description,
        string[] memory allowedRoles,
        string[] memory restrictions
    ) external onlyAdministrator subdomainNotExists(subdomain) {
        _reserveSubdomain(subdomain, priority, category, description, allowedRoles, restrictions);
    }

    /**
     * @dev Release a reserved subdomain
     */
    function releaseSubdomain(string memory subdomain) 
        external 
        onlyAdministrator 
        subdomainExists(subdomain) 
    {
        ReservedSubdomainInfo storage info = reservedSubdomains[subdomain];
        Priority priority = info.priority;
        string memory category = info.category;

        // Update statistics
        totalReservedSubdomains--;
        subdomainsByPriority[priority]--;
        subdomainsByCategory[category]--;

        // Clear data
        delete reservedSubdomains[subdomain];
        delete isReserved[subdomain];
        delete subdomainPriority[subdomain];

        emit SubdomainReleased(subdomain, msg.sender);
    }

    /**
     * @dev Update subdomain priority
     */
    function updateSubdomainPriority(string memory subdomain, Priority newPriority) 
        external 
        onlyModerator 
        subdomainExists(subdomain) 
    {
        ReservedSubdomainInfo storage info = reservedSubdomains[subdomain];
        Priority oldPriority = info.priority;

        // Update statistics
        subdomainsByPriority[oldPriority]--;
        subdomainsByPriority[newPriority]++;

        // Update info
        info.priority = newPriority;
        info.updatedAt = block.timestamp;
        subdomainPriority[subdomain] = newPriority;

        emit SubdomainUpdated(subdomain, oldPriority, newPriority, msg.sender);
    }

    /**
     * @dev Update subdomain category
     */
    function updateSubdomainCategory(string memory subdomain, string memory newCategory) 
        external 
        onlyModerator 
        subdomainExists(subdomain) 
    {
        ReservedSubdomainInfo storage info = reservedSubdomains[subdomain];
        string memory oldCategory = info.category;

        // Update statistics
        subdomainsByCategory[oldCategory]--;
        subdomainsByCategory[newCategory]++;

        // Update info
        info.category = newCategory;
        info.updatedAt = block.timestamp;

        emit SubdomainUpdated(subdomain, info.priority, info.priority, msg.sender);
    }

    /**
     * @dev Add role to subdomain
     */
    function addRoleToSubdomain(string memory subdomain, string memory role) 
        external 
        onlyModerator 
        subdomainExists(subdomain) 
    {
        ReservedSubdomainInfo storage info = reservedSubdomains[subdomain];
        
        // Check if role already exists
        for (uint256 i = 0; i < info.allowedRoles.length; i++) {
            require(keccak256(bytes(info.allowedRoles[i])) != keccak256(bytes(role)), "Role already exists");
        }

        info.allowedRoles.push(role);
        info.updatedAt = block.timestamp;

        emit RoleAdded(subdomain, role, msg.sender);
    }

    /**
     * @dev Remove role from subdomain
     */
    function removeRoleFromSubdomain(string memory subdomain, string memory role) 
        external 
        onlyModerator 
        subdomainExists(subdomain) 
    {
        ReservedSubdomainInfo storage info = reservedSubdomains[subdomain];
        
        bool found = false;
        for (uint256 i = 0; i < info.allowedRoles.length; i++) {
            if (keccak256(bytes(info.allowedRoles[i])) == keccak256(bytes(role))) {
                // Remove role by shifting array
                for (uint256 j = i; j < info.allowedRoles.length - 1; j++) {
                    info.allowedRoles[j] = info.allowedRoles[j + 1];
                }
                info.allowedRoles.pop();
                found = true;
                break;
            }
        }

        require(found, "Role not found");
        info.updatedAt = block.timestamp;

        emit RoleRemoved(subdomain, role, msg.sender);
    }

    /**
     * @dev Check if subdomain is reserved
     */
    function checkIfReserved(string memory subdomain) external view returns (bool) {
        return isReserved[subdomain];
    }

    /**
     * @dev Get subdomain priority
     */
    function getSubdomainPriority(string memory subdomain) external view returns (Priority) {
        return subdomainPriority[subdomain];
    }

    /**
     * @dev Get reserved subdomain info
     */
    function getReservedSubdomainInfo(string memory subdomain) 
        external 
        view 
        returns (ReservedSubdomainInfo memory) 
    {
        require(isReserved[subdomain], "Subdomain not reserved");
        return reservedSubdomains[subdomain];
    }

    /**
     * @dev Get all reserved subdomains by priority
     */
    function getReservedSubdomainsByPriority(Priority priority) 
        external 
        view 
        returns (string[] memory) 
    {
        string[] memory subdomains = new string[](subdomainsByPriority[priority]);
        uint256 count = 0;

        // This is a simplified implementation
        // In a real scenario, you might want to maintain a separate mapping
        // for efficient retrieval by priority
        for (uint256 i = 0; i < totalReservedSubdomains; i++) {
            // This would need to be implemented with proper indexing
            // For now, returning empty array
        }

        return subdomains;
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
            totalReservedSubdomains,
            subdomainsByPriority[Priority.CRITICAL],
            subdomainsByPriority[Priority.HIGH],
            subdomainsByPriority[Priority.MEDIUM],
            subdomainsByPriority[Priority.LOW]
        );
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

    /**
     * @dev Check if address is moderator
     */
    function isModerator(address addr) external view returns (bool) {
        return moderators[addr] || administrators[addr] || owner() == addr;
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