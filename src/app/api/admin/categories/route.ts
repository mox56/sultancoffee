// src/app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const categorySchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  slug: z.string().min(1),
});

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { nameAr: "asc" },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "بيانات غير صالحة", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.create({ data: parsed.data });
    return NextResponse.json({ category }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "هذا الرابط مستخدم بالفعل" }, { status: 409 });
    }
    console.error("Category creation failed:", err);
    return NextResponse.json({ error: "فشل إنشاء الفئة" }, { status: 500 });
  }
}