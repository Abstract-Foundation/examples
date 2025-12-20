import Image from "next/image";

export default function Header() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center gap-4">
        <Image
          src="/abstract.svg"
          alt="Abstract logo"
          width={240}
          height={32}
          quality={100}
          priority
        />
        <span>🤝</span>
        <Image
          className="pt-0.5"
          src="/family.svg"
          alt="Family logo"
          width={32}
          height={32}
          quality={100}
          priority
        />
      </div>
      <p className="text-md font-[family-name:var(--font-roobert)]">
        Get started by editing{" "}
        <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
          src/app/page.tsx
        </code>
        .
      </p>
    </div>
  );
}
