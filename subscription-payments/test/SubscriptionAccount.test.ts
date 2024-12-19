import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import hre from 'hardhat';

describe('SubscriptionAccount', function () {
  const PLAN_AMOUNT = hre.ethers.parseEther('0.1'); // 0.1 ETH
  const PLAN_INTERVAL = BigInt(30 * 24 * 60 * 60); // 30 days in seconds

  async function deployAccountFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    // Deploys Registry first
    const SubscriptionRegistry = await hre.ethers.getContractFactory('SubscriptionRegistry');
    const registry = await SubscriptionRegistry.deploy();

    // Deploys Account
    const SubscriptionAccount = await hre.ethers.getContractFactory('SubscriptionAccount');
    const account = await SubscriptionAccount.deploy(await registry.getAddress(), owner.address);

    // Funds the account
    await owner.sendTransaction({
      to: account.getAddress(),
      value: hre.ethers.parseEther('1.0'),
    });

    return { account, registry, owner, otherAccount };
  }

  async function deployAccountWithPlanFixture() {
    const { account, registry, owner, otherAccount } = await loadFixture(deployAccountFixture);

    await registry.createPlan(PLAN_AMOUNT, PLAN_INTERVAL);
    const planId = 0;

    return { account, registry, planId, owner, otherAccount };
  }

  describe('Core Functionality', function () {
    describe('Account Setup', function () {
      it('Should have correct owner', async function () {
        const { account, owner } = await loadFixture(deployAccountFixture);
        expect(await account.OWNER()).to.equal(owner.address);
      });

      it('Should have correct registry', async function () {
        const { account, registry } = await loadFixture(deployAccountFixture);
        expect(await account.REGISTRY()).to.equal(await registry.getAddress());
      });
    });

    describe('Subscription Management', function () {
      it('Should allow owner to subscribe to a plan', async function () {
        const { account, registry, planId, owner } = await loadFixture(
          deployAccountWithPlanFixture,
        );

        await expect(account.connect(owner).subscribe(planId))
          .to.emit(registry, 'SubscriptionCreated')
          .withArgs(await account.getAddress(), planId, anyValue);

        const subscription = await registry.getSubscription(await account.getAddress(), planId);
        expect(subscription.active).to.be.true;
      });

      it('Should allow owner to cancel subscription', async function () {
        const { account, registry, planId, owner } = await loadFixture(
          deployAccountWithPlanFixture,
        );
        await account.connect(owner).subscribe(planId);

        await expect(account.connect(owner).cancelSubscription(planId))
          .to.emit(registry, 'SubscriptionCancelled')
          .withArgs(await account.getAddress(), planId);

        const subscription = await registry.getSubscription(await account.getAddress(), planId);
        expect(subscription.active).to.be.false;
      });
    });

    describe('Payment Processing', function () {
      async function deployAndSubscribeFixture() {
        const { account, registry, planId, owner, otherAccount } = await loadFixture(
          deployAccountWithPlanFixture,
        );
        await account.connect(owner).subscribe(planId);
        return { account, registry, planId, owner, otherAccount };
      }

      it('Should process payment successfully', async function () {
        const { account, registry, planId } = await loadFixture(deployAndSubscribeFixture);

        await time.increase(PLAN_INTERVAL);

        const initialBalance = await hre.ethers.provider.getBalance(registry.getAddress());

        await expect(account.processSubscriptionPayment(planId))
          .to.emit(registry, 'PaymentProcessed')
          .withArgs(await account.getAddress(), planId, PLAN_AMOUNT);

        const finalBalance = await hre.ethers.provider.getBalance(registry.getAddress());
        expect(finalBalance - initialBalance).to.equal(PLAN_AMOUNT);
      });
    });
  });
});
