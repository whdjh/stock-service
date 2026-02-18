import { useJsonData } from "@/hooks/useJsonData";
import { MarketIndex, ExchangeRate } from "@/types";
import Badge from "@/components/ui/Badge";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MarketData {
  indexes: MarketIndex[];
  extras: ExchangeRate[];
}

export default function Sidebar() {
  const { t } = useTranslation();
  const { data, loading } = useJsonData<MarketData>("/data/market-indexes.json");

  return (
    <aside className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-6 lg:self-start">
      <div className="bg-surface rounded-3xl p-5 shadow-plastic">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-foreground" />
            <h2 className="text-base font-semibold text-foreground">
              {t("sidebar.title")}
            </h2>
          </div>
          <LocaleSwitcher />
        </div>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>
            ))}
          </div>
        ) : !data ? (
          <p className="text-xs text-muted">{t("common.noData")}</p>
        ) : (
          <div className="space-y-3">
            {data.indexes.map((index) => (
              <div key={index.symbol} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{index.name}</p>
                  <p className="text-xs text-muted">{index.price.toLocaleString()}</p>
                </div>
                <Badge value={index.changesPercentage} />
              </div>
            ))}
            <div className="border-t border-gray-100 pt-3 space-y-3">
              {data.extras.map((item) => (
                <div key={item.pair} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted">{item.rate.toLocaleString()}</p>
                  </div>
                  <Badge value={item.changesPercentage} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
