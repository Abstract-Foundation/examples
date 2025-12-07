import Image from "next/image";

// Spinner component
export const Spinner = () => (
  <div className="animate-spin">
    <Image src="/abs.svg" alt="Loading" width={20} height={20} />
  </div>
);
