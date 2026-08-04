// src/app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { OrderStatus } from "../../../../../generated/prisma/enums";
import { confirmOrderPayment, InsufficientStockError } from "@/lib/order-fulfillment";
import { z } from "zod";

const updateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const newStatus = parsed.data.status;

  try {
    // Transitioning into PAID runs the same stock-decrement logic
    // used by the Fawry webhook — this is what closes the COD gap.
    if (newStatus === OrderStatus.PAID) {
      const order = await confirmOrderPayment(id);
      return NextResponse.json({ order });
    }

    // Any other status is a plain field update, no stock logic involved
    const order = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
    });
    return NextResponse.json({ order });
  } catch (err: any) {
    if (err instanceof InsufficientStockError) {
      return NextResponse.json(
        { error: "لا يوجد مخزون كافٍ لإتمام هذا الطلب. يرجى مراجعة الكميات." },
        { status: 409 }
      );
    }
    if (err.code === "P2025" || err.message?.includes("not found")) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }
    console.error("Order update failed:", err);
    return NextResponse.json({ error: "فشل تحديث الطلب" }, { status: 500 });
  }
}