"use client";

import { useState } from "react";
import Link from "next/link";
import { Sector } from "@/types";
import Badge from "@/components/ui/Badge";

interface SectorTabsProps {
  sectors: Sector[];
}

export default function SectorTabs({ sectors }: SectorTabsProps) {
  const [activeId, setActiveId] = useState(sectors[0]?.id ?? "");
  const activeSector = sectors.find((s) => s.id === activeId);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
        {sectors.map((sector) => (
          <button
            key={sector.id}
            onClick={() => setActiveId(sector.id)}
            className={`shrink-0 px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              sector.id === activeId
                ? "bg-foreground text-white"
                : "bg-gray-100 text-muted hover:bg-gray-200"
            }`}
          >
            {sector.name}
          </button>
        ))}
      </div>
      {activeSector && (
        <div className="space-y-2">
          {activeSector.stocks.slice(0, 5).map((stock) => (
            <Link
              key={stock.symbol}
              href={`/stock/${stock.symbol}`}
              className="flex items-center justify-between py-3 px-4 bg-surface rounded-2xl hover:shadow-sm transition-shadow"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{stock.name}</p>
                <p className="text-xs text-muted">{stock.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {stock.exchange === "KRX" ? "₩" : "$"}{stock.price.toLocaleString()}
                </p>
                <Badge value={stock.changesPercentage} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
