// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAccount, ACCOUNT_VALIDATION_SUCCESS_MAGIC} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IAccount.sol";
import {TransactionHelper, Transaction} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/TransactionHelper.sol";
import {SystemContractsCaller} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol";
import {SystemContractHelper} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractHelper.sol";
import {EfficientCall} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/EfficientCall.sol";
import {BOOTLOADER_FORMAL_ADDRESS, NONCE_HOLDER_SYSTEM_CONTRACT, DEPLOYER_SYSTEM_CONTRACT, INonceHolder} from "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";
import {Utils} from "@matterlabs/zksync-contracts/l2/system-contracts/libraries/Utils.sol";

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

contract SmartAccount is IAccount {
    using TransactionHelper for Transaction;
    using SignatureChecker for address;

    address public eoaSigner;

    modifier ignoreNonBootloader() {
        if (msg.sender != BOOTLOADER_FORMAL_ADDRESS) {
            assembly {
                return(0, 0)
            }
        }
        _;
    }

    constructor(address _initialSigner) {
        eoaSigner = _initialSigner;
    }

    /* ********************
     * IAccount Functions *
     ******************** */

    // Step 1: Bootloader calls this function to see if the account wants to execute the transaction.
    function validateTransaction(
        bytes32, // _txHash
        bytes32 _suggestedSignedHash,
        Transaction calldata _transaction
    ) external payable override ignoreNonBootloader returns (bytes4 magic) {
        magic = _validate(_suggestedSignedHash, _transaction);
    }

    // Step 2: If the validation step passed, begin executing the transaction.
    function executeTransaction(
        bytes32, // _txHash
        bytes32, // _suggestedSignedHash
        Transaction calldata _transaction
    ) external payable override ignoreNonBootloader {
        _execute(_transaction);
    }

    // Step 2 (alternative): Execute a transaction from "outside" the account.
    // This enables transactions to be executed from the L1 for this account.
    function executeTransactionFromOutside(
        Transaction calldata _transaction
    ) external payable override ignoreNonBootloader {
        // Since no "suggestedHash", is provided, we pass in 0 and let the function calculate the hash.
        bytes4 magic = _validate(bytes32(0), _transaction);
        // Same flow: if validation passed, execute the transaction.
        if (magic == ACCOUNT_VALIDATION_SUCCESS_MAGIC) {
            _execute(_transaction);
        } else {
            revert("Transaction validation failed");
        }
    }

    // Step 3: Pay for the transaction fee.
    function payForTransaction(
        bytes32, // _txHash
        bytes32, // _suggestedSignedHash
        Transaction calldata _transaction
    ) external payable ignoreNonBootloader {
        bool success = _transaction.payToTheBootloader();
        require(success, "Failed to pay the fee to the operator");
    }

    // Step 3 (alternative): Pay for the transaction using a paymaster.
    // This means the paymaster
    function prepareForPaymaster(
        bytes32, // _txHash
        bytes32, // _suggestedSignedHash
        Transaction calldata _transaction
    ) external payable ignoreNonBootloader {
        _transaction.processPaymasterInput();
    }

    /* ********************
     * Other Functions *
     ******************** */

    /**
     * @dev Validates a signature for a given hash following EIP-1271.
     * @param _address The address that signed the hash.
     * @param _hash The hash that was signed.
     * @param _signature The signature to validate.
     * @return `true` if the signature is valid, `false` otherwise.
     * @notice This function uses the `isValidSignatureNow` function from the `SignatureChecker` library.
     * See https://docs.abs.xyz/how-abstract-works/native-account-abstraction/signature-validation
     *     For more information on signature validation in Abstract's native account abstraction.
     */
    function isValidSignature(
        address _address,
        bytes32 _hash,
        bytes memory _signature
    ) public view returns (bool) {
        return _address.isValidSignatureNow(_hash, _signature);
    }

    /**
     * @dev Increments the nonce for the smart contract account.
     * @param nonce The expected current nonce value.
     * @notice This function makes a system call to the NonceHolder system contract
     *         to increment the minimum nonce if it equals the provided value.
     * @custom:context This function is used during transaction validation
     * See https://docs.abs.xyz/how-abstract-works/native-account-abstraction/handling-nonces
     *      For more information on nonce handling in Abstract's native account abstraction.
     */
    function _incrementNonce(uint256 nonce) internal {
        // SystemContractsCaller is a library that allows calling contracts with the `isSystem` flag.
        SystemContractsCaller.systemCallWithPropagatedRevert(
            uint32(gasleft()), // gasLimit
            address(NONCE_HOLDER_SYSTEM_CONTRACT), // Call the NonceHolder system contract
            0, // value
            // Call the NonceHolder's incrementMinNonceIfEquals function.
            // -> If the nonce passed in is equal to the current minimum nonce, increment it.
            // -> Otherwise, revert the transaction.
            abi.encodeCall(INonceHolder.incrementMinNonceIfEquals, (nonce))
        );
    }

    function _validate(
        bytes32 _suggestedSignedHash,
        Transaction calldata _transaction
    ) internal returns (bytes4 magic) {
        // The nonce must be used up in the validation step.
        _incrementNonce(_transaction.nonce);

        // Ensure this account has enough funds to pay for the transaction.
        require(
            _transaction.totalRequiredBalance() <= address(this).balance,
            "Not enough balance for fee + value"
        );

        // In the future, the bootloader may not always provide the signed hash.
        // So, here, we check and calculate the hash if it is not provided.
        bytes32 txHash = _suggestedSignedHash != bytes32(0)
            ? _suggestedSignedHash
            : _transaction.encodeHash();

        // Validate the transaction signature using the EOA signer.
        bool shouldExecuteTransaction = isValidSignature(
            eoaSigner,
            txHash,
            _transaction.signature
        );

        // If our validation checks arec correct, return the success magic value. If not, return 0 bytes.
        magic = shouldExecuteTransaction
            ? ACCOUNT_VALIDATION_SUCCESS_MAGIC
            : bytes4(0);
    }

    /**
     * @dev Executes a transaction by calling the target contract with the provided data.
     * @param _transaction The transaction to execute.
     * @notice This function uses the EfficientCall library to make the call and propagate any reverts.
     */
    function _execute(Transaction calldata _transaction) internal {
        address to = address(uint160(_transaction.to));
        uint128 value = Utils.safeCastToU128(_transaction.value);
        bytes calldata data = _transaction.data;
        uint32 gas = Utils.safeCastToU32(gasleft());

        // Smart contract deployment transactions must go through the ContractDeployer system contract.
        // Deployment transactions must also be a system call (isSystem).
        // See https://docs.abs.xyz/how-abstract-works/evm-differences/contract-deployment
        //     For more information on contract deployment in Abstract.
        if (to == address(DEPLOYER_SYSTEM_CONTRACT)) {
            SystemContractsCaller.systemCallWithPropagatedRevert(
                gas,
                to,
                value,
                data
            );
        }
        // If not a deployment transaction, execute the transaction directly.
        // Use the EfficientCall library to make the call and propagate any reverts.
        else {
            bool success = EfficientCall.rawCall(gas, to, value, data, false);
            if (!success) {
                EfficientCall.propagateRevert();
            }
        }
    }

    fallback() external payable {
        assert(msg.sender != BOOTLOADER_FORMAL_ADDRESS);
    }

    receive() external payable {}
}
