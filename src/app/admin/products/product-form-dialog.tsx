// src/app/admin/products/product-form-dialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

type Variant = {
  id?: string;
  weightGrams?: number | null;
  roastLevel?: string | null;
  grindType?: string | null;
  sku: string;
  price: number;
  stock: number;
  lowStockAt: number;
};

type Product = {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  slug: string;
  descriptionAr?: string | null;
  images: string[];
  categoryId?: string | null;
  variants: Variant[];
};

type Category = {
  id: string;
  nameAr: string;
};

export function ProductFormDialog({
  mode,
  product,
  categories,
}: {
  mode: "create" | "edit";
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nameAr, setNameAr] = useState(product?.nameAr ?? "");
  const [nameEn, setNameEn] = useState(product?.nameEn ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [descriptionAr, setDescriptionAr] = useState(product?.descriptionAr ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>(
    product?.variants ?? [{ sku: "", price: 0, stock: 0, lowStockAt: 5, weightGrams: 250 }]
  );

  const addVariant = () =>
    setVariants([...variants, { sku: "", price: 0, stock: 0, lowStockAt: 5 }]);
  const removeVariant = (index: number) =>
    setVariants(variants.filter((_, i) => i !== index));
  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };
    setVariants(next);
  };

  async function handleSubmit() {
    setSaving(true);
    setError(null);

    const payload = {
      nameAr,
      nameEn: nameEn || undefined,
      slug,
      descriptionAr: descriptionAr || undefined,
      images,
      categoryId: categoryId || undefined,
      variants: variants.map((v) => ({
        ...v,
        price: Number(v.price),
        stock: Number(v.stock),
        lowStockAt: Number(v.lowStockAt),
        weightGrams: v.weightGrams ? Number(v.weightGrams) : undefined,
      })),
    };

    try {
      const res = await fetch(
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${product!.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "حدث خطأ ما");
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "فشل رفع الصورة");

      setImages((prev) => [...prev, data.url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-selecting the same file
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((img) => img !== url));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="bg-stone-900 hover:bg-stone-800">
            <Plus className="w-4 h-4 ml-2" />
            إضافة منتج
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            تعديل
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl max-h-[85vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "إضافة منتج" : "تعديل المنتج"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block mb-1.5" htmlFor="nameAr">
                الاسم (عربي)
              </Label>
              <Input
                id="nameAr"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="بن كولومبي"
              />
            </div>
            <div>
              <Label className="block mb-1.5" htmlFor="nameEn">
                الاسم (إنجليزي)
              </Label>
              <Input
                id="nameEn"
                dir="ltr"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Colombian Coffee"
              />
            </div>
          </div>

          <div>
            <Label className="block mb-1.5" htmlFor="slug">
              الرابط (slug)
            </Label>
            <Input
              id="slug"
              dir="ltr"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="colombian-coffee"
            />
          </div>
          <div>
            <Label className="block mb-1.5">الفئة</Label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-stone-200 text-sm bg-white"
            >
              <option value="">بدون فئة</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="block mb-1.5" htmlFor="descriptionAr">
              الوصف
            </Label>
            <Input
              id="descriptionAr"
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
            />
          </div>
          <div>
            <Label className="block mb-1.5">الصور</Label>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {images.map((url) => (
                  <div
                    key={url}
                    className="relative aspect-square rounded-md overflow-hidden border border-stone-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-1 left-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-stone-300 rounded-md text-sm text-stone-500 cursor-pointer hover:border-stone-400">
              {uploading ? "جاري الرفع..." : "+ رفع صورة"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>الأنواع</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
              >
                <Plus className="w-3 h-3 ml-1" />
                إضافة نوع
              </Button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, i) => (
                <div
                  key={i}
                  className="border border-stone-200 rounded-lg p-4 relative"
                >
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 left-2 h-7 w-7"
                      onClick={() => removeVariant(i)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="block mb-1.5 text-xs">الوزن (جم)</Label>
                      <Input
                        type="number"
                        dir="ltr"
                        value={variant.weightGrams ?? ""}
                        onChange={(e) =>
                          updateVariant(i, "weightGrams", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="block mb-1.5 text-xs">التحميص</Label>
                      <Input
                        value={variant.roastLevel ?? ""}
                        onChange={(e) =>
                          updateVariant(i, "roastLevel", e.target.value)
                        }
                        placeholder="متوسط"
                      />
                    </div>
                    <div>
                      <Label className="block mb-1.5 text-xs">الطحن</Label>
                      <Input
                        value={variant.grindType ?? ""}
                        onChange={(e) =>
                          updateVariant(i, "grindType", e.target.value)
                        }
                        placeholder="مطحون"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <Label className="block mb-1.5 text-xs">SKU</Label>
                      <Input
                        dir="ltr"
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(i, "sku", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="block mb-1.5 text-xs">
                        السعر (ج.م)
                      </Label>
                      <Input
                        type="number"
                        dir="ltr"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(i, "price", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="block mb-1.5 text-xs">المخزون</Label>
                      <Input
                        type="number"
                        dir="ltr"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(i, "stock", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ المنتج"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
