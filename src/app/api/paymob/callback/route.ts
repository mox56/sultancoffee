// src/app/api/paymob/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPaymobHmac } from "@/lib/paymob";
import { confirmOrderPayment, InsufficientStockError } from "@/lib/order-fulfillment";
import { OrderStatus } from "../../../../generated/prisma/enums";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const transaction = body.obj;
  const receivedHmac = req.nextUrl.searchParams.get("hmac") ?? "";

  const isValid = verifyPaymobHmac(transaction, receivedHmac);
  if (!isValid) {
    console.error("Paymob callback: invalid HMAC");
    return NextResponse.json({}, { status: 200 });
  }

  const merchantOrderId = transaction.order?.merchant_order_id;
  const success = transaction.success;

  if (!merchantOrderId) {
    return NextResponse.json({}, { status: 200 });
  }

  try {
    const order = await prisma.order.findUnique({ where: { orderNumber: merchantOrderId } });
    if (!order) throw new Error(`Order not found for ${merchantOrderId}`);

    if (success === true) {
      await confirmOrderPayment(order.id, String(transaction.id));
    } else if (
      order.status !== OrderStatus.PAID &&
      order.status !== OrderStatus.CANCELLED
    ) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED, paymentRefNumber: String(transaction.id) },
      });
    }

    return NextResponse.json({}, { status: 200 });
  } catch (err) {
    console.error("Paymob callback processing failed:", err);
    if (err instanceof InsufficientStockError) {
      await prisma.order
        .update({
          where: { orderNumber: merchantOrderId },
          data: { notes: "⚠️ Payment received but stock unavailable. Needs manual review." },
        })
        .catch(() => {});
    }
    return NextResponse.json({}, { status: 200 });
  }
}
