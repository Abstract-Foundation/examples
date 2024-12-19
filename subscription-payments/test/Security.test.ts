import { expect } from 'chai';
import { ethers } from 'ethers';
import { loadFixture, time } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre from 'hardhat';
import { SubscriptionAccount, SubscriptionRegistry } from '../typechain-types';

describe('Security Tests', function () {
  async function deployFixture() {
    const [owner, attacker, subscriber] = await hre.ethers.getSigners();

    // Deploys Registry
    const SubscriptionRegistry = await hre.ethers.getContractFactory('SubscriptionRegistry');
    const registry = await SubscriptionRegistry.deploy();

    // Deploys Account for legitimate subscriber
    const SubscriptionAccount = await hre.ethers.getContractFactory('SubscriptionAccount');
    const account = await SubscriptionAccount.deploy(
      await registry.getAddress(),
      subscriber.address,
    );

    // Creates a test plan
    const planAmount = ethers.parseEther('0.1');
    const planInterval = BigInt(30 * 24 * 60 * 60); // 30 days
    await registry.createPlan(planAmount, planInterval);

    // Funds the account
    await subscriber.sendTransaction({
      to: await account.getAddress(),
      value: ethers.parseEther('1.0'),
    });

    return { registry, account, owner, attacker, subscriber, planAmount, planInterval };
  }

  describe('Access Control', function () {
    it('Should prevent non-owners from creating plans', async function () {
      const { registry, attacker } = await loadFixture(deployFixture);

      await expect(
        registry.connect(attacker).createPlan(ethers.parseEther('0.1'), BigInt(30 * 24 * 60 * 60)),
      ).to.be.reverted; // Ownable reverts with a standard message
    });

    it('Should prevent non-owners from withdrawing funds', async function () {
      const { registry, attacker } = await loadFixture(deployFixture);

      await expect(registry.connect(attacker).withdraw()).to.be.reverted; // Ownable reverts with a standard message
    });

    it('Should prevent non-owners from managing subscriptions', async function () {
      const { account, attacker } = await loadFixture(deployFixture);

      await expect(account.connect(attacker).subscribe(0)).to.be.revertedWithCustomError(
        account,
        'OnlyOwner',
      );
    });
  });

  describe('Reentrancy Protection', function () {
    it('Should prevent reentrant subscription creation', async function () {
      const { registry, attacker } = await loadFixture(deployFixture);

      // Deploys the reentrancy test contract
      const AttackerFactory = await hre.ethers.getContractFactory('ReentrancyAttacker');
      const attackerContract = await AttackerFactory.connect(attacker).deploy(
        await registry.getAddress(),
      );

      // Funds the test attacker contract
      await attacker.sendTransaction({
        to: await attackerContract.getAddress(),
        value: ethers.parseEther('1.0'),
      });

      await expect(
        attackerContract.attack(0), // Try to create multiple subscriptions in one tx
      ).to.be.reverted; // ReentrancyGuard reverts with a standard message
    });

    it('Should prevent reentrant payment processing', async function () {
      const { registry, account, subscriber } = await loadFixture(deployFixture);

      // Subscribes legitimately
      await account.connect(subscriber).subscribe(0);

      // Tries to process payment with reentrant call
      const AttackerFactory = await hre.ethers.getContractFactory('ReentrancyAttacker');
      const attackerContract = await AttackerFactory.connect(subscriber).deploy(
        await registry.getAddress(),
      );

      await expect(attackerContract.attackPayment(await account.getAddress(), 0)).to.be.reverted; // ReentrancyGuard reverts with a standard message
    });
  });

  describe('Payment Security', function () {
    it('Should prevent processing payments before due date', async function () {
      const { account, subscriber, registry } = await loadFixture(deployFixture);

      // Subscribes legitimately
      await account.connect(subscriber).subscribe(0);

      // Tries to process payment immediately
      await expect(account.processSubscriptionPayment(0)).to.be.revertedWithCustomError(
        registry,
        'PaymentNotDue',
      );
    });

    it('Should prevent processing payments for inactive subscriptions', async function () {
      const { account, subscriber } = await loadFixture(deployFixture);

      // Subscribes and then cancels
      await account.connect(subscriber).subscribe(0);
      await account.connect(subscriber).cancelSubscription(0);

      // Advances time
      await time.increase(30 * 24 * 60 * 60);

      // Tries to process payment
      await expect(account.processSubscriptionPayment(0)).to.be.revertedWithCustomError(
        account,
        'SubscriptionNotActive',
      );
    });

    it('Should prevent processing payments for inactive plans', async function () {
      const { registry, account, subscriber } = await loadFixture(deployFixture);

      // Tries to subscribe to non-existent plan
      await expect(account.connect(subscriber).subscribe(999)).to.be.revertedWithCustomError(
        registry,
        'PlanNotActive',
      );
    });
  });

  describe('Fund Security', function () {
    it('Should prevent withdrawal when balance is zero', async function () {
      const { registry, owner } = await loadFixture(deployFixture);

      await expect(registry.connect(owner).withdraw()).to.be.revertedWithCustomError(
        registry,
        'NoBalance',
      );
    });

    it('Should ensure subscription payments are exact', async function () {
      const { registry, account, subscriber, planAmount } = await loadFixture(deployFixture);

      // Subscribes and advance time
      await account.connect(subscriber).subscribe(0);
      await time.increase(30 * 24 * 60 * 60);

      // Processes payment and check exact amount transferred
      const registryBalanceBefore = await hre.ethers.provider.getBalance(registry.getAddress());
      await account.processSubscriptionPayment(0);
      const registryBalanceAfter = await hre.ethers.provider.getBalance(registry.getAddress());

      expect(registryBalanceAfter - registryBalanceBefore).to.equal(planAmount);
    });
  });
});
