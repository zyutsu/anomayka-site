import React from "react";
import { getDatabaseAsync } from "@/lib/db";
import { ServicesCatalog } from "@/components/services/ServicesCatalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ServicesPage() {
  const db = await getDatabaseAsync();
  const categories = db.categories.filter((c) => c.isActive);
  const services = db.services.filter((s) => s.isActive);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Шапка каталога */}
      <div className="max-w-2xl space-y-2">
        <span className="text-xs font-bold text-brand-accent uppercase tracking-wider block">
          Прайс-лист и регламент
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-theme-title tracking-tight">
          Услуги автоцентра и детейлинга
        </h1>
        <p className="text-sm text-theme-muted leading-relaxed">
          Фиксированные цены и регламентное время. Выберите услугу и запишитесь на свободный слот онлайн или запросите консультацию мастера.
        </p>
      </div>

      {/* Интерактивный каталог с поддержкой демо-профилей */}
      <ServicesCatalog categories={categories} services={services} />
    </div>
  );
}
