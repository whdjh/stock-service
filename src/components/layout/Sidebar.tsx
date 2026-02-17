import { marketIndexes } from "@/data/mock";
import Badge from "@/components/ui/Badge";
import { TrendingUp } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-full lg:w-64 lg:shrink-0">
      <div className="bg-surface rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-foreground" />
          <h2 className="text-base font-semibold text-foreground">오늘의 시장</h2>
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
        </div>
      </div>
    </aside>
  );
}
