// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SubscriptionRegistry} from "../SubscriptionRegistry.sol";
import {SubscriptionAccount} from "../SubscriptionAccount.sol";

contract ReentrancyAttacker {
    SubscriptionRegistry public immutable registry;
    uint256 public attackCount;
    bool public isAttacking;

    constructor(address payable _registry) {
        registry = SubscriptionRegistry(_registry);
    }

    // Try to reenter during subscription
    function attack(uint256 planId) external {
        isAttacking = true;
        // First subscription
        registry.subscribe(planId);
        // Second subscription attempt in same tx
        registry.subscribe(planId);
    }

    // Try to reenter during payment processing
    function attackPayment(address payable account, uint256 planId) external {
        isAttacking = true;
        SubscriptionAccount(account).processSubscriptionPayment(planId);
    }

    // Fallback function that tries to reenter
    receive() external payable {
        if (isAttacking && attackCount < 5) {
            attackCount++;
            // Try to reenter the same function that triggered this callback
            registry.subscribe(0);
        }
    }

    fallback() external payable {}
}
