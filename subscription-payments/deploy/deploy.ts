import { Wallet } from 'zksync-ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '@matterlabs/hardhat-zksync';
import { vars } from 'hardhat/config';

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script`);

  // Initializes the wallet using your private key.
  const wallet = new Wallet(vars.get('DEPLOYER_PRIVATE_KEY'));

  const deployer = new Deployer(hre, wallet);

  // Loads contract
  const artifact = await deployer.loadArtifact('SubscriptionRegistry');

  // Deploy this contract. The returned object will be of a `Contract` type,
  // similar to the ones in `ethers`.
  const tokenContract = await deployer.deploy(artifact);

  console.log(`${artifact.contractName} was deployed to ${await tokenContract.getAddress()}`);
}
