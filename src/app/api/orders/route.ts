// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/orderNumber";
import { PaymentMethod, OrderStatus } from "@/generated/prisma/enums";
import { z } from "zod";

const cartItemSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(10),
  customerEmail: z.string().email().optional(),
  addressLine: z.string().min(5),
  city: z.string().min(2),
  notes: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  items: z.array(cartItemSchema).min(1),
});

const SHIPPING_FEE = 50; // EGP flat rate — swap for real logic later (by city etc.)

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      // 1. Re-fetch variants from DB — never trust client-sent prices
      const variantIds = data.items.map((i) => i.variantId);
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true },
      });

      if (variants.length !== variantIds.length) {
        throw new Error("One or more products no longer exist");
      }

      // 2. Validate stock availability (soft check — we don't decrement yet,
      // that happens on payment confirmation) and inactive products
      for (const item of data.items) {
        const variant = variants.find((v) => v.id === item.variantId)!;
        if (!variant.product.isActive) {
          throw new Error(`${variant.product.nameAr} is no longer available`);
        }
        if (variant.stock < item.quantity) {
          throw new Error(
            `Not enough stock for ${variant.product.nameAr} (${variant.weightGrams}g)`
          );
        }
      }

      // 3. Compute prices server-side
      const subtotal = data.items.reduce((sum, item) => {
        const variant = variants.find((v) => v.id === item.variantId)!;
        return sum + Number(variant.price) * item.quantity;
      }, 0);

      const total = subtotal + SHIPPING_FEE;
      const orderNumber = await generateOrderNumber();

      // 4. Create order + items
      return tx.order.create({
        data: {
          orderNumber,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          addressLine: data.addressLine,
          city: data.city,
          notes: data.notes,
          status: OrderStatus.PENDING,
          paymentMethod: data.paymentMethod,
          subtotal,
          shippingFee: SHIPPING_FEE,
          total,
          items: {
            create: data.items.map((item) => {
              const variant = variants.find((v) => v.id === item.variantId)!;
              return {
                variantId: item.variantId,
                quantity: item.quantity,
                priceAtSale: variant.price,
              };
            }),
          },
        },
        include: { items: true },
      });
    });

    // 5. Branch on payment method
    if (order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
      // No payment gateway involved — order just sits PENDING until
      // admin marks it PROCESSING/DELIVERED manually.
      return NextResponse.json({ order }, { status: 201 });
    }

    // For Fawry methods: this is where we'd call the Fawry charge API
    // and return a payment reference / redirect URL to the client.
    // Stubbed until staging credentials are available:
    //
    // const fawryResponse = await initiateFawryCharge(order);
    // return NextResponse.json({ order, fawry: fawryResponse }, { status: 201 });

    return NextResponse.json(
      { order, note: "Fawry integration pending — order created as PENDING" },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    console.error("Order creation failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}