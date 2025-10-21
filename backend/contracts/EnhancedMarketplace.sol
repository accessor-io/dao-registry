// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import { PublicResolver } from "@ensdomains/ens-contracts/contracts/resolvers/PublicResolver.sol";

/**
 * @title Enhanced ENS Marketplace
 * @dev A comprehensive marketplace for trading ENS domains and DAO registrations
 * @author ENS DAO Registry Team
 * @notice Combines features from both the original marketplace and Enstools marketplace
 */
contract EnhancedMarketplace is ReentrancyGuard, Ownable, ERC1155Holder {
    using Counters for Counters.Counter;
    using Strings for uint256;

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
        string listingName;
        bool cancelled;
        uint256 selectedAt;
        address buyer;
    }

    struct Offer {
        address domainOwner;
        address offerMaker;
        uint256 tokenId;
        uint256 offeredAt;
        uint256 offerUntil;
        uint256 selectedAt;
        uint256 price;
        bool cancelled;
        string cancelReason;
        uint256 cancelledAt;
        string offerName;
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
        string auctionName;
        bool cancelled;
        uint256 selectedAt;
    }

    // ========== STATE VARIABLES ==========

    Counters.Counter private _listingIdCounter;
    Counters.Counter private _auctionIdCounter;
    Counters.Counter private _offerIdCounter;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => Offer) public offers;
    mapping(address => bool) public supportedPaymentTokens;
    mapping(address => bool) public supportedTokenContracts;

    // Enstools marketplace features
    address private signer;
    address public ensNFT;
    address public ensPublicResolver;
    uint256 public FEE_PERCENTAGE = 100; // 1% in basis points
    uint256 public OFFER_FEE = 100; // 1% in basis points
    uint256 public FEE_DENOMINATOR = 10000;
    uint256 public PRICE_OFFSET = 100;

    uint256 public minimumListingDuration = 1 days;
    uint256 public maximumListingDuration = 365 days;

    // ========== EVENTS ==========

    // Listing events
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address indexed tokenContract,
        uint256 tokenId,
        uint256 price,
        address paymentToken,
        uint256 expiresAt,
        string listingName
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

    // Offchain events
    event NewOffchainSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 amount,
        uint256 soldAt
    );

    // Offer events
    event OfferMade(
        uint256 indexed offerId,
        address indexed domainOwner,
        address indexed offerMaker,
        uint256 tokenId,
        uint256 offeredAt,
        uint256 offerUntil,
        uint256 price,
        string offerName
    );

    event OfferAccepted(
        uint256 indexed offerId,
        address indexed domainOwner,
        address indexed offerMaker,
        uint256 amount,
        uint256 selectedAt
    );

    event OfferCancelled(
        uint256 indexed offerId,
        address indexed domainOwner,
        address indexed offerMaker,
        uint256 cancelledAt,
        string cancelReason
    );

    // Auction events
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        address indexed tokenContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 endTime,
        string auctionName
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

    // Admin events
    event PaymentTokenUpdated(address indexed token, bool supported);
    event TokenContractUpdated(address indexed contract, bool supported);
    event PlatformFeeUpdated(uint256 newFeePercentage);
    event SignerUpdated(address indexed newSigner);

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

    modifier onlySigner() {
        require(msg.sender == signer, "Only signer can call this function");
        _;
    }

    // ========== CONSTRUCTOR ==========

    constructor(
        address _ensNFT,
        address _ensPublicResolver,
        address _signer
    ) {
        ensNFT = _ensNFT;
        ensPublicResolver = _ensPublicResolver;
        signer = _signer;
        
        // Support ETH as default payment token
        supportedPaymentTokens[address(0)] = true;
    }

    // ========== LISTING FUNCTIONS ==========

    /**
     * @dev Create a new listing for an NFT
     */
    function createListing(
        address tokenContract,
        uint256 tokenId,
        uint256 price,
        address paymentToken,
        uint256 duration,
        string calldata metadata,
        string calldata listingName
    ) external onlySupportedToken(tokenContract) onlySupportedPaymentToken(paymentToken) {
        require(price > 0, "Price must be greater than 0");
        require(duration >= minimumListingDuration, "Duration too short");
        require(duration <= maximumListingDuration, "Duration too long");

        // Transfer token to marketplace
        IERC1155(tokenContract).safeTransferFrom(msg.sender, address(this), tokenId, 1, "0x");

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
            metadata: metadata,
            listingName: listingName,
            cancelled: false,
            selectedAt: 0,
            buyer: address(0)
        });

        emit ListingCreated(
            listingId,
            msg.sender,
            tokenContract,
            tokenId,
            price,
            paymentToken,
            block.timestamp + duration,
            listingName
        );
    }

    /**
     * @dev Create multiple listings in a single transaction
     */
    function createBulkListing(
        string[] calldata listingNames,
        uint256[] calldata tokenIds,
        uint256[] calldata durations,
        uint256[] calldata prices,
        address tokenContract,
        address paymentToken
    ) external onlySupportedToken(tokenContract) onlySupportedPaymentToken(paymentToken) {
        require(
            tokenIds.length == durations.length && 
            durations.length == prices.length && 
            prices.length == listingNames.length,
            "Array lengths must match"
        );

        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(prices[i] > 0, "Price must be greater than 0");
            require(durations[i] >= minimumListingDuration, "Duration too short");
            require(durations[i] <= maximumListingDuration, "Duration too long");

            // Transfer token to marketplace
            IERC1155(tokenContract).safeTransferFrom(msg.sender, address(this), tokenIds[i], 1, "0x");

            _listingIdCounter.increment();
            uint256 listingId = _listingIdCounter.current();

            listings[listingId] = Listing({
                seller: msg.sender,
                tokenContract: tokenContract,
                tokenId: tokenIds[i],
                price: prices[i],
                paymentToken: paymentToken,
                isActive: true,
                createdAt: block.timestamp,
                expiresAt: block.timestamp + durations[i],
                metadata: "",
                listingName: listingNames[i],
                cancelled: false,
                selectedAt: 0,
                buyer: address(0)
            });

            emit ListingCreated(
                listingId,
                msg.sender,
                tokenContract,
                tokenIds[i],
                prices[i],
                paymentToken,
                block.timestamp + durations[i],
                listingNames[i]
            );
        }
    }

    /**
     * @dev Buy an item from a listing
     */
    function buyItem(uint256 listingId) external payable onlyActiveListing(listingId) nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller != msg.sender, "Cannot buy your own listing");

        // Calculate platform fee
        uint256 platformFee = (listing.price * FEE_PERCENTAGE) / FEE_DENOMINATOR;
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
            payable(owner()).transfer(platformFee);
        } else {
            // ERC20 payment
            require(msg.value == 0, "ETH not accepted for ERC20 payments");
            
            IERC20(listing.paymentToken).transferFrom(msg.sender, listing.seller, sellerAmount);
            IERC20(listing.paymentToken).transferFrom(msg.sender, owner(), platformFee);
        }

        // Transfer NFT to buyer
        IERC1155(listing.tokenContract).safeTransferFrom(address(this), msg.sender, listing.tokenId, 1, "0x");

        // Update listing state
        listing.isActive = false;
        listing.selectedAt = block.timestamp;
        listing.buyer = msg.sender;

        emit ItemSold(listingId, msg.sender, listing.seller, listing.price, platformFee);
    }

    /**
     * @dev Cancel a listing and return the token to the seller
     */
    function cancelListing(uint256 listingId) external onlyListingOwner(listingId) {
        require(listings[listingId].isActive, "Listing not active");
        require(listings[listingId].selectedAt == 0, "Listing already sold");

        listings[listingId].isActive = false;
        listings[listingId].cancelled = true;
        listings[listingId].selectedAt = block.timestamp;

        // Return token to seller
        IERC1155(listings[listingId].tokenContract).safeTransferFrom(
            address(this),
            msg.sender,
            listings[listingId].tokenId,
            1,
            "0x"
        );

        emit ListingCancelled(listingId);
    }

    // ========== OFFCHAIN FUNCTIONS ==========

    /**
     * @dev Buy an item offchain with signature verification
     */
    function offchainBuy(
        uint256 tokenId,
        address seller,
        uint256 paymentValue,
        bytes memory signature
    ) external payable {
        require(verify(abi.encodePacked(seller, msg.sender, tokenId, paymentValue), signature), "Invalid signature");
        require(paymentValue == msg.value, "Payment value mismatch");

        // Calculate platform fee
        uint256 platformFee = (paymentValue * FEE_PERCENTAGE) / FEE_DENOMINATOR;
        uint256 sellerAmount = paymentValue - platformFee;

        // Transfer payment
        payable(seller).transfer(sellerAmount);
        payable(owner()).transfer(platformFee);

        // Transfer NFT
        IERC1155(ensNFT).safeTransferFrom(seller, address(this), tokenId, 1, "0x");
        PublicResolver(ensPublicResolver).setAddr(bytes32(tokenId), msg.sender);
        IERC1155(ensNFT).safeTransferFrom(address(this), msg.sender, tokenId, 1, "0x");

        emit NewOffchainSold(tokenId, seller, msg.sender, paymentValue, block.timestamp);
    }

    /**
     * @dev Buy multiple items offchain in a single transaction
     */
    function offchainBulkBuy(
        uint256[] calldata tokenIds,
        address[] calldata sellers,
        uint256[] calldata paymentValues,
        bytes[] memory signatures
    ) external payable {
        require(
            tokenIds.length == sellers.length && 
            sellers.length == paymentValues.length && 
            paymentValues.length == signatures.length,
            "Array lengths must match"
        );

        uint256 totalPayment = 0;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(
                verify(abi.encodePacked(sellers[i], msg.sender, tokenIds[i], paymentValues[i]), signatures[i]),
                "Invalid signature"
            );

            totalPayment += paymentValues[i];

            // Calculate platform fee
            uint256 platformFee = (paymentValues[i] * FEE_PERCENTAGE) / FEE_DENOMINATOR;
            uint256 sellerAmount = paymentValues[i] - platformFee;

            // Transfer payment
            payable(sellers[i]).transfer(sellerAmount);
            payable(owner()).transfer(platformFee);

            // Transfer NFT
            IERC1155(ensNFT).safeTransferFrom(sellers[i], address(this), tokenIds[i], 1, "0x");
            PublicResolver(ensPublicResolver).setAddr(bytes32(tokenIds[i]), msg.sender);
            IERC1155(ensNFT).safeTransferFrom(address(this), msg.sender, tokenIds[i], 1, "0x");

            emit NewOffchainSold(tokenIds[i], sellers[i], msg.sender, paymentValues[i], block.timestamp);
        }

        require(totalPayment == msg.value, "Total payment mismatch");
    }

    // ========== OFFER FUNCTIONS ==========

    /**
     * @dev Make an offer for a domain
     */
    function makeOffer(
        address domainOwner,
        string calldata offerName,
        uint256 tokenId,
        uint256 offerUntil,
        uint256 price
    ) external payable {
        require(price == msg.value, "Payment value mismatch");
        require(IERC1155(ensNFT).balanceOf(domainOwner, tokenId) > 0, "Domain owner does not own this token");

        _offerIdCounter.increment();
        uint256 offerId = _offerIdCounter.current();

        offers[offerId] = Offer({
            domainOwner: domainOwner,
            offerMaker: msg.sender,
            tokenId: tokenId,
            offeredAt: block.timestamp,
            offerUntil: offerUntil,
            selectedAt: 0,
            price: price,
            cancelled: false,
            cancelReason: "",
            cancelledAt: 0,
            offerName: offerName
        });

        emit OfferMade(offerId, domainOwner, msg.sender, tokenId, block.timestamp, offerUntil, price, offerName);
    }

    /**
     * @dev Accept an offer
     */
    function acceptOffer(uint256 offerId, uint256[] calldata cancelOfferIds) external {
        require(offerId < _offerIdCounter.current(), "Invalid offer ID");

        Offer storage offer = offers[offerId];
        require(block.timestamp < offer.offerUntil, "Offer has expired");
        require(!offer.cancelled, "Offer has been cancelled");
        require(msg.sender == offer.domainOwner, "Only domain owner can accept offer");

        offer.selectedAt = block.timestamp;

        // Calculate platform fee
        uint256 platformFee = (offer.price * OFFER_FEE) / FEE_DENOMINATOR;
        uint256 sellerAmount = offer.price - platformFee;

        // Transfer payment
        payable(offer.domainOwner).transfer(sellerAmount);
        payable(owner()).transfer(platformFee);

        // Transfer NFT
        IERC1155(ensNFT).safeTransferFrom(msg.sender, address(this), offer.tokenId, 1, "0x");
        PublicResolver(ensPublicResolver).setAddr(bytes32(offer.tokenId), offer.offerMaker);
        IERC1155(ensNFT).safeTransferFrom(address(this), offer.offerMaker, offer.tokenId, 1, "0x");

        emit OfferAccepted(offerId, offer.domainOwner, offer.offerMaker, offer.price, block.timestamp);

        // Cancel other offers if specified
        for (uint256 i = 0; i < cancelOfferIds.length; i++) {
            Offer storage cancelOffer = offers[cancelOfferIds[i]];
            if (!cancelOffer.cancelled) {
                cancelOffer.cancelled = true;
                cancelOffer.cancelReason = "Sold to another buyer";
                cancelOffer.cancelledAt = block.timestamp;

                // Refund the cancelled offer
                payable(cancelOffer.offerMaker).transfer(cancelOffer.price);

                emit OfferCancelled(cancelOfferIds[i], cancelOffer.domainOwner, cancelOffer.offerMaker, block.timestamp, "Sold to another buyer");
            }
        }
    }

    /**
     * @dev Reject offers
     */
    function rejectOffers(uint256[] calldata offerIds) external {
        for (uint256 i = 0; i < offerIds.length; i++) {
            Offer storage offer = offers[offerIds[i]];
            require(msg.sender == offer.domainOwner, "Only domain owner can reject offer");

            if (!offer.cancelled) {
                offer.cancelled = true;
                offer.cancelReason = "Rejected by owner";
                offer.cancelledAt = block.timestamp;

                // Refund the offer
                payable(offer.offerMaker).transfer(offer.price);

                emit OfferCancelled(offerIds[i], offer.domainOwner, offer.offerMaker, block.timestamp, "Rejected by owner");
            }
        }
    }

    // ========== AUCTION FUNCTIONS ==========

    /**
     * @dev Create a new auction
     */
    function createAuction(
        address tokenContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 reservePrice,
        address paymentToken,
        uint256 duration,
        string calldata metadata,
        string calldata auctionName
    ) external onlySupportedToken(tokenContract) onlySupportedPaymentToken(paymentToken) {
        require(startingPrice > 0, "Starting price must be greater than 0");
        require(reservePrice >= startingPrice, "Reserve price must be >= starting price");
        require(duration >= 1 hours, "Auction duration too short");
        require(duration <= 7 days, "Auction duration too long");

        // Transfer token to marketplace
        IERC1155(tokenContract).safeTransferFrom(msg.sender, address(this), tokenId, 1, "0x");

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
            metadata: metadata,
            auctionName: auctionName,
            cancelled: false,
            selectedAt: 0
        });

        emit AuctionCreated(
            auctionId,
            msg.sender,
            tokenContract,
            tokenId,
            startingPrice,
            reservePrice,
            block.timestamp + duration,
            auctionName
        );
    }

    /**
     * @dev Place a bid on an auction
     */
    function placeBid(uint256 auctionId) external payable onlyActiveAuction(auctionId) nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.seller != msg.sender, "Cannot bid on your own auction");

        uint256 bidAmount = msg.value;
        require(bidAmount > auction.highestBid, "Bid must be higher than current highest bid");
        require(bidAmount >= auction.startingPrice, "Bid must be at least starting price");

        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        // Update auction state
        auction.highestBidder = msg.sender;
        auction.highestBid = bidAmount;

        emit BidPlaced(auctionId, msg.sender, bidAmount);
    }

    /**
     * @dev End an auction and transfer the NFT to the winner
     */
    function endAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended yet");

        auction.isActive = false;
        auction.selectedAt = block.timestamp;

        if (auction.highestBidder != address(0) && auction.highestBid >= auction.reservePrice) {
            // Auction successful
            uint256 platformFee = (auction.highestBid * FEE_PERCENTAGE) / FEE_DENOMINATOR;
            uint256 sellerAmount = auction.highestBid - platformFee;

            // Transfer payment
            payable(auction.seller).transfer(sellerAmount);
            payable(owner()).transfer(platformFee);

            // Transfer NFT to winner
            IERC1155(auction.tokenContract).safeTransferFrom(address(this), auction.highestBidder, auction.tokenId, 1, "0x");

            emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
        } else {
            // Auction failed - return NFT to seller
            IERC1155(auction.tokenContract).safeTransferFrom(address(this), auction.seller, auction.tokenId, 1, "0x");
            
            // Refund highest bidder if any
            if (auction.highestBidder != address(0)) {
                payable(auction.highestBidder).transfer(auction.highestBid);
            }

            emit AuctionEnded(auctionId, address(0), 0);
        }
    }

    // ========== VIEW FUNCTIONS ==========

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    function getAuction(uint256 auctionId) external view returns (Auction memory) {
        return auctions[auctionId];
    }

    function getOffer(uint256 offerId) external view returns (Offer memory) {
        return offers[offerId];
    }

    function getTotalListings() external view returns (uint256) {
        return _listingIdCounter.current();
    }

    function getTotalAuctions() external view returns (uint256) {
        return _auctionIdCounter.current();
    }

    function getTotalOffers() external view returns (uint256) {
        return _offerIdCounter.current();
    }

    // ========== SIGNATURE VERIFICATION ==========

    function verify(bytes memory _input, bytes memory _signature) private view returns (bool) {
        bytes32 messageHash = getMessageHash(_input);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        return recoverSigner(ethSignedMessageHash, _signature) == signer;
    }

    function getMessageHash(bytes memory _input) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(_input));
    }

    function getEthSignedMessageHash(bytes32 _messageHash) private pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) private pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) private pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    // ========== ADMIN FUNCTIONS ==========

    function setSupportedPaymentToken(address token, bool supported) external onlyOwner {
        supportedPaymentTokens[token] = supported;
        emit PaymentTokenUpdated(token, supported);
    }

    function setSupportedTokenContract(address tokenContract, bool supported) external onlyOwner {
        supportedTokenContracts[tokenContract] = supported;
        emit TokenContractUpdated(tokenContract, supported);
    }

    function setPlatformFeePercentage(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee percentage too high"); // Max 10%
        FEE_PERCENTAGE = newFeePercentage;
        emit PlatformFeeUpdated(newFeePercentage);
    }

    function setOfferFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee percentage too high"); // Max 10%
        OFFER_FEE = newFee;
    }

    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
        emit SignerUpdated(_signer);
    }

    function setEnsNFT(address _ensNFT) external onlyOwner {
        ensNFT = _ensNFT;
    }

    function setEnsPublicResolver(address _ensPublicResolver) external onlyOwner {
        ensPublicResolver = _ensPublicResolver;
    }

    function setListingDurations(uint256 newMinimum, uint256 newMaximum) external onlyOwner {
        require(newMinimum < newMaximum, "Invalid duration range");
        minimumListingDuration = newMinimum;
        maximumListingDuration = newMaximum;
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }

    // ========== UTILITY FUNCTIONS ==========

    function uint2str(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + value % 10));
            value /= 10;
        }
        
        return string(buffer);
    }

    function concatenateStrings(string memory a, string memory b) public pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }
}


