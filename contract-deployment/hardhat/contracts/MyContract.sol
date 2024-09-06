// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * Simple example contract to be deployed by the MyContractFactory.
 */
contract MyContract {
    function sayHello() public pure returns (string memory) {
        return "Hello World!";
    }
}