"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarCheck, Clock3, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { useBrand } from "@/context/BrandContext";
import { BrandMark } from "@/components/BrandMark";

export default function ContactsPage() {
  const { brand, getDemoHref } = useBrand();
  const mapHref =
    brand.mapUrl || "https://yandex.ru/maps/?text=" + encodeURIComponent(brand.address);

  return (
    <div>
      <div className="border-b border-brand-border">
        <div className="page-shell py-10 sm:py-14">
          <p className="eyebrow mb-3">Контакты</p>
          <h1 className="heading text-[clamp(2rem,4.4vw,3.2rem)] text-theme-title">
            Как нас найти
          </h1>
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-theme-muted sm:text-sm">
            Приезжайте по адресу или позвоните — подскажем, как удобнее добраться
            и где оставить автомобиль.
          </p>
        </div>
      </div>

      <div className="page-shell section-tight">
        <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-6">
              <p className="mono-label mb-3">Адрес</p>
              <p className="text-[15px] font-semibold leading-snug text-theme-title">
                {brand.address}
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-theme-muted">
                {brand.city}. Въезд на территорию — через шлагбаум, скажите охране,
                что вы в {brand.name}.
              </p>
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-accent"
              >
                Открыть на карте
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="rounded-2xl border border-brand-border bg-brand-surface p-6">
              <p className="mono-label mb-3">Телефон</p>
              <a
                href={"tel:" + (brand.phoneRaw || brand.phone)}
                className="text-[19px] font-bold tracking-tight text-theme-title transition-colors hover:text-brand-accent"
              >
                {brand.phone}
              </a>
              <p className="mt-2 text-[12px] text-theme-muted">
                Администратор и мастер-консультант
              </p>
            </div>

            <div className="rounded-2xl border border-brand-border bg-brand-surface p-6">
              <p className="mono-label mb-3">График</p>
              <p className="inline-flex items-center gap-2 text-[14px] font-medium text-theme-title">
                <Clock3 className="h-4 w-4 text-brand-accent" />
                {brand.workHours}
              </p>
              <p className="mt-2 text-[12px] text-theme-muted">
                Приём автомобилей — по предварительной записи.
              </p>
            </div>

            {(brand.telegramUrl || brand.whatsappUrl) && (
              <div className="rounded-2xl border border-brand-border bg-brand-surface p-6">
                <p className="mono-label mb-3">Мессенджеры</p>
                <div className="flex flex-wrap gap-2">
                  {brand.telegramUrl && (
                    <a
                      href={brand.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-brand-border px-4 text-[12px] font-medium text-theme-title transition-colors hover:border-sky-500/50"
                    >
                      <Send className="h-3.5 w-3.5 text-sky-400" />
                      Telegram
                    </a>
                  )}
                  {brand.whatsappUrl && (
                    <a
                      href={brand.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-brand-border px-4 text-[12px] font-medium text-theme-title transition-colors hover:border-emerald-500/50"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-border bg-brand-surface">
            <div className="relative min-h-[320px] flex-1 overflow-hidden bg-[var(--brand-secondary)]">
              <div className="absolute inset-0 grid-texture opacity-70" aria-hidden="true" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <BrandMark
                  name={brand.name}
                  logoUrl={brand.logoUrl}
                  accentColor={brand.accentColor}
                  className="h-20 w-20 rounded-[22px] border border-brand-border bg-[var(--brand-primary)] p-2"
                />
                <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-theme-muted">
                  {brand.address}
                </p>
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-brand-border px-4 text-[12px] font-medium text-theme-title transition-colors hover:border-brand-accent/60"
                >
                  <MapPin className="h-3.5 w-3.5 text-brand-accent" />
                  Открыть в Яндекс.Картах
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-brand-border p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[13px] font-semibold text-theme-title">
                  Удобнее записаться заранее?
                </p>
                <p className="mt-0.5 text-[12px] text-theme-muted">
                  Свободные окна — на сегодня и ближайшие дни.
                </p>
              </div>
              <Link
                href={getDemoHref("/booking")}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-brand-accent px-5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-accentHover"
              >
                <CalendarCheck className="h-4 w-4" />
                Выбрать время
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

