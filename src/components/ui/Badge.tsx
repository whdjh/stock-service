interface BadgeProps {
  value: number;
  showSign?: boolean;
  suffix?: string;
  className?: string;
}

export default function Badge({ value, showSign = true, suffix = "%", className = "" }: BadgeProps) {
  const isUp = value > 0;
  const isDown = value < 0;
  const color = isUp ? "text-red-500 bg-red-50" : isDown ? "text-blue-500 bg-blue-50" : "text-muted bg-gray-100";
  const sign = showSign && isUp ? "+" : "";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-sm font-medium ${color} ${className}`}>
      {sign}{value.toFixed(2)}{suffix}
    </span>
  );
}
