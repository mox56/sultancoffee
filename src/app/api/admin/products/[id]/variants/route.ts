// src/app/api/admin/products/[id]/variants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const variantSchema = z.object({
  weightGrams: z.number().int().positive().optional(),
  roastLevel: z.string().optional(),
  grindType: z.string().optional(),
  sku: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  lowStockAt: z.number().int().min(0).default(5),
});

// POST /api/admin/products/[id]/variants — add a new variant to an existing product
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = variantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid variant data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const variant = await prisma.productVariant.create({
      data: { ...parsed.data, productId: id },
    });
    return NextResponse.json({ variant }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
    }
    console.error("Variant creation failed:", err);
    return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
  }
}