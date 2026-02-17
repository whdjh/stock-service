"use client";

import { useState } from "react";
import Link from "next/link";
import { StockQuote } from "@/types";
import Badge from "@/components/ui/Badge";

interface RankingListProps {
  usStocks: StockQuote[];
  krStocks: StockQuote[];
}

export default function RankingList({ usStocks, krStocks }: RankingListProps) {
  const [tab, setTab] = useState<"us" | "kr">("us");
  const stocks = tab === "us" ? usStocks : krStocks;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("us")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            tab === "us" ? "bg-foreground text-white" : "bg-gray-100 text-muted"
          }`}
        >
          미국
        </button>
        <button
          onClick={() => setTab("kr")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            tab === "kr" ? "bg-foreground text-white" : "bg-gray-100 text-muted"
          }`}
        >
          한국
        </button>
      </div>
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
                {tab === "kr" ? "₩" : "$"}{stock.price.toLocaleString()}
              </p>
              <Badge value={stock.changesPercentage} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
