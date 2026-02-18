import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sector, StockQuote } from "@/types";
import { getKrStockBySymbol } from "@/data/mock";
import { useJsonData } from "@/hooks/useJsonData";
import Badge from "@/components/ui/Badge";
import Tooltip from "@/components/ui/Tooltip";

interface SectorTabsProps {
  usSectors: Sector[];
  krSectors: Sector[];
}

const sectorKeys: Record<string, string> = {
  "information-technology": "informationTechnology",
  "health-care": "healthCare",
  financials: "financials",
  "consumer-discretionary": "consumerDiscretionary",
  "communication-services": "communicationServices",
  industrials: "industrials",
  "consumer-staples": "consumerStaples",
  energy: "energy",
  materials: "materials",
  utilities: "utilities",
  "real-estate": "realEstate",
};

export default function SectorTabs({
  usSectors,
  krSectors,
}: SectorTabsProps) {
  const { t } = useTranslation();
  const [country, setCountry] = useState<"us" | "kr">("us");
  const sectors = country === "us" ? usSectors : krSectors;
  const [activeId, setActiveId] = useState(sectors[0]?.id ?? "");
  const { data: usStocks } = useJsonData<StockQuote[]>("/data/us-stocks.json");

  const activeSector = sectors.find((s) => s.id === activeId) ?? sectors[0];

  function handleCountryChange(c: "us" | "kr") {
    setCountry(c);
    const newSectors = c === "us" ? usSectors : krSectors;
    setActiveId(newSectors[0]?.id ?? "");
  }

  function getSectorName(sector: Sector): string {
    const key = sectorKeys[sector.id];
    if (key) {
      return t(`sectors.${key}`);
    }
    return sector.name;
  }

  function getSectorTooltip(sector: Sector): string | null {
    const key = sectorKeys[sector.id];
    if (key) {
      return t(`tooltip.sector.${key}`);
    }
    return null;
  }

  function resolveStocks(sector: Sector): StockQuote[] {
    if (country === "kr") {
      return sector.symbols
        .map(getKrStockBySymbol)
        .filter((s): s is StockQuote => !!s)
        .sort((a, b) => b.marketCap - a.marketCap);
    }
    if (!usStocks) return [];
    const usMap = new Map(usStocks.map((s) => [s.symbol, s]));
    return sector.symbols
      .map((sym) => usMap.get(sym))
      .filter((s): s is StockQuote => !!s)
      .sort((a, b) => b.marketCap - a.marketCap);
  }

  const stocks = activeSector ? resolveStocks(activeSector) : [];

  return (
    <div>
      {/* Country tabs */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => handleCountryChange("us")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            country === "us"
              ? "bg-foreground text-white"
              : "bg-gray-100 text-muted"
          }`}
        >
          {t("common.us")}
        </button>
        <button
          onClick={() => handleCountryChange("kr")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            country === "kr"
              ? "bg-foreground text-white"
              : "bg-gray-100 text-muted"
          }`}
        >
          {t("common.kr")}
        </button>
      </div>

      {/* Sector tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3">
        {sectors.map((sector) => {
          const tip = getSectorTooltip(sector);
          return (
            <div key={sector.id} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setActiveId(sector.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sector.id === activeId
                    ? "bg-gray-200 text-foreground"
                    : "bg-gray-50 text-muted hover:bg-gray-100"
                }`}
              >
                {getSectorName(sector)}
              </button>
              {tip && <Tooltip text={tip} />}
            </div>
          );
        })}
      </div>

      {/* Stock list */}
      {stocks.length > 0 ? (
        <div className="space-y-2">
          {stocks.map((stock, i) => (
            <Link
              key={stock.symbol}
              to={`/stock/${stock.symbol}`}
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
                  {country === "kr" ? "\u20A9" : "$"}
                  {stock.price.toLocaleString()}
                </p>
                <Badge value={stock.changesPercentage} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted py-4 text-center">{t("common.noData")}</p>
      )}
    </div>
  );
}
