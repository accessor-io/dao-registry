// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ENS Marketplace
 * @dev A marketplace for trading ENS domains and DAO registrations
 * @author ENS DAO Registry Team
 */
contract Marketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    // ========== STRUCTS ==========

    struct Listing {
        address seller;
        address tokenContract;
        uint256 tokenId;
        uint256 price;
        address paymentToken;
        bool isActive;
        uint256 createdAt;
        uint256 expiresAt;
        string metadata;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
        bool isActive;
    }

    struct Auction {
        address seller;
        address tokenContract;
        uint256 tokenId;
        uint256 startingPrice;
        uint256 reservePrice;
        address paymentToken;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        address highestBidder;
        uint256 highestBid;
        string metadata;
    }

    // ========== STATE VARIABLES ==========

    Counters.Counter private _listingIdCounter;
    Counters.Counter private _auctionIdCounter;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => Bid)) public auctionBids;
    mapping(address => bool) public supportedPaymentTokens;
    mapping(address => bool) public supportedTokenContracts;

    uint256 public platformFeePercentage = 250; // 2.5% in basis points
    address public feeRecipient;
    uint256 public minimumListingDuration = 1 days;
    uint256 public maximumListingDuration = 365 days;

    // ========== EVENTS ==========

    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address indexed tokenContract,
        uint256 tokenId,
        uint256 price,
        address paymentToken,
        uint256 expiresAt
    );

    event ListingUpdated(
        uint256 indexed listingId,
        uint256 newPrice,
        uint256 newExpiresAt
    );

    event ListingCancelled(uint256 indexed listingId);

    event ItemSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 platformFee
    );

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        address indexed tokenContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 endTime
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );

    event PaymentTokenUpdated(address indexed token, bool supported);
    event TokenContractUpdated(address indexed contract, bool supported);
    event PlatformFeeUpdated(uint256 newFeePercentage);

    // ========== MODIFIERS ==========

    modifier onlySupportedToken(address tokenContract) {
        require(supportedTokenContracts[tokenContract], "Token contract not supported");
        _;
    }

    modifier onlySupportedPaymentToken(address paymentToken) {
        require(supportedPaymentTokens[paymentToken], "Payment token not supported");
        _;
    }

    modifier onlyListingOwner(uint256 listingId) {
        require(listings[listingId].seller == msg.sender, "Not listing owner");
        _;
    }

    modifier onlyAuctionOwner(uint256 auctionId) {
        require(auctions[auctionId].seller == msg.sender, "Not auction owner");
        _;
    }

    modifier onlyActiveListing(uint256 listingId) {
        require(listings[listingId].isActive, "Listing not active");
        require(block.timestamp < listings[listingId].expiresAt, "Listing expired");
        _;
    }

    modifier onlyActiveAuction(uint256 auctionId) {
        require(auctions[auctionId].isActive, "Auction not active");
        require(block.timestamp < auctions[auctionId].endTime, "Auction ended");
        _;
    }

    // ========== CONSTRUCTOR ==========

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
        
        // Support ETH as default payment token
        supportedPaymentTokens[address(0)] = true;
    }

    // ========== LISTING FUNCTIONS ==========

    /**
     * @dev Create a new listing for an NFT
     * @param tokenContract Address of the NFT contract
     * @param tokenId ID of the token to list
     * @param price Price in payment token
     * @param paymentToken Address of the payment token (0x0 for ETH)
     * @param duration Duration of the listing in seconds
     * @param metadata Additional metadata for the listing
     */
    function createListing(
        address tokenContract,
        uint256 tokenId,
        uint256 price,
        address paymentToken,
        uint256 duration,
        string calldata metadata
    ) external onlySupportedToken(tokenContract) onlySupportedPaymentToken(paymentToken) {
        require(price > 0, "Price must be greater than 0");
        require(duration >= minimumListingDuration, "Duration too short");
        require(duration <= maximumListingDuration, "Duration too long");

        // Transfer token to marketplace
        IERC721(tokenContract).transferFrom(msg.sender, address(this), tokenId);

        _listingIdCounter.increment();
        uint256 listingId = _listingIdCounter.current();

        listings[listingId] = Listing({
            seller: msg.sender,
            tokenContract: tokenContract,
            tokenId: tokenId,
            price: price,
            paymentToken: paymentToken,
            isActive: true,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + duration,
            metadata: metadata
        });

        emit ListingCreated(
            listingId,
            msg.sender,
            tokenContract,
            tokenId,
            price,
            paymentToken,
            block.timestamp + duration
        );
    }

    /**
     * @dev Update an existing listing
     * @param listingId ID of the listing to update
     * @param newPrice New price for the listing
     * @param newDuration New duration for the listing
     */
    function updateListing(
        uint256 listingId,
        uint256 newPrice,
        uint256 newDuration
    ) external onlyListingOwner(listingId) onlyActiveListing(listingId) {
        require(newPrice > 0, "Price must be greater than 0");
        require(newDuration >= minimumListingDuration, "Duration too short");
        require(newDuration <= maximumListingDuration, "Duration too long");

        listings[listingId].price = newPrice;
        listings[listingId].expiresAt = block.timestamp + newDuration;

        emit ListingUpdated(listingId, newPrice, block.timestamp + newDuration);
    }

    /**
     * @dev Cancel a listing and return the token to the seller
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external onlyListingOwner(listingId) {
        require(listings[listingId].isActive, "Listing not active");

        listings[listingId].isActive = false;

        // Return token to seller
        IERC721(listings[listingId].tokenContract).transferFrom(
            address(this),
            msg.sender,
            listings[listingId].tokenId
        );

        emit ListingCancelled(listingId);
    }

    /**
     * @dev Buy an item from a listing
     * @param listingId ID of the listing to buy from
     */
    function buyItem(uint256 listingId) external payable onlyActiveListing(listingId) nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller != msg.sender, "Cannot buy your own listing");

        // Calculate platform fee
        uint256 platformFee = (listing.price * platformFeePercentage) / 10000;
        uint256 sellerAmount = listing.price - platformFee;

        // Handle payment
        if (listing.paymentToken == address(0)) {
            // ETH payment
            require(msg.value >= listing.price, "Insufficient payment");
            
            // Refund excess ETH
            if (msg.value > listing.price) {
                payable(msg.sender).transfer(msg.value - listing.price);
            }
            
            // Transfer to seller and fee recipient
            payable(listing.seller).transfer(sellerAmount);
            payable(feeRecipient).transfer(platformFee);
        } else {
            // ERC20 payment
            require(msg.value == 0, "ETH not accepted for ERC20 payments");
            
            IERC20(listing.paymentToken).transferFrom(msg.sender, listing.seller, sellerAmount);
            IERC20(listing.paymentToken).transferFrom(msg.sender, feeRecipient, platformFee);
        }

        // Transfer NFT to buyer
        IERC721(listing.tokenContract).transferFrom(address(this), msg.sender, listing.tokenId);

        // Deactivate listing
        listing.isActive = false;

        emit ItemSold(listingId, msg.sender, listing.seller, listing.price, platformFee);
    }

    // ========== AUCTION FUNCTIONS ==========

    /**
     * @dev Create a new auction
     * @param tokenContract Address of the NFT contract
     * @param tokenId ID of the token to auction
     * @param startingPrice Starting price for the auction
     * @param reservePrice Reserve price for the auction
     * @param paymentToken Address of the payment token (0x0 for ETH)
     * @param duration Duration of the auction in seconds
     * @param metadata Additional metadata for the auction
     */
    function createAuction(
        address tokenContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 reservePrice,
        address paymentToken,
        uint256 duration,
        string calldata metadata
    ) external onlySupportedToken(tokenContract) onlySupportedPaymentToken(paymentToken) {
        require(startingPrice > 0, "Starting price must be greater than 0");
        require(reservePrice >= startingPrice, "Reserve price must be >= starting price");
        require(duration >= 1 hours, "Auction duration too short");
        require(duration <= 7 days, "Auction duration too long");

        // Transfer token to marketplace
        IERC721(tokenContract).transferFrom(msg.sender, address(this), tokenId);

        _auctionIdCounter.increment();
        uint256 auctionId = _auctionIdCounter.current();

        auctions[auctionId] = Auction({
            seller: msg.sender,
            tokenContract: tokenContract,
            tokenId: tokenId,
            startingPrice: startingPrice,
            reservePrice: reservePrice,
            paymentToken: paymentToken,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            isActive: true,
            highestBidder: address(0),
            highestBid: 0,
            metadata: metadata
        });

        emit AuctionCreated(
            auctionId,
            msg.sender,
            tokenContract,
            tokenId,
            startingPrice,
            reservePrice,
            block.timestamp + duration
        );
    }

    /**
     * @dev Place a bid on an auction
     * @param auctionId ID of the auction to bid on
     */
    function placeBid(uint256 auctionId) external payable onlyActiveAuction(auctionId) nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.seller != msg.sender, "Cannot bid on your own auction");

        uint256 bidAmount;
        if (auction.paymentToken == address(0)) {
            bidAmount = msg.value;
        } else {
            bidAmount = msg.value; // This would be set by the frontend for ERC20
            // In a real implementation, you'd handle ERC20 transfers here
        }

        require(bidAmount > auction.highestBid, "Bid must be higher than current highest bid");
        require(bidAmount >= auction.startingPrice, "Bid must be at least starting price");

        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            if (auction.paymentToken == address(0)) {
                payable(auction.highestBidder).transfer(auction.highestBid);
            }
        }

        // Update auction state
        auction.highestBidder = msg.sender;
        auction.highestBid = bidAmount;

        // Store bid
        auctionBids[auctionId][msg.sender] = Bid({
            bidder: msg.sender,
            amount: bidAmount,
            timestamp: block.timestamp,
            isActive: true
        });

        emit BidPlaced(auctionId, msg.sender, bidAmount);
    }

    /**
     * @dev End an auction and transfer the NFT to the winner
     * @param auctionId ID of the auction to end
     */
    function endAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended yet");

        auction.isActive = false;

        if (auction.highestBidder != address(0) && auction.highestBid >= auction.reservePrice) {
            // Auction successful
            uint256 platformFee = (auction.highestBid * platformFeePercentage) / 10000;
            uint256 sellerAmount = auction.highestBid - platformFee;

            // Transfer payment
            if (auction.paymentToken == address(0)) {
                payable(auction.seller).transfer(sellerAmount);
                payable(feeRecipient).transfer(platformFee);
            }

            // Transfer NFT to winner
            IERC721(auction.tokenContract).transferFrom(address(this), auction.highestBidder, auction.tokenId);

            emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
        } else {
            // Auction failed - return NFT to seller
            IERC721(auction.tokenContract).transferFrom(address(this), auction.seller, auction.tokenId);
            
            // Refund highest bidder if any
            if (auction.highestBidder != address(0)) {
                if (auction.paymentToken == address(0)) {
                    payable(auction.highestBidder).transfer(auction.highestBid);
                }
            }

            emit AuctionEnded(auctionId, address(0), 0);
        }
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Get listing details
     * @param listingId ID of the listing
     * @return Listing details
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    /**
     * @dev Get auction details
     * @param auctionId ID of the auction
     * @return Auction details
     */
    function getAuction(uint256 auctionId) external view returns (Auction memory) {
        return auctions[auctionId];
    }

    /**
     * @dev Get bid details for an auction
     * @param auctionId ID of the auction
     * @param bidder Address of the bidder
     * @return Bid details
     */
    function getBid(uint256 auctionId, address bidder) external view returns (Bid memory) {
        return auctionBids[auctionId][bidder];
    }

    /**
     * @dev Get total number of listings
     * @return Total listings count
     */
    function getTotalListings() external view returns (uint256) {
        return _listingIdCounter.current();
    }

    /**
     * @dev Get total number of auctions
     * @return Total auctions count
     */
    function getTotalAuctions() external view returns (uint256) {
        return _auctionIdCounter.current();
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Add or remove a supported payment token
     * @param token Address of the payment token
     * @param supported Whether the token is supported
     */
    function setSupportedPaymentToken(address token, bool supported) external onlyOwner {
        supportedPaymentTokens[token] = supported;
        emit PaymentTokenUpdated(token, supported);
    }

    /**
     * @dev Add or remove a supported token contract
     * @param tokenContract Address of the token contract
     * @param supported Whether the contract is supported
     */
    function setSupportedTokenContract(address tokenContract, bool supported) external onlyOwner {
        supportedTokenContracts[tokenContract] = supported;
        emit TokenContractUpdated(tokenContract, supported);
    }

    /**
     * @dev Update platform fee percentage
     * @param newFeePercentage New fee percentage in basis points
     */
    function setPlatformFeePercentage(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee percentage too high"); // Max 10%
        platformFeePercentage = newFeePercentage;
        emit PlatformFeeUpdated(newFeePercentage);
    }

    /**
     * @dev Update fee recipient address
     * @param newFeeRecipient New fee recipient address
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = newFeeRecipient;
    }

    /**
     * @dev Update minimum and maximum listing durations
     * @param newMinimum New minimum duration
     * @param newMaximum New maximum duration
     */
    function setListingDurations(uint256 newMinimum, uint256 newMaximum) external onlyOwner {
        require(newMinimum < newMaximum, "Invalid duration range");
        minimumListingDuration = newMinimum;
        maximumListingDuration = newMaximum;
    }

    /**
     * @dev Emergency function to withdraw stuck tokens
     * @param token Address of the token to withdraw (0x0 for ETH)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
}




