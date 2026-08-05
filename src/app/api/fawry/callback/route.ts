// src/app/api/fawry/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyFawryCallbackSignature } from "@/lib/fawry";
import {
  confirmOrderPayment,
  InsufficientStockError,
} from "@/lib/order-fulfillment";
import { OrderStatus } from "@/generated/prisma/enums";

export async function POST(req: NextRequest) {
  const payload = await req.json();

  // 1. Verify this actually came from Fawry
  const isValid = verifyFawryCallbackSignature(payload);
  if (!isValid) {
    console.error(
      "Fawry callback: invalid signature",
      payload.merchantRefNumber,
    );
    // Still return 200 — a malformed/forged request retrying forever helps no one,
    // but log it for investigation.
    return NextResponse.json({}, { status: 200 });
  }

  const { merchantRefNumber, fawryRefNumber, orderStatus } = payload;

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: merchantRefNumber },
    });

    if (!order) {
      throw new Error(`Order not found for ref ${merchantRefNumber}`);
    }

    if (orderStatus === "PAID") {
      // Shared logic: validates stock, decrements it, marks PAID —
      // identical to what the admin manual-confirm path uses.
      await confirmOrderPayment(order.id, fawryRefNumber);
    } else if (
      orderStatus === "CANCELLED" ||
      orderStatus === "EXPIRED" ||
      orderStatus === "FAILED"
    ) {
      // Idempotency: only touch it if it's not already in a terminal state
      if (
        order.status !== OrderStatus.PAID &&
        order.status !== OrderStatus.CANCELLED
      ) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELLED, paymentRefNumber: fawryRefNumber },
        });
      }
    }
    // orderStatus === "NEW" — reference generated but not paid yet, no-op

    return NextResponse.json({}, { status: 200 });
  } catch (err) {
    console.error("Fawry callback processing failed:", err);

    // Stock-shortage case: order stays PENDING with a note for the admin
    // to see and manually resolve (refund/contact customer), rather than
    // silently marking it PAID with no stock to fulfill.
    if (err instanceof InsufficientStockError) {
      await prisma.order
        .update({
          where: { orderNumber: merchantRefNumber },
          data: {
            notes: `⚠️ Payment received but stock unavailable at confirmation time. Needs manual review.`,
          },
        })
        .catch(() => {});
    }

    // Still 200 so Fawry doesn't hammer retries for an issue that needs
    // human intervention, not a resend.
    return NextResponse.json({}, { status: 200 });
  }
}
