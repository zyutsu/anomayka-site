"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Clock, Send, MessageSquare, Calendar, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrand } from "@/context/BrandContext";

export default function ContactsPage() {
  const { brand } = useBrand();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-2xl space-y-2">
        <span className="text-xs font-bold text-brand-accent uppercase tracking-wider block">
          Контакты и проезд
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Как нас найти
        </h1>
        <p className="text-sm text-slate-400">
          Мы находимся в удобной транспортной доступности. Охраняемая парковка для клиентов сервиса.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Контактные карточки */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-brand-surface border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-brand-accent text-xs font-bold uppercase">
              <MapPin className="w-4 h-4" />
              <span>Адрес автоцентра</span>
            </div>
            <strong className="text-white text-base block">{brand.address}</strong>
            <p className="text-xs text-slate-400">
              Въезд через шлагбаум, скажите на охране «в автоцентр {brand.name}».
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-brand-accent text-xs font-bold uppercase">
              <Phone className="w-4 h-4" />
              <span>Телефон горячей линии</span>
            </div>
            <a
              href={`tel:${brand.phoneRaw || brand.phone}`}
              className="text-white text-xl font-black block hover:text-brand-accent transition-colors"
            >
              {brand.phone}
            </a>
            <p className="text-xs text-slate-400">
              Связь с администратором и клиентской службой
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-brand-accent text-xs font-bold uppercase">
              <Clock className="w-4 h-4" />
              <span>Режим работы</span>
            </div>
            <strong className="text-white text-base block">{brand.workHours}</strong>
            <p className="text-xs text-slate-400">
              Прием автомобилей строго по предварительной записи.
            </p>
          </div>

          {/* Мессенджеры */}
          <div className="p-6 rounded-2xl bg-brand-surface border border-white/5 space-y-3">
            <span className="text-xs text-slate-400 block font-semibold">
              Прямая связь в мессенджерах:
            </span>
            <div className="flex items-center gap-3">
              {brand.telegramUrl && (
                <a
                  href={brand.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>Telegram</span>
                </a>
              )}
              {brand.whatsappUrl && (
                <a
                  href={brand.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Схема / Карта */}
        <div className="lg:col-span-2 rounded-2xl bg-brand-surface border border-white/10 overflow-hidden relative min-h-[400px] flex flex-col justify-between p-6">
          <div className="space-y-2 relative z-10">
            <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-medium text-slate-300 backdrop-blur-md inline-block">
              Интерактивная карта проезда
            </span>
            <h3 className="text-xl font-bold text-white">
              Автоцентр {brand.name} • {brand.city}
            </h3>
          </div>

          {/* Стилизованная схема карты */}
          <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-8 text-center">
            <div className="space-y-4 max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-brand-accent/20 border border-brand-accent/40 mx-auto flex items-center justify-center text-brand-accent shadow-xl shadow-brand-accent/20">
                <Navigation className="w-7 h-7" />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {brand.address}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={`https://yandex.ru/maps/?text=${encodeURIComponent(brand.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="sm" className="text-xs">
                    Открыть в Яндекс.Картах
                  </Button>
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(brand.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="sm" className="text-xs">
                    Открыть в Google Maps
                  </Button>
                </a>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 flex justify-end">
            <Link href="/booking">
              <Button size="md" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span>Записаться в этот филиал</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
