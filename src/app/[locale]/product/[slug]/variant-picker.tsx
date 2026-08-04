// src/app/[locale]/product/[slug]/variant-picker.tsx
"use client";

import { useState, useMemo } from "react";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "@/i18n/navigation";

type Variant = {
  id: string;
  weightGrams: number | null;
  roastLevel: string | null;
  grindType: string | null;
  price: number;
  stock: number;
};

export function VariantPicker({
  productSlug,
  nameAr,
  nameEn,
  variants,
  isAr,
}: {
  productSlug: string;
  nameAr: string;
  nameEn: string | null;
  variants: Variant[];
  isAr: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = useMemo(
    () => variants.find((v) => v.id === selectedId),
    [selectedId, variants]
  );

  if (!selected) return null;

  const outOfStock = selected.stock === 0;

  function handleAddToCart() {
    if (!selected) return;

    addItem({
      variantId: selected.id,
      productSlug,
      nameAr,
      nameEn,
      weightGrams: selected.weightGrams,
      roastLevel: selected.roastLevel,
      grindType: selected.grindType,
      price: selected.price,
      quantity,
      maxStock: selected.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div>
      {/* Variant selection */}
      <div className="space-y-2 mb-6">
        {variants.map((v) => {
          const label = [
            v.weightGrams ? `${v.weightGrams}${isAr ? "جم" : "g"}` : null,
            v.roastLevel,
            v.grindType,
          ]
            .filter(Boolean)
            .join(" · ");

          const isSelected = v.id === selectedId;
          const isOut = v.stock === 0;

          return (
            <button
              key={v.id}
              disabled={isOut}
              onClick={() => setSelectedId(v.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-md border text-sm transition-colors ${
                isSelected
                  ? "border-[#C9A66B] bg-[#C9A66B]/10"
                  : "border-[#3A2D22] hover:border-[#5A4A3A]"
              } ${isOut ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <span>{label}</span>
              <span dir="ltr" className="text-[#C9A66B]">
                {v.price} {isAr ? "ج.م" : "EGP"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-[#B8A78F]">{isAr ? "الكمية" : "Quantity"}</span>
        <div className="flex items-center border border-[#3A2D22] rounded-md" dir="ltr">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1.5 text-[#B8A78F] hover:text-[#F5EFE6]"
          >
            −
          </button>
          <span className="px-3 text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(selected.stock, q + 1))}
            disabled={quantity >= selected.stock}
            className="px-3 py-1.5 text-[#B8A78F] hover:text-[#F5EFE6] disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        disabled={outOfStock}
        className="w-full py-3 rounded-md bg-[#C9A66B] text-[#1C1410] font-semibold hover:bg-[#D9B87E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {outOfStock
          ? isAr
            ? "غير متوفر"
            : "Out of stock"
          : added
          ? isAr
            ? "تمت الإضافة ✓"
            : "Added ✓"
          : isAr
          ? "أضف إلى السلة"
          : "Add to cart"}
      </button>

      <button
        onClick={() => router.push("/cart")}
        className="w-full mt-3 py-2 text-sm text-[#8A7A65] hover:text-[#C9A66B] transition-colors"
      >
        {isAr ? "عرض السلة" : "View cart"}
      </button>
    </div>
  );
}