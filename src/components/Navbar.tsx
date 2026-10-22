"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Calendar, Menu, X, Shield, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandSettings } from "@/lib/types";

export function Navbar({ brand }: { brand: BrandSettings }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Главная", href: "/" },
    { label: "Услуги и цены", href: "/services" },
    { label: "Записаться", href: "/booking" },
    { label: "Контакты", href: "/contacts" },
    { label: "FAQ", href: "/faq" },
    { label: "Мои записи", href: "/account" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--brand-header-bg)] backdrop-blur-md border-b border-brand-border shadow-2xl py-2.5"
          : "bg-[var(--brand-header-bg)] border-b border-brand-border/60 py-3.5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Бренд и логотип */}
          <Link href="/" className="flex items-center gap-3.5 group focus:outline-none">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-brand-border bg-black/60 shadow-md group-hover:border-brand-accent transition-all flex items-center justify-center shrink-0">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-brand-accent font-black text-xl px-2">A</div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-theme-title group-hover:text-brand-accent transition-colors">
                {brand.name}
              </span>
              <span className="text-[10px] text-theme-muted font-medium tracking-wider uppercase hidden sm:block">
                {brand.city} • Онлайн-запись 24/7
              </span>
            </div>
          </Link>

          {/* Десктопное меню */}
          <nav className="hidden lg:flex items-center gap-1 bg-brand-surface/80 border border-brand-border rounded-full px-4 py-1.5 backdrop-blur-sm shadow-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-brand-accent text-white shadow-sm shadow-brand-accent/30 font-semibold"
                      : "text-theme-muted hover:text-theme-title hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Правая секция: телефон, кнопка записи, вход в админку */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${brand.phoneRaw || brand.phone}`}
              className="flex items-center gap-2 text-xs font-semibold text-theme-title bg-brand-surface hover:border-brand-accent px-3 py-2 rounded-xl border border-brand-border transition-all shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-brand-accent" />
              <span>{brand.phone}</span>
            </a>

            <Link href="/booking">
              <Button size="sm" className="font-semibold shadow-md shadow-brand-accent/20">
                <Calendar className="w-3.5 h-3.5" />
                <span>Записаться</span>
              </Button>
            </Link>

            <Link
              href="/admin"
              className="p-2 text-theme-muted hover:text-theme-title hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
              title="Панель администратора"
            >
              <Shield className="w-4 h-4" />
            </Link>
          </div>

          {/* Мобильная кнопка меню */}
          <div className="flex sm:hidden items-center gap-2">
            <Link href="/booking">
              <Button size="sm" className="px-3 text-xs">
                Запись
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-brand-surface border border-brand-border text-theme-title focus:outline-none"
              aria-label="Меню"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное выпадающее меню */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-brand-surface border-b border-brand-border px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? "bg-brand-accent text-white font-semibold"
                      : "text-theme-title hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-brand-border space-y-2">
            <a
              href={`tel:${brand.phoneRaw || brand.phone}`}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-theme-title bg-brand-secondary border border-brand-border"
            >
              <Phone className="w-4 h-4 text-brand-accent" />
              <span>{brand.phone}</span>
            </a>
            <div className="flex items-center justify-between px-4 py-2 text-xs text-theme-muted">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-accent" />
                {brand.workHours}
              </span>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-theme-muted hover:text-theme-title flex items-center gap-1 underline underline-offset-4"
              >
                <Shield className="w-3.5 h-3.5" /> Вход для персонала
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
