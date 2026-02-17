"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { StockQuote } from "@/types";
import Badge from "@/components/ui/Badge";

interface RankingListProps {
  usStocks: StockQuote[];
  krStocks: StockQuote[];
  kosdaqStocks: StockQuote[];
}

export default function RankingList({
  usStocks,
  krStocks,
  kosdaqStocks,
}: RankingListProps) {
  const t = useTranslations("common");
  const [country, setCountry] = useState<"us" | "kr">("us");
  const [usExchange, setUsExchange] = useState<"all" | "NASDAQ" | "NYSE">("all");
  const [krExchange, setKrExchange] = useState<"all" | "KOSPI" | "KOSDAQ">("all");

  let stocks: StockQuote[];
  let currency: string;

  if (country === "us") {
    const allUs = usStocks;
    stocks =
      usExchange === "all" ? allUs : allUs.filter((s) => s.exchange === usExchange);
    currency = "$";
  } else {
    const allKr = [...krStocks, ...kosdaqStocks].sort(
      (a, b) => b.marketCap - a.marketCap
    );
    stocks =
      krExchange === "all" ? allKr : allKr.filter((s) => s.exchange === krExchange);
    currency = "\u20A9";
  }

  return (
    <div>
      {/* Country tabs */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setCountry("us")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            country === "us"
              ? "bg-foreground text-white"
              : "bg-gray-100 text-muted"
          }`}
        >
          {t("us")}
        </button>
        <button
          onClick={() => setCountry("kr")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            country === "kr"
              ? "bg-foreground text-white"
              : "bg-gray-100 text-muted"
          }`}
        >
          {t("kr")}
        </button>
      </div>

      {/* Exchange sub-tabs */}
      <div className="flex gap-2 mb-4">
        {country === "us" ? (
          <>
            {(["all", "NASDAQ", "NYSE"] as const).map((ex) => (
              <button
                key={ex}
                onClick={() => setUsExchange(ex)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  usExchange === ex
                    ? "bg-gray-200 text-foreground"
                    : "bg-gray-50 text-muted hover:bg-gray-100"
                }`}
              >
                {ex === "all" ? t("all") : ex}
              </button>
            ))}
          </>
        ) : (
          <>
            {(["all", "KOSPI", "KOSDAQ"] as const).map((ex) => (
              <button
                key={ex}
                onClick={() => setKrExchange(ex)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  krExchange === ex
                    ? "bg-gray-200 text-foreground"
                    : "bg-gray-50 text-muted hover:bg-gray-100"
                }`}
              >
                {ex === "all" ? t("all") : ex}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Stock list */}
      <div className="space-y-2">
        {stocks.map((stock, i) => (
          <Link
            key={stock.symbol}
            href={`/stock/${stock.symbol}`}
            className="flex items-center justify-between py-3 px-4 bg-surface rounded-2xl hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted w-6 text-right">{i + 1}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{stock.name}</p>
                <p className="text-xs text-muted">{stock.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {currency}
                {stock.price.toLocaleString()}
              </p>
              <Badge value={stock.changesPercentage} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
