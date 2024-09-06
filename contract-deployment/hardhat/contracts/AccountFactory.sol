// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";
import "@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol";

/**
 * When working specifically with smart contract accounts (see https://docs.abs.xyz/how-abstract-works/native-account-abstraction/smart-contract-wallets)
 *  we need to call the createAccount or create2Account functions of the Deployer system contract
 *  as opposed to the default create or create2 functions that are used to deploy regular contracts.
 * 
 * Since there is no direct call to create or create2 in this contract,
 *  the zksolc compiler does NOT detect that the contract is capable of creating instances of DefaultAccount.
 * 
 * As you can see in the /deploy/deploy-myaccount.ts script, we need to manually
 *  provide the bytecode of Account.sol into the factoryDeps field of deploy function.
 *  Otherwise, the deployment will fail with the error "code hash not known".
 */
contract AccountFactory {
    bytes32 public accountBytecodeHash;

    // When working with smart contract accounts, 
    // manually call the createAccount or create2Account functions of the Deployer system contract
    // by using the SystemContractsCaller library to make a call to the Deployer system contract.
    // NOTE: You MUST set the zksolc.enableEraVMExtensions in hardhat.config.ts to true to make system calls.
    constructor(bytes32 _accountBytecodeHash) {
        accountBytecodeHash = _accountBytecodeHash;
    }

    function createAccount(
        address owner
    ) external returns (address accountAddress) {
        (bool success, bytes memory returnData) = SystemContractsCaller
            .systemCallWithReturndata(
                uint32(gasleft()), // gas limit
                address(DEPLOYER_SYSTEM_CONTRACT), // to
                uint128(0), // value
                abi.encodeCall(
                    DEPLOYER_SYSTEM_CONTRACT.createAccount,
                    (
                        bytes32(0), // empty salt, it is not used
                        accountBytecodeHash, // provide the bytecode hash of the account to deploy (DefaultAccount in this case)
                        abi.encode(owner), // Constructor arguments for the account
                        // This final flag is what separates the deployment of a smart contract account/wallet from a regular contract.
                        // See: https://docs.abs.xyz/how-abstract-works/native-account-abstraction/smart-contract-wallets#deployer-system-contract
                        IContractDeployer.AccountAbstractionVersion.Version1
                    )
                )
            );
        require(success, "Deployment failed");
        emit AccountCreated(accountAddress, owner);

        (accountAddress) = abi.decode(returnData, (address));
    }


    function create2Account(
        address owner,
        bytes32 salt
    ) external returns (address accountAddress) {
        (bool success, bytes memory returnData) = SystemContractsCaller
            .systemCallWithReturndata(
                uint32(gasleft()), // gas limit
                address(DEPLOYER_SYSTEM_CONTRACT), // to
                uint128(0), // value
                abi.encodeCall(
                    DEPLOYER_SYSTEM_CONTRACT.create2Account,
                    (
                        salt, // salt for deterministic address
                        accountBytecodeHash, // provide the bytecode hash of the account to deploy (DefaultAccount in this case)
                        abi.encode(owner), // Constructor arguments for the account
                        // This final flag is what separates the deployment of a smart contract account/wallet from a regular contract.
                        // See: https://docs.abs.xyz/how-abstract-works/native-account-abstraction/smart-contract-wallets#deployer-system-contract
                        IContractDeployer.AccountAbstractionVersion.Version1
                    )
                )
            );
        require(success, "Deployment failed");
        emit AccountCreated(accountAddress, owner);

        (accountAddress) = abi.decode(returnData, (address));
    }

    event AccountCreated(address indexed accountAddress, address indexed owner);
}