// src/app/admin/products/page.tsx
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFormDialog } from "./product-form-dialog";
import { DeleteProductButton } from "./delete-product-button";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { variants: true, category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { nameAr: "asc" } }),
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">المنتجات</h1>
          <p className="text-stone-500 text-sm mt-1">
            {products.length} منتج · بن السلطان
          </p>
        </div>
        <ProductFormDialog mode="create" categories={categories} />
      </div>

      {products.length === 0 ? (
        <div className="border border-dashed border-stone-300 rounded-lg py-16 text-center">
          <p className="text-stone-500">لا توجد منتجات بعد.</p>
          <p className="text-stone-400 text-sm mt-1">
            أضف أول منتج لبدء البيع.
          </p>
        </div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>الأنواع</TableHead>
                <TableHead>المخزون</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-end">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.stock,
                  0,
                );
                const hasLowStock = product.variants.some(
                  (v) => v.stock <= v.lowStockAt,
                );

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium text-stone-900">
                        {product.nameAr}
                      </div>
                      {product.nameEn && (
                        <div className="text-sm text-stone-500">
                          {product.nameEn}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-stone-600">
                      {product.category?.nameAr ?? "—"}
                    </TableCell>
                    <TableCell className="text-stone-600">
                      {product.variants.length}
                    </TableCell>
                    <TableCell className="text-end tabular-nums" dir="ltr">
                      <span
                        className={
                          hasLowStock
                            ? "text-amber-600 font-medium"
                            : "text-stone-600"
                        }
                      >
                        {totalStock}
                      </span>
                      {hasLowStock && (
                        <Badge
                          variant="outline"
                          className="mr-2 border-amber-300 text-amber-700 bg-amber-50"
                        >
                          مخزون منخفض
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.isActive ? "default" : "secondary"}
                      >
                        {product.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end space-x-2 space-x-reverse">
                      <ProductFormDialog
                        mode="edit"
                        categories={categories}
                        product={{
                          id: product.id,
                          nameAr: product.nameAr,
                          nameEn: product.nameEn,
                          slug: product.slug,
                          descriptionAr: product.descriptionAr,
                          images: product.images,
                          categoryId: product.categoryId,
                          variants: product.variants.map((v) => ({
                            id: v.id,
                            weightGrams: v.weightGrams,
                            roastLevel: v.roastLevel,
                            grindType: v.grindType,
                            sku: v.sku,
                            price: Number(v.price),
                            stock: v.stock,
                            lowStockAt: v.lowStockAt,
                          })),
                        }}
                      />
                      <DeleteProductButton productId={product.id} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
