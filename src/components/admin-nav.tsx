// src/components/admin-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/admin/products", label: "المنتجات" },
  { href: "/admin/categories", label: "الفئات" },
  { href: "/admin/orders", label: "الطلبات" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-semibold text-stone-900">بن السلطان</span>

          <div className="flex items-center gap-1">
            {LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-sm text-stone-500 hover:text-red-600 transition-colors"
        >
          تسجيل الخروج
        </button>
      </div>
    </nav>
  );
}