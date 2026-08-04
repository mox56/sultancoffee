// src/app/api/admin/products/route.ts
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

const productSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  slug: z.string().min(1),
  images: z.array(z.string()).default([]),
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
  variants: z.array(variantSchema).min(1),
});

// GET /api/admin/products — list all, with variants
export async function GET() {
  const products = await prisma.product.findMany({
    include: { variants: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

// POST /api/admin/products — create product + variants together
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const product = await prisma.product.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        slug: data.slug,
        images: data.images,
        categoryId: data.categoryId,
        isActive: data.isActive,
        variants: { create: data.variants },
      },
      include: { variants: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Slug or SKU already exists" },
        { status: 409 }
      );
    }
    console.error("Product creation failed:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}