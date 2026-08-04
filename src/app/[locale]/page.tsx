// src/app/[locale]/page.tsx
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export default async function ShopPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { variants: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#1C1410] text-[#F5EFE6]">

      {/* Product grid */}
      <main className="px-6 py-10 max-w-5xl mx-auto">
        {products.length === 0 ? (
          <p className="text-center text-[#8A7A65] py-20">
            {isAr
              ? "لا توجد منتجات متاحة حالياً"
              : "No products available right now"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const prices = product.variants.map((v) => Number(v.price));
              const minPrice = Math.min(...prices);
              const inStock = product.variants.some((v) => v.stock > 0);

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group block rounded-lg overflow-hidden border border-[#3A2D22] bg-[#241B14] hover:border-[#C9A66B]/50 transition-colors"
                >
                  <div className="aspect-square bg-[#2E2319] flex items-center justify-center">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0]}
                        alt={product.nameAr}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#5A4A3A] text-sm">
                        {isAr ? "بن السلطان" : "Sultan Coffee"}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h2 className="font-semibold text-[#F5EFE6] group-hover:text-[#C9A66B] transition-colors">
                      {isAr
                        ? product.nameAr
                        : (product.nameEn ?? product.nameAr)}
                    </h2>
                    {product.category && (
                      <p className="text-xs text-[#8A7A65] mt-0.5">
                        {isAr
                          ? product.category.nameAr
                          : product.category.nameEn}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[#C9A66B] font-medium" dir="ltr">
                        {isAr ? `${minPrice} ج.م` : `${minPrice} EGP`}
                      </span>
                      {!inStock && (
                        <span className="text-xs text-[#B06A4E]">
                          {isAr ? "غير متوفر" : "Out of stock"}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
