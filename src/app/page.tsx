import React from "react";
import Link from "next/link";
import { ArrowUpRight, Award, CalendarCheck, CheckCircle2, Clock, Clock3, MapPin, Phone, ShieldCheck, Star, Zap } from "lucide-react";
import { getDatabaseAsync } from "@/lib/db";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeCallMaster } from "@/components/home/HomeCallMaster";
import { HomePopularServices } from "@/components/home/HomePopularServices";
import { BrandMark } from "@/components/BrandMark";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const STEPS = [
  {
    n: "01",
    title: "Выберите услугу",
    text: "Каталог с ценами и длительностью: ТО, диагностика, шины, детейлинг.",
  },
  {
    n: "02",
    title: "Найдите свободное окно",
    text: "Показываем только реально доступное время с учётом длительности работ.",
  },
  {
    n: "03",
    title: "Оставьте контакты",
    text: "Имя и телефон — всё. Бронь подтверждается сразу, без звонка.",
  },
  {
    n: "04",
    title: "Приезжайте в срок",
    text: "Талон с номером брони и адресом. Можно добавить визит в календарь.",
  },
];

const FEATURE_ICONS: Record<string, React.ElementType> = {
  Clock,
  ShieldCheck,
  Zap,
  Award,
};

export default async function HomePage() {
  const db = await getDatabaseAsync();
  const brand = db.brand;
  const categories = db.categories.filter((c) => c.isActive);
  const popularServices = db.services.filter((s) => s.isActive && s.isPopular).slice(0, 4);
  const reviews = (db.reviews || []).slice(0, 3);
  const features = db.brand.features || [];
  const mapHref =
    brand.mapUrl || "https://yandex.ru/maps/?text=" + encodeURIComponent(brand.address);

  return (
    <div>
      <HeroSection initialBrand={brand} />

      <section className="border-y border-brand-border bg-[var(--brand-secondary)]/40">
        <div className="page-shell grid grid-cols-1 gap-x-8 gap-y-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = FEATURE_ICONS[feature.icon] || CheckCircle2;
            return (
              <div key={feature.title} className="flex items-start gap-3.5">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13.5px] font-semibold tracking-tight text-theme-title">
                    {feature.title}
                  </span>
                  <span className="text-[11.5px] leading-snug text-theme-muted">{feature.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <HomeCategories initialCategories={categories} />

      <section id="how" className="section-tight scroll-mt-24">
        <div className="page-shell">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow mb-3">Как это работает</p>
              <h2 className="heading text-[clamp(1.8rem,3.6vw,2.6rem)] text-theme-title">
                Четыре шага
                <br />
                и вы в боксе
              </h2>
              <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-theme-muted">
                Никаких «перезвоним в течение дня». Всё, что нужно, — выбрать время
                и подтвердить визит.
              </p>
              <Link
                href="/booking"
                className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-brand-accent px-5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-accentHover"
              >
                <CalendarCheck className="h-4 w-4" />
                Записаться сейчас
              </Link>
            </div>

            <ol className="divide-y divide-brand-border border-y border-brand-border">
              {STEPS.map((step) => (
                <li key={step.n} className="grid grid-cols-[44px_1fr] gap-4 py-6 sm:grid-cols-[64px_1fr]">
                  <span className="mono-label pt-1 text-brand-accent">{step.n}</span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-theme-title">{step.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-theme-muted">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <HomeCallMaster />

      <HomePopularServices initialServices={popularServices} />

      {reviews.length > 0 && (
        <section className="section-tight">
          <div className="page-shell">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-3">Отзывы клиентов</p>
                <h2 className="heading text-[clamp(1.7rem,3.4vw,2.5rem)] text-theme-title">
                  Что говорят после визита
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-theme-muted">
                <span className="flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-600" />
                  ))}
                </span>
                <span>по оценкам клиентов</span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {reviews.map((rev) => (
                <figure
                  key={rev.id}
                  className="flex flex-col justify-between rounded-2xl border border-brand-border bg-brand-surface p-6"
                >
                  <div>
                    <div className="mb-4 flex items-center gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-600" />
                      ))}
                    </div>
                    <blockquote className="text-[13px] leading-relaxed text-theme-title">
                      «{rev.text}»
                    </blockquote>
                  </div>
                  <figcaption className="mt-6 flex items-center justify-between gap-3 border-t border-brand-border/70 pt-4">
                    <div>
                      <p className="text-[12px] font-semibold text-theme-title">{rev.author}</p>
                      <p className="text-[11px] text-theme-muted">{rev.car}</p>
                    </div>
                    <span className="text-[10px] text-theme-muted">{rev.date}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-tight">
        <div className="page-shell">
          <div className="overflow-hidden rounded-[28px] border border-brand-border bg-brand-surface">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-7 sm:p-10">
                <p className="eyebrow mb-4">Контакты</p>
                <h2 className="heading text-[clamp(1.7rem,3.2vw,2.4rem)] text-theme-title">
                  {brand.name}
                </h2>
                <p className="mt-2 text-[13px] text-theme-muted">{brand.slogan}</p>

                <div className="mt-7 space-y-4 text-[13px]">
                  <a
                    href={"tel:" + (brand.phoneRaw || brand.phone)}
                    className="flex items-center gap-3 text-theme-title transition-colors hover:text-brand-accent"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-brand-accent" />
                    {brand.phone}
                  </a>
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-theme-muted transition-colors hover:text-theme-title"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                    <span>{brand.address}</span>
                  </a>
                  <p className="flex items-center gap-3 text-theme-muted">
                    <Clock3 className="h-4 w-4 shrink-0 text-brand-accent" />
                    {brand.workHours}
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
                  <Link
                    href="/booking"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-accent px-6 text-[13px] font-semibold text-white transition-colors hover:bg-brand-accentHover"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Записаться онлайн
                  </Link>
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-brand-border px-6 text-[13px] font-medium text-theme-title transition-colors hover:border-brand-accent/60"
                  >
                    Построить маршрут
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="relative min-h-[300px] overflow-hidden border-t border-brand-border bg-[var(--brand-secondary)] lg:border-l lg:border-t-0">
                <div className="absolute inset-0 grid-texture opacity-60" aria-hidden="true" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <BrandMark
                    name={brand.name}
                    logoUrl={brand.logoUrl}
                    accentColor={brand.accentColor}
                    className="h-20 w-20 rounded-[22px] border border-brand-border bg-[var(--brand-primary)] p-2"
                  />
                  <p className="mt-5 max-w-[240px] text-[13px] leading-relaxed text-theme-muted">
                    {brand.address}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-theme-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Парковка для клиентов
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

