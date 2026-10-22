import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getDatabaseAsync } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BrandProvider } from "@/context/BrandContext";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const viewport: Viewport = {
  themeColor: "#e11d48",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const db = await getDatabaseAsync();
  const brand = db.brand;

  return {
    title: `${brand.name} — Онлайн-запись в автоцентр без звонков`,
    description: brand.slogan || "Онлайн-запись на автосервис, ТО, диагностику и детейлинг за 2 минуты.",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: brand.name,
    },
    icons: {
      icon: "/logo.jpg",
      apple: "/logo.jpg",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const db = await getDatabaseAsync();
  const brand = db.brand;

  return (
    <html lang="ru" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen flex flex-col bg-brand-primary text-slate-100 selection:bg-brand-accent selection:text-white">
        <BrandProvider initialBrand={brand}>
          <Navbar brand={brand} />
          <main className="flex-1">{children}</main>
          <Footer brand={brand} />
        </BrandProvider>

        {/* Очистка устаревшего кэша браузера и снятие Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    for (var i = 0; i < regs.length; i++) {
                      regs[i].unregister();
                    }
                  });
                }
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (var i = 0; i < names.length; i++) {
                      caches.delete(names[i]);
                    }
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
