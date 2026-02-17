import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Landmark,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { getGuruById } from "@/data/mock";
import Badge from "@/components/ui/Badge";

interface GuruDetailPageProps {
  params: Promise<{ id: string }>;
}

const guruIcons = {
  institutional: Building2,
  congress: Landmark,
  pension: Building2,
};

function formatValue(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

export default async function GuruDetailPage({ params }: GuruDetailPageProps) {
  const { id } = await params;
  const guru = getGuruById(id);

  if (!guru) {
    notFound();
  }

  const Icon = guruIcons[guru.type] ?? Building2;

  // Top 10 holdings by weight
  const topHoldings = [...guru.holdings]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10);

  // Recent activity: holdings with non-zero changeInSharesNumberPercentage
  const recentActivity = guru.holdings.filter(
    (h) => h.changeInSharesNumberPercentage !== 0
  );

  // Max weight for progress bar scaling
  const maxWeight = topHoldings.length > 0 ? topHoldings[0].weight : 100;

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

      {/* Guru Profile Card */}
      <div className="bg-surface rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Icon size={28} className="text-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{guru.name}</h1>
              <Badge value={guru.returnRate} suffix="% /yr" />
            </div>
            <p className="text-sm text-muted mt-0.5">{guru.nameEn}</p>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              {guru.description}
            </p>
          </div>
        </div>
      </div>

      {/* Top Holdings */}
      <div className="bg-surface rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Top Holdings
        </h2>
        <div className="space-y-3">
          {topHoldings.map((holding, i) => (
            <Link
              key={holding.symbol}
              href={`/stock/${holding.symbol}`}
              className="block py-3 px-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted w-6 text-right">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {holding.nameOfIssuer}
                    </p>
                    <p className="text-xs text-muted">{holding.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {holding.weight.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted">
                    {formatValue(holding.value)}
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-foreground rounded-full h-1.5 transition-all"
                  style={{
                    width: `${(holding.weight / maxWeight) * 100}%`,
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-surface rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            최근 활동
          </h2>
          <div className="space-y-2">
            {recentActivity.map((holding) => {
              const isBuy = holding.changeInSharesNumberPercentage > 0;
              return (
                <Link
                  key={holding.symbol}
                  href={`/stock/${holding.symbol}`}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isBuy ? (
                      <ArrowUpCircle size={20} className="text-red-500" />
                    ) : (
                      <ArrowDownCircle size={20} className="text-blue-500" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {holding.nameOfIssuer}
                      </p>
                      <p className="text-xs text-muted">{holding.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      value={holding.changeInSharesNumberPercentage}
                      suffix="%"
                    />
                    <p className="text-xs text-muted mt-1">
                      {isBuy ? "매수" : "매도"}{" "}
                      {Math.abs(
                        holding.changeInSharesNumber
                      ).toLocaleString()}
                      주
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Congress Trades (only for Pelosi / congress type with trades) */}
      {guru.trades && guru.trades.length > 0 && (
        <div className="bg-surface rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            의회 거래 내역
          </h2>
          <div className="space-y-2">
            {guru.trades.map((trade, i) => {
              const isPurchase = trade.type === "purchase";
              const typeLabel = isPurchase
                ? "매수"
                : trade.type === "sale_full"
                ? "전량 매도"
                : "일부 매도";
              return (
                <Link
                  key={`${trade.symbol}-${trade.transactionDate}-${i}`}
                  href={`/stock/${trade.symbol}`}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isPurchase ? (
                      <TrendingUp size={20} className="text-red-500" />
                    ) : (
                      <TrendingDown size={20} className="text-blue-500" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {trade.symbol}
                      </p>
                      <p className="text-xs text-muted">
                        {trade.transactionDate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${
                        isPurchase
                          ? "text-red-500 bg-red-50"
                          : "text-blue-500 bg-blue-50"
                      }`}
                    >
                      {typeLabel}
                    </span>
                    <p className="text-xs text-muted mt-1">{trade.amount}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
