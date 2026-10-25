"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Wrench, Sparkles, Disc, Cpu, Shield, Gauge } from "lucide-react";
import { Category } from "@/lib/types";
import { useBrand } from "@/context/BrandContext";

const ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Cpu,
  Disc,
  Shield,
  Gauge,
  Wrench,
};

export function HomeCategories({ initialCategories }: { initialCategories: Category[] }) {
  const { isDemo, getDemoHref } = useBrand();
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  useEffect(() => {
    const update = () => {
      if (isDemo && typeof window !== "undefined") {
        try {
          const demoCats = sessionStorage.getItem("anomayka_demo_categories");
          if (demoCats) {
            setCategories(JSON.parse(demoCats).filter((c: Category) => c.isActive));
            return;
          }
        } catch (e) {}
      }
      setCategories(initialCategories.filter((c) => c.isActive));
    };

    update();
    window.addEventListener("anomayka_demo_data_updated", update);
    return () => window.removeEventListener("anomayka_demo_data_updated", update);
  }, [isDemo, initialCategories]);

  if (categories.length === 0) return null;

  return (
    <section className="section-tight">
      <div className="page-shell">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">Направления</p>
            <h2 className="heading text-[clamp(1.7rem,3.4vw,2.5rem)] text-theme-title">
              Чем можем помочь
            </h2>
          </div>
          <Link
            href={getDemoHref("/services")}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-theme-muted transition-colors hover:text-theme-title"
          >
            Полный прайс-лист
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = ICONS[cat.icon] || Wrench;
            return (
              <Link
                key={cat.id}
                href={getDemoHref("/booking?categoryId=" + cat.id)}
                className="group relative overflow-hidden rounded-2xl border border-brand-border bg-brand-surface transition-all duration-300 hover:border-brand-accent/50"
              >
                <div className="relative h-[168px] overflow-hidden bg-[var(--brand-secondary)]">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.title}
                      className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-theme-muted">
                      <Icon className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-surface)] via-[var(--brand-surface)]/10 to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>

                <div className="relative -mt-8 p-5">
                  <h3 className="text-[15px] font-semibold leading-snug text-theme-title transition-colors group-hover:text-brand-accent">
                    {cat.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-theme-muted">
                    {cat.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-theme-muted transition-colors group-hover:text-theme-title">
                    Выбрать услугу
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

