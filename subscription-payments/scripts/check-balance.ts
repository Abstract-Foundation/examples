import { ethers } from 'hardhat';
import { vars } from 'hardhat/config';

async function main() {
  const wallet = new ethers.Wallet(vars.get('DEPLOYER_PRIVATE_KEY'), ethers.provider);
  const balance = await ethers.provider.getBalance(wallet.address);
  console.log(`Balance for ${wallet.address}: ${ethers.formatEther(balance)} ETH`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
