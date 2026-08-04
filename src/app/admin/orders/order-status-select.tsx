// src/app/admin/orders/order-status-select.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار",
  PAID: "مدفوع",
  PROCESSING: "جاري التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
  REFUNDED: "مسترجع",
};

export function OrderStatusSelect({
  orderId,
  currentStatus,
  colorClass,
}: {
  orderId: string;
  currentStatus: string;
  colorClass: string;
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  async function handleChange(newStatus: string) {
    setUpdating(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? "فشل تحديث الحالة");
    }
  }

  return (
    <Select
      value={currentStatus}
      onValueChange={handleChange}
      disabled={updating}
    >
      <SelectTrigger className={`w-36 h-8 text-xs border ${colorClass}`}>
        <SelectValue>{STATUS_LABELS[currentStatus]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
