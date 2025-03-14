// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SubscriptionRegistry} from "./SubscriptionRegistry.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IAccount} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol";
import {Transaction, TransactionHelper} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol";
import {SystemContractsCaller} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol";
import {BOOTLOADER_FORMAL_ADDRESS, NONCE_HOLDER_SYSTEM_CONTRACT} from "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";
import {INonceHolder} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/INonceHolder.sol";

/**
 * @title SubscriptionAccount
 * @notice Smart contract account that handles automated subscription payments
 */
contract SubscriptionAccount is IAccount {
    using TransactionHelper for Transaction;
    using ECDSA for bytes32;

    bytes4 constant VALIDATION_SUCCESS_MAGIC = 0x1626ba7e;

    error OnlyOwner();
    error InvalidSignature();
    error TransactionFailed();
    error SubscriptionNotActive();
    error PlanNotActive();
    error PaymentProcessingFailed();
    error PaymentTransferFailed();
    error OnlyBootloader();

    SubscriptionRegistry public immutable REGISTRY;
    address public immutable OWNER;

    event PaymentFailed(uint256 indexed planId, string reason);

    constructor(address payable _registry, address _owner) {
        REGISTRY = SubscriptionRegistry(_registry);
        OWNER = _owner;
    }

    modifier onlyBootloader() {
        if (msg.sender != BOOTLOADER_FORMAL_ADDRESS) revert OnlyBootloader();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != OWNER) revert OnlyOwner();
        _;
    }

    function validateTransaction(
        bytes32,
        bytes32 _suggestedSignedHash,
        Transaction calldata _transaction
    ) external payable override onlyBootloader returns (bytes4 magic) {
        return _validateTransaction(_suggestedSignedHash, _transaction);
    }

    function executeTransactionFromOutside(
        Transaction calldata _transaction
    ) external payable override onlyBootloader {
        _executeTransaction(_transaction);
    }

    function _validateTransaction(
        bytes32 _suggestedSignedHash,
        Transaction calldata _transaction
    ) internal returns (bytes4 magic) {
        // Increments nonce
        SystemContractsCaller.systemCallWithPropagatedRevert(
            uint32(gasleft()),
            address(NONCE_HOLDER_SYSTEM_CONTRACT),
            0,
            abi.encodeCall(INonceHolder.incrementMinNonceIfEquals, (_transaction.nonce))
        );

        // Validates signature
        bytes32 txHash = _suggestedSignedHash == bytes32(0)
            ? _transaction.encodeHash()
            : _suggestedSignedHash;
        if (!_validateSignature(txHash, _transaction.signature)) revert InvalidSignature();

        // Checks balance
        uint256 totalRequiredBalance = _transaction.totalRequiredBalance();
        require(
            totalRequiredBalance <= address(this).balance,
            "Not enough balance for fee + value"
        );

        magic = VALIDATION_SUCCESS_MAGIC;
    }

    function executeTransaction(
        bytes32,
        bytes32,
        Transaction calldata _transaction
    ) external payable override onlyBootloader {
        _executeTransaction(_transaction);
    }

    function _executeTransaction(Transaction calldata _transaction) internal {
        address to = address(uint160(_transaction.to));
        uint256 value = _transaction.value;
        bytes memory data = _transaction.data;

        bool success;
        assembly {
            success := call(gas(), to, value, add(data, 0x20), mload(data), 0, 0)
        }
        if (!success) revert TransactionFailed();
    }

    function subscribe(uint256 planId) external onlyOwner {
        REGISTRY.subscribe(planId);
    }

    function cancelSubscription(uint256 planId) external onlyOwner {
        REGISTRY.cancelSubscription(planId);
    }

    function processSubscriptionPayment(uint256 planId) external {
        // Gets subscription details
        SubscriptionRegistry.Subscription memory sub = REGISTRY.getSubscription(
            address(this),
            planId
        );
        if (!sub.active) revert SubscriptionNotActive();

        // Gets plan details
        SubscriptionRegistry.SubscriptionPlan memory plan = REGISTRY.getPlan(planId);
        if (!plan.active) revert PlanNotActive();

        // Processes the payment
        bool success = REGISTRY.processPayment(address(this), planId);
        if (!success) revert PaymentProcessingFailed();

        // Transfers the subscription amount
        (bool transferred, ) = payable(address(REGISTRY)).call{value: plan.amount}("");
        if (!transferred) revert PaymentTransferFailed();
    }

    function _validateSignature(bytes32 hash, bytes memory signature) internal view returns (bool) {
        if (signature.length != 65) {
            return false;
        }

        uint8 v;
        bytes32 r;
        bytes32 s;
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := and(mload(add(signature, 0x41)), 0xff)
        }

        if (v != 27 && v != 28) {
            return false;
        }

        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            return false;
        }

        address recoveredAddress = ecrecover(hash, v, r, s);
        return recoveredAddress == OWNER && recoveredAddress != address(0);
    }

    function payForTransaction(
        bytes32,
        bytes32,
        Transaction calldata _transaction
    ) external payable override onlyBootloader {
        bool success = _transaction.payToTheBootloader();
        require(success, "Failed to pay bootloader operator fee");
    }

    function prepareForPaymaster(
        bytes32,
        bytes32,
        Transaction calldata _transaction
    ) external payable override onlyBootloader {
        _transaction.processPaymasterInput();
    }

    receive() external payable {}
}
