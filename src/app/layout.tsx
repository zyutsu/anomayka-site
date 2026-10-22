import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getDatabase } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BrandThemeInjector } from "@/components/BrandThemeInjector";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const viewport: Viewport = {
  themeColor: "#e11d48",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const db = getDatabase();
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const db = getDatabase();
  const brand = db.brand;

  return (
    <html lang="ru" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen flex flex-col bg-brand-primary text-slate-100 selection:bg-brand-accent selection:text-white">
        <BrandThemeInjector initialBrand={brand} />
        <Navbar brand={brand} />
        <main className="flex-1">{children}</main>
        <Footer brand={brand} />

        {/* Регистрация Service Worker для PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ANOMAYKA PWA Service Worker registered with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ANOMAYKA PWA ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
