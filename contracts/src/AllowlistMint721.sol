// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {ERC721} from "solady/tokens/ERC721.sol";
import {MerkleProofLib} from "solady/utils/MerkleProofLib.sol";
import {IExclusiveDelegateResolver} from "ExclusiveDelegateResolver/src/IExclusiveDelegateResolver.sol";
// @dev use zkSync specific import for signature verification
import {SignatureCheckerLib} from "solady/utils/ext/zksync/SignatureCheckerLib.sol";

contract AllowlistMint721 is ERC721 {
    error AlreadyMinted();
    error NotAllowed();
    error InvalidProof();
    error InvalidSignature();

    bytes24 constant _AGW_LINK_RIGHTS = bytes24(keccak256("AGW_LINK"));

    IExclusiveDelegateResolver public constant DELEGATE_RESOLVER =
        IExclusiveDelegateResolver(0x0000000078CC4Cc1C14E27c0fa35ED6E5E58825D);

    bytes32 public merkleRoot;
    address public exampleSigner;

    mapping(address => bool) public minted;

    uint256 public tokenIndex;

    constructor(bytes32 _merkleRoot, address _exampleSigner) {
        merkleRoot = _merkleRoot;
        exampleSigner = _exampleSigner;
    }

    function name() public pure override returns (string memory) {
        return "Example";
    }

    function symbol() public pure override returns (string memory) {
        return "EXAMPLE";
    }

    function tokenURI(uint256 tokenId) public pure override returns (string memory) {
        return "";
    }

    function mintWithMerkleProof(address user, bytes32[] calldata proof) public {
        // check if the address has already minted
        if (minted[user]) revert AlreadyMinted();

        // in this example, we want to allow the user ONLY to mint from a delegated AGW if it is set
        // check that the caller is the current exclusively delegated wallet by rights
        if (msg.sender != DELEGATE_RESOLVER.exclusiveWalletByRights(user, _AGW_LINK_RIGHTS)) {
            revert NotAllowed();
        }

        // check the proof against the passed address as that is the address submitted
        // for allowlisting (likely an EOA wallet)
        if (!MerkleProofLib.verifyCalldata(proof, merkleRoot, keccak256(abi.encode(user)))) {
            revert InvalidProof();
        }

        minted[user] = true;
        _mint(msg.sender, ++tokenIndex);
    }

    function mintWithSignature(address user, bytes calldata signature) public {
        if (minted[user]) revert AlreadyMinted();

        // in this example, we want to allow the user to mint for themselves OR from a delegated AGW
        // if the caller is not the user we are minting for; check if the caller is the exclusively
        // delegated wallet for AGW linking
        if (msg.sender != user) {
            address allowedWallet = DELEGATE_RESOLVER.exclusiveWalletByRights(user, _AGW_LINK_RIGHTS);
            if (msg.sender != allowedWallet) {
                revert NotAllowed();
            }
        }

        // check the signature against the passed address as that is the address submitted
        // for allowlisting (likely an EOA wallet)
        // @dev this is not a particular secure method of signature verification; would recommend using
        // a more robust EIP-712 typed signature instead of just signing the hashed address
        if (!SignatureCheckerLib.isValidSignatureNow(exampleSigner, keccak256(abi.encode(user)), signature)) {
            revert InvalidSignature();
        }

        minted[user] = true;
        _mint(msg.sender, ++tokenIndex);
    }
}
