import { gurus, usStocks, krStocks, sectors } from "@/data/mock";
import GuruCard from "@/components/guru/GuruCard";
import RankingList from "@/components/stock/RankingList";
import SectorTabs from "@/components/sector/SectorTabs";
import { Wallet, Trophy, Flame } from "lucide-react";

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

      {/* 섹션 3: 지금 뜨는 섹터 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Flame size={20} className="text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">지금 뜨는 섹터</h2>
        </div>
        <SectorTabs sectors={sectors} />
      </section>
    </div>
  );
}
