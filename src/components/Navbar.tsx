"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Menu, X, Phone, ShieldCheck } from "lucide-react";
import { BrandSettings } from "@/lib/types";
import { useBrand } from "@/context/BrandContext";
import { BrandMark } from "@/components/BrandMark";

const NAV_LINKS = [
  { label: "Услуги", href: "/services" },
  { label: "Как записаться", href: "/#how" },
  { label: "Контакты", href: "/contacts" },
  { label: "Вопросы", href: "/faq" },
  { label: "Мои записи", href: "/account" },
];

export function Navbar({ brand: propBrand }: { brand?: BrandSettings }) {
  const brandContext = useBrand();
  const brand = brandContext?.brand || propBrand!;
  const getDemoHref = brandContext?.getDemoHref || ((p: string) => p);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={
        "sticky top-0 z-50 transition-all duration-300 " +
        (scrolled
          ? "bg-[var(--brand-header-bg)] backdrop-blur-xl border-b border-brand-border"
          : "bg-transparent border-b border-transparent")
      }
    >
      <div className="page-shell">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <Link
            href={getDemoHref("/")}
            className="flex min-w-0 items-center gap-3"
            aria-label={brand.name + " — на главную"}
          >
            <BrandMark
              name={brand.name}
              logoUrl={brand.logoUrl}
              accentColor={brand.accentColor}
              className="h-10 w-10 shrink-0 rounded-xl border border-brand-border bg-[var(--brand-secondary)] p-1"
              imageClassName="rounded-lg"
            />
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-bold tracking-tight text-theme-title">
                {brand.name}
              </span>
              <span className="hidden text-[11px] text-theme-muted sm:block">
                {brand.city} · онлайн-запись 24/7
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Основная навигация">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href.split("#")[0] && link.href !== "/#how";
              return (
                <Link
                  key={link.href}
                  href={getDemoHref(link.href)}
                  className={
                    "rounded-full px-3.5 py-2 text-[13px] transition-colors " +
                    (active
                      ? "bg-[var(--brand-secondary)] font-semibold text-theme-title"
                      : "text-theme-muted hover:text-theme-title")
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <a
              href={"tel:" + (brand.phoneRaw || brand.phone)}
              className="rounded-full px-3 py-2 text-[13px] font-semibold text-theme-title transition-colors hover:text-brand-accent"
            >
              {brand.phone}
            </a>
            <Link
              href={getDemoHref("/booking")}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-accent px-4 text-[13px] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(var(--brand-accent-rgb),0.8)] transition-all hover:bg-brand-accentHover"
            >
              <Calendar className="h-4 w-4" />
              Записаться
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:hidden">
            <a
              href={"tel:" + (brand.phoneRaw || brand.phone)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-theme-title"
              aria-label="Позвонить"
            >
              <Phone className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-theme-title"
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-[72px] bottom-0 z-50 overflow-y-auto border-t border-brand-border bg-[var(--brand-primary)] px-5 pb-10 pt-5 sm:hidden">
          <nav className="flex flex-col" aria-label="Мобильная навигация">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={getDemoHref(link.href)}
                className="flex items-center justify-between border-b border-brand-border/70 py-4 text-base font-medium text-theme-title"
              >
                {link.label}
                <span className="text-theme-muted">›</span>
              </Link>
            ))}
          </nav>

          <Link
            href={getDemoHref("/booking")}
            className="mt-6 flex h-14 items-center justify-center gap-2 rounded-full bg-brand-accent text-base font-semibold text-white"
          >
            <Calendar className="h-5 w-5" />
            Записаться онлайн
          </Link>

          <div className="mt-6 space-y-3 text-sm text-theme-muted">
            <a href={"tel:" + (brand.phoneRaw || brand.phone)} className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-accent" />
              {brand.phone}
            </a>
            <p className="text-xs leading-relaxed">{brand.address}</p>
            <p className="text-xs">{brand.workHours}</p>
          </div>

          <Link
            href={getDemoHref("/admin")}
            className="mt-8 inline-flex items-center gap-1.5 text-xs text-theme-muted"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Вход для персонала
          </Link>
        </div>
      )}
    </header>
  );
}

