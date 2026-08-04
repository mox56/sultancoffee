// src/app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateProductSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  slug: z.string().min(1).optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/products/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, category: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

// PATCH /api/admin/products/[id] — update product fields (not variants — see below)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid update data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: { variants: true },
    });
    return NextResponse.json({ product });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    console.error("Product update failed:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Don't hard-delete if there are existing orders referencing this product's
  // variants — that would break order history. Soft-delete via isActive instead.
  const hasOrders = await prisma.orderItem.findFirst({
    where: { variant: { productId: id } },
  });

  if (hasOrders) {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({
      message: "Product has existing orders — deactivated instead of deleted",
    });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product deleted" });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("Product delete failed:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}