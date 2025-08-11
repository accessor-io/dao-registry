/**
 * Smart Contract Types
 * RFC-001: DAO Registry Specification - Smart Contract Types
 */

// DAO Registry Contract
export interface IDAORegistry {
  struct DAOInfo {
    name: string;
    symbol: string;
    description: string;
    contractAddress: string;
    tokenAddress: string;
    treasuryAddress: string;
    chainId: number;
    verified: boolean;
    createdAt: number;
  }
  
  event DAORegistered(
    address indexed daoAddress,
    string name,
    uint256 chainId
  );
  
  event DAOUpdated(
    address indexed daoAddress,
    string name
  );
  
  function registerDAO(
    string memory name,
    string memory symbol,
    string memory description,
    address contractAddress,
    address tokenAddress,
    address treasuryAddress,
    uint256 chainId
  ) external returns (uint256 daoId);
  
  function updateDAO(
    uint256 daoId,
    string memory name,
    string memory symbol,
    string memory description
  ) external;
  
  function getDAO(uint256 daoId) external view returns (DAOInfo memory);
  
  function getDAOByAddress(address daoAddress) external view returns (uint256 daoId);
  
  function verifyDAO(uint256 daoId) external;
}

// Treasury Contract
export interface ITreasury {
  struct TreasuryInfo {
    address daoAddress;
    uint256 totalValue;
    mapping(address => uint256) tokenBalances;
    address[] supportedTokens;
  }
  
  event FundsReceived(
    address indexed from,
    uint256 amount,
    address token
  );
  
  event FundsWithdrawn(
    address indexed to,
    uint256 amount,
    address token
  );
  
  function receiveFunds(address token, uint256 amount) external;
  
  function withdrawFunds(
    address token,
    uint256 amount,
    address recipient
  ) external;
  
  function getTreasuryInfo() external view returns (TreasuryInfo memory);
}

// ENS Integration Contract
export interface IENSIntegration {
  struct ENSRegistration {
    string primaryDomain;
    string governanceSubdomain;
    string treasurySubdomain;
    string tokenSubdomain;
    address daoAddress;
    bool verified;
    uint256 registrationDate;
  }
  
  event DAOENSRegistered(
    address indexed daoAddress,
    string primaryDomain,
    uint256 registrationDate
  );
  
  event ENSSubdomainUpdated(
    address indexed daoAddress,
    string subdomain,
    string newValue
  );
  
  function registerDAOWithENS(
    string memory primaryDomain,
    string memory governanceSubdomain,
    string memory treasurySubdomain,
    string memory tokenSubdomain,
    address daoAddress
  ) external returns (uint256 registrationId);
  
  function updateENSSubdomain(
    address daoAddress,
    string memory subdomain,
    string memory newValue
  ) external;
  
  function verifyENSRegistration(
    address daoAddress,
    string memory domain
  ) external;
  
  function getENSRegistration(
    address daoAddress
  ) external view returns (ENSRegistration memory);
  
  function getDAOByENSDomain(
    string memory domain
  ) external view returns (address daoAddress);
}

// Governance Contract
export interface IGovernance {
  struct Proposal {
    uint256 id;
    address proposer;
    string title;
    string description;
    uint256 startTime;
    uint256 endTime;
    uint256 quorum;
    uint256 forVotes;
    uint256 againstVotes;
    uint256 abstainVotes;
    bool executed;
    bool canceled;
    address[] targets;
    uint256[] values;
    string[] signatures;
    bytes[] calldatas;
  }
  
  event ProposalCreated(
    uint256 indexed proposalId,
    address indexed proposer,
    address[] targets,
    uint256[] values,
    string[] signatures,
    bytes[] calldatas,
    string title,
    string description
  );
  
  event ProposalExecuted(
    uint256 indexed proposalId
  );
  
  event VoteCast(
    address indexed voter,
    uint256 indexed proposalId,
    uint8 support,
    uint256 weight,
    string reason
  );
  
  function propose(
    address[] memory targets,
    uint256[] memory values,
    string[] memory signatures,
    bytes[] memory calldatas,
    string memory title,
    string memory description
  ) external returns (uint256);
  
  function execute(
    address[] memory targets,
    uint256[] memory values,
    string[] memory signatures,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) external payable returns (uint256);
  
  function castVote(
    uint256 proposalId,
    uint8 support
  ) external;
  
  function castVoteWithReason(
    uint256 proposalId,
    uint8 support,
    string memory reason
  ) external;
  
  function getProposal(uint256 proposalId) external view returns (Proposal memory);
  
  function getProposalState(uint256 proposalId) external view returns (uint256);
}

// Token Contract
export interface IToken {
  struct TokenInfo {
    string name;
    string symbol;
    uint8 decimals;
    uint256 totalSupply;
    address daoAddress;
    bool verified;
  }
  
  event Transfer(
    address indexed from,
    address indexed to,
    uint256 value
  );
  
  event Approval(
    address indexed owner,
    address indexed spender,
    uint256 value
  );
  
  function name() external view returns (string memory);
  
  function symbol() external view returns (string memory);
  
  function decimals() external view returns (uint8);
  
  function totalSupply() external view returns (uint256);
  
  function balanceOf(address account) external view returns (uint256);
  
  function transfer(address to, uint256 amount) external returns (bool);
  
  function allowance(address owner, address spender) external view returns (uint256);
  
  function approve(address spender, uint256 amount) external returns (bool);
  
  function transferFrom(
    address from,
    address to,
    uint256 amount
  ) external returns (bool);
  
  function getTokenInfo() external view returns (TokenInfo memory);
}

// Cross-Chain Bridge Contract
export interface ICrossChainBridge {
  struct BridgeInfo {
    uint256 sourceChainId;
    uint256 targetChainId;
    address sourceContract;
    address targetContract;
    uint256 bridgeFee;
    bool active;
  }
  
  event BridgeInitiated(
    uint256 indexed bridgeId,
    address indexed sender,
    uint256 sourceChainId,
    uint256 targetChainId,
    uint256 amount,
    bytes data
  );
  
  event BridgeCompleted(
    uint256 indexed bridgeId,
    address indexed recipient,
    uint256 targetChainId,
    uint256 amount
  );
  
  function initiateBridge(
    uint256 targetChainId,
    address targetContract,
    uint256 amount,
    bytes memory data
  ) external payable returns (uint256 bridgeId);
  
  function completeBridge(
    uint256 bridgeId,
    address recipient,
    uint256 amount,
    bytes memory proof
  ) external;
  
  function getBridgeInfo(uint256 bridgeId) external view returns (BridgeInfo memory);
  
  function getBridgeFee(uint256 targetChainId) external view returns (uint256);
}

// Analytics Contract
export interface IAnalytics {
  struct AnalyticsData {
    uint256 totalMembers;
    uint256 totalProposals;
    uint256 treasuryValue;
    uint256 participationRate;
    uint256 averageVotingPower;
    uint256 lastUpdate;
  }
  
  event AnalyticsUpdated(
    address indexed daoAddress,
    uint256 totalMembers,
    uint256 totalProposals,
    uint256 treasuryValue
  );
  
  function updateAnalytics(
    address daoAddress,
    uint256 totalMembers,
    uint256 totalProposals,
    uint256 treasuryValue
  ) external;
  
  function getAnalytics(address daoAddress) external view returns (AnalyticsData memory);
  
  function getHistoricalAnalytics(
    address daoAddress,
    uint256 startTime,
    uint256 endTime
  ) external view returns (AnalyticsData[] memory);
}

// Security Contract
export interface ISecurity {
  struct SecurityInfo {
    bool paused;
    address[] authorizedOperators;
    uint256 maxProposalValue;
    uint256 minQuorum;
    uint256 emergencyThreshold;
  }
  
  event EmergencyPaused(
    address indexed pauser,
    string reason
  );
  
  event EmergencyUnpaused(
    address indexed unpauser
  );
  
  event SecurityUpdated(
    uint256 maxProposalValue,
    uint256 minQuorum,
    uint256 emergencyThreshold
  );
  
  function pause() external;
  
  function unpause() external;
  
  function emergencyPause(string memory reason) external;
  
  function updateSecuritySettings(
    uint256 maxProposalValue,
    uint256 minQuorum,
    uint256 emergencyThreshold
  ) external;
  
  function getSecurityInfo() external view returns (SecurityInfo memory);
  
  function isPaused() external view returns (bool);
  
  function isAuthorizedOperator(address operator) external view returns (bool);
} 