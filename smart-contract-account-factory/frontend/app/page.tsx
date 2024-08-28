import ConnectEoaSection from "@/components/ConnectEoaSection";
import DeploySmartWalletSection from "@/components/DeploySmartWalletSection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between py-16 px-2 h-[64rem]">
      <section className="flex flex-col items-center justify-between w-full max-w-[64rem]">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8 pb-2 border-b text-center">
          Abstract Smart Contract Account Demo
        </h1>

        <div className="flex flex-row items-center justify-between w-full p-4">
          <div className="flex flex-col items-center justify-center w-full h-full px-3">
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-center">
              1. Connect EOA Wallet
            </h2>

            <p className="leading-7 mt-2 text-center">
              First, connect an EOA to deploy a smart contract account from.
            </p>

            <div className="flex flex-col gap-2">
              <ConnectEoaSection />
              <DeploySmartWalletSection />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
