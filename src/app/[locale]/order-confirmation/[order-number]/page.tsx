// src/app/[locale]/order-confirmation/[orderNumber]/page.tsx
import { prisma } from "@/lib/db";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const locale = await getLocale();
  const isAr = locale === "ar";

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) notFound();

  return (
    <div className="min-h-screen bg-[#1C1410] text-[#F5EFE6] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-[#C9A66B] text-4xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">
          {isAr ? "شكراً لطلبك!" : "Thank you for your order!"}
        </h1>
        <p className="text-[#B8A78F] mb-1">
          {isAr ? "رقم الطلب" : "Order number"}
        </p>
        <p className="text-[#C9A66B] font-mono text-lg mb-6" dir="ltr">
          {order.orderNumber}
        </p>
        <p className="text-sm text-[#8A7A65] mb-8">
          {isAr
            ? "سنتواصل معك قريباً لتأكيد التوصيل."
            : "We'll be in touch soon to confirm delivery."}
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-md bg-[#C9A66B] text-[#1C1410] font-semibold hover:bg-[#D9B87E] transition-colors"
        >
          {isAr ? "متابعة التسوق" : "Continue shopping"}
        </Link>
      </div>
    </div>
  );
}