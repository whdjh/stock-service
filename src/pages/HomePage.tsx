import { gurus, usStocks, krStocks, kosdaqStocks, usSectors, krSectors } from "@/data/mock";
import { useTranslation } from "react-i18next";
import GuruCard from "@/components/guru/GuruCard";
import RankingList from "@/components/stock/RankingList";
import SectorTabs from "@/components/sector/SectorTabs";
import { Wallet, Trophy, BarChart3 } from "lucide-react";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Gurus */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={20} className="text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            {t("gurus.title")}
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {gurus.map((guru) => (
            <GuruCard key={guru.id} guru={guru} />
          ))}
        </div>
      </section>

      {/* Ranking */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            {t("ranking.title")}
          </h2>
        </div>
        <RankingList
          usStocks={usStocks}
          krStocks={krStocks}
          kosdaqStocks={kosdaqStocks}
        />
      </section>

      {/* Sectors */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            {t("sectors.title")}
          </h2>
        </div>
        <SectorTabs
          usSectors={usSectors}
          krSectors={krSectors}
        />
      </section>
    </div>
  );
}
