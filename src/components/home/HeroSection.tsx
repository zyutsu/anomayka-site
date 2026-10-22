"use client";

import React from "react";
import Link from "next/link";
import { Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrand } from "@/context/BrandContext";
import { BrandSettings } from "@/lib/types";

export function HeroSection({ initialBrand }: { initialBrand: BrandSettings }) {
  const brandContext = useBrand();
  const brand = brandContext?.brand || initialBrand;
  const getDemoHref = brandContext?.getDemoHref || ((p: string) => p);

  return (
    <section className="relative pt-6 pb-12 sm:pt-12 sm:pb-20">
      {/* Мягкое бесшовное атмосферное свечение */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_35%,rgba(var(--brand-accent-rgb),0.12)_0%,rgba(var(--brand-accent-rgb),0.03)_40%,transparent_65%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
        {/* Фирменный логотип */}
        {brand.logoUrl && (
          <div className="flex justify-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border border-brand-border bg-black/60 shadow-2xl flex items-center justify-center transition-all hover:scale-[1.03]">
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Заголовок и номер телефона прямо под именем салона */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-6xl font-black text-theme-title tracking-tight leading-none">
            {brand.name}
          </h1>

          {/* Номер телефона прямо под именем салона */}
          <div className="flex justify-center">
            <a
              href={`tel:${brand.phoneRaw || brand.phone}`}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-brand-surface border border-brand-border text-base sm:text-lg font-bold text-brand-accent hover:border-brand-accent transition-all hover:scale-105 shadow-md"
            >
              <Phone className="w-4 h-4 text-brand-accent shrink-0" />
              <span>{brand.phone}</span>
            </a>
          </div>

          <p className="text-xs sm:text-sm text-theme-muted font-medium">
            {brand.city} • {brand.address}
          </p>
        </div>

        {/* Большая заметная кнопка онлайн-записи с мягкой подсветкой */}
        <div className="flex justify-center pt-2">
          <div className="relative inline-flex items-center justify-center w-full sm:w-auto">
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[380px] h-[90px] rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(var(--brand-accent-rgb), 0.35) 0%, rgba(var(--brand-accent-rgb), 0.12) 35%, rgba(var(--brand-accent-rgb), 0) 68%)",
              }}
            />
            <Link href={getDemoHref("/booking")} className="relative z-10 w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg sm:text-xl font-black shadow-xl shadow-brand-accent/25 hover:scale-[1.03] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Calendar className="w-6 h-6" />
                <span>Записаться онлайн</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
