import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'hardhat';

export async function deployContract<T>(hre: HardhatRuntimeEnvironment, contractName: string) {
  const factory = await hre.ethers.getContractFactory(contractName);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  return contract as unknown as T;
}

export async function getSigners() {
  const [owner, subscriber, otherAccount] = await ethers.getSigners();
  return { owner, subscriber, otherAccount };
}
