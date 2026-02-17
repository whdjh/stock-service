"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

const locales = ["ko", "en"] as const;

export default function LocaleSwitcher() {
  const current = useLocale();
  const router = useRouter();

  function switchLocale(locale: string) {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="flex gap-1">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
            locale === current
              ? "bg-foreground text-white"
              : "bg-gray-100 text-muted hover:bg-gray-200"
          }`}
        >
          {locale === "ko" ? "한국어" : "English"}
        </button>
      ))}
    </div>
  );
}
