import Image from "next/image";

export default function LoadingSpinner() {
  return (
    <div className="animate-spin">
      <Image src="/abs.svg" alt="Loading" width={24} height={24} />
    </div>
  );
}
