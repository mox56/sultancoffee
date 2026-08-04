// src/app/admin/layout.tsx
import { SessionProvider } from "next-auth/react";
import { Cairo } from "next/font/google";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import "../globals.css";

const cairo = Cairo({ subsets: ["arabic"], variable: "--font-cairo" });

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        <SessionProvider>
          {session && <AdminNav />}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}