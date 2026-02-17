"use client";

import { useState } from "react";
import Link from "next/link";
import { Sector } from "@/types";
import Badge from "@/components/ui/Badge";

interface SectorTabsProps {
  usSectors: Sector[];
  krSectors: Sector[];
}

export default function SectorTabs({ usSectors, krSectors }: SectorTabsProps) {
  const [country, setCountry] = useState<"us" | "kr">("us");
  const sectors = country === "us" ? usSectors : krSectors;
  const [activeId, setActiveId] = useState(sectors[0]?.id ?? "");

  const activeSector = sectors.find((s) => s.id === activeId) ?? sectors[0];

  function handleCountryChange(c: "us" | "kr") {
    setCountry(c);
    const newSectors = c === "us" ? usSectors : krSectors;
    setActiveId(newSectors[0]?.id ?? "");
  }

  return (
    <div>
      {/* 미국/한국 탭 */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => handleCountryChange("us")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            country === "us" ? "bg-foreground text-white" : "bg-gray-100 text-muted"
          }`}
        >
          미국
        </button>
        <button
          onClick={() => handleCountryChange("kr")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            country === "kr" ? "bg-foreground text-white" : "bg-gray-100 text-muted"
          }`}
        >
          한국
        </button>
      </div>

      {/* 섹터 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-3">
        {sectors.map((sector) => (
          <button
            key={sector.id}
            onClick={() => setActiveId(sector.id)}
            className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              sector.id === activeId
                ? "bg-gray-200 text-foreground"
                : "bg-gray-50 text-muted hover:bg-gray-100"
            }`}
          >
            {sector.name}
          </button>
        ))}
      </div>

      {/* 종목 리스트 (시가총액 순) */}
      {activeSector && (
        <div className="space-y-2">
          {activeSector.stocks.map((stock, i) => (
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
                  {country === "kr" ? "₩" : "$"}{stock.price.toLocaleString()}
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
