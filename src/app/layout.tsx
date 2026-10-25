import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getDatabaseAsync } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BrandProvider } from "@/context/BrandContext";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const viewport: Viewport = {
  themeColor: "#f6f5f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const db = await getDatabaseAsync();
  const brand = db.brand;
  const title = brand.name + " — онлайн-запись в автосервис";
  const description =
    brand.slogan ||
    "Онлайн-запись на ТО, диагностику, шиномонтаж и детейлинг за две минуты. Свободные окна и подтверждение сразу.";

  return {
    title,
    description,
    manifest: "/manifest.json",
    applicationName: brand.name,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: brand.name,
    },
    icons: {
      icon: "/logo.jpg",
      apple: "/logo.jpg",
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ru_RU",
      siteName: brand.name,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const db = await getDatabaseAsync();
  const brand = db.brand;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: brand.name,
    description: brand.slogan,
    telephone: brand.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: brand.address,
      addressLocality: brand.city,
      addressCountry: "RU",
    },
    openingHours: brand.workHours,
    url: brand.mapUrl || undefined,
  };

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-brand-primary text-theme-title antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BrandProvider initialBrand={brand}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-accent focus:px-4 focus:py-2 focus:text-sm focus:text-white"
          >
            Перейти к содержимому
          </a>
          <Navbar brand={brand} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer brand={brand} />
        </BrandProvider>
      </body>
    </html>
  );
}

