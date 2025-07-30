import { ReactNode } from "react";

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "gradient";
  children: ReactNode;
  className?: string;
}

export const Button = ({
  onClick,
  disabled,
  variant = "primary",
  children,
  className = "",
}: ButtonProps) => {
  const baseClasses =
    "rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 font-[family-name:var(--font-roobert)]";

  const variantClasses = {
    primary: "border-white/20 bg-white/10 hover:bg-white/20",
    secondary: "border-white/10 bg-white/5 hover:bg-white/10",
    gradient: disabled
      ? "bg-gray-500 cursor-not-allowed opacity-50 border-gray-500"
      : "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 border-transparent",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
