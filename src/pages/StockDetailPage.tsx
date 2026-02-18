import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Building2, Landmark } from "lucide-react";
import { guruDetails, gurus } from "@/data/mock";
import { useJsonData } from "@/hooks/useJsonData";
import { CompanyProfile } from "@/types";
import { useTranslation } from "react-i18next";
import StockMetrics from "@/components/stock/StockMetrics";

export default function StockDetailPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const { t } = useTranslation();
  const { data: profiles, loading } = useJsonData<Record<string, CompanyProfile>>("/data/profiles.json");
  const profile = profiles?.[ticker ?? ""];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-20 mb-6" />
          <div className="bg-surface rounded-3xl p-6 shadow-plastic">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  const isKR = profile.exchange === "KRX";
  const currencyPrefix = isKR ? "\u20A9" : "$";
  const isUp = profile.changesPercentage > 0;
  const isDown = profile.changesPercentage < 0;

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
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        {t("common.back")}
      </Link>

      <div className="bg-surface rounded-3xl p-6 shadow-plastic">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile.companyName}
            </h1>
            <p className="text-sm text-muted mt-1">
              {profile.symbol} &middot; {profile.exchange}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">
              {currencyPrefix}
              {profile.price.toLocaleString()}
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

      <StockMetrics profile={profile} />

      {gurusHoldingStock.length > 0 && (
        <div className="bg-surface rounded-3xl p-6 shadow-plastic">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {t("stockDetail.guruChoice")}
          </h2>
          <div className="space-y-3">
            {gurusHoldingStock.map(({ guru, holding }) => {
              const Icon = guru.type === "congress" ? Landmark : Building2;
              return (
                <Link
                  key={guru.id}
                  to={`/guru/${guru.id}`}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Icon size={20} className="text-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {guru.name}
                      </p>
                      <p className="text-xs text-muted">{guru.nameEn}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {t("common.weight")} {holding.weight.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted">
                      {holding.sharesNumber.toLocaleString()}
                      {t("common.shares")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-surface rounded-3xl p-6 shadow-plastic">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {t("stockDetail.companyInfo")}
        </h2>
        <p className="text-sm text-muted leading-relaxed mb-4">
          {profile.description}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-xs text-muted mb-1">{t("common.sector")}</p>
            <p className="text-sm font-medium text-foreground">{profile.sector}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-xs text-muted mb-1">{t("common.industry")}</p>
            <p className="text-sm font-medium text-foreground">{profile.industry}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3">
            <p className="text-xs text-muted mb-1">{t("common.exchange")}</p>
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
