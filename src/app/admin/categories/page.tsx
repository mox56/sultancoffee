// src/app/admin/categories/page.tsx
import { prisma } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryFormDialog } from "./category-form-dialog";
import { DeleteCategoryButton } from "./delete-category-button";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { nameAr: "asc" },
  });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">الفئات</h1>
          <p className="text-stone-500 text-sm mt-1">{categories.length} فئة</p>
        </div>
        <CategoryFormDialog mode="create" />
      </div>

      {categories.length === 0 ? (
        <div className="border border-dashed border-stone-300 rounded-lg py-16 text-center">
          <p className="text-stone-500">لا توجد فئات بعد.</p>
        </div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الرابط</TableHead>
                <TableHead>المنتجات</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="font-medium text-stone-900">{category.nameAr}</div>
                    {category.nameEn && (
                      <div className="text-sm text-stone-500">{category.nameEn}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-stone-600" dir="rtl">
                    {category.slug}
                  </TableCell>
                  <TableCell className="text-stone-600">{category._count.products}</TableCell>
                  <TableCell className="text-center space-x-2 space-x-reverse">
                    <CategoryFormDialog mode="edit" category={category} />
                    <DeleteCategoryButton categoryId={category.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}