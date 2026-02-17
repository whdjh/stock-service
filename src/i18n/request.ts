import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const locales = ["ko", "en"] as const;
const defaultLocale = "ko";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale =
    cookieLocale && locales.includes(cookieLocale as (typeof locales)[number])
      ? cookieLocale
      : defaultLocale;

  return {
    locale,
    messages: (await import(`@/dictionaries/${locale}.json`)).default,
  };
});
