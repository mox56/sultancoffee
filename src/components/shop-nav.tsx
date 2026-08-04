// src/components/shop-nav.tsx
"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-context";

export function ShopNav() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();

  const otherLocale = locale === "ar" ? "en" : "ar";

  return (
    <nav className="sticky top-0 z-40 bg-[#1C1410]/95 backdrop-blur border-b border-[#3A2D22]">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-wide text-white">
          بن السلطان
        </Link>

        <div className="flex items-center gap-5">
          <button
            onClick={() => router.replace(pathname, { locale: otherLocale })}
            className="text-sm text-[#B8A78F] hover:text-[#C9A66B] transition-colors"
          >
            {otherLocale === "ar" ? "العربية" : "English"}
          </button>

          <Link
            href="/cart"
            className="relative text-sm text-[#B8A78F] hover:text-[#C9A66B] transition-colors"
          >
            {isAr ? "السلة" : "Cart"}
            {totalItems > 0 && (
              <span
                className="absolute -top-2.5 -end-3 bg-[#C9A66B] text-[#1C1410] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                dir="ltr"
              >
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}