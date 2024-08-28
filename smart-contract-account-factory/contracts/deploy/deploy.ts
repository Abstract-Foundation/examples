import * as hre from "hardhat";
import { vars } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { Provider, types, utils, Wallet } from "zksync-ethers";
import { Contract, ContractTransactionReceipt, parseEther } from "ethers";
import { EIP712Signer } from "zksync-ethers/build/signer";

import "@matterlabs/hardhat-zksync-node/dist/type-extensions";
import "@matterlabs/hardhat-zksync-verify/dist/src/type-extensions";
import { EIP712_TX_TYPE, serializeEip712 } from "zksync-ethers/build/utils";
import { eip712Domain, eip712Types } from "./utils";

// An example of a deploy script that will deploy and call a simple contract.
export default async function deploy(hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script...`);

  // Setup the EOA wallet to deploy from (reads private key from hardhat config)
  const provider = new Provider(hre.network.config.url);
  const eoaWallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"), provider);
  const eoaWalletAddress = await eoaWallet.getAddress();
  const deployer = new Deployer(hre, eoaWallet);

  // === 1: Deploy Factory ======================================================================== \\

  // Setup the SmartAccount (we need to include the account bytecode hash when deploying the factory)
  const accountArtifact = await deployer.loadArtifact("Account");
  const accountBytecode = accountArtifact.bytecode;
  const accountBytecodeHash = utils.hashBytecode(accountBytecode);

  const factoryConstructorArgs = [accountBytecodeHash];
  const factoryArtifact = await deployer.loadArtifact("AccountFactory");
  const factoryDeployment = await deployer.deploy(
    factoryArtifact,
    factoryConstructorArgs,
    undefined,
    undefined,
    [accountBytecode]
  );

  const deployedFactoryTx = await factoryDeployment.waitForDeployment();
  const factoryContractAddress = await deployedFactoryTx.getAddress();

  const factoryContract = new Contract(
    factoryContractAddress,
    factoryArtifact.abi,
    eoaWallet
  );

  await verifyContract({
    address: factoryContractAddress,
    constructorArguments: factoryContract.interface.encodeDeploy(
      factoryConstructorArgs
    ),
    bytecode: factoryArtifact.bytecode,
    contract: `${factoryArtifact.sourceName}:${factoryArtifact.contractName}`,
  });

  console.log(`✅ Factory contract deployed at: ${factoryContractAddress}`);
  logExplorerUrl(factoryContractAddress, "address");

  // ================================================================================================ \\

  // === 2: Create an account via the factory ======================================================= \\

  // Call the factory contract to create a new account
  const salt = hre.ethers.ZeroHash;

  const newAccountTx = await factoryContract.deployAccount(
    eoaWalletAddress,
    salt
  );

  const receipt: ContractTransactionReceipt = await newAccountTx.wait();

  const deployedContractAddress = receipt.contractAddress as string;

  const newAccountContract: Contract = new Contract(
    deployedContractAddress,
    accountArtifact.abi
  );

  await verifyContract({
    address: deployedContractAddress!,
    constructorArguments: newAccountContract.interface.encodeDeploy([
      eoaWalletAddress,
    ]),
    bytecode: accountArtifact.bytecode,
    contract: `${accountArtifact.sourceName}:${accountArtifact.contractName}`,
  });

  console.log(
    `✅ New account deployed via factory at: ${deployedContractAddress}`
  );
  logExplorerUrl(deployedContractAddress, "address");

  // =============================================================================================== \\

  // === 3: Run an example transaction from the smart contract account ============================= \\

  // Check if the smart contract has any funds to pay for gas fees
  const balance = await provider.getBalance(deployedContractAddress);
  // If it does not have any funds, load funds to the contract from your EOA (set as Hardhat private key)
  if (balance == 0n) {
    await loadFundsToAccount(
      eoaWallet,
      deployedContractAddress,
      parseEther("0.001")
    );
  }

  const to = Wallet.createRandom().address;
  const nonce = await provider.getTransactionCount(deployedContractAddress);
  const gasPrice = await provider.getGasPrice();
  const gasLimit = await provider.estimateGas({
    from: deployedContractAddress,
    to: to,
    data: "0x69",
  });

  // Create your transaction object
  const tx = {
    from: deployedContractAddress,
    to: Wallet.createRandom().address,
    nonce: nonce,
    gasLimit: gasLimit.toString(),
    gasPrice: gasPrice.toString(),
    chainId: hre.network.config.chainId,
    value: 0,
    type: EIP712_TX_TYPE,
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
    } as types.Eip712Meta,
  };

  // Transform the transaction into an EIP712 typed data object
  const typedData = EIP712Signer.getSignInput(tx);

  // Sign the typed data with the EOA wallet
  const rawSignature = await eoaWallet.signTypedData(
    eip712Domain,
    eip712Types,
    typedData
  );

  // Serialize the transaction with the custom signature
  const serializedTx = serializeEip712({
    ...tx,
    customData: {
      ...tx.customData,
      customSignature: rawSignature,
    },
  });

  const transactionRequest = await provider.broadcastTransaction(serializedTx);
  const transactionResponse = await transactionRequest.wait();

  console.log(
    `✅ Transaction submitted from smart contract: ${transactionResponse.hash}`
  );
  logExplorerUrl(transactionResponse.hash, "tx");
  // =============================================================================================== \\
}

const verifyContract = async (data: {
  address: string;
  contract: string;
  constructorArguments: string;
  bytecode: string;
}) => {
  if (hre.network.name === "abstractTestnet") {
    const verificationRequestId: number = await hre.run("verify:verify", {
      ...data,
      noCompile: true,
    });
    return verificationRequestId;
  }
};

function logExplorerUrl(address: string, type: "address" | "tx") {
  if (hre.network.name === "abstractTestnet") {
    const explorerUrl = `https://explorer.testnet.abs.xyz/${type}/${address}`;
    const prettyType = type === "address" ? "account" : "transaction";

    console.log(
      `🔗 View your ${prettyType} on the Abstract Explorer: ${explorerUrl}\n`
    );
  }
}

async function loadFundsToAccount(
  senderWallet: Wallet,
  smartAccountAddress: string,
  amount: bigint
) {
  try {
    const tx = await senderWallet.transfer({
      amount,
      to: smartAccountAddress,
    });
    console.log("Smart contract has no funds. Loaded funds to cover gas fees.");
    return tx;
  } catch (e) {
    console.error("Error loading funds to smart account:", e);
    throw e;
  }
}
