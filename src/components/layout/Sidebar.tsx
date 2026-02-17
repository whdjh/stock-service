import { marketIndexes, sidebarExtras } from "@/data/mock";
import Badge from "@/components/ui/Badge";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";
import { TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function Sidebar() {
  const t = await getTranslations("sidebar");

  return (
    <aside className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-6 lg:self-start">
      <div className="bg-surface rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-foreground" />
            <h2 className="text-base font-semibold text-foreground">
              {t("title")}
            </h2>
          </div>
          <LocaleSwitcher />
        </div>
        <div className="space-y-3">
          {marketIndexes.map((index) => (
            <div key={index.symbol} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{index.name}</p>
                <p className="text-xs text-muted">{index.price.toLocaleString()}</p>
              </div>
              <Badge value={index.changesPercentage} />
            </div>
          ))}
          {/* Exchange Rate & Commodities */}
          <div className="border-t border-gray-100 pt-3 space-y-3">
            {sidebarExtras.map((item) => (
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
      </div>
    </aside>
  );
}
