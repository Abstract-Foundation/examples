// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SmartAccount.sol";

contract SmartAccountFactory {
    function deployAccount(
        address _owner
    ) external returns (address accountAddress) {
        SmartAccount account = new SmartAccount(_owner);
        return address(account);
    }
}