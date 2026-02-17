import { CompanyProfile } from "@/types";
import { getTranslations } from "next-intl/server";

interface StockMetricsProps {
  profile: CompanyProfile;
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toLocaleString();
}

export default async function StockMetrics({ profile }: StockMetricsProps) {
  const t = await getTranslations("stockDetail");

  const metrics = [
    {
      label: t("marketCap"),
      key: "marketCap" as const,
      format: formatMarketCap,
    },
    {
      label: t("per"),
      key: "pe" as const,
      format: (v: number) => v.toFixed(2),
    },
    {
      label: t("pbr"),
      key: "pbr" as const,
      format: (v: number) => v.toFixed(2),
    },
    {
      label: t("dividendYield"),
      key: "dividend" as const,
      format: (v: number) => `${v.toFixed(2)}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {metrics.map(({ label, key, format }) => (
        <div key={key} className="bg-surface rounded-2xl p-4">
          <p className="text-xs text-muted mb-1">{label}</p>
          <p className="text-base font-semibold text-foreground">
            {format(profile[key])}
          </p>
        </div>
      ))}
    </div>
  );
}
