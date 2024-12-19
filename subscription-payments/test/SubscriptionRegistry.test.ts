import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import hre from 'hardhat';
import { SubscriptionRegistry } from '../typechain-types';
import { deployContract, getSigners } from './helpers';

describe('SubscriptionRegistry', function () {
  const PLAN_AMOUNT = hre.ethers.parseEther('0.1'); // 0.1 ETH
  const PLAN_INTERVAL = BigInt(30 * 24 * 60 * 60); // 30 days in seconds

  async function deployRegistryFixture() {
    const { owner, subscriber, otherAccount } = await getSigners();
    const registry = await deployContract<SubscriptionRegistry>(hre, 'SubscriptionRegistry');
    return { registry, owner, subscriber, otherAccount };
  }

  async function deployRegistryWithPlanFixture() {
    const { registry, owner, subscriber, otherAccount } = await loadFixture(deployRegistryFixture);

    await registry.createPlan(PLAN_AMOUNT, PLAN_INTERVAL);
    const planId = 0;

    return { registry, planId, owner, subscriber, otherAccount };
  }

  describe('Plan Management', function () {
    it('Should create a plan', async function () {
      const { registry } = await loadFixture(deployRegistryFixture);

      await expect(registry.createPlan(PLAN_AMOUNT, PLAN_INTERVAL))
        .to.emit(registry, 'PlanCreated')
        .withArgs(0, PLAN_AMOUNT, PLAN_INTERVAL);

      const plan = await registry.getPlan(0);
      expect(plan.amount).to.equal(PLAN_AMOUNT);
      expect(plan.interval).to.equal(PLAN_INTERVAL);
      expect(plan.active).to.be.true;
    });

    it('Should revert if interval is zero', async function () {
      const { registry } = await loadFixture(deployRegistryFixture);

      await expect(registry.createPlan(PLAN_AMOUNT, 0)).to.be.revertedWithCustomError(
        registry,
        'InvalidInterval',
      );
    });

    it('Should revert if amount is zero', async function () {
      const { registry } = await loadFixture(deployRegistryFixture);

      await expect(registry.createPlan(0, PLAN_INTERVAL)).to.be.revertedWithCustomError(
        registry,
        'InvalidAmount',
      );
    });
  });

  describe('Subscription Management', function () {
    it('Should allow subscription to a plan', async function () {
      const { registry, planId, subscriber } = await loadFixture(deployRegistryWithPlanFixture);
      const timestamp = await time.latest();

      await expect(registry.connect(subscriber).subscribe(planId))
        .to.emit(registry, 'SubscriptionCreated')
        .withArgs(subscriber.address, planId, anyValue); // timestamp can vary

      const subscription = await registry.getSubscription(subscriber.address, planId);
      expect(subscription.active).to.be.true;
      expect(subscription.planId).to.equal(planId);
      expect(subscription.startTime).to.be.greaterThanOrEqual(timestamp);
      expect(subscription.nextPayment).to.equal(subscription.startTime + PLAN_INTERVAL);
    });

    it('Should revert if already subscribed', async function () {
      const { registry, planId, subscriber } = await loadFixture(deployRegistryWithPlanFixture);

      await registry.connect(subscriber).subscribe(planId);

      await expect(registry.connect(subscriber).subscribe(planId)).to.be.revertedWithCustomError(
        registry,
        'AlreadySubscribed',
      );
    });

    it('Should allow cancellation of subscription', async function () {
      const { registry, planId, subscriber } = await loadFixture(deployRegistryWithPlanFixture);

      await registry.connect(subscriber).subscribe(planId);

      await expect(registry.connect(subscriber).cancelSubscription(planId))
        .to.emit(registry, 'SubscriptionCancelled')
        .withArgs(subscriber.address, planId);

      const subscription = await registry.getSubscription(subscriber.address, planId);
      expect(subscription.active).to.be.false;
    });

    it('Should revert cancellation if no active subscription', async function () {
      const { registry, planId, subscriber } = await loadFixture(deployRegistryWithPlanFixture);

      await expect(
        registry.connect(subscriber).cancelSubscription(planId),
      ).to.be.revertedWithCustomError(registry, 'NoActiveSubscription');
    });
  });

  describe('Payment Processing', function () {
    async function deployAndSubscribeFixture() {
      const { registry, planId, owner, subscriber, otherAccount } = await loadFixture(
        deployRegistryWithPlanFixture,
      );
      await registry.connect(subscriber).subscribe(planId);
      return { registry, planId, owner, subscriber, otherAccount };
    }

    it('Should process payment when due', async function () {
      const { registry, planId, subscriber } = await loadFixture(deployAndSubscribeFixture);

      await time.increase(PLAN_INTERVAL);

      await expect(registry.processPayment(subscriber.address, planId))
        .to.emit(registry, 'PaymentProcessed')
        .withArgs(subscriber.address, planId, PLAN_AMOUNT);

      const subscription = await registry.getSubscription(subscriber.address, planId);
      expect(subscription.nextPayment).to.equal(BigInt(await time.latest()) + PLAN_INTERVAL);
    });
  });

  describe('Withdrawal', function () {
    it('Should allow owner to withdraw funds', async function () {
      const { registry, owner } = await loadFixture(deployRegistryFixture);

      // Funds the contract
      await owner.sendTransaction({
        to: registry.getAddress(),
        value: hre.ethers.parseEther('1.0'),
      });

      await expect(registry.withdraw()).to.changeEtherBalances(
        [registry, owner],
        [hre.ethers.parseEther('-1.0'), hre.ethers.parseEther('1.0')],
      );
    });
  });
});
