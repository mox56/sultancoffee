// src/app/api/admin/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().optional(),
  slug: z.string().min(1).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  try {
    const category = await prisma.category.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ category });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });
    }
    if (err.code === "P2002") {
      return NextResponse.json({ error: "هذا الرابط مستخدم بالفعل" }, { status: 409 });
    }
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: `لا يمكن حذف هذه الفئة لأنها تحتوي على ${productCount} منتج. أزل المنتجات منها أولاً.` },
      { status: 409 }
    );
  }

  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "تم حذف الفئة" });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });
    }
    return NextResponse.json({ error: "فشل الحذف" }, { status: 500 });
  }
}