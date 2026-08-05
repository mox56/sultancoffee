// src/app/[locale]/checkout/page.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

const SHIPPING_FEE = 50;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const currency = isAr ? "ج.م" : "EGP";

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    addressLine: "",
    building: "",
    floor: "",
    apartment: "",
    city: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "PAYMOB_CARD">(
    "CASH_ON_DELIVERY"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#1C1410] text-[#F5EFE6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8A7A65] mb-4">
            {isAr ? "سلتك فارغة" : "Your cart is empty"}
          </p>
          <Link href="/" className="text-[#C9A66B] text-sm hover:underline">
            {isAr ? "تصفح المنتجات" : "Browse products"}
          </Link>
        </div>
      </div>
    );
  }

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          customerEmail: form.customerEmail || undefined,
          notes: form.notes || undefined,
          paymentMethod,
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ?? (isAr ? "فشل إنشاء الطلب" : "Failed to create order"),
        );
      }
      if (paymentMethod === "PAYMOB_CARD") {
        // Redirect to Paymob's hosted iframe instead of going straight to confirmation
        const chargeRes = await fetch("/api/paymob/charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.order.id }),
        });
        const chargeData = await chargeRes.json();
        if (!chargeRes.ok)
          throw new Error(chargeData.error ?? "Payment initiation failed");

        window.location.href = chargeData.iframeUrl;
        return;
      }
      clearCart();
      router.push(`/order-confirmation/${data.order.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1410] text-[#F5EFE6]">
      <main className="px-6 py-10 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">
          {isAr ? "إتمام الطلب" : "Checkout"}
        </h1>
        <div className="w-12 h-px bg-[#C9A66B] mb-8" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#B8A78F] mb-1.5">
                {isAr ? "الاسم الكامل" : "Full name"}
              </label>
              <input
                required
                value={form.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#241B14] border border-[#3A2D22] focus:border-[#C9A66B] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-[#B8A78F] mb-1.5">
                {isAr ? "رقم الهاتف" : "Phone number"}
              </label>
              <input
                required
                dir="ltr"
                value={form.customerPhone}
                onChange={(e) => update("customerPhone", e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full px-3 py-2 rounded-md bg-[#241B14] border border-[#3A2D22] focus:border-[#C9A66B] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-[#B8A78F] mb-1.5">
                {isAr ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}
              </label>
              <input
                type="email"
                dir="ltr"
                value={form.customerEmail}
                onChange={(e) => update("customerEmail", e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#241B14] border border-[#3A2D22] focus:border-[#C9A66B] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-[#B8A78F] mb-1.5">
                {isAr ? "الشارع / المنطقة" : "Street / Area"}
              </label>
              <input
                required
                value={form.addressLine}
                onChange={(e) => update("addressLine", e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#241B14] border border-[#3A2D22] focus:border-[#C9A66B] outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-[#B8A78F] mb-1.5">
                  {isAr ? "المبنى" : "Building"}
                </label>
                <input
                  required
                  dir="ltr"
                  value={form.building}
                  onChange={(e) => update("building", e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#241B14] border border-[#3A2D22] focus:border-[#C9A66B] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#B8A78F] mb-1.5">
                  {isAr ? "الدور" : "Floor"}
                </label>
                <input
                  required
                  dir="ltr"
                  value={form.floor}
                  onChange={(e) => update("floor", e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#241B14] border border-[#3A2D22] focus:border-[#C9A66B] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#B8A78F] mb-1.5">
                  {isAr ? "الشقة" : "Apartment"}
                </label>
                <input
                  required
                  dir="ltr"
                  value={form.apartment}
                  onChange={(e) => update("apartment", e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#241B14] border border-[#3A2D22] focus:border-[#C9A66B] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#B8A78F] mb-1.5">
                {isAr ? "المدينة" : "City"}
              </label>
              <input
                required
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#241B14] border border-[#3A2D22] focus:border-[#C9A66B] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-[#B8A78F] mb-1.5">
                {isAr ? "ملاحظات (اختياري)" : "Notes (optional)"}
              </label>
              <input
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#241B14] border border-[#3A2D22] focus:border-[#C9A66B] outline-none"
              />
            </div>
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-sm text-[#B8A78F] mb-2">
              {isAr ? "طريقة الدفع" : "Payment method"}
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                className={`w-full text-start px-4 py-3 rounded-md border transition-colors ${
                  paymentMethod === "CASH_ON_DELIVERY"
                    ? "border-[#C9A66B] bg-[#C9A66B]/10"
                    : "border-[#3A2D22]"
                }`}
              >
                {isAr ? "الدفع عند الاستلام" : "Cash on delivery"}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("PAYMOB_CARD")}
                className={`w-full text-start px-4 py-3 rounded-md border transition-colors ${
                  paymentMethod === "PAYMOB_CARD"
                    ? "border-[#C9A66B] bg-[#C9A66B]/10"
                    : "border-[#3A2D22]"
                }`}
              >
                {isAr ? "بطاقة / محفظة إلكترونية" : "Card / Mobile Wallet"}
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div className="border-t border-[#3A2D22] pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[#B8A78F]">
              <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
              <span dir="ltr">
                {subtotal} {currency}
              </span>
            </div>
            <div className="flex justify-between text-[#B8A78F]">
              <span>{isAr ? "الشحن" : "Shipping"}</span>
              <span dir="ltr">
                {SHIPPING_FEE} {currency}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-[#F5EFE6] text-base pt-2">
              <span>{isAr ? "الإجمالي" : "Total"}</span>
              <span dir="ltr" className="text-[#C9A66B]">
                {subtotal + SHIPPING_FEE} {currency}
              </span>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-md bg-[#C9A66B] text-[#1C1410] font-semibold hover:bg-[#D9B87E] transition-colors disabled:opacity-40"
          >
            {submitting
              ? isAr ? "جاري إرسال الطلب..." : "Placing order..."
              : isAr ? "تأكيد الطلب" : "Place order"}
          </button>
        </form>
      </main>
    </div>
  );
}
