"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarCheck, Clock3, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { useBrand } from "@/context/BrandContext";
import { BrandSettings } from "@/lib/types";
import { BrandMark } from "@/components/BrandMark";

export function HeroSection({ initialBrand }: { initialBrand: BrandSettings }) {
  const brandContext = useBrand();
  const brand = brandContext?.brand || initialBrand;
  const getDemoHref = brandContext?.getDemoHref || ((p: string) => p);

  const mapHref =
    brand.mapUrl || "https://yandex.ru/maps/?text=" + encodeURIComponent(brand.address);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-texture opacity-70" aria-hidden="true" />
      <div className="absolute -right-40 -top-56 h-[560px] w-[560px] rounded-full glow-accent blur-2xl" aria-hidden="true" />

      <div className="page-shell relative">
        <div className="grid items-end gap-12 pb-14 pt-12 md:grid-cols-[1.25fr_0.75fr] md:gap-16 md:pb-20 md:pt-20">
          <div className="animate-rise">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-brand-border bg-[var(--brand-surface)]/70 px-3 py-1.5 text-[11px] font-medium text-theme-muted backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Свободные окна на сегодня · запись открыта
            </div>

            <h1 className="display text-[clamp(2.9rem,7vw,5.4rem)] text-theme-title">
              Запись в сервис
              <br />
              <span className="text-brand-accent">за две минуты.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-theme-muted sm:text-base">
              {brand.name} — {brand.city}. Выберите услугу, удобное время и оставьте
              контакты. Мастер будет ждать вас в назначенный час, без звонков и
              очередей.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={getDemoHref("/booking")}
                className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-brand-accent px-7 text-[15px] font-semibold text-white shadow-[0_18px_40px_-16px_rgba(var(--brand-accent-rgb),0.9)] transition-all hover:bg-brand-accentHover hover:shadow-[0_22px_48px_-16px_rgba(var(--brand-accent-rgb),0.95)]"
              >
                <CalendarCheck className="h-5 w-5" />
                Выбрать время визита
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={getDemoHref("/services")}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-brand-border px-6 text-[15px] font-medium text-theme-title transition-colors hover:border-brand-accent/60"
              >
                Услуги и цены
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] text-theme-muted">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-accent" />
                Бронь без предоплаты
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-brand-accent" />
                Подтверждение сразу
              </span>
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-theme-title"
              >
                <MapPin className="h-4 w-4 text-brand-accent" />
                {brand.city}
              </a>
            </div>
          </div>

          <div className="relative animate-rise [animation-delay:120ms]">
            <div className="surface overflow-hidden rounded-[26px]">
              <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
                <span className="mono-label">Визит · детали</span>
                <Sparkles className="h-4 w-4 text-brand-accent" />
              </div>

              <div className="space-y-5 p-5">
                <div className="flex items-center gap-3.5">
                  <BrandMark
                    name={brand.name}
                    logoUrl={brand.logoUrl}
                    accentColor={brand.accentColor}
                    className="h-14 w-14 shrink-0 rounded-2xl border border-brand-border bg-[var(--brand-secondary)] p-1.5"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-theme-title">{brand.name}</p>
                    <p className="truncate text-[11px] text-theme-muted">{brand.address}</p>
                  </div>
                </div>

                <div className="hairline" />

                <dl className="space-y-3 text-[12px]">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-theme-muted">Услуга</dt>
                    <dd className="text-right font-medium text-theme-title">
                      ТО и диагностика
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-theme-muted">Длительность</dt>
                    <dd className="font-medium text-theme-title">45 минут</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-theme-muted">Стоимость</dt>
                    <dd className="font-semibold text-theme-title">от 2 500 ₽</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-theme-muted">График</dt>
                    <dd className="text-right font-medium text-theme-title">{brand.workHours}</dd>
                  </div>
                </dl>

                <div className="rounded-2xl border border-brand-accent/25 bg-brand-accent/[0.08] px-4 py-3">
                  <p className="text-[11px] leading-relaxed text-theme-title">
                    Свободные окна рассчитываются по длительности услуги — пересечений
                    и накладок не будет.
                  </p>
                </div>

                <Link
                  href={getDemoHref("/booking")}
                  className="flex h-11 items-center justify-center rounded-full bg-[var(--brand-secondary)] text-[13px] font-semibold text-theme-title transition-colors hover:bg-brand-accent hover:text-white"
                >
                  Проверить свободное время
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

