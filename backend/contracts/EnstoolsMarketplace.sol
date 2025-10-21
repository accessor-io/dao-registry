// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import { EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import { Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import { IERC1155 } from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import { ERC1155Holder } from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import { MerkleProofUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { PublicResolver } from "@ensdomains/ens-contracts/contracts/resolvers/PublicResolver.sol";
import "hardhat/console.sol";

contract LibraryLockDataLayout {
  bool public initializedFlag;
}

contract EnstoolsMarketplace is OwnableUpgradeable, ReentrancyGuardUpgradeable, ERC1155Holder {
    using Strings for uint256;
    using Counters for Counters.Counter;
    
    address private signer;

    struct ListingEntry {
        address creator;
        uint256 tokenId;
        uint256 createdAt;
        uint256 listingUntil;
        uint256 selectedAt;
        uint256 price;
        address buyer;
        bool cancelled;
        string listingName;
    }

    event DomainListed(uint256 listingIndex, address creator, uint256 tokenId, uint256 createdAt, uint256 listingUntil, uint256 price, string listingName);
    event NewSold(uint256 listingIndex, address bidder, uint256 amount, uint256 bidAt);
    event NewOffchainSold(uint256 tokenIndex, address seller, address buyer, uint256 amount, uint256 bidAt);
    event ListingCancelled(uint256 listingIndex);
    event DomainTransferred(address from, address to, uint256 tokenId);

    mapping(uint256 => ListingEntry) public listingEntries;
    mapping(uint256 => uint256) public bidCount;
    uint256 listingCount;

    address ensNFT;

    uint256 FEE_PERCENTAGE;
    uint256 FEE_DENOMINATOR;

    bool initializedFlag;

    address newOwner;

    uint256 PRICE_OFFSET;

    struct OfferEntry {
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
    mapping(uint256 => OfferEntry) public offerEntries;
    uint256 public offerCount;
    uint256 OFFER_FEE;

    event OfferMade(uint256 offerIndex, address domainOwner, address offerMaker, uint256 tokenId, uint256 offeredAt, uint256 offerUntil, uint256 price, string offerName);
    event OfferAccepted(uint256 offerIndex, address domainOwner, address offerMaker, uint256 amount, uint256 selectedAt);
    event OfferCancelled(uint256 offerIndex, address domainOwner, address offerMaker, uint256 cancelledAt, string cancelReason);

    address ensPublicResolver;

    function initialize(
        address _ensNFT,
        address _ensPublicResolver
    ) public initializer {
        require(!initializedFlag, "The contract has already been initialized");
        signer = _msgSender();
        ensNFT = _ensNFT;
        ensPublicResolver = _ensPublicResolver;
        listingCount = 0;
        FEE_PERCENTAGE = 100;
        OFFER_FEE = 100;
        FEE_DENOMINATOR = 10000;
        PRICE_OFFSET = 100;
        initializedFlag = true;
    }

    function createListing(string calldata _listingName, uint256 _tokenId, uint256 _listingUntil, uint256 _price) external {
        IERC1155(ensNFT).safeTransferFrom(msg.sender, address(this), _tokenId, 1, "0x");

        ListingEntry storage _listingEntry = listingEntries[listingCount];

        _listingEntry.creator = msg.sender;
        _listingEntry.tokenId = _tokenId;
        _listingEntry.createdAt = getTimestamp();
        _listingEntry.listingUntil = _listingUntil;
        _listingEntry.price = _price;
        _listingEntry.cancelled = false;
        _listingEntry.listingName = _listingName;

        listingCount += 1;
        emit DomainListed(listingCount - 1, _listingEntry.creator, _listingEntry.tokenId, _listingEntry.createdAt, _listingEntry.listingUntil, _listingEntry.price, _listingEntry.listingName);
    }

    function createBulkListing(string [] calldata _listingNames, uint256 [] calldata _tokenIds, uint256 [] calldata _listingUntils, uint256 [] calldata _prices) external {
        require(_tokenIds.length == _listingUntils.length && _listingUntils.length == _prices.length, "The arrays' size is not the same");
        uint256 i;

        for (i = 0; i < _tokenIds.length; i++) {
            IERC1155(ensNFT).safeTransferFrom(msg.sender, address(this), _tokenIds[i], 1, "0x");

            ListingEntry storage _listingEntry = listingEntries[listingCount];

            _listingEntry.creator = msg.sender;
            _listingEntry.tokenId = _tokenIds[i];
            _listingEntry.createdAt = getTimestamp();
            _listingEntry.listingUntil = _listingUntils[i];
            _listingEntry.price = _prices[i];
            _listingEntry.cancelled = false;
            _listingEntry.listingName = _listingNames[i];

            listingCount += 1;
            emit DomainListed(listingCount - 1, _listingEntry.creator, _listingEntry.tokenId, _listingEntry.createdAt, _listingEntry.listingUntil, _listingEntry.price, _listingEntry.listingName);
        }
    }

    function singleTransfer(uint256 _tokenId, address _destination) external {
        IERC1155(ensNFT).safeTransferFrom(msg.sender, address(this), _tokenId, 1, "0x");
        PublicResolver(ensPublicResolver).setAddr(bytes32(_tokenId), _destination);
        IERC1155(ensNFT).safeTransferFrom(address(this), _destination, _tokenId, 1, "0x");
        emit DomainTransferred(msg.sender, _destination, _tokenId);
    }

    function bulkTransfer(uint256 [] calldata _tokenIds, address _destination) external {
        uint256 i;

        for (i = 0; i < _tokenIds.length; i++) {
            IERC1155(ensNFT).safeTransferFrom(msg.sender, address(this), _tokenIds[i], 1, "0x");
            PublicResolver(ensPublicResolver).setAddr(bytes32(_tokenIds[i]), _destination);
            IERC1155(ensNFT).safeTransferFrom(address(this), _destination, _tokenIds[i], 1, "0x");
            emit DomainTransferred(msg.sender, _destination, _tokenIds[i]);
        }
    }

    function buy(uint256 _listingId, uint256 _paymentValue) external payable {
        require(_listingId < listingCount, concatenateStrings("Listing id must be less than ", uint2str(listingCount)));

        ListingEntry storage _listingEntry = listingEntries[_listingId];
        require(_paymentValue == msg.value && _paymentValue == _listingEntry.price);
        require(getTimestamp() < _listingEntry.listingUntil, "Listing has ended");
        require(!_listingEntry.cancelled, "Listing has been canceled");

        _listingEntry.selectedAt = getTimestamp();
        _listingEntry.buyer = msg.sender;

        payable(_listingEntry.creator).transfer(_listingEntry.price * (FEE_DENOMINATOR - FEE_PERCENTAGE) / FEE_DENOMINATOR);
        IERC1155(ensNFT).safeTransferFrom(address(this), msg.sender, _listingEntry.tokenId, 1, "0x");
            
        emit NewSold(_listingId, msg.sender, _paymentValue, _listingEntry.selectedAt);
    }

    function offchainBuy(uint256 _tokenId, address _seller, uint256 _paymentValue, bytes memory _signature) external payable {
        require(verify(abi.encodePacked(_seller, msg.sender, _tokenId, _paymentValue), _signature), "Invalid buy");
        
        require(_paymentValue == msg.value);
        payable(_seller).transfer(_paymentValue * (FEE_DENOMINATOR - FEE_PERCENTAGE) / FEE_DENOMINATOR);
        IERC1155(ensNFT).safeTransferFrom(_seller, address(this), _tokenId, 1, "0x");
        PublicResolver(ensPublicResolver).setAddr(bytes32(_tokenId), msg.sender);
        IERC1155(ensNFT).safeTransferFrom(address(this), msg.sender, _tokenId, 1, "0x");

        emit NewOffchainSold(_tokenId, _seller, msg.sender, _paymentValue, getTimestamp());
    }

    function offchainBulkBuy(uint256 [] calldata _tokenIds, address [] calldata _sellers, uint256 [] calldata _paymentValues, bytes [] memory _signatures) external payable {
        require(_tokenIds.length == _sellers.length && _sellers.length == _paymentValues.length && _paymentValues.length == _signatures.length, "The arrays' size is not the same");
        
        uint256 i;
        uint256 sumPayment = 0;

        for (i = 0; i < _tokenIds.length; i++) {
            require(verify(abi.encodePacked(_sellers[i], msg.sender, _tokenIds[i], _paymentValues[i]), _signatures[i]), "Invalid buy");
            sumPayment = sumPayment + _paymentValues[i];
            payable(_sellers[i]).transfer(_paymentValues[i] * (FEE_DENOMINATOR - FEE_PERCENTAGE) / FEE_DENOMINATOR);
            IERC1155(ensNFT).safeTransferFrom(_sellers[i], address(this), _tokenIds[i], 1, "0x");
            PublicResolver(ensPublicResolver).setAddr(bytes32(_tokenIds[i]), msg.sender);
            IERC1155(ensNFT).safeTransferFrom(address(this), msg.sender, _tokenIds[i], 1, "0x");
            emit NewOffchainSold(_tokenIds[i], _sellers[i], msg.sender, _paymentValues[i], getTimestamp());
        }
        
        require(sumPayment == msg.value);
    }

    function cancelListing(uint256 _listingId) external {
        ListingEntry storage _listingEntry = listingEntries[_listingId];
        require(_listingEntry.creator == msg.sender, "It should be the creator");
        require(_listingEntry.cancelled == false, "It has already been canceled");
        require(_listingEntry.selectedAt == 0, "It has already ended");

        IERC1155(ensNFT).safeTransferFrom(address(this), msg.sender, _listingEntry.tokenId, 1, "0x");
        _listingEntry.cancelled = true;
        _listingEntry.selectedAt = getTimestamp();

        emit ListingCancelled(_listingId);
    }

    function makeOffer(address _domainOwner, string calldata _offerName, uint256 _tokenId, uint256 _offerUntil, uint256 _price) external payable {
        require(_price == msg.value);
        require(IERC1155(ensNFT).balanceOf(_domainOwner, _tokenId) > 0, "You are not the owner of the domain");

        OfferEntry storage _offerEntry = offerEntries[offerCount];

        _offerEntry.domainOwner = _domainOwner;
        _offerEntry.offerMaker = msg.sender;
        _offerEntry.tokenId = _tokenId;
        _offerEntry.offeredAt = getTimestamp();
        _offerEntry.offerUntil = _offerUntil;
        _offerEntry.price = _price;
        _offerEntry.cancelled = false;
        _offerEntry.cancelReason = "";
        _offerEntry.offerName = _offerName;

        offerCount += 1;
        emit OfferMade(offerCount - 1, _offerEntry.domainOwner, _offerEntry.offerMaker, _offerEntry.tokenId, _offerEntry.offeredAt, _offerEntry.offerUntil, _offerEntry.price, _offerEntry.offerName);
    }

    function acceptOffer(uint256 _offerId, uint256 [] calldata _cancelOfferIds) external {
        require(_offerId < offerCount, concatenateStrings("Offer id must be less than ", uint2str(offerCount)));

        OfferEntry storage _offerEntry = offerEntries[_offerId];
        require(getTimestamp() < _offerEntry.offerUntil, "The offer has ended");
        require(!_offerEntry.cancelled, "The offer has been canceled");
        require(msg.sender == _offerEntry.domainOwner, "The caller is not the owner");

        _offerEntry.selectedAt = getTimestamp();

        payable(_offerEntry.domainOwner).transfer(_offerEntry.price * (FEE_DENOMINATOR - OFFER_FEE) / FEE_DENOMINATOR);
        IERC1155(ensNFT).safeTransferFrom(address(msg.sender), address(this), _offerEntry.tokenId, 1, "0x");
        PublicResolver(ensPublicResolver).setAddr(bytes32(_offerEntry.tokenId), _offerEntry.offerMaker);
        IERC1155(ensNFT).safeTransferFrom(address(this), _offerEntry.offerMaker, _offerEntry.tokenId, 1, "0x");
            
        emit OfferAccepted(_offerId, _offerEntry.domainOwner, _offerEntry.offerMaker, _offerEntry.price, _offerEntry.selectedAt);

        if (_cancelOfferIds.length > 0) {
            uint256 i;
            OfferEntry storage _cancelOfferEntry;

            for (i = 0; i < _cancelOfferIds.length; i++) {
                _cancelOfferEntry = offerEntries[_cancelOfferIds[i]];
                
                if (!_cancelOfferEntry.cancelled) {
                    _cancelOfferEntry.cancelled = true;
                    _cancelOfferEntry.cancelReason = "Sold to someone else";
                    _cancelOfferEntry.cancelledAt = getTimestamp();

                    emit OfferCancelled(_cancelOfferIds[i], _cancelOfferEntry.domainOwner, _cancelOfferEntry.offerMaker, _cancelOfferEntry.cancelledAt, _cancelOfferEntry.cancelReason);
                }
            }
        }
    }
    
    function rejectOffers(uint256 [] calldata _cancelOfferIds) external {
        if (_cancelOfferIds.length > 0) {
            uint256 i;
            OfferEntry storage _cancelOfferEntry;

            for (i = 0; i < _cancelOfferIds.length; i++) {
                _cancelOfferEntry = offerEntries[_cancelOfferIds[i]];
                require(msg.sender == _cancelOfferEntry.domainOwner, "The caller is not the owner of the domain");

                if (!_cancelOfferEntry.cancelled) {
                    _cancelOfferEntry.cancelled = true;
                    _cancelOfferEntry.cancelReason = "Cancelled by the owner";
                    _cancelOfferEntry.cancelledAt = getTimestamp();

                    emit OfferCancelled(_cancelOfferIds[i], _cancelOfferEntry.domainOwner, _cancelOfferEntry.offerMaker, _cancelOfferEntry.cancelledAt, _cancelOfferEntry.cancelReason);
                }
            }
        }
    }

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

    function verify(
        bytes memory _input,
        bytes memory _signature
    ) private view returns (bool) {
        bytes32 messageHash = getMessageHash(_input);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        return recoverSigner(ethSignedMessageHash, _signature) == signer;
    }

    function getMessageHash(bytes memory _input) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(_input));
    }

    function getEthSignedMessageHash(bytes32 _messageHash)
        private
        pure
        returns (bytes32)
    {
        /*
        Signature is produced by signing a keccak256 hash with the following format:
        "\x19Ethereum Signed Message\n" + len(msg) + msg
        */
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
            );
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature)
        private
        pure
        returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig)
        private
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }

    function getSigner() public view returns (address) {
        return signer;
    }

    function updateSigner(address _signer) external isSigner {
        signer = _signer;
    }

    function updateFee(uint256 _newFee) external isSigner {
        FEE_PERCENTAGE = _newFee;
    }

    function updateOfferFee(uint256 _newFee) external isSigner {
        OFFER_FEE = _newFee;
    }

    function updatePriceOffset(uint256 _newOffset) external isSigner {
        PRICE_OFFSET = _newOffset;
    }

    function setEnsNFT(address _ensNFT) external isSigner {
        ensNFT = _ensNFT;
    }

    function setEnsPublicResolver(address _ensPublicResolver) external isSigner {
        ensPublicResolver = _ensPublicResolver;
    }

    function setInitializedFlag(bool _initializedFlag) external isSigner {
        initializedFlag = _initializedFlag;
    }

    function recoverETH() external isSigner {
        uint256 balance = address(this).balance;

        if (balance > 0) {
            (bool success, ) = payable(msg.sender).call{value: balance}('');
            require(success);
        }
    }

    function getListingCount() public view returns (uint256) {
        return listingCount;
    }

    function getTimestamp() public view virtual returns (uint256) {
        return block.timestamp;
    }

    modifier isSigner {
        require(_msgSender() == signer, "This function can only be called by an signer");
        _;
    }

    modifier delegatedOnly() {
        require(initializedFlag, "The library is locked. No direct 'call' is allowed");
        _;
    }
}