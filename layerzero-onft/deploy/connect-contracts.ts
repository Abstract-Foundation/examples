import { Contract, JsonRpcProvider, Wallet, zeroPadValue } from "ethers";
import { vars } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Provider, Wallet as ZkWallet } from "zksync-ethers";
import { config } from "./config";

export default async function connectContract(hre: HardhatRuntimeEnvironment) {
  console.log(`Running connect-contracts script`);

  // Setup Base:
  const baseProvider = new JsonRpcProvider(
    // @ts-ignore
    hre.config.networks.baseSepolia.url!
  );
  const baseWallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"), baseProvider);
  const baseArtifact = await hre.artifacts.readArtifact("MyONFT721");
  const baseNftContract = new Contract(
    config.baseSepolia.nftContractAddress,
    baseArtifact.abi,
    baseWallet
  );

  // Setup Abstract:
  const abstractProvider = new Provider(
    // @ts-ignore
    hre.config.networks.abstractTestnet.url!
  );
  const abstractWallet = new ZkWallet(
    vars.get("DEPLOYER_PRIVATE_KEY"),
    abstractProvider
  );
  const abstractArtifact = await hre.zksyncEthers.loadArtifact("MyONFT721");
  const abstractNftContract = new Contract(
    config.abstractTestnet.nftContractAddress,
    abstractArtifact.abi,
    abstractWallet
  );

  // Connect the two contracts:
  // Call setPeer on the Base contract to connect it to the Abstract contract
  const baseTx = await baseNftContract.setPeer(
    config.abstractTestnet.endpointId,
    zeroPadValue(config.abstractTestnet.nftContractAddress, 32)
  );

  // Call setPeer on the Abstract contract to connect it to the Base contract
  const abstractTx = await abstractNftContract.setPeer(
    config.baseSepolia.endpointId,
    zeroPadValue(config.baseSepolia.nftContractAddress, 32)
  );

  // Wait for the transactions to be mined
  await baseTx.wait();
  await abstractTx.wait();

  console.log(`✅ Contracts connected`);
}

// Run the script
connectContract(require("hardhat"));
