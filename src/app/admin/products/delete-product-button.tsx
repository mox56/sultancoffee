// src/app/admin/products/delete-product-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        "حذف هذا المنتج؟ لا يمكن التراجع عن هذا إذا لم يكن له طلبات سابقة.",
      )
    )
      return;
    setLoading(true);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "فشل الحذف");
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      disabled={loading}
    >
      حذف
    </Button>
  );
}
