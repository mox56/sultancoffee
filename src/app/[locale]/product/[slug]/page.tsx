// src/app/[locale]/product/[slug]/page.tsx
import { prisma } from "@/lib/db";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { VariantPicker } from "./variant-picker";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const isAr = locale === "ar";

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true, category: true },
  });

  if (!product || !product.isActive) notFound();

  const serializedVariants = product.variants.map((v) => ({
    id: v.id,
    weightGrams: v.weightGrams,
    roastLevel: v.roastLevel,
    grindType: v.grindType,
    price: Number(v.price),
    stock: v.stock,
  }));

  return (
    <div className="min-h-screen bg-[#1C1410] text-[#F5EFE6]">
      <main className="px-6 py-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square bg-[#241B14] rounded-lg overflow-hidden flex items-center justify-center border border-[#3A2D22]">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.nameAr}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[#5A4A3A]">بن السلطان</span>
          )}
        </div>

        {/* Details */}
        <div>
          {product.category && (
            <p className="text-xs text-[#8A7A65] uppercase tracking-wide mb-2">
              {isAr ? product.category.nameAr : product.category.nameEn}
            </p>
          )}

          <h1 className="text-2xl font-bold">
            {isAr ? product.nameAr : product.nameEn ?? product.nameAr}
          </h1>

          <div className="w-12 h-px bg-[#C9A66B] my-4" />

          {(isAr ? product.descriptionAr : product.descriptionEn) && (
            <p className="text-[#B8A78F] text-sm leading-relaxed mb-6">
              {isAr ? product.descriptionAr : product.descriptionEn}
            </p>
          )}

          <VariantPicker
            productSlug={product.slug}
            nameAr={product.nameAr}
            nameEn={product.nameEn}
            variants={serializedVariants}
            isAr={isAr}
          />
        </div>
      </main>
    </div>
  );
}