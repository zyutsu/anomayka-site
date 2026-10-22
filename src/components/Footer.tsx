import React from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Send, MessageSquare, Shield, Smartphone } from "lucide-react";
import { BrandSettings } from "@/lib/types";

export function Footer({ brand }: { brand: BrandSettings }) {
  return (
    <footer className="bg-[#06070a] border-t border-white/10 pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Бренд */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/15 bg-black/60 flex items-center justify-center">
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain p-0.5" />
                ) : (
                  <span className="text-brand-accent font-black">A</span>
                )}
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">{brand.name}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {brand.slogan}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {brand.telegramUrl && (
                <a
                  href={brand.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  title="Telegram"
                >
                  <Send className="w-4 h-4 text-sky-400" />
                </a>
              )}
              {brand.whatsappUrl && (
                <a
                  href={brand.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                </a>
              )}
            </div>
          </div>

          {/* Быстрые ссылки */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Разделы сайта</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Услуги и прайс-лист
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-white transition-colors">
                  Онлайн-запись 24/7
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Личный кабинет / Перенос записи
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Вопросы и ответы (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="hover:text-white transition-colors">
                  Контакты и схема проезда
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты и время */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Контакты и график</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                <span>{brand.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-accent shrink-0" />
                <a href={`tel:${brand.phoneRaw || brand.phone}`} className="hover:text-white transition-colors">
                  {brand.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-accent shrink-0" />
                <span>{brand.workHours}</span>
              </div>
            </div>
          </div>

          {/* PWA и админка */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Мобильное приложение</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Установите сайт как приложение (PWA) на экран смартфона для быстрой записи в 2 клика.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors py-1"
              >
                <Shield className="w-3.5 h-3.5 text-brand-accent" />
                <span>Панель администратора (/admin)</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {brand.name}. Все права защищены.
          </div>
          <div className="flex items-center gap-6">
            <span>White-Label Multi-Tenant Ready</span>
            <Link href="/admin" className="hover:text-slate-400 transition-colors">
              Вход для персонала
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
