import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getDatabaseAsync } from "@/lib/db";
import { ServicesCatalog } from "@/components/services/ServicesCatalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ServicesPage() {
  const db = await getDatabaseAsync();
  const categories = db.categories.filter((c) => c.isActive);
  const services = db.services.filter((s) => s.isActive);

  return (
    <div>
      <div className="border-b border-brand-border">
        <div className="page-shell py-10 sm:py-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="eyebrow mb-3">Прайс-лист</p>
              <h1 className="heading text-[clamp(2rem,4.4vw,3.2rem)] text-theme-title">
                Услуги и цены
              </h1>
              <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-theme-muted sm:text-sm">
                Фиксированные цены и время работ. Выберите услугу и забронируйте
                удобный слот — мастер будет ждать вас без очередей.
              </p>
            </div>
            <Link
              href="/booking"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-accent px-5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-accentHover"
            >
              Записаться
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="page-shell section-tight">
        <ServicesCatalog categories={categories} services={services} />
      </div>
    </div>
  );
}

