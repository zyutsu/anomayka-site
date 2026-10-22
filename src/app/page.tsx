import React from "react";
import { getDatabaseAsync } from "@/lib/db";
import { Star } from "lucide-react";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeCallMaster } from "@/components/home/HomeCallMaster";
import { HomePopularServices } from "@/components/home/HomePopularServices";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const db = await getDatabaseAsync();
  const brand = db.brand;
  const categories = db.categories.filter((c) => c.isActive);
  const popularServices = db.services.filter((s) => s.isActive && s.isPopular).slice(0, 4);
  const reviews = db.reviews;

  return (
    <div className="space-y-16 pb-16">
      {/* 1. МИНИМАЛИСТИЧНЫЙ МЯГКИЙ HERO-БЛОК */}
      <HeroSection initialBrand={brand} />

      {/* 2. КАТЕГОРИИ УСЛУГ (С ПОДДЕРЖКОЙ ИЗОЛИРОВАННОГО ДЕМО) */}
      <HomeCategories initialCategories={categories} />

      {/* 3. БЛОК «СЛОЖНЫЙ СЛУЧАЙ / ПОЗВОНИТЬ МАСТЕРУ» */}
      <HomeCallMaster />

      {/* 4. ПОПУЛЯРНЫЕ УСЛУГИ С ФОТОГРАФИЯМИ (С ПОДДЕРЖКОЙ ИЗОЛИРОВАННОГО ДЕМО) */}
      <HomePopularServices initialServices={popularServices} />

      {/* 5. ОТЗЫВЫ */}
      {reviews.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-title tracking-tight text-center sm:text-left">
            Отзывы клиентов
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-3xl bg-brand-surface border border-brand-border space-y-2.5 shadow-sm"
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-theme-title leading-relaxed italic">
                  «{rev.text}»
                </p>
                <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-theme-title block">{rev.author}</strong>
                    <span className="text-[10px] text-theme-muted">{rev.car}</span>
                  </div>
                  <span className="text-[10px] text-theme-muted">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
