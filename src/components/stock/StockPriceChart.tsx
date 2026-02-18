import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, AreaSeries } from "lightweight-charts";
import { useJsonData } from "@/hooks/useJsonData";

interface HistoricalPrice {
  date: string;
  close: number;
}

interface HistoricalResponse {
  symbol: string;
  historical: HistoricalPrice[];
}

type Period = "1M" | "3M" | "6M" | "1Y";

interface StockPriceChartProps {
  symbol: string;
}

function filterByPeriod(data: HistoricalPrice[], period: Period): HistoricalPrice[] {
  const now = new Date();
  const months = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 };
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - months[period]);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return data.filter((d) => d.date >= cutoffStr);
}

export default function StockPriceChart({ symbol }: StockPriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [period, setPeriod] = useState<Period>("1Y");
  const { data, loading } = useJsonData<HistoricalResponse>(`/data/historical/${symbol}.json`);

  useEffect(() => {
    if (!chartContainerRef.current || !data) return;

    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        layout: { background: { color: "transparent" }, textColor: "#8B95A1" },
        grid: { vertLines: { visible: false }, horzLines: { color: "#F2F4F6" } },
        width: chartContainerRef.current.clientWidth,
        height: 300,
        timeScale: { borderVisible: false },
        rightPriceScale: { borderVisible: false },
      });
      seriesRef.current = chartRef.current.addSeries(AreaSeries, {
        lineColor: "#191F28",
        topColor: "rgba(25, 31, 40, 0.2)",
        bottomColor: "rgba(25, 31, 40, 0)",
        lineWidth: 2,
      });
    }

    const filtered = filterByPeriod(data.historical, period)
      .sort((a, b) => a.date.localeCompare(b.date));
    seriesRef.current?.setData(
      filtered.map((d) => ({ time: d.date, value: d.close }))
    );
    chartRef.current?.timeScale().fitContent();
  }, [data, period]);

  useEffect(() => {
    if (!chartContainerRef.current || !chartRef.current) return;
    const container = chartContainerRef.current;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      chartRef.current?.applyOptions({ width });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [data]);

  useEffect(() => {
    return () => {
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  if (loading) {
    return <div className="bg-surface rounded-3xl p-6 shadow-plastic h-[380px] animate-pulse" />;
  }

  if (!data) return null;

  const periods: Period[] = ["1M", "3M", "6M", "1Y"];

  return (
    <div className="bg-surface rounded-3xl p-6 shadow-plastic">
      <div className="flex gap-2 mb-4">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              p === period
                ? "bg-foreground text-white"
                : "bg-gray-100 text-muted hover:bg-gray-200"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
}
