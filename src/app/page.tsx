import { gurus, usStocks, krStocks, usSectors, krSectors } from "@/data/mock";
import GuruCard from "@/components/guru/GuruCard";
import RankingList from "@/components/stock/RankingList";
import SectorTabs from "@/components/sector/SectorTabs";
import { Wallet, Trophy, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* 섹션 1: 고수들의 지갑 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={20} className="text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">고수들의 지갑</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {gurus.map((guru) => (
            <GuruCard key={guru.id} guru={guru} />
          ))}
        </div>
      </section>

      {/* 섹션 2: 시총 Top 30 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">시총 Top 30</h2>
        </div>
        <RankingList usStocks={usStocks} krStocks={krStocks} />
      </section>

      {/* 섹션 3: 섹터별 순위 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">섹터별 순위</h2>
        </div>
        <SectorTabs usSectors={usSectors} krSectors={krSectors} />
      </section>
    </div>
  );
}
