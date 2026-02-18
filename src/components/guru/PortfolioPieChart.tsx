import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { InstitutionalHolding } from "@/types";
import { useTranslation } from "react-i18next";

const COLORS = ["#191F28", "#4B5563", "#6B7280", "#9CA3AF", "#D1D5DB", "#E5E7EB"];

interface PortfolioPieChartProps {
  holdings: InstitutionalHolding[];
}

export default function PortfolioPieChart({ holdings }: PortfolioPieChartProps) {
  const { t } = useTranslation();
  const top5 = [...holdings].sort((a, b) => b.weight - a.weight).slice(0, 5);
  const othersWeight = 100 - top5.reduce((sum, h) => sum + h.weight, 0);

  const chartData = [
    ...top5.map((h) => ({ name: h.symbol, value: h.weight })),
    ...(othersWeight > 0 ? [{ name: t("common.others"), value: othersWeight }] : []),
  ];

  return (
    <div className="bg-surface rounded-3xl p-6 shadow-plastic">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${Number(value).toFixed(1)}%`}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {chartData.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-sm text-foreground font-medium flex-1">{item.name}</span>
              <span className="text-sm text-muted">{item.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
