// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title MockTreasury
 * @dev Mock treasury contract for testing DAO Registry functionality
 */
contract MockTreasury is Ownable, ReentrancyGuard {
    // Treasury balances
    mapping(address => uint256) public ethBalance;
    mapping(address => mapping(address => uint256)) public tokenBalances;
    mapping(address => mapping(uint256 => bool)) public nftBalances;

    // Treasury info
    string public name;
    string public description;
    uint256 public totalValue;
    uint256 public lastUpdated;

    // Events
    event ETHDeposited(address indexed from, uint256 amount);
    event ETHWithdrawn(address indexed to, uint256 amount);
    event TokenDeposited(address indexed token, address indexed from, uint256 amount);
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);
    event NFTDeposited(address indexed nft, address indexed from, uint256 tokenId);
    event NFTWithdrawn(address indexed nft, address indexed to, uint256 tokenId);
    event TreasuryUpdated(uint256 totalValue, uint256 timestamp);

    constructor() {
        name = "Mock DAO Treasury";
        description = "A mock treasury for testing DAO Registry functionality";
        lastUpdated = block.timestamp;
    }

    /**
     * @dev Deposit ETH to treasury
     */
    function depositETH() external payable nonReentrant {
        require(msg.value > 0, "Must deposit some ETH");
        
        ethBalance[msg.sender] += msg.value;
        totalValue += msg.value;
        lastUpdated = block.timestamp;

        emit ETHDeposited(msg.sender, msg.value);
        emit TreasuryUpdated(totalValue, block.timestamp);
    }

    /**
     * @dev Withdraw ETH from treasury (only owner)
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function withdrawETH(address to, uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= address(this).balance, "Insufficient ETH balance");
        require(to != address(0), "Invalid recipient address");

        ethBalance[owner()] -= amount;
        totalValue -= amount;
        lastUpdated = block.timestamp;

        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "ETH transfer failed");

        emit ETHWithdrawn(to, amount);
        emit TreasuryUpdated(totalValue, block.timestamp);
    }

    /**
     * @dev Deposit ERC20 tokens to treasury
     * @param token Token address
     * @param amount Amount to deposit
     */
    function depositToken(address token, uint256 amount) external nonReentrant {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");

        IERC20 tokenContract = IERC20(token);
        require(
            tokenContract.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        tokenBalances[token][msg.sender] += amount;
        totalValue += amount; // Simplified - in real implementation would get USD value
        lastUpdated = block.timestamp;

        emit TokenDeposited(token, msg.sender, amount);
        emit TreasuryUpdated(totalValue, block.timestamp);
    }

    /**
     * @dev Withdraw ERC20 tokens from treasury (only owner)
     * @param token Token address
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function withdrawToken(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");
        require(to != address(0), "Invalid recipient address");

        IERC20 tokenContract = IERC20(token);
        require(
            tokenContract.balanceOf(address(this)) >= amount,
            "Insufficient token balance"
        );

        tokenBalances[token][owner()] -= amount;
        totalValue -= amount; // Simplified
        lastUpdated = block.timestamp;

        require(tokenContract.transfer(to, amount), "Token transfer failed");

        emit TokenWithdrawn(token, to, amount);
        emit TreasuryUpdated(totalValue, block.timestamp);
    }

    /**
     * @dev Deposit NFT to treasury
     * @param nft NFT contract address
     * @param tokenId Token ID
     */
    function depositNFT(address nft, uint256 tokenId) external nonReentrant {
        require(nft != address(0), "Invalid NFT address");

        IERC721 nftContract = IERC721(nft);
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "Not the owner of this NFT"
        );

        nftContract.transferFrom(msg.sender, address(this), tokenId);
        nftBalances[nft][tokenId] = true;
        totalValue += 1; // Simplified - in real implementation would get USD value
        lastUpdated = block.timestamp;

        emit NFTDeposited(nft, msg.sender, tokenId);
        emit TreasuryUpdated(totalValue, block.timestamp);
    }

    /**
     * @dev Withdraw NFT from treasury (only owner)
     * @param nft NFT contract address
     * @param to Recipient address
     * @param tokenId Token ID
     */
    function withdrawNFT(
        address nft,
        address to,
        uint256 tokenId
    ) external onlyOwner nonReentrant {
        require(nft != address(0), "Invalid NFT address");
        require(to != address(0), "Invalid recipient address");
        require(nftBalances[nft][tokenId], "NFT not in treasury");

        IERC721 nftContract = IERC721(nft);
        nftContract.transferFrom(address(this), to, tokenId);
        nftBalances[nft][tokenId] = false;
        totalValue -= 1; // Simplified
        lastUpdated = block.timestamp;

        emit NFTWithdrawn(nft, to, tokenId);
        emit TreasuryUpdated(totalValue, block.timestamp);
    }

    /**
     * @dev Get treasury balance for a specific address
     * @param account Address to check
     * @return ethBalance ETH balance
     * @return tokenCount Number of different tokens
     * @return nftCount Number of NFTs
     */
    function getAccountBalance(address account)
        external
        view
        returns (
            uint256 ethBalance,
            uint256 tokenCount,
            uint256 nftCount
        )
    {
        ethBalance = ethBalance[account];
        
        // Note: This is a simplified implementation
        // In a real implementation, you would track token types and NFT counts
        tokenCount = 0;
        nftCount = 0;
    }

    /**
     * @dev Get treasury statistics
     * @return totalETH Total ETH balance
     * @return totalTokens Total token value
     * @return totalNFTs Total NFT count
     * @return lastUpdate Last update timestamp
     */
    function getTreasuryStats()
        external
        view
        returns (
            uint256 totalETH,
            uint256 totalTokens,
            uint256 totalNFTs,
            uint256 lastUpdate
        )
    {
        totalETH = address(this).balance;
        totalTokens = totalValue - totalETH; // Simplified
        totalNFTs = 0; // Would need to track NFT count
        lastUpdate = lastUpdated;
    }

    /**
     * @dev Check if treasury has sufficient balance
     * @param token Token address (address(0) for ETH)
     * @param amount Amount to check
     * @return True if sufficient balance
     */
    function hasSufficientBalance(address token, uint256 amount)
        external
        view
        returns (bool)
    {
        if (token == address(0)) {
            return address(this).balance >= amount;
        } else {
            IERC20 tokenContract = IERC20(token);
            return tokenContract.balanceOf(address(this)) >= amount;
        }
    }

    /**
     * @dev Get treasury value in USD (mock implementation)
     * @return value Treasury value in USD (scaled by 1e18)
     */
    function getTreasuryValueUSD() external view returns (uint256 value) {
        // Mock implementation - in real scenario would use price oracles
        return totalValue * 2000; // Assume 1 ETH = $2000
    }

    /**
     * @dev Update treasury name and description (only owner)
     * @param newName New treasury name
     * @param newDescription New treasury description
     */
    function updateTreasuryInfo(
        string memory newName,
        string memory newDescription
    ) external onlyOwner {
        name = newName;
        description = newDescription;
        lastUpdated = block.timestamp;
    }

    /**
     * @dev Emergency function to recover stuck tokens
     * @param tokenAddress Token address to recover
     * @param to Recipient address
     * @param amount Amount to recover
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
     * @dev Emergency function to recover stuck NFTs
     * @param nftAddress NFT address to recover
     * @param to Recipient address
     * @param tokenId Token ID to recover
     */
    function emergencyRecoverNFT(
        address nftAddress,
        address to,
        uint256 tokenId
    ) external onlyOwner {
        IERC721 nft = IERC721(nftAddress);
        nft.transferFrom(address(this), to, tokenId);
    }

    /**
     * @dev Emergency function to recover stuck ETH
     * @param to Recipient address
     * @param amount Amount to recover
     */
    function emergencyRecoverETH(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(amount <= address(this).balance, "Insufficient balance");

        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Transfer failed");
    }

    // Receive function to accept ETH
    receive() external payable {
        depositETH();
    }
} 