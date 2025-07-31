// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockERC20
 * @dev Mock ERC20 token for testing DAO Registry functionality
 */
contract MockERC20 is ERC20, Ownable {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _decimals = decimals_;
    }

    /**
     * @dev Mint tokens to a specific address (only owner)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from a specific address
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Override decimals function
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Transfer tokens with additional data
     * @param to Recipient address
     * @param amount Amount to transfer
     * @param data Additional data
     */
    function transferWithData(
        address to,
        uint256 amount,
        bytes calldata data
    ) external returns (bool) {
        bool success = transfer(to, amount);
        if (success && data.length > 0) {
            // Emit custom event for additional data
            emit TransferWithData(msg.sender, to, amount, data);
        }
        return success;
    }

    /**
     * @dev Batch transfer tokens to multiple addresses
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to transfer
     */
    function batchTransfer(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external returns (bool) {
        require(
            recipients.length == amounts.length,
            "Recipients and amounts arrays must have same length"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            require(transfer(recipients[i], amounts[i]), "Transfer failed");
        }

        return true;
    }

    /**
     * @dev Get token info
     * @return tokenName Token name
     * @return tokenSymbol Token symbol
     * @return supply Total supply
     * @return tokenDecimals Token decimals
     */
    function getTokenInfo()
        external
        view
        returns (
            string memory tokenName,
            string memory tokenSymbol,
            uint256 supply,
            uint8 tokenDecimals
        )
    {
        return (name(), symbol(), totalSupply(), decimals());
    }

    /**
     * @dev Check if address has sufficient balance
     * @param account Address to check
     * @param amount Amount to check
     * @return True if sufficient balance
     */
    function hasSufficientBalance(address account, uint256 amount)
        external
        view
        returns (bool)
    {
        return balanceOf(account) >= amount;
    }

    /**
     * @dev Get balance percentage of total supply
     * @param account Address to check
     * @return percentage Balance percentage (basis points)
     */
    function getBalancePercentage(address account)
        external
        view
        returns (uint256 percentage)
    {
        uint256 balance = balanceOf(account);
        uint256 supply = totalSupply();
        
        if (supply == 0) return 0;
        
        return (balance * 10000) / supply; // Return in basis points
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

    // Events
    event TransferWithData(
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes data
    );
} 