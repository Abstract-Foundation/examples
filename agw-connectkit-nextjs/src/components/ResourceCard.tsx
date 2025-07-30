import { ReactNode } from "react";

interface ResourceCardProps {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}

export const ResourceCard = ({
  href,
  icon,
  title,
  description,
}: ResourceCardProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all h-full text-center backdrop-blur-sm"
  >
    <div className="mb-2 opacity-70">{icon}</div>
    <h3 className="text-lg font-semibold mb-2 opacity-90">{title}</h3>
    <p className="text-sm opacity-70">{description}</p>
  </a>
);
