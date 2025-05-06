// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IExclusiveDelegateResolver} from "ExclusiveDelegateResolver/src/IExclusiveDelegateResolver.sol";
import {LibBitmap} from "solady/utils/LibBitmap.sol";
// @dev use zkSync specific import for safe transfer
import {SafeTransferLib} from "solady/utils/ext/zksync/SafeTransferLib.sol";

contract ERC20ClaimForHolders {
    using SafeTransferLib for address;
    using LibBitmap for LibBitmap.Bitmap;

    error NotExclusiveOwnerByRights();
    error AlreadyClaimed();

    uint256 public constant TOKENS_PER_NFT = 1e18;
    address public NFT_CONTRACT_ADDRESS;
    address public ERC20_CONTRACT_ADDRESS;

    bytes24 constant _AGW_LINK_RIGHTS = bytes24(keccak256("AGW_LINK"));

    IExclusiveDelegateResolver public constant DELEGATE_RESOLVER =
        IExclusiveDelegateResolver(0x0000000078CC4Cc1C14E27c0fa35ED6E5E58825D);

    LibBitmap.Bitmap private _claimedTokens;

    function claimTokens(uint256 tokenId) external {
        // check that the caller is the current exclusively delegated owner of this NFT by rights.
        // If they are not, we are not going to let them claim the tokens.
        // An alternative approach here would be to check that they are either the owner of the NFT
        // and if they are not, check the delegation resolver to see if they are delegated to claim the tokens.
        address owner = DELEGATE_RESOLVER.exclusiveOwnerByRights(NFT_CONTRACT_ADDRESS, tokenId, _AGW_LINK_RIGHTS);
        if (msg.sender != owner) {
            revert NotExclusiveOwnerByRights();
        }

        if (isClaimed(tokenId)) {
            revert AlreadyClaimed();
        }

        _claimedTokens.set(tokenId);

        ERC20_CONTRACT_ADDRESS.safeTransfer(msg.sender, TOKENS_PER_NFT);
    }

    function isClaimed(uint256 tokenId) public view returns (bool) {
        return _claimedTokens.get(tokenId);
    }
}
