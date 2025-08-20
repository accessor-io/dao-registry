    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.19;

    import "@openzeppelin/contracts/access/Ownable.sol";
    import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
    import "@openzeppelin/contracts/security/Pausable.sol";
    import "@openzeppelin/contracts/utils/Counters.sol";
    import "@openzeppelin/contracts/utils/Strings.sol";
    import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
    import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

    /**
    * @title DAO Registry
    * @dev A   registry for managing Decentralized Autonomous Organizations (DAOs)
    * across multiple blockchain networks with governance tracking and analytics support.
    */
    contract DAORegistry is Ownable, ReentrancyGuard, Pausable {
        using Counters for Counters.Counter;
        using Strings for uint256;

        // =======================================================================
        // STRUCTS
        // =======================================================================

        struct DAOInfo {
            string name;                    // DAO name
            string symbol;                  // DAO token symbol
            string description;             // DAO description
            string logo;                    // Logo URI
            string website;                 // Website URL
            address contractAddress;        // Main DAO contract address
            address tokenAddress;           // Governance token address
            address treasuryAddress;        // Treasury contract address
            address governanceAddress;      // Governance contract address
            uint256 chainId;               // Blockchain network ID
            uint256 createdAt;             // Registration timestamp
            uint256 updatedAt;             // Last update timestamp
            bool verified;                 // Verification status
            bool active;                   // Active status
            DAOStatus status;              // Current status
            GovernanceType governanceType; // Type of governance
            uint256 votingPeriod;          // Voting period in seconds
            uint256 quorum;                // Quorum percentage (basis points)
            uint256 proposalThreshold;     // Minimum tokens to propose
            string[] tags;                 // Categorization tags
            SocialLinks socialLinks;       // Social media links
        }

        struct SocialLinks {
            string twitter;
            string discord;
            string telegram;
            string github;
            string medium;
            string reddit;
        }

        struct ProposalInfo {
            uint256 daoId;                 // Associated DAO ID
            address proposer;              // Proposer address
            string title;                  // Proposal title
            string description;            // Proposal description
            uint256 startTime;             // Voting start time
            uint256 endTime;               // Voting end time
            uint256 quorum;                // Required quorum
            uint256 forVotes;              // Votes in favor
            uint256 againstVotes;          // Votes against
            uint256 abstainVotes;          // Abstain votes
            bool executed;                 // Execution status
            bool canceled;                 // Cancellation status
            uint256 executedAt;            // Execution timestamp
            ProposalStatus status;         // Current status
            ProposalAction[] actions;      // Proposed actions
        }

        struct ProposalAction {
            address target;                // Target contract
            uint256 value;                 // ETH value to send
            string signature;              // Function signature
            bytes data;                    // Call data
        }

        struct MemberInfo {
            uint256 daoId;                 // Associated DAO ID
            address memberAddress;         // Member wallet address
            uint256 tokenBalance;          // Governance token balance
            uint256 votingPower;           // Calculated voting power
            uint256 proposalsCreated;      // Number of proposals created
            uint256 proposalsVoted;        // Number of proposals voted on
            uint256 lastActivity;          // Last activity timestamp
            bool active;                   // Active member status
            MemberRole[] roles;            // Member roles
        }

        struct Analytics {
            uint256 totalProposals;        // Total number of proposals
            uint256 activeProposals;       // Currently active proposals
            uint256 totalMembers;          // Total number of members
            uint256 activeMembers;         // Active members count
            uint256 treasuryValue;         // Treasury value in USD
            uint256 participationRate;     // Participation rate (basis points)
            uint256 averageVotingPower;    // Average voting power
            uint256 lastUpdated;           // Last analytics update
        }

        // =======================================================================
        // ENUMS
        // =======================================================================

        enum DAOStatus {
            Pending,      // 0: Pending verification
            Active,       // 1: Active and verified
            Suspended,    // 2: Temporarily suspended
            Inactive,     // 3: Inactive
            Banned        // 4: Banned
        }

        enum GovernanceType {
            TokenWeighted,    // 0: Token-weighted voting
            Quadratic,        // 1: Quadratic voting
            Reputation,       // 2: Reputation-based
            Liquid,          // 3: Liquid democracy
            Hybrid           // 4: Hybrid governance
        }

        enum ProposalStatus {
            Pending,        // 0: Pending execution
            Active,         // 1: Active voting
            Succeeded,      // 2: Succeeded
            Defeated,       // 3: Defeated
            Executed,       // 4: Executed
            Canceled,       // 5: Canceled
            Expired         // 6: Expired
        }

        enum MemberRole {
            Member,         // 0: Regular member
            Moderator,      // 1: Moderator
            Admin,          // 2: Administrator
            Owner           // 3: Owner
        }

        // =======================================================================
        // STATE VARIABLES
        // =======================================================================

        Counters.Counter private _daoIds;
        Counters.Counter private _proposalIds;
        Counters.Counter private _memberIds;

        mapping(uint256 => DAOInfo) public daos;
        mapping(address => uint256) public daoByAddress;
        mapping(uint256 => mapping(address => bool)) public daoMembers;
        mapping(uint256 => ProposalInfo) public proposals;
        mapping(uint256 => MemberInfo) public members;
        mapping(uint256 => Analytics) public analytics;
        mapping(uint256 => mapping(address => bool)) public verifiedAddresses;

        // Fee structure
        uint256 public registrationFee = 0.1 ether;
        uint256 public verificationFee = 0.05 ether;
        uint256 public updateFee = 0.02 ether;

        // Limits and constraints
        uint256 public maxTagsPerDAO = 10;
        uint256 public maxDescriptionLength = 1000;
        uint256 public maxNameLength = 100;
        uint256 public maxSymbolLength = 10;

        // Events
        event DAORegistered(uint256 indexed daoId, address indexed contractAddress, string name, uint256 chainId);
        event DAOUpdated(uint256 indexed daoId, address indexed contractAddress);
        event DAOVerified(uint256 indexed daoId, bool verified);
        event DAOStatusChanged(uint256 indexed daoId, DAOStatus oldStatus, DAOStatus newStatus);
        event ProposalCreated(uint256 indexed proposalId, uint256 indexed daoId, address indexed proposer);
        event ProposalVoted(uint256 indexed proposalId, address indexed voter, uint8 support, uint256 weight);
        event ProposalExecuted(uint256 indexed proposalId, uint256 indexed daoId);
        event MemberAdded(uint256 indexed daoId, address indexed memberAddress);
        event MemberRemoved(uint256 indexed daoId, address indexed memberAddress);
        event AnalyticsUpdated(uint256 indexed daoId, uint256 totalProposals, uint256 totalMembers);
        event FeesUpdated(uint256 registrationFee, uint256 verificationFee, uint256 updateFee);

        // =======================================================================
        // MODIFIERS
        // =======================================================================

        modifier onlyDAOOwner(uint256 daoId) {
            require(daos[daoId].active, "DAO does not exist or is inactive");
            require(daoByAddress[msg.sender] == daoId, "Not DAO owner");
            _;
        }

        modifier onlyVerifiedDAO(uint256 daoId) {
            require(daos[daoId].verified, "DAO not verified");
            require(daos[daoId].active, "DAO not active");
            _;
        }

        modifier onlyActiveDAO(uint256 daoId) {
            require(daos[daoId].active, "DAO not active");
            _;
        }

        modifier onlyValidProposal(uint256 proposalId) {
            require(proposals[proposalId].daoId != 0, "Proposal does not exist");
            _;
        }

        modifier onlyValidMember(uint256 daoId, address memberAddress) {
            require(daoMembers[daoId][memberAddress], "Not a member of this DAO");
            _;
        }

        modifier onlyValidStringLength(string memory str, uint256 maxLength) {
            require(bytes(str).length <= maxLength, "String exceeds maximum length");
            require(bytes(str).length > 0, "String cannot be empty");
            _;
        }

        // =======================================================================
        // CONSTRUCTOR
        // =======================================================================

        constructor() {
            _daoIds.increment(); // Start from 1
            _proposalIds.increment();
            _memberIds.increment();
        }

        // =======================================================================
        // CORE FUNCTIONS
        // =======================================================================

        /**
        * @dev Register a new DAO
        * @param name DAO name
        * @param symbol DAO token symbol
        * @param description DAO description
        * @param contractAddress Main DAO contract address
        * @param tokenAddress Governance token address
        * @param treasuryAddress Treasury contract address
        * @param governanceAddress Governance contract address
        * @param chainId Blockchain network ID
        * @param governanceType Type of governance
        * @param votingPeriod Voting period in seconds
        * @param quorum Quorum percentage (basis points)
        * @param proposalThreshold Minimum tokens to propose
        * @param tags Categorization tags
        * @param socialLinks Social media links
        */
        function registerDAO(
            string memory name,
            string memory symbol,
            string memory description,
            address contractAddress,
            address tokenAddress,
            address treasuryAddress,
            address governanceAddress,
            uint256 chainId,
            GovernanceType governanceType,
            uint256 votingPeriod,
            uint256 quorum,
            uint256 proposalThreshold,
            string[] memory tags,
            SocialLinks memory socialLinks
        )
            external
            payable
            nonReentrant
            whenNotPaused
            onlyValidStringLength(name, maxNameLength)
            onlyValidStringLength(symbol, maxSymbolLength)
            onlyValidStringLength(description, maxDescriptionLength)
        {
            require(msg.value >= registrationFee, "Insufficient registration fee");
            require(contractAddress != address(0), "Invalid contract address");
            require(daoByAddress[contractAddress] == 0, "DAO already registered");
            require(chainId > 0, "Invalid chain ID");
            require(tags.length <= maxTagsPerDAO, "Too many tags");

            _daoIds.increment();
            uint256 daoId = _daoIds.current();

            daos[daoId] = DAOInfo({
                name: name,
                symbol: symbol,
                description: description,
                logo: "",
                website: "",
                contractAddress: contractAddress,
                tokenAddress: tokenAddress,
                treasuryAddress: treasuryAddress,
                governanceAddress: governanceAddress,
                chainId: chainId,
                createdAt: block.timestamp,
                updatedAt: block.timestamp,
                verified: false,
                active: true,
                status: DAOStatus.Pending,
                governanceType: governanceType,
                votingPeriod: votingPeriod,
                quorum: quorum,
                proposalThreshold: proposalThreshold,
                tags: tags,
                socialLinks: socialLinks
            });

            daoByAddress[contractAddress] = daoId;

            emit DAORegistered(daoId, contractAddress, name, chainId);
        }

        /**
        * @dev Update DAO information
        * @param daoId DAO ID
        * @param name New DAO name
        * @param symbol New DAO token symbol
        * @param description New DAO description
        * @param logo New logo URI
        * @param website New website URL
        * @param tags New tags
        * @param socialLinks New social links
        */
        function updateDAO(
            uint256 daoId,
            string memory name,
            string memory symbol,
            string memory description,
            string memory logo,
            string memory website,
            string[] memory tags,
            SocialLinks memory socialLinks
        )
            external
            payable
            onlyDAOOwner(daoId)
            nonReentrant
            whenNotPaused
            onlyValidStringLength(name, maxNameLength)
            onlyValidStringLength(symbol, maxSymbolLength)
            onlyValidStringLength(description, maxDescriptionLength)
        {
            require(msg.value >= updateFee, "Insufficient update fee");
            require(tags.length <= maxTagsPerDAO, "Too many tags");

            DAOInfo storage dao = daos[daoId];
            dao.name = name;
            dao.symbol = symbol;
            dao.description = description;
            dao.logo = logo;
            dao.website = website;
            dao.tags = tags;
            dao.socialLinks = socialLinks;
            dao.updatedAt = block.timestamp;

            emit DAOUpdated(daoId, dao.contractAddress);
        }

        /**
        * @dev Verify a DAO (only owner)
        * @param daoId DAO ID
        * @param verified Verification status
        */
        function verifyDAO(uint256 daoId, bool verified) external onlyOwner {
            require(daos[daoId].active, "DAO does not exist");
            daos[daoId].verified = verified;
            daos[daoId].updatedAt = block.timestamp;

            if (verified) {
                daos[daoId].status = DAOStatus.Active;
            }

            emit DAOVerified(daoId, verified);
        }

        /**
        * @dev Change DAO status (only owner)
        * @param daoId DAO ID
        * @param newStatus New status
        */
        function changeDAOStatus(uint256 daoId, DAOStatus newStatus) external onlyOwner {
            require(daos[daoId].active, "DAO does not exist");
            DAOStatus oldStatus = daos[daoId].status;
            daos[daoId].status = newStatus;
            daos[daoId].updatedAt = block.timestamp;

            if (newStatus == DAOStatus.Inactive || newStatus == DAOStatus.Banned) {
                daos[daoId].active = false;
            }

            emit DAOStatusChanged(daoId, oldStatus, newStatus);
        }

        // =======================================================================
        // PROPOSAL FUNCTIONS
        // =======================================================================

        /**
        * @dev Create a new proposal
        * @param daoId DAO ID
        * @param title Proposal title
        * @param description Proposal description
        * @param actions Proposed actions
        */
        function createProposal(
            uint256 daoId,
            string memory title,
            string memory description,
            ProposalAction[] memory actions
        ) external onlyVerifiedDAO(daoId) nonReentrant {
            require(daoMembers[daoId][msg.sender], "Not a member of this DAO");

            _proposalIds.increment();
            uint256 proposalId = _proposalIds.current();

            DAOInfo storage dao = daos[daoId];
            uint256 startTime = block.timestamp;
            uint256 endTime = startTime + dao.votingPeriod;

            proposals[proposalId] = ProposalInfo({
                daoId: daoId,
                proposer: msg.sender,
                title: title,
                description: description,
                startTime: startTime,
                endTime: endTime,
                quorum: dao.quorum,
                forVotes: 0,
                againstVotes: 0,
                abstainVotes: 0,
                executed: false,
                canceled: false,
                executedAt: 0,
                status: ProposalStatus.Active,
                actions: actions
            });

            emit ProposalCreated(proposalId, daoId, msg.sender);
        }

        /**
        * @dev Vote on a proposal
        * @param proposalId Proposal ID
        * @param support Vote support (0 = against, 1 = for, 2 = abstain)
        */
        function vote(uint256 proposalId, uint8 support) external onlyValidProposal(proposalId) nonReentrant {
            ProposalInfo storage proposal = proposals[proposalId];
            require(proposal.status == ProposalStatus.Active, "Proposal not active");
            require(block.timestamp >= proposal.startTime, "Voting not started");
            require(block.timestamp <= proposal.endTime, "Voting ended");

            uint256 daoId = proposal.daoId;
            require(daoMembers[daoId][msg.sender], "Not a member of this DAO");

            // Calculate voting power based on token balance
            uint256 votingPower = getVotingPower(daoId, msg.sender);
            require(votingPower > 0, "No voting power");

            if (support == 0) {
                proposal.againstVotes += votingPower;
            } else if (support == 1) {
                proposal.forVotes += votingPower;
            } else if (support == 2) {
                proposal.abstainVotes += votingPower;
            } else {
                revert("Invalid support value");
            }

            emit ProposalVoted(proposalId, msg.sender, support, votingPower);
        }

        /**
        * @dev Execute a proposal
        * @param proposalId Proposal ID
        */
        function executeProposal(uint256 proposalId) external onlyValidProposal(proposalId) nonReentrant {
            ProposalInfo storage proposal = proposals[proposalId];
            require(proposal.status == ProposalStatus.Succeeded, "Proposal not succeeded");
            require(!proposal.executed, "Proposal already executed");
            require(block.timestamp >= proposal.endTime, "Voting period not ended");

            proposal.executed = true;
            proposal.executedAt = block.timestamp;
            proposal.status = ProposalStatus.Executed;

            // Execute actions
            for (uint256 i = 0; i < proposal.actions.length; i++) {
                ProposalAction memory action = proposal.actions[i];
                (bool success, ) = action.target.call{value: action.value}(action.data);
                require(success, "Action execution failed");
            }

            emit ProposalExecuted(proposalId, proposal.daoId);
        }

        // =======================================================================
        // MEMBER FUNCTIONS
        // =======================================================================

        /**
        * @dev Add a member to a DAO
        * @param daoId DAO ID
        * @param memberAddress Member address
        */
        function addMember(uint256 daoId, address memberAddress) external onlyVerifiedDAO(daoId) {
            require(!daoMembers[daoId][memberAddress], "Already a member");

            _memberIds.increment();
            uint256 memberId = _memberIds.current();

            members[memberId] = MemberInfo({
                daoId: daoId,
                memberAddress: memberAddress,
                tokenBalance: 0,
                votingPower: 0,
                proposalsCreated: 0,
                proposalsVoted: 0,
                lastActivity: block.timestamp,
                active: true,
                roles: new MemberRole[](1)
            });

            members[memberId].roles[0] = MemberRole.Member;
            daoMembers[daoId][memberAddress] = true;

            emit MemberAdded(daoId, memberAddress);
        }

        /**
        * @dev Remove a member from a DAO
        * @param daoId DAO ID
        * @param memberAddress Member address
        */
        function removeMember(uint256 daoId, address memberAddress) external onlyVerifiedDAO(daoId) {
            require(daoMembers[daoId][memberAddress], "Not a member");

            daoMembers[daoId][memberAddress] = false;

            emit MemberRemoved(daoId, memberAddress);
        }

        // =======================================================================
        // ANALYTICS FUNCTIONS
        // =======================================================================

        /**
        * @dev Update DAO analytics
        * @param daoId DAO ID
        * @param totalProposals Total proposals count
        * @param activeProposals Active proposals count
        * @param totalMembers Total members count
        * @param activeMembers Active members count
        * @param treasuryValue Treasury value in USD
        * @param participationRate Participation rate (basis points)
        * @param averageVotingPower Average voting power
        */
        function updateAnalytics(
            uint256 daoId,
            uint256 totalProposals,
            uint256 activeProposals,
            uint256 totalMembers,
            uint256 activeMembers,
            uint256 treasuryValue,
            uint256 participationRate,
            uint256 averageVotingPower
        ) external onlyVerifiedDAO(daoId) {
            analytics[daoId] = Analytics({
                totalProposals: totalProposals,
                activeProposals: activeProposals,
                totalMembers: totalMembers,
                activeMembers: activeMembers,
                treasuryValue: treasuryValue,
                participationRate: participationRate,
                averageVotingPower: averageVotingPower,
                lastUpdated: block.timestamp
            });

            emit AnalyticsUpdated(daoId, totalProposals, totalMembers);
        }

        // =======================================================================
        // VIEW FUNCTIONS
        // =======================================================================

        /**
        * @dev Get DAO information
        * @param daoId DAO ID
        * @return DAO information
        */
        function getDAO(uint256 daoId) external view returns (DAOInfo memory) {
            return daos[daoId];
        }

        /**
        * @dev Get DAO by contract address
        * @param contractAddress Contract address
        * @return DAO ID
        */
        function getDAOByAddress(address contractAddress) external view returns (uint256) {
            return daoByAddress[contractAddress];
        }

        /**
        * @dev Get proposal information
        * @param proposalId Proposal ID
        * @return Proposal information
        */
        function getProposal(uint256 proposalId) external view returns (ProposalInfo memory) {
            return proposals[proposalId];
        }

        /**
        * @dev Get member information
        * @param memberId Member ID
        * @return Member information
        */
        function getMember(uint256 memberId) external view returns (MemberInfo memory) {
            return members[memberId];
        }

        /**
        * @dev Get DAO analytics
        * @param daoId DAO ID
        * @return Analytics information
        */
        function getAnalytics(uint256 daoId) external view returns (Analytics memory) {
            return analytics[daoId];
        }

        /**
        * @dev Get total DAOs count
        * @return Total DAOs count
        */
        function getTotalDAOs() external view returns (uint256) {
            return _daoIds.current();
        }

        /**
        * @dev Get total proposals count
        * @return Total proposals count
        */
        function getTotalProposals() external view returns (uint256) {
            return _proposalIds.current();
        }

        /**
        * @dev Get total members count
        * @return Total members count
        */
        function getTotalMembers() external view returns (uint256) {
            return _memberIds.current();
        }

        /**
        * @dev Check if address is a member of DAO
        * @param daoId DAO ID
        * @param memberAddress Member address
        * @return True if member
        */
        function isMember(uint256 daoId, address memberAddress) external view returns (bool) {
            return daoMembers[daoId][memberAddress];
        }

        /**
        * @dev Get voting power for address in DAO
        * @param daoId DAO ID
        * @param memberAddress Member address
        * @return Voting power
        */
        function getVotingPower(uint256 daoId, address memberAddress) public view returns (uint256) {
            DAOInfo storage dao = daos[daoId];
            if (dao.tokenAddress == address(0)) {
                return 0;
            }

            IERC20 token = IERC20(dao.tokenAddress);
            return token.balanceOf(memberAddress);
        }

        // =======================================================================
        // ADMIN FUNCTIONS
        // =======================================================================

        /**
        * @dev Update fee structure (only owner)
        * @param newRegistrationFee New registration fee
        * @param newVerificationFee New verification fee
        * @param newUpdateFee New update fee
        */
        function updateFees(
            uint256 newRegistrationFee,
            uint256 newVerificationFee,
            uint256 newUpdateFee
        ) external onlyOwner {
            registrationFee = newRegistrationFee;
            verificationFee = newVerificationFee;
            updateFee = newUpdateFee;

            emit FeesUpdated(registrationFee, verificationFee, updateFee);
        }

        /**
        * @dev Update limits (only owner)
        * @param newMaxTagsPerDAO New max tags per DAO
        * @param newMaxDescriptionLength New max description length
        * @param newMaxNameLength New max name length
        * @param newMaxSymbolLength New max symbol length
        */
        function updateLimits(
            uint256 newMaxTagsPerDAO,
            uint256 newMaxDescriptionLength,
            uint256 newMaxNameLength,
            uint256 newMaxSymbolLength
        ) external onlyOwner {
            maxTagsPerDAO = newMaxTagsPerDAO;
            maxDescriptionLength = newMaxDescriptionLength;
            maxNameLength = newMaxNameLength;
            maxSymbolLength = newMaxSymbolLength;
        }

        /**
        * @dev Pause contract (only owner)
        */
        function pause() external onlyOwner {
            _pause();
        }

        /**
        * @dev Unpause contract (only owner)
        */
        function unpause() external onlyOwner {
            _unpause();
        }

        /**
        * @dev Withdraw fees (only owner)
        */
        function withdrawFees() external onlyOwner {
            uint256 balance = address(this).balance;
            require(balance > 0, "No fees to withdraw");

            (bool success, ) = payable(owner()).call{value: balance}("");
            require(success, "Withdrawal failed");
        }

        // =======================================================================
        // EMERGENCY FUNCTIONS
        // =======================================================================

        /**
        * @dev Emergency function to recover stuck tokens
        * @param tokenAddress Token address
        * @param to Recipient address
        * @param amount Amount to transfer
        */
        function emergencyRecoverTokens(
            address tokenAddress,
            address to,
            uint256 amount
        ) external onlyOwner {
            IERC20 token = IERC20(tokenAddress);
            require(token.transfer(to, amount), "Transfer failed");
        }

        /**
        * @dev Emergency function to recover stuck ETH
        * @param to Recipient address
        * @param amount Amount to transfer
        */
        function emergencyRecoverETH(address to, uint256 amount) external onlyOwner {
            require(to != address(0), "Invalid recipient");
            require(amount <= address(this).balance, "Insufficient balance");

            (bool success, ) = payable(to).call{value: amount}("");
            require(success, "Transfer failed");
        }
    } 