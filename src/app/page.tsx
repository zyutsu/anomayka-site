import React from "react";
import Link from "next/link";
import { getDatabase } from "@/lib/db";
import { Calendar, Phone, ArrowRight, Star, ChevronRight, MessageSquare, Wrench, Sparkles, Disc, Cpu, Shield, Gauge } from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CallMasterModal } from "@/components/CallMasterModal";
import { HeroSection } from "@/components/home/HeroSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  const db = getDatabase();
  const brand = db.brand;
  const categories = db.categories.filter((c) => c.isActive);
  const popularServices = db.services.filter((s) => s.isActive && s.isPopular).slice(0, 4);
  const reviews = db.reviews;

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

  return (
    <div className="space-y-16 pb-16">
      {/* 1. МИНИМАЛИСТИЧНЫЙ МЯГКИЙ HERO-БЛОК (БЕЗ ВОДЫ И ЛИШНЕГО ТЕКСТА) */}
      <HeroSection initialBrand={brand} />

      {/* 2. КАТЕГОРИИ УСЛУГ (БЫСТРЫЙ ВЫБОР В 1 КЛИК) */}
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
            href="/services"
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
              href={`/booking?categoryId=${cat.id}`}
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

      {/* 3. БЛОК «СЛОЖНЫЙ СЛУЧАЙ / ПОЗВОНИТЬ МАСТЕРУ» */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-brand-surface border border-brand-border p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[11px] font-bold text-brand-accent uppercase tracking-wider">
              Индивидуальный расчет
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-theme-title">
              Сложный случай или нужен совет мастера?
            </h3>
            <p className="text-xs text-theme-muted max-w-xl">
              Если поломка нестандартная, требуется дефектовка или индивидуальный расчет — позвоните нашему мастеру напрямую для оперативной консультации и бронирования.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <CallMasterModal
              phone={brand.phone}
              phoneRaw={brand.phoneRaw}
              size="lg"
              className="h-14 px-8 text-base"
              label="Позвонить мастеру"
            />
          </div>
        </div>
      </section>

      {/* 4. ПОПУЛЯРНЫЕ УСЛУГИ С ФОТОГРАФИЯМИ */}
      {popularServices.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-theme-title tracking-tight">
              Популярные процедуры
            </h2>
            <Link
              href="/services"
              className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1"
            >
              <span>Все услуги</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularServices.map((srv) => (
              <div
                key={srv.id}
                className="rounded-3xl bg-brand-surface border border-brand-border overflow-hidden flex flex-col justify-between hover:border-brand-accent transition-all group shadow-sm"
              >
                {srv.imageUrl && (
                  <div className="relative h-36 w-full overflow-hidden bg-black/40">
                    <img
                      src={srv.imageUrl}
                      alt={srv.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-theme-title text-sm group-hover:text-brand-accent transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-theme-muted line-clamp-2 mt-1 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-theme-title text-sm block">
                        {formatPrice(srv.price)}
                      </span>
                      <span className="text-[10px] text-theme-muted">
                        {formatDuration(srv.durationMinutes)}
                      </span>
                    </div>

                    <Link href={`/booking?serviceId=${srv.id}`}>
                      <Button size="sm" className="h-8 px-3 rounded-xl text-xs font-semibold">
                        Записаться
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
