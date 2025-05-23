interface StatDisplayProps {
  label: string;
  value: string | number | bigint | undefined;
  valueColor?: string;
  formatValue?: (value: string | number | bigint | undefined) => string;
}

export function StatDisplay({ 
  label, 
  value, 
  valueColor = "text-green-400",
  formatValue = (v) => v?.toString() ?? "N/A"
}: StatDisplayProps) {
  return (
    <p className="text-sm font-medium font-[family-name:var(--font-roobert)]">
      {label}: <span className={valueColor}>{formatValue(value)}</span>
    </p>
  );
} 