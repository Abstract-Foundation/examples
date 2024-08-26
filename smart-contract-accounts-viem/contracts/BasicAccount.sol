// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol";
import {TransactionHelper} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol";
import {SystemContractsCaller} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol";
import {BOOTLOADER_FORMAL_ADDRESS, NONCE_HOLDER_SYSTEM_CONTRACT, INonceHolder} from "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";

contract BasicAccount is IAccount {
    using TransactionHelper for *;

    modifier onlyBootloader() {
        require(
            msg.sender == BOOTLOADER_FORMAL_ADDRESS,
            "Only bootloader is allowed to call this function"
        );
        _;
    }

    // Step 1: Do you want to execute the transaction based on the logic set here?
    function validateTransaction(
        bytes32,
        bytes32,
        Transaction calldata _transaction
    ) external payable onlyBootloader returns (bytes4 magic) {
        // The only mandatory rule is that we increment the nonce
        SystemContractsCaller.systemCallWithPropagatedRevert(
            uint32(gasleft()),
            address(NONCE_HOLDER_SYSTEM_CONTRACT),
            0,
            abi.encodeCall(
                INonceHolder.incrementMinNonceIfEquals,
                (_transaction.nonce)
            )
        );

        // ... As a simple example, we perform no validation and always return success.

        // To indicate you want to execute the tx, return the "magic" value below:
        magic = ACCOUNT_VALIDATION_SUCCESS_MAGIC;
    }

    // Step 2: If you want to execute it, pay the fee to the bootloader first.
    // Note: Alternatively, prepareForPaymaster could be called and have someone else cover the fee.
    function payForTransaction(
        bytes32,
        bytes32,
        Transaction calldata _transaction
    ) external payable onlyBootloader {
        bool success = _transaction.payToTheBootloader();
        require(success, "Failed to pay the fee to the operator");
    }

    // Step 3: Once you have paid the fee to the bootloader, the transaction is executed.
    function executeTransaction(
        bytes32,
        bytes32,
        Transaction calldata _transaction
    ) external payable onlyBootloader {
        address to = address(uint160(_transaction.to));
        (bool success, ) = to.call{value: _transaction.value}(
            _transaction.data
        );

        require(success, "Failed to execute the transaction");
    }

    // This will be called instead of payForTransaction (step 2) if the transaction has a paymaster.
    function prepareForPaymaster(
        bytes32,
        bytes32,
        Transaction calldata _transaction
    ) external payable onlyBootloader {
        _transaction.processPaymasterInput();
    }

    // This is related to L1 -> L2 communication. We can leave it empty.
    function executeTransactionFromOutside(
        Transaction calldata _transaction
    ) external payable onlyBootloader {}

    fallback() external {
        assert(msg.sender != BOOTLOADER_FORMAL_ADDRESS);
    }

    receive() external payable {}
}
