// src/app/api/admin/variants/[variantId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateVariantSchema = z.object({
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  lowStockAt: z.number().int().min(0).optional(),
  weightGrams: z.number().int().positive().optional(),
  roastLevel: z.string().optional(),
  grindType: z.string().optional(),
});

// PATCH /api/admin/variants/[variantId] — the main route you'll use to adjust stock
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const { variantId } = await params;
  const body = await req.json();
  const parsed = updateVariantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: parsed.data,
    });
    return NextResponse.json({ variant });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }
    console.error("Variant update failed:", err);
    return NextResponse.json({ error: "Failed to update variant" }, { status: 500 });
  }
}

// DELETE /api/admin/variants/[variantId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const { variantId } = await params;

  const hasOrders = await prisma.orderItem.findFirst({ where: { variantId } });
  if (hasOrders) {
    return NextResponse.json(
      { error: "Cannot delete a variant with existing order history" },
      { status: 409 }
    );
  }

  try {
    await prisma.productVariant.delete({ where: { id: variantId } });
    return NextResponse.json({ message: "Variant deleted" });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete variant" }, { status: 500 });
  }
}