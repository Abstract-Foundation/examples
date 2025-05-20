// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SubscriptionService
 * @dev Minimal contract for subscription management
 */
contract SubscriptionService {
    uint256 public constant subscriptionFee = 0.0001 ether;
    uint256 public constant subscriptionDuration = 15 minutes;

    mapping(address => uint256) public subscriptionExpiry;

    event NewSubscription(address indexed subscriber, uint256 expiresAt);

    /**
     * @dev Subscribe to the service
     */
    function subscribe() external payable {
        require(msg.value == subscriptionFee, "Incorrect payment amount");

        subscriptionExpiry[msg.sender] = block.timestamp + subscriptionDuration;

        emit NewSubscription(msg.sender, subscriptionExpiry[msg.sender]);
    }

    /**
     * @dev Check if an address has an active subscription
     */
    function isSubscribed(address user) external view returns (bool) {
        return subscriptionExpiry[user] > block.timestamp;
    }
}
