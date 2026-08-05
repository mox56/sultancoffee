// src/lib/order-fulfillment.ts
import { prisma } from "@/lib/db";
import { OrderStatus } from "../generated/prisma/enums";

export class InsufficientStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientStockError";
  }
}

/**
 * Confirms payment on an order: validates stock, decrements it, and
 * marks the order PAID — all in one transaction. Idempotent: calling
 * this on an order that's already PAID or CANCELLED is a safe no-op.
 *
 * Used by both the Fawry webhook and the admin manual status update
 * (for COD orders), so stock logic lives in exactly one place.
 */
export async function confirmOrderPayment(orderId: string, fawryRefNumber?: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Idempotency guard — already processed, don't decrement twice
    if (order.status === OrderStatus.PAID || order.status === OrderStatus.CANCELLED) {
      return order;
    }

    // Validate stock for every item before decrementing anything
    for (const item of order.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
      });
      if (!variant || variant.stock < item.quantity) {
        throw new InsufficientStockError(
          `Insufficient stock for variant ${item.variantId} on order ${order.orderNumber}`
        );
      }
    }

    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PAID,
        ...(fawryRefNumber ? { paymentRefNumber: fawryRefNumber } : {}),
      },
    });
  });
}
