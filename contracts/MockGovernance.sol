// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MockGovernance
 * @dev Mock governance contract for testing DAO Registry functionality
 */
contract MockGovernance is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Governance token
    IERC20 public governanceToken;
    address public daoRegistry;

    // Proposal tracking
    Counters.Counter private _proposalIds;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Governance parameters
    uint256 public votingPeriod = 86400; // 1 day
    uint256 public quorumVotes = 1000; // 10% in basis points
    uint256 public proposalThreshold = 1000; // Minimum tokens to propose

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bool canceled;
        uint256 executedAt;
        ProposalStatus status;
        ProposalAction[] actions;
    }

    struct ProposalAction {
        address target;
        uint256 value;
        string signature;
        bytes data;
    }

    struct Vote {
        uint8 support; // 0 = against, 1 = for, 2 = abstain
        uint256 weight;
        string reason;
    }

    enum ProposalStatus {
        Pending,
        Active,
        Succeeded,
        Defeated,
        Executed,
        Canceled,
        Expired
    }

    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint8 support,
        uint256 weight,
        string reason
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    event GovernanceParametersUpdated(
        uint256 votingPeriod,
        uint256 quorumVotes,
        uint256 proposalThreshold
    );

    constructor(address _governanceToken, address _daoRegistry) {
        governanceToken = IERC20(_governanceToken);
        daoRegistry = _daoRegistry;
    }

    /**
     * @dev Create a new proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param actions Proposed actions
     */
    function propose(
        string memory title,
        string memory description,
        ProposalAction[] memory actions
    ) external nonReentrant returns (uint256) {
        require(
            governanceToken.balanceOf(msg.sender) >= proposalThreshold,
            "Insufficient tokens to propose"
        );

        _proposalIds.increment();
        uint256 proposalId = _proposalIds.current();

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + votingPeriod;

        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            startTime: startTime,
            endTime: endTime,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            executed: false,
            canceled: false,
            executedAt: 0,
            status: ProposalStatus.Active,
            actions: actions
        });

        emit ProposalCreated(proposalId, msg.sender, title, startTime, endTime);

        return proposalId;
    }

    /**
     * @dev Vote on a proposal
     * @param proposalId Proposal ID
     * @param support Vote support (0 = against, 1 = for, 2 = abstain)
     * @param reason Voting reason
     */
    function castVote(
        uint256 proposalId,
        uint8 support,
        string memory reason
    ) external nonReentrant {
        require(proposalId > 0 && proposalId <= _proposalIds.current(), "Invalid proposal");
        require(support <= 2, "Invalid support value");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");

        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");

        hasVoted[proposalId][msg.sender] = true;
        votes[proposalId][msg.sender] = Vote({
            support: support,
            weight: weight,
            reason: reason
        });

        if (support == 0) {
            proposal.againstVotes += weight;
        } else if (support == 1) {
            proposal.forVotes += weight;
        } else if (support == 2) {
            proposal.abstainVotes += weight;
        }

        emit VoteCast(proposalId, msg.sender, support, weight, reason);
    }

    /**
     * @dev Execute a proposal
     * @param proposalId Proposal ID
     */
    function execute(uint256 proposalId) external nonReentrant {
        require(proposalId > 0 && proposalId <= _proposalIds.current(), "Invalid proposal");

        Proposal storage proposal = proposals[proposalId];
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

        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Cancel a proposal (only proposer or owner)
     * @param proposalId Proposal ID
     */
    function cancel(uint256 proposalId) external {
        require(proposalId > 0 && proposalId <= _proposalIds.current(), "Invalid proposal");

        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized to cancel"
        );
        require(proposal.status == ProposalStatus.Active, "Proposal not active");

        proposal.canceled = true;
        proposal.status = ProposalStatus.Canceled;

        emit ProposalCanceled(proposalId);
    }

    /**
     * @dev Update proposal status based on voting results
     * @param proposalId Proposal ID
     */
    function updateProposalStatus(uint256 proposalId) external {
        require(proposalId > 0 && proposalId <= _proposalIds.current(), "Invalid proposal");

        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp >= proposal.endTime, "Voting period not ended");

        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 totalSupply = governanceToken.totalSupply();

        if (totalVotes >= (totalSupply * quorumVotes) / 10000) {
            if (proposal.forVotes > proposal.againstVotes) {
                proposal.status = ProposalStatus.Succeeded;
            } else {
                proposal.status = ProposalStatus.Defeated;
            }
        } else {
            proposal.status = ProposalStatus.Defeated;
        }
    }

    /**
     * @dev Get proposal information
     * @param proposalId Proposal ID
     * @return Proposal information
     */
    function getProposal(uint256 proposalId)
        external
        view
        returns (
            uint256 id,
            address proposer,
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 abstainVotes,
            bool executed,
            bool canceled,
            uint256 executedAt,
            ProposalStatus status
        )
    {
        require(proposalId > 0 && proposalId <= _proposalIds.current(), "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];

        return (
            proposal.id,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.executed,
            proposal.canceled,
            proposal.executedAt,
            proposal.status
        );
    }

    /**
     * @dev Get vote information
     * @param proposalId Proposal ID
     * @param voter Voter address
     * @return Vote information
     */
    function getVote(uint256 proposalId, address voter)
        external
        view
        returns (
            uint8 support,
            uint256 weight,
            string memory reason
        )
    {
        require(proposalId > 0 && proposalId <= _proposalIds.current(), "Invalid proposal");
        Vote storage vote = votes[proposalId][voter];

        return (vote.support, vote.weight, vote.reason);
    }

    /**
     * @dev Check if address has voted on proposal
     * @param proposalId Proposal ID
     * @param voter Voter address
     * @return True if has voted
     */
    function hasVotedOnProposal(uint256 proposalId, address voter)
        external
        view
        returns (bool)
    {
        return hasVoted[proposalId][voter];
    }

    /**
     * @dev Get voting power for address
     * @param account Address to check
     * @return Voting power
     */
    function getVotingPower(address account) external view returns (uint256) {
        return governanceToken.balanceOf(account);
    }

    /**
     * @dev Get total proposals count
     * @return Total proposals
     */
    function getTotalProposals() external view returns (uint256) {
        return _proposalIds.current();
    }

    /**
     * @dev Update governance parameters (only owner)
     * @param newVotingPeriod New voting period
     * @param newQuorumVotes New quorum votes
     * @param newProposalThreshold New proposal threshold
     */
    function updateGovernanceParameters(
        uint256 newVotingPeriod,
        uint256 newQuorumVotes,
        uint256 newProposalThreshold
    ) external onlyOwner {
        votingPeriod = newVotingPeriod;
        quorumVotes = newQuorumVotes;
        proposalThreshold = newProposalThreshold;

        emit GovernanceParametersUpdated(
            newVotingPeriod,
            newQuorumVotes,
            newProposalThreshold
        );
    }

    /**
     * @dev Get governance parameters
     * @return votingPeriod Current voting period
     * @return quorumVotes Current quorum votes
     * @return proposalThreshold Current proposal threshold
     */
    function getGovernanceParameters()
        external
        view
        returns (
            uint256 votingPeriod,
            uint256 quorumVotes,
            uint256 proposalThreshold
        )
    {
        return (votingPeriod, quorumVotes, proposalThreshold);
    }

    /**
     * @dev Get proposal actions
     * @param proposalId Proposal ID
     * @return actions Array of proposal actions
     */
    function getProposalActions(uint256 proposalId)
        external
        view
        returns (ProposalAction[] memory actions)
    {
        require(proposalId > 0 && proposalId <= _proposalIds.current(), "Invalid proposal");
        return proposals[proposalId].actions;
    }

    /**
     * @dev Get proposal state
     * @param proposalId Proposal ID
     * @return state Proposal state string
     */
    function getProposalState(uint256 proposalId)
        external
        view
        returns (string memory state)
    {
        require(proposalId > 0 && proposalId <= _proposalIds.current(), "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];

        if (proposal.canceled) {
            return "Canceled";
        } else if (proposal.executed) {
            return "Executed";
        } else if (block.timestamp < proposal.startTime) {
            return "Pending";
        } else if (block.timestamp <= proposal.endTime) {
            return "Active";
        } else if (proposal.status == ProposalStatus.Succeeded) {
            return "Succeeded";
        } else {
            return "Defeated";
        }
    }
} 