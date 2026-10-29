"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Clock, Send, MessageSquare, ShieldCheck, ArrowUpRight, Globe } from "lucide-react";
import { BrandSettings } from "@/lib/types";
import { useBrand } from "@/context/BrandContext";
import { BrandMark } from "@/components/BrandMark";

export function Footer({ brand: propBrand }: { brand?: BrandSettings }) {
  const brandContext = useBrand();
  const brand = brandContext?.brand || propBrand!;
  const getDemoHref = brandContext?.getDemoHref || ((p: string) => p);
  const mapHref = brand.mapUrl || "https://yandex.ru/maps/?text=" + encodeURIComponent(brand.address);

  return (
    <footer className="mt-auto border-t border-brand-border bg-[var(--brand-primary)]">
      <div className="page-shell py-14">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm space-y-5">
            <div className="flex items-center gap-3">
              <BrandMark
                name={brand.name}
                logoUrl={brand.logoUrl}
                accentColor={brand.accentColor}
                className="h-11 w-11 rounded-xl border border-brand-border bg-[var(--brand-secondary)] p-1"
              />
              <div>
                <p className="text-base font-bold tracking-tight text-theme-title">{brand.name}</p>
                <p className="text-[11px] text-theme-muted">{brand.city}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-theme-muted">{brand.slogan}</p>
            <div className="flex items-center gap-2">
              {brand.telegramUrl && (
                <a
                  href={brand.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-brand-border px-3 text-xs text-theme-muted transition-colors hover:text-theme-title"
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
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-brand-border px-3 text-xs text-theme-muted transition-colors hover:text-theme-title"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                  WhatsApp
                </a>
              )}
              {brand.vkUrl && (
                <a
                  href={brand.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-brand-border px-3 text-xs text-theme-muted transition-colors hover:text-theme-title"
                >
                  <Globe className="h-3.5 w-3.5 text-sky-500" />
                  VK
                </a>
              )}
            </div>
          </div>

          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-theme-muted">
              Разделы
            </p>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Услуги и цены", "/services"],
                ["Онлайн-запись", "/booking"],
                ["Мои записи", "/account"],
                ["Контакты", "/contacts"],
                ["Вопросы и ответы", "/faq"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={getDemoHref(href)}
                    className="text-theme-muted transition-colors hover:text-theme-title"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-theme-muted">
              Контакты
            </p>
            <div className="space-y-3 text-sm text-theme-muted">
              <a
                href={"tel:" + (brand.phoneRaw || brand.phone)}
                className="flex items-center gap-2 transition-colors hover:text-theme-title"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-brand-accent" />
                {brand.phone}
              </a>
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 transition-colors hover:text-theme-title"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-accent" />
                <span>{brand.address}</span>
              </a>
              <p className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-brand-accent" />
                {brand.workHours}
              </p>
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-theme-title"
              >
                Проложить маршрут
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-brand-border pt-6 text-[11px] text-theme-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name}. Онлайн-запись и обслуживание автомобилей.
          </p>
          <Link
            href={getDemoHref("/admin")}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-theme-title"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Панель управления
          </Link>
        </div>
      </div>
    </footer>
  );
}

