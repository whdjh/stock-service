import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, Building2, Landmark } from "lucide-react";
import { getCompanyProfile, guruDetails, gurus } from "@/data/mock";
import Badge from "@/components/ui/Badge";
import StockMetrics from "@/components/stock/StockMetrics";

interface StockDetailPageProps {
  params: Promise<{ ticker: string }>;
}

export default async function StockDetailPage({ params }: StockDetailPageProps) {
  const { ticker } = await params;
  const profile = getCompanyProfile(ticker);

  if (!profile) {
    notFound();
  }

  const isKR = profile.exchange === "KRX";
  const currencyPrefix = isKR ? "₩" : "$";
  const isUp = profile.changesPercentage > 0;
  const isDown = profile.changesPercentage < 0;

  // Find which gurus hold this stock
  const gurusHoldingStock = gurus
    .map((guru) => {
      const detail = guruDetails[guru.id];
      if (!detail) return null;
      const holding = detail.holdings.find((h) => h.symbol === ticker);
      if (!holding) return null;
      return { guru, holding };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        대시보드로 돌아가기
      </Link>

      {/* Stock Header */}
      <div className="bg-surface rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile.companyName}
            </h1>
            <p className="text-sm text-muted mt-1">{profile.symbol} · {profile.exchange}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">
              {currencyPrefix}{profile.price.toLocaleString()}
            </p>
            <div className="flex items-center justify-end gap-2 mt-1">
              {isUp ? (
                <TrendingUp size={16} className="text-red-500" />
              ) : isDown ? (
                <TrendingDown size={16} className="text-blue-500" />
              ) : null}
              <span
                className={`text-sm font-medium ${
                  isUp ? "text-red-500" : isDown ? "text-blue-500" : "text-muted"
                }`}
              >
                {isUp ? "+" : ""}
                {profile.change.toLocaleString()} ({isUp ? "+" : ""}
                {profile.changesPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <StockMetrics profile={profile} />

      {/* 고수의 선택 */}
      {gurusHoldingStock.length > 0 && (
        <div className="bg-surface rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">고수의 선택</h2>
          <div className="space-y-3">
            {gurusHoldingStock.map(({ guru, holding }) => {
              const Icon = guru.type === "congress" ? Landmark : Building2;
              return (
                <Link
                  key={guru.id}
                  href={`/guru/${guru.id}`}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Icon size={20} className="text-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{guru.name}</p>
                      <p className="text-xs text-muted">{guru.nameEn}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      비중 {holding.weight.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted">
                      {holding.sharesNumber.toLocaleString()}주
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Company Info */}
      <div className="bg-surface rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">기업 정보</h2>
        <p className="text-sm text-muted leading-relaxed mb-4">{profile.description}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-xs text-muted mb-1">섹터</p>
            <p className="text-sm font-medium text-foreground">{profile.sector}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-xs text-muted mb-1">산업</p>
            <p className="text-sm font-medium text-foreground">{profile.industry}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-xs text-muted mb-1">거래소</p>
            <p className="text-sm font-medium text-foreground">{profile.exchange}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-xs text-muted mb-1">CEO</p>
            <p className="text-sm font-medium text-foreground">{profile.ceo}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
