import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StockQuote } from "@/types";
import { useJsonData } from "@/hooks/useJsonData";
import Badge from "@/components/ui/Badge";
import Tooltip from "@/components/ui/Tooltip";

interface RankingListProps {
  krStocks: StockQuote[];
  kosdaqStocks: StockQuote[];
}

export default function RankingList({
  krStocks,
  kosdaqStocks,
}: RankingListProps) {
  const { t } = useTranslation();
  const [country, setCountry] = useState<"us" | "kr">("us");
  const [usExchange, setUsExchange] = useState<"all" | "NASDAQ" | "NYSE">("all");
  const [krExchange, setKrExchange] = useState<"all" | "KOSPI" | "KOSDAQ">("all");
  const { data: usStocks, loading: usLoading } = useJsonData<StockQuote[]>("/data/us-stocks.json");
  const { data: krStocksJson, loading: krLoading } = useJsonData<StockQuote[]>("/data/kr-stocks.json");

  let stocks: StockQuote[];
  let currency: string;
  let loading = false;

  if (country === "us") {
    if (usLoading || !usStocks) {
      stocks = [];
      loading = true;
    } else {
      stocks =
        usExchange === "all" ? usStocks : usStocks.filter((s) => s.exchange === usExchange);
    }
    currency = "$";
  } else {
    // JSON 실데이터 우선, 없으면 mock fallback
    let allKr: StockQuote[];
    if (krStocksJson && krStocksJson.length > 0) {
      allKr = [...krStocksJson].sort((a, b) => b.marketCap - a.marketCap);
      loading = false;
    } else if (krLoading) {
      allKr = [];
      loading = true;
    } else {
      allKr = [...krStocks, ...kosdaqStocks].sort(
        (a, b) => b.marketCap - a.marketCap
      );
    }
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
          {t("common.us")}
        </button>
        <button
          onClick={() => setCountry("kr")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            country === "kr"
              ? "bg-foreground text-white"
              : "bg-gray-100 text-muted"
          }`}
        >
          {t("common.kr")}
        </button>
      </div>

      {/* Exchange sub-tabs */}
      <div className="flex gap-2 mb-4">
        {country === "us" ? (
          <>
            {(["all", "NASDAQ", "NYSE"] as const).map((ex) => (
              <div key={ex} className="flex items-center gap-1">
                <button
                  onClick={() => setUsExchange(ex)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    usExchange === ex
                      ? "bg-gray-200 text-foreground"
                      : "bg-gray-50 text-muted hover:bg-gray-100"
                  }`}
                >
                  {ex === "all" ? t("common.all") : ex}
                </button>
                {ex !== "all" && <Tooltip text={t(`tooltip.exchange.${ex}`)} />}
              </div>
            ))}
          </>
        ) : (
          <>
            {(["all", "KOSPI", "KOSDAQ"] as const).map((ex) => (
              <div key={ex} className="flex items-center gap-1">
                <button
                  onClick={() => setKrExchange(ex)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    krExchange === ex
                      ? "bg-gray-200 text-foreground"
                      : "bg-gray-50 text-muted hover:bg-gray-100"
                  }`}
                >
                  {ex === "all" ? t("common.all") : ex}
                </button>
                {ex !== "all" && <Tooltip text={t(`tooltip.exchange.${ex}`)} />}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Stock list */}
      {loading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      ) : stocks.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center">{t("common.noData")}</p>
      ) : (
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
                  {currency}
                  {stock.price.toLocaleString()}
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
