import { useTranslation } from "react-i18next";

const locales = ["ko", "en"] as const;

export default function LocaleSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  function switchLocale(locale: string) {
    localStorage.setItem("locale", locale);
    i18n.changeLanguage(locale);
  }

  return (
    <div className="flex gap-1">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={`w-16 py-1 rounded-lg text-xs font-medium text-center transition-colors ${
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
