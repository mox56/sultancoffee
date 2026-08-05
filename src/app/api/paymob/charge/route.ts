// src/app/api/paymob/charge/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getAuthToken,
  createPaymobOrder,
  getPaymentKey,
  buildIframeUrl,
} from "@/lib/paymob";

export async function POST(req: NextRequest) {
  const { orderId } = await req.json();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { variant: { include: { product: true } } } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const amountCents = Math.round(Number(order.total) * 100);

  try {
    const authToken = await getAuthToken();

    const paymobOrderId = await createPaymobOrder(
      authToken,
      amountCents,
      order.orderNumber,
      order.items.map((item) => ({
        name: item.variant.product.nameEn ?? item.variant.product.nameAr,
        amount_cents: Math.round(Number(item.priceAtSale) * 100),
        quantity: item.quantity,
      })),
    );

    const [firstName, ...rest] = order.customerName.split(" ");

    const paymentKey = await getPaymentKey(authToken, amountCents, paymobOrderId, {
  first_name: firstName || order.customerName,
  last_name: rest.join(" ") || "N/A",
  phone_number: order.customerPhone,
  email: order.customerEmail || "no-email@sultancoffee.com",
  city: order.city,
  street: order.addressLine,
  building: order.building,
  floor: order.floor,
  apartment: order.apartment,
  country: "EG",
});

    return NextResponse.json({ iframeUrl: buildIframeUrl(paymentKey) });
  } catch (err) {
    console.error("Paymob charge initiation failed:", err);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 },
    );
  }
}
