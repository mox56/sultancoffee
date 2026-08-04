// src/components/language-switcher.tsx
"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const otherLocale = locale === "ar" ? "en" : "ar";

  return (
    <button
      onClick={() => router.replace(pathname, { locale: otherLocale })}
      className="text-sm underline"
    >
      {otherLocale === "ar" ? "العربية" : "English"}
    </button>
  );
}