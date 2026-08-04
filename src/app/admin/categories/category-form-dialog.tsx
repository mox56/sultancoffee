// src/app/admin/categories/category-form-dialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

type Category = {
  id: string;
  nameAr: string;
  nameEn: string | null;
  slug: string;
};

export function CategoryFormDialog({
  mode,
  category,
}: {
  mode: "create" | "edit";
  category?: Category;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nameAr, setNameAr] = useState(category?.nameAr ?? "");
  const [nameEn, setNameEn] = useState(category?.nameEn ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");

  async function handleSubmit() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(
        mode === "create" ? "/api/admin/categories" : `/api/admin/categories/${category!.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nameAr, nameEn: nameEn || undefined, slug }),
        }
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="bg-stone-900 hover:bg-stone-800">
            <Plus className="w-4 h-4 ml-2" />
            إضافة فئة
          </Button>
        ) : (
          <Button variant="ghost" size="sm">تعديل</Button>
        )}
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "إضافة فئة" : "تعديل الفئة"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="block mb-1.5">الاسم (عربي)</Label>
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="بن عربي" />
          </div>
          <div>
            <Label className="block mb-1.5">الاسم (إنجليزي)</Label>
            <Input dir="ltr" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Arabic Coffee" />
          </div>
          <div>
            <Label className="block mb-1.5">الرابط (slug)</Label>
            <Input dir="ltr" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="arabic-coffee" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}