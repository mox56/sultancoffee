// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Cairo, Inter } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { ShopNav } from "@/components/shop-nav";
import "../globals.css";

const cairo = Cairo({ subsets: ["arabic"], variable: "--font-cairo" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) notFound();

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className={locale === "ar" ? cairo.className : inter.className}>
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <ShopNav />
            {children}
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}