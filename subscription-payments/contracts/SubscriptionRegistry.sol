// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SubscriptionRegistry
 * @notice Manages subscription plans and user subscriptions
 */
contract SubscriptionRegistry is Ownable, ReentrancyGuard {
    error InvalidInterval();
    error InvalidAmount();
    error PlanNotActive();
    error AlreadySubscribed();
    error NoActiveSubscription();
    error PaymentNotDue();
    error NoBalance();
    error WithdrawalFailed();
    error SubscriptionNotActive();

    struct SubscriptionPlan {
        uint256 amount; // Amount per interval in wei
        uint256 interval; // Time interval in seconds
        bool active; //  Whether the plan is active
    }

    struct Subscription {
        uint256 planId;
        uint256 startTime;
        uint256 nextPayment;
        bool active;
    }

    // planId => SubscriptionPlan
    mapping(uint256 => SubscriptionPlan) public plans;
    // subscriber => planId => Subscription
    mapping(address => mapping(uint256 => Subscription)) public subscriptions;

    uint256 public nextPlanId;

    event PlanCreated(uint256 indexed planId, uint256 amount, uint256 interval);
    event PlanUpdated(uint256 indexed planId, uint256 amount, uint256 interval);
    event PlanDeactivated(uint256 indexed planId);
    event SubscriptionCreated(
        address indexed subscriber,
        uint256 indexed planId,
        uint256 startTime
    );
    event SubscriptionCancelled(address indexed subscriber, uint256 indexed planId);
    event PaymentProcessed(address indexed subscriber, uint256 indexed planId, uint256 amount);

    constructor() Ownable() {
        _transferOwnership(msg.sender);
    }

    function createPlan(uint256 amount, uint256 interval) external onlyOwner returns (uint256) {
        if (interval == 0) revert InvalidInterval();
        if (amount == 0) revert InvalidAmount();

        uint256 planId = nextPlanId++;
        plans[planId] = SubscriptionPlan({amount: amount, interval: interval, active: true});

        emit PlanCreated(planId, amount, interval);
        return planId;
    }

    function subscribe(uint256 planId) external nonReentrant {
        SubscriptionPlan memory plan = plans[planId];
        if (!plan.active) revert PlanNotActive();
        if (subscriptions[msg.sender][planId].active) revert AlreadySubscribed();

        uint256 startTime = block.timestamp;
        subscriptions[msg.sender][planId] = Subscription({
            planId: planId,
            startTime: startTime,
            nextPayment: startTime + plan.interval,
            active: true
        });

        emit SubscriptionCreated(msg.sender, planId, startTime);
    }

    function cancelSubscription(uint256 planId) external {
        if (!subscriptions[msg.sender][planId].active) revert NoActiveSubscription();
        subscriptions[msg.sender][planId].active = false;
        emit SubscriptionCancelled(msg.sender, planId);
    }

    function processPayment(
        address subscriber,
        uint256 planId
    ) external nonReentrant returns (bool) {
        Subscription storage sub = subscriptions[subscriber][planId];
        SubscriptionPlan storage plan = plans[planId];

        if (!sub.active || !plan.active) revert SubscriptionNotActive();
        if (block.timestamp < sub.nextPayment) revert PaymentNotDue();

        sub.nextPayment = block.timestamp + plan.interval;
        emit PaymentProcessed(subscriber, planId, plan.amount);

        return true;
    }

    function getSubscription(
        address subscriber,
        uint256 planId
    ) external view returns (Subscription memory) {
        return subscriptions[subscriber][planId];
    }

    function getPlan(uint256 planId) external view returns (SubscriptionPlan memory) {
        return plans[planId];
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoBalance();

        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) revert WithdrawalFailed();
    }

    // Allow receiving ETH
    receive() external payable {}
}
