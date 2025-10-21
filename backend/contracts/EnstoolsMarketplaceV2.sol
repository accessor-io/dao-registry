// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import { EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import { Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import { NameWrapper } from "@ensdomains/ens-contracts/contracts/wrapper/NameWrapper.sol";
import { ERC1155Holder } from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import { MerkleProofUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "hardhat/console.sol";

contract LibraryLockDataLayout {
  bool public initializedFlag;
}

contract EnstoolsMarketplaceV2 is OwnableUpgradeable, ReentrancyGuardUpgradeable, ERC1155Holder {
    using Strings for uint256;
    using Counters for Counters.Counter;
    
    address private signer;

    event NewOffchainSold(uint256 tokenIndex, address seller, address buyer, uint256 amount, uint256 bidAt);

    address ensNFT;

    uint256 LISTING_FEE;
    uint256 FEE_DENOMINATOR;

    bool initializedFlag;

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

    function initialize(
        address _ensNFT
    ) public initializer {
        require(!initializedFlag, "Contract is already initialized");
        signer = _msgSender();
        ensNFT = _ensNFT;
        LISTING_FEE = 100;
        OFFER_FEE = 100;
        FEE_DENOMINATOR = 10000;
        initializedFlag = true;
    }

    function offchainBuy(uint256 _tokenId, address _seller, uint256 _paymentValue, bytes memory _signature) external payable {
        require(verify(abi.encodePacked(_seller, msg.sender, _tokenId, _paymentValue), _signature), "Incorrect Buy");
        
        require(_paymentValue == msg.value);
        payable(_seller).transfer(_paymentValue * (FEE_DENOMINATOR - LISTING_FEE) / FEE_DENOMINATOR);
        NameWrapper(ensNFT).safeTransferFrom(_seller, msg.sender, _tokenId, 1, "0x");

        emit NewOffchainSold(_tokenId, _seller, msg.sender, _paymentValue, getTimestamp());
    }

    function offchainBulkBuy(uint256 [] calldata _tokenIds, address [] calldata _sellers, uint256 [] calldata _paymentValues, bytes [] memory _signatures) external payable {
        require(_tokenIds.length == _sellers.length && _sellers.length == _paymentValues.length && _paymentValues.length == _signatures.length, "The arrays size are not same.");
        
        uint256 i;
        uint256 sumPayment = 0;

        for (i = 0; i < _tokenIds.length; i++) {
            require(verify(abi.encodePacked(_sellers[i], msg.sender, _tokenIds[i], _paymentValues[i]), _signatures[i]), "Incorrect Buy");
            sumPayment = sumPayment + _paymentValues[i];
            payable(_sellers[i]).transfer(_paymentValues[i] * (FEE_DENOMINATOR - LISTING_FEE) / FEE_DENOMINATOR);
            NameWrapper(ensNFT).safeTransferFrom(_sellers[i], msg.sender, _tokenIds[i], 1, "0x");

            emit NewOffchainSold(_tokenIds[i], _sellers[i], msg.sender, _paymentValues[i], getTimestamp());
        }
        
        require(sumPayment == msg.value);
    }

    function makeOffer(address _domainOwner, string calldata _offerName, uint256 _tokenId, uint256 _offerUntil, uint256 _price) external payable {
        require(_price == msg.value);
        require(NameWrapper(ensNFT).balanceOf(_domainOwner, _tokenId) > 0 , "Not Owner of the Domain");

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
        require(_offerId < offerCount, concatenateStrings("Offer Id should be less than ", uint2str(offerCount)));

        OfferEntry storage _offerEntry = offerEntries[_offerId];
        require(getTimestamp() < _offerEntry.offerUntil, "Offer is ended");
        require(!_offerEntry.cancelled, "Offer is cancelled");
        require(msg.sender == _offerEntry.domainOwner, "Caller is not the Owner");

        _offerEntry.selectedAt = getTimestamp();

        payable(_offerEntry.domainOwner).transfer(_offerEntry.price * (FEE_DENOMINATOR - OFFER_FEE) / FEE_DENOMINATOR);
        NameWrapper(ensNFT).safeTransferFrom(address(msg.sender), _offerEntry.offerMaker, _offerEntry.tokenId, 1, "0x");
            
        emit OfferAccepted(_offerId, _offerEntry.domainOwner, _offerEntry.offerMaker, _offerEntry.price, _offerEntry.selectedAt);

        if (_cancelOfferIds.length > 0) {
            uint256 i;
            OfferEntry storage _cancelOfferEntry;

            for (i = 0; i < _cancelOfferIds.length; i++) {
                _cancelOfferEntry = offerEntries[_cancelOfferIds[i]];
                
                if (!_cancelOfferEntry.cancelled) {
                    _cancelOfferEntry.cancelled = true;
                    _cancelOfferEntry.cancelReason = "Sold to another";
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
                require(msg.sender == _cancelOfferEntry.domainOwner, "Caller is not the Owner");

                if (!_cancelOfferEntry.cancelled) {
                    _cancelOfferEntry.cancelled = true;
                    _cancelOfferEntry.cancelReason = "Cancelled by owner";
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
        console.logBytes(_input);
        console.logBytes(_signature);
        bytes32 messageHash = getMessageHash(_input);
        console.logBytes32(messageHash);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        console.logBytes32(ethSignedMessageHash);
        console.log(recoverSigner(ethSignedMessageHash, _signature));
        console.log(signer);

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
        require(sig.length == 65, "invalid signature length");

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
        LISTING_FEE = _newFee;
    }

    function updateOfferFee(uint256 _newFee) external isSigner {
        OFFER_FEE = _newFee;
    }

    function setEnsNFT(address _ensNFT) external isSigner {
        ensNFT = _ensNFT;
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