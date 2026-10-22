"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Category } from "@/lib/types";
import { useBrand } from "@/context/BrandContext";
import { ChevronRight, ArrowRight, Wrench, Sparkles, Disc, Cpu, Shield, Gauge } from "lucide-react";

export function HomeCategories({ initialCategories }: { initialCategories: Category[] }) {
  const { isDemo, getDemoHref } = useBrand();
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  useEffect(() => {
    if (isDemo && typeof window !== "undefined") {
      try {
        const demoCats = sessionStorage.getItem("anomayka_demo_categories");
        if (demoCats) {
          const parsed: Category[] = JSON.parse(demoCats);
          setCategories(parsed.filter((c) => c.isActive));
          return;
        }
      } catch (e) {}
    }
    setCategories(initialCategories.filter((c) => c.isActive));
  }, [isDemo, initialCategories]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-brand-accent" />;
      case "Cpu":
        return <Cpu className="w-5 h-5 text-brand-accent" />;
      case "Disc":
        return <Disc className="w-5 h-5 text-brand-accent" />;
      case "Shield":
        return <Shield className="w-5 h-5 text-brand-accent" />;
      case "Gauge":
        return <Gauge className="w-5 h-5 text-brand-accent" />;
      default:
        return <Wrench className="w-5 h-5 text-brand-accent" />;
    }
  };

  if (categories.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-theme-title tracking-tight">
            Категории обслуживания
          </h2>
          <p className="text-xs text-theme-muted mt-0.5">
            Нажмите на нужное направление для перехода к записи
          </p>
        </div>
        <Link
          href={getDemoHref("/services")}
          className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1"
        >
          <span>Весь прайс-лист</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={getDemoHref(`/booking?categoryId=${cat.id}`)}
            className="group rounded-3xl overflow-hidden border border-brand-border bg-brand-surface hover:border-brand-accent transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-lg hover:shadow-brand-accent/10"
          >
            {/* Фотография направления */}
            <div className="relative h-44 w-full overflow-hidden bg-black/40">
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-brand-secondary flex items-center justify-center">
                  {getCategoryIcon(cat.icon)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-black/30" />
              <div className="absolute top-3 right-3 w-9 h-9 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md">
                {getCategoryIcon(cat.icon)}
              </div>
            </div>

            <div className="p-5 space-y-2">
              <h3 className="font-bold text-base text-theme-title group-hover:text-brand-accent transition-colors">
                {cat.title}
              </h3>
              <p className="text-xs text-theme-muted line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs font-bold text-brand-accent">
                <span>Выбрать услугу</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
