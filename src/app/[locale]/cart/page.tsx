// src/app/[locale]/cart/page.tsx
"use client";

import { useCart } from "@/lib/cart-context";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();

  const currency = isAr ? "ج.م" : "EGP";

  return (
    <div className="min-h-screen bg-[#1C1410] text-[#F5EFE6]">
      <main className="px-6 py-10 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">{isAr ? "السلة" : "Cart"}</h1>
        <div className="w-12 h-px bg-[#C9A66B] mb-8" />

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#8A7A65] mb-4">
              {isAr ? "سلتك فارغة" : "Your cart is empty"}
            </p>
            <Link href="/" className="text-[#C9A66B] text-sm hover:underline">
              {isAr ? "تصفح المنتجات" : "Browse products"}
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map((item) => {
                const label = [
                  item.weightGrams ? `${item.weightGrams}${isAr ? "جم" : "g"}` : null,
                  item.roastLevel,
                  item.grindType,
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <div
                    key={item.variantId}
                    className="flex items-center justify-between border border-[#3A2D22] rounded-lg p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {isAr ? item.nameAr : item.nameEn ?? item.nameAr}
                      </p>
                      <p className="text-xs text-[#8A7A65] mt-0.5">{label}</p>
                      <p className="text-sm text-[#C9A66B] mt-1" dir="ltr">
                        {item.price} {currency}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className="flex items-center border border-[#3A2D22] rounded-md"
                        dir="ltr"
                      >
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-2.5 py-1 text-[#B8A78F] hover:text-[#F5EFE6]"
                        >
                          −
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="px-2.5 py-1 text-[#B8A78F] hover:text-[#F5EFE6] disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-xs text-[#B06A4E] hover:underline"
                      >
                        {isAr ? "إزالة" : "Remove"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#3A2D22] pt-6">
              <div className="flex items-center justify-between text-lg font-semibold mb-6">
                <span>{isAr ? "الإجمالي" : "Subtotal"}</span>
                <span dir="ltr" className="text-[#C9A66B]">
                  {subtotal} {currency}
                </span>
              </div>
              <p className="text-xs text-[#8A7A65] mb-4">
                {isAr
                  ? "رسوم الشحن تُحتسب عند إتمام الطلب"
                  : "Shipping calculated at checkout"}
              </p>
              <button
                onClick={() => router.push("/checkout")}
                className="w-full py-3 rounded-md bg-[#C9A66B] text-[#1C1410] font-semibold hover:bg-[#D9B87E] transition-colors"
              >
                {isAr ? "إتمام الطلب" : "Checkout"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}